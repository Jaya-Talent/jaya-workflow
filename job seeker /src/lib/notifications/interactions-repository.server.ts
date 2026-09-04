import { randomUUID } from "node:crypto";
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

async function readAll() {
  await ensureCsvFile(FILE, INTERACTION_COLUMNS);
  return (await readCsvFile(FILE)).map(fromRecord).filter((row) => row.interaction_id);
}

export class InteractionsRepository {
  async listInteractions() {
    return readAll();
  }

  async record(input: Omit<StoredInteraction, "interaction_id" | "timestamp" | "detail"> & { timestamp?: string; detail?: string }) {
    return withFileLock(FILE, async () => {
      const rows = await readAll();
      const row: StoredInteraction = {
        ...input,
        interaction_id: randomUUID(),
        timestamp: input.timestamp || new Date().toISOString(),
        detail: input.detail ?? "",
      };
      rows.push(row);
      await writeCsvFile(FILE, INTERACTION_COLUMNS, rows.map(toRecord));
      return row;
    });
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
