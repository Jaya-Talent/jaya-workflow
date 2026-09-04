import { randomUUID } from "node:crypto";
import { ensureCsvFile, readCsvFile, withFileLock, writeCsvFile } from "../store/csv-table.server.ts";
import type { StoredNotification } from "./types.ts";

const FILE = "notifications.csv";

export const NOTIFICATION_COLUMNS = [
  "notification_id",
  "applicant_id",
  "job_id",
  "match_id",
  "channel",
  "notification_type",
  "status",
  "sent_at",
  "opened_at",
  "clicked_at",
  "action",
  "error",
  "attempts",
  "next_retry_at",
] as const;

function toRecord(row: StoredNotification): Record<string, string> {
  return {
    notification_id: row.notification_id,
    applicant_id: row.applicant_id,
    job_id: row.job_id,
    match_id: row.match_id,
    channel: row.channel,
    notification_type: row.notification_type,
    status: row.status,
    sent_at: row.sent_at,
    opened_at: row.opened_at,
    clicked_at: row.clicked_at,
    action: row.action,
    error: row.error,
    attempts: String(row.attempts ?? 0),
    next_retry_at: row.next_retry_at ?? "",
  };
}

function fromRecord(record: Record<string, string>): StoredNotification {
  return {
    notification_id: record.notification_id ?? "",
    applicant_id: record.applicant_id ?? "",
    job_id: record.job_id ?? "",
    match_id: record.match_id ?? "",
    channel: (record.channel as StoredNotification["channel"]) || "email",
    notification_type: (record.notification_type as StoredNotification["notification_type"]) || "instant",
    status: (record.status as StoredNotification["status"]) || "queued",
    sent_at: record.sent_at ?? "",
    opened_at: record.opened_at ?? "",
    clicked_at: record.clicked_at ?? "",
    action: record.action ?? "",
    error: record.error ?? "",
    attempts: Number(record.attempts || 0),
    next_retry_at: record.next_retry_at ?? "",
  };
}

async function readAll() {
  await ensureCsvFile(FILE, NOTIFICATION_COLUMNS);
  return (await readCsvFile(FILE)).map(fromRecord).filter((row) => row.notification_id);
}

export class NotificationsRepository {
  async listNotifications() {
    return readAll();
  }

  async findSent(applicantId: string, jobId: string, channel: string) {
    return (await readAll()).find(
      (row) =>
        row.applicant_id === applicantId &&
        row.job_id === jobId &&
        row.channel === channel &&
        (row.status === "sent" || row.status === "queued"),
    );
  }

  async createNotification(input: Omit<StoredNotification, "notification_id"> & { notification_id?: string }) {
    return withFileLock(FILE, async () => {
      const rows = await readAll();
      const row: StoredNotification = {
        ...input,
        notification_id: input.notification_id || randomUUID(),
      };
      rows.push(row);
      await writeCsvFile(FILE, NOTIFICATION_COLUMNS, rows.map(toRecord));
      return row;
    });
  }

  async updateNotification(id: string, patch: Partial<StoredNotification>) {
    return withFileLock(FILE, async () => {
      const rows = await readAll();
      const index = rows.findIndex((row) => row.notification_id === id);
      if (index === -1) return null;
      const current = rows[index];
      if (!current) return null;
      const next = { ...current, ...patch, notification_id: id };
      rows[index] = next;
      await writeCsvFile(FILE, NOTIFICATION_COLUMNS, rows.map(toRecord));
      return next;
    });
  }

  async listRetryable(nowIso: string) {
    return (await readAll()).filter(
      (row) =>
        row.status === "failed" &&
        row.attempts < 3 &&
        (!row.next_retry_at || row.next_retry_at <= nowIso),
    );
  }
}

let repository: NotificationsRepository | null = null;

export function getNotificationsRepository() {
  if (!repository) repository = new NotificationsRepository();
  return repository;
}
