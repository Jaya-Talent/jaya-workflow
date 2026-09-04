import type { Applicant, ApplicantInput } from "./types.ts";

export type CompletionInput = Partial<
  Omit<ApplicantInput, "consent"> & {
    cv_filename?: string;
    has_cv?: boolean;
  }
>;

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasList(value: unknown): boolean {
  return Array.isArray(value) && value.some((item) => hasText(String(item)));
}

export function calculateProfileCompletion(input: CompletionInput): number {
  let score = 0;

  // Basic information — 20%
  if (hasText(input.full_name)) score += 6;
  if (hasText(input.email)) score += 6;
  if (hasText(input.country)) score += 4;
  if (hasText(input.city)) score += 1;
  if (hasText(input.telegram_username)) score += 1;
  if (hasText(input.linkedin_url)) score += 1;
  if (hasText(input.github_url)) score += 0.5;
  if (hasText(input.portfolio_url)) score += 0.5;

  // Career information — 30%
  if (hasList(input.job_categories)) score += 8;
  if (hasList(input.target_job_titles)) score += 8;
  if (hasText(input.experience_level)) score += 6;
  if (hasText(input.years_experience)) score += 4;
  if (hasList(input.employment_type)) score += 4;

  // Skills / preferences — 30%
  if (hasList(input.skills)) score += 12;
  if (hasText(input.work_preference)) score += 6;
  if (hasList(input.preferred_locations)) score += 6;
  if (hasText(input.salary_min)) score += 3;
  if (hasText(input.availability)) score += 3;

  // CV / profile — 20%
  if (input.has_cv || hasText(input.cv_filename)) score += 12;
  if (hasText(input.professional_bio) && (input.professional_bio?.trim().length ?? 0) >= 40) {
    score += 8;
  } else if (hasText(input.professional_bio)) {
    score += 4;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function completionFromApplicant(applicant: Applicant): number {
  return calculateProfileCompletion(applicant);
}
