import { isAdminAuthenticated, unauthorized } from "../applicants/admin-auth.server.ts";
import { getApplicantRepository } from "../applicants/sql-repository.server.ts";
import { jsonError } from "../applicants/http.ts";
import { NotFoundError } from "../applicants/types.ts";
import { getJobsRepository } from "../jobs/jobs-repository.server.ts";
import { getInteractionsRepository } from "../notifications/interactions-repository.server.ts";
import { getNotificationsRepository } from "../notifications/notifications-repository.server.ts";
import { retryFailedNotifications } from "../notifications/service.server.ts";
import {
  matchApplicantAgainstJobs,
  matchJobAgainstApplicants,
  runMatchingCycle,
} from "./pipeline.server.ts";
import { getMatchesRepository } from "./matches-repository.server.ts";

export async function handleMatchJob(jobId: string, request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  const job = await getJobsRepository().getJob(jobId);
  if (!job) return jsonError(new NotFoundError("Job not found"));
  const result = await matchJobAgainstApplicants(jobId);
  return Response.json({ ok: true, ...result });
}

export async function handleMatchApplicant(applicantId: string, request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  const applicant = await getApplicantRepository().getApplicant(applicantId);
  if (!applicant) return jsonError(new NotFoundError());
  const result = await matchApplicantAgainstJobs(applicantId);
  return Response.json({ ok: true, ...result });
}

export async function handleMatchRun(request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  const result = await runMatchingCycle();
  return Response.json({ ok: true, ...result });
}

export async function handleApplicantMatches(applicantId: string) {
  const applicant = await getApplicantRepository().getApplicant(applicantId);
  if (!applicant) return jsonError(new NotFoundError());
  let matches = await getMatchesRepository().listByApplicant(applicantId);
  if (matches.length === 0) {
    await matchApplicantAgainstJobs(applicantId);
    matches = await getMatchesRepository().listByApplicant(applicantId);
  }
  const jobs = await getJobsRepository().listJobs();
  const jobMap = new Map(jobs.map((job) => [job.id, job]));
  const rows = matches.map((match) => ({
    ...match,
    job: jobMap.get(match.job_id) ?? null,
  }));
  return Response.json({ matches: rows });
}

export async function handleJobMatches(jobId: string, request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  const job = await getJobsRepository().getJob(jobId);
  if (!job) return jsonError(new NotFoundError("Job not found"));
  const applicants = await getApplicantRepository().listApplicants();
  const people = new Map(applicants.map((row) => [row.id, row]));
  const matches = (await getMatchesRepository().listByJob(jobId)).map((match) => ({
    ...match,
    applicant: people.get(match.applicant_id)
      ? {
          id: people.get(match.applicant_id)!.id,
          full_name: people.get(match.applicant_id)!.full_name,
          email: people.get(match.applicant_id)!.email,
          experience_level: people.get(match.applicant_id)!.experience_level,
          country: people.get(match.applicant_id)!.country,
        }
      : null,
  }));
  return Response.json({ matches });
}

export async function handleAdminMatching(request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const [applicants, jobs, matches, notifications] = await Promise.all([
      getApplicantRepository().listApplicants().catch((err) => {
        console.error("[handleAdminMatching] listApplicants error:", err);
        return [];
      }),
      getJobsRepository().listJobs().catch((err) => {
        console.error("[handleAdminMatching] listJobs error:", err);
        return [];
      }),
      getMatchesRepository().listMatches().catch((err) => {
        console.error("[handleAdminMatching] listMatches error:", err);
        return [];
      }),
      getNotificationsRepository().listNotifications().catch((err) => {
        console.error("[handleAdminMatching] listNotifications error:", err);
        return [];
      }),
    ]);

    const people = new Map(applicants.map((row) => [row.id, row]));
    const jobMap = new Map(jobs.map((row) => [row.id, row]));
    const rows = (matches || [])
      .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      .map((match) => ({
        ...match,
        applicant_name: people.get(match.applicant_id)?.full_name ?? "Unknown",
        applicant_email: people.get(match.applicant_id)?.email ?? "",
        job_title: jobMap.get(match.job_id)?.title ?? "Unknown",
        job_company: jobMap.get(match.job_id)?.company ?? "",
        job_category: jobMap.get(match.job_id)?.category ?? "",
      }));

    return Response.json({
      stats: {
        applicants: applicants.length,
        activeJobs: jobs.filter((job) => job.status === "active").length,
        matches: matches.length,
        above80: matches.filter((match) => (match.match_score || 0) >= 80).length,
        notificationsSent: notifications.filter((row) => row.status === "sent").length,
      },
      matches: rows,
    });
  } catch (err: any) {
    console.error("[handleAdminMatching top-level error]", err);
    return Response.json({
      stats: {
        applicants: 0,
        activeJobs: 0,
        matches: 0,
        above80: 0,
        notificationsSent: 0,
      },
      matches: [],
      error: err?.message || String(err),
    });
  }
}

export async function handleRetryNotifications(request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  const result = await retryFailedNotifications();
  return Response.json({ ok: true, ...result });
}

export async function handleMatchAction(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    applicant_id?: string;
    job_id?: string;
    match_id?: string;
    action?: "view" | "click" | "save" | "apply" | "not_relevant" | "dismiss" | "feedback";
    detail?: string;
  } | null;
  if (!body?.job_id || !body.action) {
    return Response.json({ error: "job_id and action are required" }, { status: 400 });
  }
  const applicantId = body.applicant_id || "guest";
  const interaction = await getInteractionsRepository().record({
    applicant_id: applicantId,
    job_id: body.job_id,
    interaction_type: body.action,
    detail: body.detail ?? "",
  });
  if (body.match_id && (body.action === "click" || body.action === "apply")) {
    const notes = await getNotificationsRepository().listNotifications();
    const related = notes.find(
      (row) => row.match_id === body.match_id && row.applicant_id === applicantId,
    );
    if (related) {
      await getNotificationsRepository().updateNotification(related.notification_id, {
        clicked_at: new Date().toISOString(),
        action: body.action,
      });
    }
  }
  return Response.json({ ok: true, interaction });
}
