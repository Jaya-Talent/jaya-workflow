import { randomUUID } from "node:crypto";
import { joinList, splitList } from "../applicants/csv.server.ts";
import { getSql } from "../db.ts";
import { ensureCsvFile, readCsvFile, withFileLock, writeCsvFile } from "../store/csv-table.server.ts";
import type { ScoreCategory, StoredMatch } from "./types.ts";

const FILE = "matches.csv";

export const MATCH_COLUMNS = [
  "match_id",
  "applicant_id",
  "job_id",
  "match_score",
  "score_category",
  "matched_skills",
  "missing_skills",
  "partial_skills",
  "match_reasons",
  "created_at",
  "updated_at",
  "notification_status",
  "telegram_status",
  "email_status",
] as const;

function nowIso() {
  return new Date().toISOString();
}

function toRecord(row: StoredMatch): Record<string, string> {
  return {
    match_id: row.match_id,
    applicant_id: row.applicant_id,
    job_id: row.job_id,
    match_score: String(row.match_score),
    score_category: row.score_category,
    matched_skills: joinList(row.matched_skills),
    missing_skills: joinList(row.missing_skills),
    partial_skills: joinList(row.partial_skills),
    match_reasons: row.match_reasons,
    created_at: row.created_at,
    updated_at: row.updated_at,
    notification_status: row.notification_status,
    telegram_status: row.telegram_status,
    email_status: row.email_status,
  };
}

function fromRecord(record: Record<string, string>): StoredMatch {
  return {
    match_id: record.match_id ?? "",
    applicant_id: record.applicant_id ?? "",
    job_id: record.job_id ?? "",
    match_score: Number(record.match_score || 0),
    score_category: (record.score_category as ScoreCategory) || "poor",
    matched_skills: splitList(record.matched_skills ?? ""),
    missing_skills: splitList(record.missing_skills ?? ""),
    partial_skills: splitList(record.partial_skills ?? ""),
    match_reasons: record.match_reasons ?? "",
    created_at: record.created_at ?? "",
    updated_at: record.updated_at ?? "",
    notification_status: record.notification_status ?? "pending",
    telegram_status: record.telegram_status ?? "",
    email_status: record.email_status ?? "",
  };
}

function fromSqlRecord(record: any): StoredMatch {
  const toArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return splitList(val);
    return [];
  };
  return {
    match_id: record.match_id ?? "",
    applicant_id: record.applicant_id ?? "",
    job_id: record.job_id ?? "",
    match_score: Number(record.match_score || 0),
    score_category: (record.score_category as ScoreCategory) || "poor",
    matched_skills: toArray(record.matched_skills),
    missing_skills: toArray(record.missing_skills),
    partial_skills: toArray(record.partial_skills),
    match_reasons: record.match_reasons ?? "",
    created_at: typeof record.created_at === "object" ? record.created_at?.toISOString() || "" : String(record.created_at || ""),
    updated_at: typeof record.updated_at === "object" ? record.updated_at?.toISOString() || "" : String(record.updated_at || ""),
    notification_status: record.notification_status ?? "pending",
    telegram_status: record.telegram_status ?? "",
    email_status: record.email_status ?? "",
  };
}

let inMemoryMatches: StoredMatch[] | null = null;

async function readAll(): Promise<StoredMatch[]> {
  if (inMemoryMatches && inMemoryMatches.length > 0) {
    return inMemoryMatches;
  }

  try {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM matches ORDER BY match_score DESC`;
    if (rows.length > 0) {
      const loaded = rows.map(fromSqlRecord);
      inMemoryMatches = loaded;
      return loaded;
    }
  } catch (err) {
    // Fallback to CSV if SQL query fails
  }

  await ensureCsvFile(FILE, MATCH_COLUMNS);
  const loaded = (await readCsvFile(FILE)).map(fromRecord).filter((row) => row.match_id);
  if (loaded.length > 0) {
    inMemoryMatches = loaded;
    void seedSqlFromMatches(loaded);
  } else {
    inMemoryMatches = null;
  }
  return inMemoryMatches ?? [];
}

async function seedSqlFromMatches(rows: StoredMatch[]) {
  try {
    const sql = await getSql();
    for (const m of rows) {
      await sql`
        INSERT INTO matches (
          match_id, applicant_id, job_id, match_score, score_category,
          matched_skills, missing_skills, partial_skills, match_reasons,
          created_at, updated_at, notification_status, telegram_status, email_status
        ) VALUES (
          ${m.match_id}, ${m.applicant_id}, ${m.job_id}, ${m.match_score}, ${m.score_category || "poor"},
          ${m.matched_skills || []}, ${m.missing_skills || []}, ${m.partial_skills || []}, ${m.match_reasons || ""},
          ${m.created_at || nowIso()}, ${m.updated_at || nowIso()}, ${m.notification_status || "pending"}, ${m.telegram_status || ""}, ${m.email_status || ""}
        ) ON CONFLICT (applicant_id, job_id) DO UPDATE SET
          match_score = EXCLUDED.match_score,
          score_category = EXCLUDED.score_category,
          matched_skills = EXCLUDED.matched_skills,
          missing_skills = EXCLUDED.missing_skills,
          partial_skills = EXCLUDED.partial_skills,
          match_reasons = EXCLUDED.match_reasons,
          updated_at = EXCLUDED.updated_at
      `;
    }
  } catch (err) {
    console.error("SQL seedSqlFromMatches error:", err);
  }
}

export class MatchesRepository {
  async listMatches() {
    return readAll();
  }

  async getMatch(id: string) {
    return (await readAll()).find((row) => row.match_id === id) ?? null;
  }

  async findByPair(applicantId: string, jobId: string) {
    return (await readAll()).find((row) => row.applicant_id === applicantId && row.job_id === jobId) ?? null;
  }

  async listByApplicant(applicantId: string) {
    return (await readAll())
      .filter((row) => row.applicant_id === applicantId)
      .sort((a, b) => b.match_score - a.match_score);
  }

  async listByJob(jobId: string) {
    return (await readAll())
      .filter((row) => row.job_id === jobId)
      .sort((a, b) => b.match_score - a.match_score);
  }

  async upsertMatch(input: Omit<StoredMatch, "match_id" | "created_at" | "updated_at"> & { match_id?: string }) {
    const rows = await readAll();
    const existing = rows.find(
      (row) => row.applicant_id === input.applicant_id && row.job_id === input.job_id,
    );
    const timestamp = nowIso();
    let next: StoredMatch;
    let isNew = false;
    if (existing) {
      next = {
        ...existing,
        ...input,
        match_id: existing.match_id,
        created_at: existing.created_at,
        updated_at: timestamp,
      };
      const index = rows.findIndex((row) => row.match_id === existing.match_id);
      if (index !== -1) rows[index] = next;
    } else {
      next = {
        ...input,
        match_id: input.match_id || randomUUID(),
        created_at: timestamp,
        updated_at: timestamp,
      };
      rows.push(next);
      isNew = true;
    }
    inMemoryMatches = rows;

    try {
      const sql = await getSql();
      await sql`
        INSERT INTO matches (
          match_id, applicant_id, job_id, match_score, score_category,
          matched_skills, missing_skills, partial_skills, match_reasons,
          created_at, updated_at, notification_status, telegram_status, email_status
        ) VALUES (
          ${next.match_id}, ${next.applicant_id}, ${next.job_id}, ${next.match_score}, ${next.score_category || "poor"},
          ${next.matched_skills || []}, ${next.missing_skills || []}, ${next.partial_skills || []}, ${next.match_reasons || ""},
          ${next.created_at}, ${next.updated_at}, ${next.notification_status || "pending"}, ${next.telegram_status || ""}, ${next.email_status || ""}
        ) ON CONFLICT (applicant_id, job_id) DO UPDATE SET
          match_score = EXCLUDED.match_score,
          score_category = EXCLUDED.score_category,
          matched_skills = EXCLUDED.matched_skills,
          missing_skills = EXCLUDED.missing_skills,
          partial_skills = EXCLUDED.partial_skills,
          match_reasons = EXCLUDED.match_reasons,
          updated_at = EXCLUDED.updated_at
      `;
    } catch (err) {
      console.error("SQL upsertMatch error:", err);
    }

    void withFileLock(FILE, async () => {
      await writeCsvFile(FILE, MATCH_COLUMNS, rows.map(toRecord));
    });

    return { match: next, created: isNew };
  }

  async upsertMatchesBulk(
    inputs: Array<Omit<StoredMatch, "match_id" | "created_at" | "updated_at"> & { match_id?: string }>,
  ) {
    if (inputs.length === 0) return { stored: 0, created: 0 };
    const rows = await readAll();
    const timestamp = nowIso();
    const existingMap = new Map(rows.map((row) => [`${row.applicant_id}:${row.job_id}`, row]));
    let createdCount = 0;

    for (const input of inputs) {
      const key = `${input.applicant_id}:${input.job_id}`;
      const existing = existingMap.get(key);
      if (existing) {
        const next: StoredMatch = {
          ...existing,
          ...input,
          match_id: existing.match_id,
          created_at: existing.created_at,
          updated_at: timestamp,
        };
        const index = rows.findIndex((row) => row.match_id === existing.match_id);
        if (index !== -1) rows[index] = next;
        existingMap.set(key, next);
      } else {
        const created: StoredMatch = {
          ...input,
          match_id: input.match_id || randomUUID(),
          created_at: timestamp,
          updated_at: timestamp,
        };
        rows.push(created);
        existingMap.set(key, created);
        createdCount += 1;
      }
    }
    inMemoryMatches = rows;

    try {
      const sql = await getSql();
      const itemsToSave: StoredMatch[] = [];
      for (const m of inputs) {
        const key = `${m.applicant_id}:${m.job_id}`;
        const current = existingMap.get(key);
        itemsToSave.push({
          match_id: current?.match_id || m.match_id || randomUUID(),
          applicant_id: m.applicant_id,
          job_id: m.job_id,
          match_score: m.match_score,
          score_category: m.score_category || "poor",
          matched_skills: m.matched_skills || [],
          missing_skills: m.missing_skills || [],
          partial_skills: m.partial_skills || [],
          match_reasons: m.match_reasons || "",
          created_at: current?.created_at || timestamp,
          updated_at: timestamp,
          notification_status: m.notification_status || "pending",
          telegram_status: m.telegram_status || "",
          email_status: m.email_status || "",
        });
      }

      for (let i = 0; i < itemsToSave.length; i += 100) {
        const chunk = itemsToSave.slice(i, i + 100);
        const placeholders: string[] = [];
        const params: unknown[] = [];
        let pIdx = 1;

        for (const m of chunk) {
          placeholders.push(
            `($${pIdx}, $${pIdx + 1}, $${pIdx + 2}, $${pIdx + 3}, $${pIdx + 4}, $${pIdx + 5}, $${pIdx + 6}, $${pIdx + 7}, $${pIdx + 8}, $${pIdx + 9}, $${pIdx + 10}, $${pIdx + 11}, $${pIdx + 12}, $${pIdx + 13})`,
          );
          params.push(
            m.match_id,
            m.applicant_id,
            m.job_id,
            m.match_score,
            m.score_category,
            m.matched_skills,
            m.missing_skills,
            m.partial_skills,
            m.match_reasons,
            m.created_at,
            m.updated_at,
            m.notification_status,
            m.telegram_status,
            m.email_status,
          );
          pIdx += 14;
        }

        const queryText = `
          INSERT INTO matches (
            match_id, applicant_id, job_id, match_score, score_category,
            matched_skills, missing_skills, partial_skills, match_reasons,
            created_at, updated_at, notification_status, telegram_status, email_status
          ) VALUES ${placeholders.join(", ")}
          ON CONFLICT (applicant_id, job_id) DO UPDATE SET
            match_score = EXCLUDED.match_score,
            score_category = EXCLUDED.score_category,
            matched_skills = EXCLUDED.matched_skills,
            missing_skills = EXCLUDED.missing_skills,
            partial_skills = EXCLUDED.partial_skills,
            match_reasons = EXCLUDED.match_reasons,
            updated_at = EXCLUDED.updated_at
        `;
        await sql.query(queryText, params);
      }
    } catch (err) {
      console.error("SQL upsertMatchesBulk error:", err);
    }

    void withFileLock(FILE, async () => {
      await writeCsvFile(FILE, MATCH_COLUMNS, rows.map(toRecord));
    });

    return { stored: inputs.length, created: createdCount };
  }

  async updateMatch(id: string, patch: Partial<StoredMatch>) {
    const rows = await readAll();
    const index = rows.findIndex((row) => row.match_id === id);
    if (index === -1) return null;
    const current = rows[index];
    if (!current) return null;
    const next = { ...current, ...patch, match_id: id, updated_at: nowIso() };
    rows[index] = next;
    inMemoryMatches = rows;

    try {
      const sql = await getSql();
      await sql`
        UPDATE matches SET
          match_score = ${next.match_score},
          score_category = ${next.score_category},
          updated_at = CURRENT_TIMESTAMP
        WHERE match_id = ${id}
      `;
    } catch (err) {
      console.error("SQL updateMatch error:", err);
    }

    void withFileLock(FILE, async () => {
      await writeCsvFile(FILE, MATCH_COLUMNS, rows.map(toRecord));
    });

    return next;
  }
}

let repository: MatchesRepository | null = null;

export function getMatchesRepository() {
  if (!repository) repository = new MatchesRepository();
  return repository;
}

