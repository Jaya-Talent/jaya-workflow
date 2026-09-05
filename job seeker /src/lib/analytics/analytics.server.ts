import { isAdminAuthenticated, unauthorized } from "../applicants/admin-auth.server.ts";
import { getApplicantRepository } from "../applicants/sql-repository.server.ts";
import { getJobsRepository } from "../jobs/jobs-repository.server.ts";
import { getMatchesRepository } from "../matching/matches-repository.server.ts";
import { getInteractionsRepository } from "../notifications/interactions-repository.server.ts";

export async function handleAdminAnalytics(request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();

  const [applicants, jobs, matches, interactions] = await Promise.all([
    getApplicantRepository().listApplicants(),
    getJobsRepository().listJobs(),
    getMatchesRepository().listMatches(),
    getInteractionsRepository().listInteractions(),
  ]);

  return Response.json({
    applicants: applicants.map((a) => ({
      id: a.id,
      created_at: a.created_at,
      job_categories: a.job_categories || [],
      skills: a.skills || [],
      country: a.country || "",
      city: a.city || "",
      experience_level: a.experience_level || "",
      work_preference: a.work_preference || "",
      profile_completion: a.profile_completion || 0,
      cv_attached: Boolean(a.cv_filename),
    })),
    jobs: jobs.map((j) => ({
      id: j.id,
      created_at: j.created_at,
      title: j.title,
      company: j.company,
      location: j.location,
      remote: j.remote,
      category: j.category,
      required_skills: j.required_skills || [],
      preferred_skills: j.preferred_skills || [],
      technologies: j.technologies || [],
      salary_min: j.salary_min || "",
      salary_currency: j.salary_currency || "USD",
      status: j.status,
    })),
    matches: matches.map((m) => ({
      match_id: m.match_id,
      created_at: m.created_at,
      match_score: m.match_score,
      score_category: m.score_category,
      job_id: m.job_id,
      applicant_id: m.applicant_id,
    })),
    interactions: interactions.map((i) => ({
      interaction_id: i.interaction_id,
      timestamp: i.timestamp,
      interaction_type: i.interaction_type,
      job_id: i.job_id,
      applicant_id: i.applicant_id,
    })),
  });
}
