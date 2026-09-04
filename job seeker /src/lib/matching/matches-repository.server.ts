import { randomUUID } from "node:crypto";
import { joinList, splitList } from "../applicants/csv.server.ts";
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

async function readAll() {
  await ensureCsvFile(FILE, MATCH_COLUMNS);
  return (await readCsvFile(FILE)).map(fromRecord).filter((row) => row.match_id);
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
    return withFileLock(FILE, async () => {
      const rows = await readAll();
      const existing = rows.find(
        (row) => row.applicant_id === input.applicant_id && row.job_id === input.job_id,
      );
      const timestamp = nowIso();
      if (existing) {
        const next: StoredMatch = {
          ...existing,
          ...input,
          match_id: existing.match_id,
          created_at: existing.created_at,
          updated_at: timestamp,
        };
        const index = rows.findIndex((row) => row.match_id === existing.match_id);
        rows[index] = next;
        await writeCsvFile(FILE, MATCH_COLUMNS, rows.map(toRecord));
        return { match: next, created: false };
      }
      const created: StoredMatch = {
        ...input,
        match_id: input.match_id || randomUUID(),
        created_at: timestamp,
        updated_at: timestamp,
      };
      rows.push(created);
      await writeCsvFile(FILE, MATCH_COLUMNS, rows.map(toRecord));
      return { match: created, created: true };
    });
  }

  async updateMatch(id: string, patch: Partial<StoredMatch>) {
    return withFileLock(FILE, async () => {
      const rows = await readAll();
      const index = rows.findIndex((row) => row.match_id === id);
      if (index === -1) return null;
      const current = rows[index];
      if (!current) return null;
      const next = { ...current, ...patch, match_id: id, updated_at: nowIso() };
      rows[index] = next;
      await writeCsvFile(FILE, MATCH_COLUMNS, rows.map(toRecord));
      return next;
    });
  }
}

let repository: MatchesRepository | null = null;

export function getMatchesRepository() {
  if (!repository) repository = new MatchesRepository();
  return repository;
}
