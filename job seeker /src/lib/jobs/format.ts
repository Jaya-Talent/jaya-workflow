import type { Job, ScoreCategory } from "../matching/types.ts";

export function formatSalary(job: Pick<Job, "salary_min" | "salary_max" | "salary_currency">) {
  const currency = job.salary_currency || "USD";
  if (!job.salary_min && !job.salary_max) return "";
  if (job.salary_min && job.salary_max) return `${currency} ${formatAmount(job.salary_min)}–${formatAmount(job.salary_max)}`;
  return `${currency} ${formatAmount(job.salary_min || job.salary_max)}`;
}

function formatAmount(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export function formatLocation(job: Pick<Job, "remote" | "location">) {
  if (job.remote === "remote") return job.location && job.location.toLowerCase() !== "remote" ? `Remote · ${job.location}` : "Remote";
  if (job.remote === "hybrid") return job.location ? `Hybrid · ${job.location}` : "Hybrid";
  return job.location || "On-site";
}

export function scoreTone(score: number): "success" | "accent" | "neutral" {
  if (score >= 85) return "success";
  if (score >= 70) return "accent";
  return "neutral";
}

export function categoryCopy(category: ScoreCategory | string) {
  switch (category) {
    case "excellent":
      return "Excellent Match";
    case "strong":
      return "Strong Match";
    case "good":
      return "Good Match";
    case "possible":
      return "Possible Match";
    default:
      return "Poor Match";
  }
}

export const PROFILE_STORAGE_KEY = "meridian_profile_id";

export function readStoredProfileId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(PROFILE_STORAGE_KEY) || "";
}

export function storeProfileId(id: string) {
  if (typeof window === "undefined" || !id) return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, id);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getJobSlug(job: Pick<Job, "id" | "title" | "company">): string {
  if (!job) return "";
  const titleSlug = slugify(job.title || "role");
  const companySlug = slugify(job.company || "");
  const cleanId = job.id.replace(/^job_scraped_|^job_manual_|^job_/, "");
  if (companySlug && titleSlug) {
    return `${titleSlug}-${companySlug}-${cleanId}`;
  }
  return `${titleSlug || "role"}-${cleanId}`;
}