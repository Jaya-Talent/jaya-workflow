import type { Applicant } from "../applicants/types.ts";
import {
  getEmailThreshold,
  getInstantThreshold,
  getTelegramThreshold,
} from "../matching/config.ts";
import { getMatchesRepository } from "../matching/matches-repository.server.ts";
import type { Job, StoredMatch } from "../matching/types.ts";
import { sendEmail } from "./email.server.ts";
import { getInteractionsRepository } from "./interactions-repository.server.ts";
import { getNotificationsRepository } from "./notifications-repository.server.ts";
import { emailHtml, emailSubject } from "./templates.ts";
import { sendTelegramMatch } from "./telegram.server.ts";
import type { NotificationChannel, NotificationType, StoredNotification } from "./types.ts";

function publicOrigin() {
  return process.env.PUBLIC_APP_URL?.replace(/\/$/, "") || "";
}

function jobViewUrl(job: Job, applicant: Applicant, match: StoredMatch) {
  const origin = publicOrigin();
  const path = `/jobs/${job.id}?applicant=${encodeURIComponent(applicant.id)}&match=${encodeURIComponent(match.match_id)}`;
  return origin ? `${origin}${path}` : path;
}

function applyUrl(job: Job, applicant: Applicant, match: StoredMatch) {
  if (job.apply_url) return job.apply_url;
  return jobViewUrl(job, applicant, match);
}

function channelEnabled(applicant: Applicant, channel: NotificationChannel) {
  if (channel === "telegram") return applicant.telegram_notifications !== false;
  return applicant.email_notifications !== false;
}

function thresholdFor(channel: NotificationChannel) {
  return channel === "telegram" ? getTelegramThreshold() : getEmailThreshold();
}

export function classifyDelivery(applicant: Applicant, score: number): NotificationType | null {
  const minScore = Math.max(applicant.minimum_match_score || 0, 0);
  if (score < minScore) return null;
  const frequency = applicant.notification_frequency || "instant";
  if (frequency === "weekly") return "weekly_digest";
  if (frequency === "daily") return "daily_digest";
  if (score >= getInstantThreshold()) return "instant";
  return "daily_digest";
}

export async function notifyForMatch(applicant: Applicant, job: Job, match: StoredMatch) {
  if (job.status !== "active") return { telegram: "skipped", email: "skipped" };
  const ignored = await getInteractionsRepository().ignoredJobIds(applicant.id);
  if (ignored.includes(job.id)) {
    return { telegram: "skipped", email: "skipped" };
  }
  const delivery = classifyDelivery(applicant, match.match_score);
  if (!delivery) return { telegram: "below_threshold", email: "below_threshold" };

  const telegramStatus =
    delivery === "instant"
      ? await sendChannel("telegram", "instant", applicant, job, match)
      : "queued_digest";
  const emailStatus =
    delivery === "instant"
      ? await sendChannel("email", "instant", applicant, job, match)
      : "queued_digest";

  await getMatchesRepository().updateMatch(match.match_id, {
    notification_status:
      telegramStatus === "sent" || emailStatus === "sent"
        ? "sent"
        : delivery === "instant"
          ? "attempted"
          : "queued",
    telegram_status: telegramStatus,
    email_status: emailStatus,
  });

  return { telegram: telegramStatus, email: emailStatus };
}

async function sendChannel(
  channel: NotificationChannel,
  type: NotificationType,
  applicant: Applicant,
  job: Job,
  match: StoredMatch,
) {
  if (!channelEnabled(applicant, channel)) return "opted_out";
  if (match.match_score < thresholdFor(channel)) return "below_threshold";
  const repo = getNotificationsRepository();
  const already = await repo.findSent(applicant.id, job.id, channel);
  if (already) return "already_sent";

  const row = await repo.createNotification({
    applicant_id: applicant.id,
    job_id: job.id,
    match_id: match.match_id,
    channel,
    notification_type: type,
    status: "queued",
    sent_at: "",
    opened_at: "",
    clicked_at: "",
    action: "",
    error: "",
    attempts: 0,
    next_retry_at: "",
  });

  return dispatchNotification(row, applicant, job, match);
}

export async function dispatchNotification(
  row: StoredNotification,
  applicant: Applicant,
  job: Job,
  match: StoredMatch,
) {
  const repo = getNotificationsRepository();
  let result: { ok: true } | { ok: false; error: string; retry: boolean };
  if (row.channel === "telegram") {
    result = await sendTelegramMatch(applicant, job, match, applyUrl(job, applicant, match));
  } else {
    if (!applicant.email) {
      result = { ok: false, error: "No email on file", retry: false };
    } else {
      result = await sendEmail({
        to: applicant.email,
        subject: emailSubject(job, match.match_score),
        html: emailHtml(applicant, job, match, jobViewUrl(job, applicant, match)),
      });
    }
  }

  const attempts = (row.attempts || 0) + 1;
  if (result.ok) {
    await repo.updateNotification(row.notification_id, {
      status: "sent",
      sent_at: new Date().toISOString(),
      error: "",
      attempts,
    });
    return "sent";
  }

  const retry = result.retry && attempts < 3;
  const next = new Date(Date.now() + attempts * 5 * 60 * 1000).toISOString();
  await repo.updateNotification(row.notification_id, {
    status: retry ? "failed" : "failed",
    error: result.error,
    attempts,
    next_retry_at: retry ? next : "",
  });
  return retry ? "failed_retry" : "failed";
}

export async function retryFailedNotifications() {
  const now = new Date().toISOString();
  const pending = await getNotificationsRepository().listRetryable(now);
  let retried = 0;
  for (const row of pending) {
    const { getApplicantRepository } = await import("../applicants/sql-repository.server.ts");
    const { getJobsRepository } = await import("../jobs/jobs-repository.server.ts");
    const applicant = await getApplicantRepository().getApplicant(row.applicant_id);
    const job = await getJobsRepository().getJob(row.job_id);
    const match = await getMatchesRepository().getMatch(row.match_id);
    if (!applicant || !job || !match) continue;
    await dispatchNotification(row, applicant, job, match);
    retried += 1;
  }
  return { retried };
}
