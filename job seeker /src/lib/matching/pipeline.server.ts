import { getApplicantRepository } from "../applicants/sql-repository.server.ts";
import type { Applicant } from "../applicants/types.ts";
import { getJobsRepository } from "../jobs/jobs-repository.server.ts";
import { notifyForMatch, retryFailedNotifications } from "../notifications/service.server.ts";
import { sendDigestRound } from "../notifications/digest.server.ts";
import { getMatchingWeights } from "./config.ts";
import { scoreMatch, shouldPrefilter } from "./engine.ts";
import { getMatchesRepository } from "./matches-repository.server.ts";
import { maybeEnhanceExplanation, resetSemanticBudget } from "./semantic.server.ts";
import type { Job } from "./types.ts";

export type MatchingRunResult = {
  compared: number;
  stored: number;
  notified: number;
  skipped: number;
};

async function persistAndMaybeNotify(applicant: Applicant, job: Job) {
  const matches = getMatchesRepository();
  const weights = getMatchingWeights();
  const existing = await matches.findByPair(applicant.id, job.id);
  const result = scoreMatch(applicant, job, weights);
  const explanation =
    result.score >= 75 ? await maybeEnhanceExplanation(applicant, job, result) : result.explanation;
  const { match, created } = await matches.upsertMatch({
    match_id: existing?.match_id,
    applicant_id: applicant.id,
    job_id: job.id,
    match_score: result.score,
    score_category: result.category,
    matched_skills: result.matchedSkills,
    missing_skills: result.missingSkills,
    partial_skills: result.partialSkills,
    match_reasons: explanation,
    notification_status: existing?.notification_status ?? "pending",
    telegram_status: existing?.telegram_status ?? "",
    email_status: existing?.email_status ?? "",
  });

  const alreadySent = existing?.notification_status === "sent";
  const scoreJump = existing ? match.match_score - existing.match_score : match.match_score;
  const shouldNotify = !alreadySent || scoreJump >= 10;
  if (shouldNotify) {
    const status = await notifyForMatch(applicant, job, match);
    const notified = status.telegram === "sent" || status.email === "sent";
    return { stored: true, created, notified };
  }
  return { stored: true, created, notified: false };
}

export async function matchJobAgainstApplicants(jobId: string): Promise<MatchingRunResult> {
  const job = await getJobsRepository().getJob(jobId);
  if (!job) return { compared: 0, stored: 0, notified: 0, skipped: 0 };
  const applicants = await getApplicantRepository().listApplicants();
  const matchesRepo = getMatchesRepository();
  const existingMatches = await matchesRepo.listByJob(jobId);
  const existingMap = new Map(existingMatches.map((m) => [m.applicant_id, m]));
  const weights = getMatchingWeights();
  resetSemanticBudget();

  let compared = 0;
  let stored = 0;
  let notified = 0;
  let skipped = 0;

  const toUpsert: Array<Omit<StoredMatch, "match_id" | "created_at" | "updated_at"> & { match_id?: string }> = [];

  for (const applicant of applicants) {
    compared += 1;
    if (shouldPrefilter(applicant, job)) {
      skipped += 1;
      continue;
    }
    const existing = existingMap.get(applicant.id);
    const result = scoreMatch(applicant, job, weights);

    toUpsert.push({
      match_id: existing?.match_id,
      applicant_id: applicant.id,
      job_id: job.id,
      match_score: result.score,
      score_category: result.category,
      matched_skills: result.matchedSkills,
      missing_skills: result.missingSkills,
      partial_skills: result.partialSkills,
      match_reasons: result.explanation,
      notification_status: existing?.notification_status ?? "pending",
      telegram_status: existing?.telegram_status ?? "",
      email_status: existing?.email_status ?? "",
    });
    stored += 1;
  }

  if (toUpsert.length > 0) {
    await matchesRepo.upsertMatchesBulk(toUpsert);
  }

  return { compared, stored, notified, skipped };
}

export async function matchApplicantAgainstJobs(applicantId: string): Promise<MatchingRunResult> {
  const applicant = await getApplicantRepository().getApplicant(applicantId);
  if (!applicant) return { compared: 0, stored: 0, notified: 0, skipped: 0 };
  const jobs = await getJobsRepository().listActiveJobs();
  const matchesRepo = getMatchesRepository();
  const existingMatches = await matchesRepo.listByApplicant(applicantId);
  const existingMap = new Map(existingMatches.map((m) => [m.job_id, m]));
  const weights = getMatchingWeights();
  resetSemanticBudget();

  let compared = 0;
  let stored = 0;
  let notified = 0;
  let skipped = 0;

  const toUpsert: Array<Omit<StoredMatch, "match_id" | "created_at" | "updated_at"> & { match_id?: string }> = [];

  for (const job of jobs) {
    compared += 1;
    if (shouldPrefilter(applicant, job)) {
      skipped += 1;
      continue;
    }
    const existing = existingMap.get(job.id);
    const result = scoreMatch(applicant, job, weights);

    toUpsert.push({
      match_id: existing?.match_id,
      applicant_id: applicant.id,
      job_id: job.id,
      match_score: result.score,
      score_category: result.category,
      matched_skills: result.matchedSkills,
      missing_skills: result.missingSkills,
      partial_skills: result.partialSkills,
      match_reasons: result.explanation,
      notification_status: existing?.notification_status ?? "pending",
      telegram_status: existing?.telegram_status ?? "",
      email_status: existing?.email_status ?? "",
    });
    stored += 1;
  }

  if (toUpsert.length > 0) {
    await matchesRepo.upsertMatchesBulk(toUpsert);
  }

  return { compared, stored, notified, skipped };
}

export async function runMatchingCycle(): Promise<MatchingRunResult & { retries: number }> {
  const [applicants, jobs, matchesRepo] = await Promise.all([
    getApplicantRepository().listApplicants(),
    getJobsRepository().listActiveJobs(),
    Promise.resolve(getMatchesRepository()),
  ]);

  const existingMatches = await matchesRepo.listMatches();
  const existingMap = new Map(existingMatches.map((m) => [`${m.applicant_id}:${m.job_id}`, m]));
  const weights = getMatchingWeights();
  resetSemanticBudget();

  let compared = 0;
  let stored = 0;
  let notified = 0;
  let skipped = 0;

  const toUpsert: Array<Omit<StoredMatch, "match_id" | "created_at" | "updated_at"> & { match_id?: string }> = [];

  for (const applicant of applicants) {
    for (const job of jobs) {
      compared += 1;
      if (shouldPrefilter(applicant, job)) {
        skipped += 1;
        continue;
      }
      const existing = existingMap.get(`${applicant.id}:${job.id}`);
      const result = scoreMatch(applicant, job, weights);

      toUpsert.push({
        match_id: existing?.match_id,
        applicant_id: applicant.id,
        job_id: job.id,
        match_score: result.score,
        score_category: result.category,
        matched_skills: result.matchedSkills,
        missing_skills: result.missingSkills,
        partial_skills: result.partialSkills,
        match_reasons: result.explanation,
        notification_status: existing?.notification_status ?? "pending",
        telegram_status: existing?.telegram_status ?? "",
        email_status: existing?.email_status ?? "",
      });
      stored += 1;
    }
  }

  if (toUpsert.length > 0) {
    await matchesRepo.upsertMatchesBulk(toUpsert);
  }

  return { compared, stored, notified, skipped, retries: 0 };
}

export function queueApplicantMatching(applicantId: string) {
  void matchApplicantAgainstJobs(applicantId).catch((error) => {
    console.error("Matching after applicant create failed:", error instanceof Error ? error.message : error);
  });
}

export function queueJobMatching(jobId: string) {
  void matchJobAgainstApplicants(jobId).catch((error) => {
    console.error("Matching after job create failed:", error instanceof Error ? error.message : error);
  });
}
