import { getApplicantRepository } from "../applicants/sql-repository.server.ts";
import type { Applicant } from "../applicants/types.ts";
import { getJobsRepository } from "../jobs/jobs-repository.server.ts";
import { getEmailThreshold } from "../matching/config.ts";
import { getMatchesRepository } from "../matching/matches-repository.server.ts";
import type { Job, StoredMatch } from "../matching/types.ts";
import { sendEmail } from "./email.server.ts";
import { getNotificationsRepository } from "./notifications-repository.server.ts";
import { digestHtml, digestSubject } from "./templates.ts";

function origin() {
  return process.env.PUBLIC_APP_URL?.replace(/\/$/, "") || "";
}

function due(applicant: Applicant, kind: "daily" | "weekly") {
  if (!applicant.last_digest_at) return true;
  const last = Date.parse(applicant.last_digest_at);
  if (!Number.isFinite(last)) return true;
  const elapsed = Date.now() - last;
  return kind === "daily" ? elapsed >= 20 * 60 * 60 * 1000 : elapsed >= 6 * 24 * 60 * 60 * 1000;
}

export async function sendDigestRound(kind: "daily" | "weekly") {
  const applicants = await getApplicantRepository().listApplicants();
  const jobs = await getJobsRepository().listJobs();
  const jobMap = new Map(jobs.map((job) => [job.id, job]));
  const matchesRepo = getMatchesRepository();
  const notes = getNotificationsRepository();
  let sent = 0;

  for (const applicant of applicants) {
    const frequency = applicant.notification_frequency || "instant";
    const wantsDigest =
      kind === "daily"
        ? frequency === "daily" || frequency === "instant"
        : frequency === "weekly";
    if (!wantsDigest || !applicant.email_notifications) continue;
    if (!due(applicant, kind)) continue;

    const minScore = Math.max(applicant.minimum_match_score || 75, getEmailThreshold());
    const scored = (await matchesRepo.listByApplicant(applicant.id))
      .filter((match) => match.match_score >= minScore)
      .filter((match) => jobMap.get(match.job_id)?.status === "active")
      .slice(0, 12);
    if (scored.length === 0) continue;

    const items: Array<{ job: Job; match: StoredMatch }> = [];
    for (const match of scored) {
      const job = jobMap.get(match.job_id);
      if (job) items.push({ job, match });
    }
    if (items.length === 0) continue;

    const top = items.slice(0, 5);
    const viewAll = `${origin()}/profile/${applicant.id}`;
    const result = await sendEmail({
      to: applicant.email,
      subject: digestSubject(top.length, kind === "daily" ? "today" : "this week"),
      html: digestHtml(applicant, top, items.length, viewAll, kind === "daily" ? "today" : "this week"),
    });

    await notes.createNotification({
      applicant_id: applicant.id,
      job_id: top[0]?.job.id ?? "",
      match_id: top[0]?.match.match_id ?? "",
      channel: "email",
      notification_type: kind === "daily" ? "daily_digest" : "weekly_digest",
      status: result.ok ? "sent" : "failed",
      sent_at: result.ok ? new Date().toISOString() : "",
      opened_at: "",
      clicked_at: "",
      action: "",
      error: result.ok ? "" : result.error,
      attempts: 1,
      next_retry_at: "",
    });

    if (result.ok) {
      await getApplicantRepository().updateApplicant(applicant.id, {
        last_digest_at: new Date().toISOString(),
      });
      sent += 1;
    }
  }

  return { sent };
}
