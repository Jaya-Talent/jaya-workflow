import { isAdminAuthenticated, unauthorized } from "../applicants/admin-auth.server.ts";
import { jsonError } from "../applicants/http.ts";
import { NotFoundError, ValidationError } from "../applicants/types.ts";
import { queueJobMatching } from "../matching/pipeline.server.ts";
import type { Job } from "../matching/types.ts";
import { getJobsRepository } from "./jobs-repository.server.ts";

export async function handleListJobs() {
  const jobs = await getJobsRepository().listActiveJobs();
  return Response.json({ jobs });
}

export async function handleGetJob(id: string) {
  const job = await getJobsRepository().getJob(id);
  if (!job) return jsonError(new NotFoundError("Job not found"));
  return Response.json({ job });
}

export async function handleCreateJob(request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const body = (await request.json()) as Partial<Job>;
    if (!body.title || !body.company) {
      throw new ValidationError("Title and company are required.");
    }
    const job = await getJobsRepository().createJob({
      title: String(body.title),
      company: String(body.company),
      location: String(body.location || "Remote"),
      remote: body.remote === "hybrid" || body.remote === "onsite" ? body.remote : "remote",
      employment_type: String(body.employment_type || "Full-time"),
      seniority: String(body.seniority || ""),
      years_min: String(body.years_min || ""),
      years_max: String(body.years_max || ""),
      salary_min: String(body.salary_min || ""),
      salary_max: String(body.salary_max || ""),
      salary_currency: String(body.salary_currency || "USD"),
      category: String(body.category || "Software Engineering"),
      required_skills: Array.isArray(body.required_skills) ? body.required_skills.map(String) : [],
      preferred_skills: Array.isArray(body.preferred_skills) ? body.preferred_skills.map(String) : [],
      technologies: Array.isArray(body.technologies) ? body.technologies.map(String) : [],
      description: String(body.description || ""),
      apply_url: String(body.apply_url || ""),
      status: "active",
      source: "admin",
    });
    queueJobMatching(job.id);
    return Response.json({ job }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function handleAdminJobs(request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  const jobs = await getJobsRepository().listJobs();
  return Response.json({ jobs, total: jobs.length, active: jobs.filter((job) => job.status === "active").length });
}
