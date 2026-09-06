import { randomUUID } from "node:crypto";
import { getSql } from "../db.ts";
import { ensureCsvFile, readCsvFile, withFileLock, writeCsvFile } from "../store/csv-table.server.ts";
import type { StoredInteraction } from "./types.ts";

const FILE = "interactions.csv";

export const INTERACTION_COLUMNS = [
  "interaction_id",
  "applicant_id",
  "job_id",
  "interaction_type",
  "timestamp",
  "detail",
] as const;

function toRecord(row: StoredInteraction): Record<string, string> {
  return {
    interaction_id: row.interaction_id,
    applicant_id: row.applicant_id,
    job_id: row.job_id,
    interaction_type: row.interaction_type,
    timestamp: row.timestamp,
    detail: row.detail,
  };
}

function fromRecord(record: Record<string, string>): StoredInteraction {
  return {
    interaction_id: record.interaction_id ?? "",
    applicant_id: record.applicant_id ?? "",
    job_id: record.job_id ?? "",
    interaction_type: (record.interaction_type as StoredInteraction["interaction_type"]) || "view",
    timestamp: record.timestamp ?? "",
    detail: record.detail ?? "",
  };
}

function fromSqlRecord(record: any): StoredInteraction {
  return {
    interaction_id: record.interaction_id ?? "",
    applicant_id: record.applicant_id ?? "",
    job_id: record.job_id ?? "",
    interaction_type: (record.interaction_type as StoredInteraction["interaction_type"]) || "view",
    timestamp: typeof record.timestamp === "object" ? record.timestamp?.toISOString() || "" : String(record.timestamp || ""),
    detail: record.detail ?? "",
  };
}

let inMemoryInteractions: StoredInteraction[] | null = null;
let sqlTableCreated = false;

async function ensureSqlTable() {
  if (sqlTableCreated) return;
  try {
    const sql = await getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS interactions (
        interaction_id TEXT NOT NULL PRIMARY KEY,
        applicant_id TEXT NOT NULL,
        job_id TEXT NOT NULL,
        interaction_type TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        detail TEXT
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS interactions_job_idx ON interactions (job_id);`;
    await sql`CREATE INDEX IF NOT EXISTS interactions_applicant_idx ON interactions (applicant_id);`;
    sqlTableCreated = true;
  } catch (err) {
    console.error("SQL ensureSqlTable error:", err);
  }
}

async function readAll(): Promise<StoredInteraction[]> {
  if (inMemoryInteractions && inMemoryInteractions.length > 0) {
    return inMemoryInteractions;
  }

  await ensureSqlTable();

  try {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM interactions ORDER BY timestamp DESC`;
    if (rows.length > 0) {
      const loaded = rows.map(fromSqlRecord);
      inMemoryInteractions = loaded;
      return loaded;
    }
  } catch (err) {
    // Fallback to CSV if SQL query fails
  }

  await ensureCsvFile(FILE, INTERACTION_COLUMNS);
  const loaded = (await readCsvFile(FILE)).map(fromRecord).filter((row) => row.interaction_id);
  if (loaded.length > 0) {
    inMemoryInteractions = loaded;
    void seedSqlFromInteractions(loaded);
  } else {
    inMemoryInteractions = [];
  }
  return inMemoryInteractions;
}

async function seedSqlFromInteractions(rows: StoredInteraction[]) {
  try {
    const sql = await getSql();
    for (const r of rows) {
      await sql`
        INSERT INTO interactions (interaction_id, applicant_id, job_id, interaction_type, timestamp, detail)
        VALUES (${r.interaction_id}, ${r.applicant_id}, ${r.job_id}, ${r.interaction_type}, ${r.timestamp || new Date().toISOString()}, ${r.detail || ""})
        ON CONFLICT (interaction_id) DO NOTHING
      `;
    }
  } catch (err) {
    console.error("SQL seedSqlFromInteractions error:", err);
  }
}

export class InteractionsRepository {
  async listInteractions() {
    return readAll();
  }

  async record(input: Omit<StoredInteraction, "interaction_id" | "timestamp" | "detail"> & { timestamp?: string; detail?: string }) {
    const row: StoredInteraction = {
      ...input,
      interaction_id: randomUUID(),
      timestamp: input.timestamp || new Date().toISOString(),
      detail: input.detail ?? "",
    };

    if (inMemoryInteractions) {
      inMemoryInteractions.push(row);
    } else {
      inMemoryInteractions = [row];
    }

    await ensureSqlTable();

    try {
      const sql = await getSql();
      await sql`
        INSERT INTO interactions (interaction_id, applicant_id, job_id, interaction_type, timestamp, detail)
        VALUES (${row.interaction_id}, ${row.applicant_id}, ${row.job_id}, ${row.interaction_type}, ${row.timestamp}, ${row.detail})
      `;
    } catch (err) {
      console.error("SQL record interaction error:", err);
    }

    void withFileLock(FILE, async () => {
      const rows = await readAll();
      await writeCsvFile(FILE, INTERACTION_COLUMNS, rows.map(toRecord));
    });

    return row;
  }

  async hasType(applicantId: string, jobId: string, type: StoredInteraction["interaction_type"]) {
    return (await readAll()).some(
      (row) => row.applicant_id === applicantId && row.job_id === jobId && row.interaction_type === type,
    );
  }

  async ignoredJobIds(applicantId: string) {
    return (await readAll())
      .filter((row) => row.applicant_id === applicantId && row.interaction_type === "not_relevant")
      .map((row) => row.job_id);
  }
}

let repository: InteractionsRepository | null = null;

export function getInteractionsRepository() {
  if (!repository) repository = new InteractionsRepository();
  return repository;
}

