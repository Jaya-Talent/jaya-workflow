import {
  DuplicateEmailError,
  NotFoundError,
  ValidationError,
} from "./types.ts";

export function jsonError(error: unknown) {
  if (error instanceof DuplicateEmailError) {
    return Response.json({ error: error.message, code: "duplicate_email" }, { status: 409 });
  }
  if (error instanceof ValidationError) {
    return Response.json({ error: error.message, fields: error.fields }, { status: 400 });
  }
  if (error instanceof NotFoundError) {
    return Response.json({ error: error.message }, { status: 404 });
  }
  console.error("Applicant API error:", error instanceof Error ? error.message : "unknown");
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export function toPublicApplicant(applicant: {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  telegram_username: string;
  country: string;
  city: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  job_categories: string[];
  target_job_titles: string[];
  experience_level: string;
  years_experience: string;
  employment_type: string[];
  skills: string[];
  work_preference: string;
  preferred_locations: string[];
  salary_min: string;
  salary_currency: string;
  availability: string;
  professional_bio: string;
  cv_filename: string;
  profile_completion: number;
  consent: boolean;
  telegram_notifications?: boolean;
  email_notifications?: boolean;
  notification_frequency?: string;
  minimum_match_score?: number;
  telegram_chat_id?: string;
  last_digest_at?: string;
}) {
  return {
    ...applicant,
    has_cv: Boolean(applicant.cv_filename),
  };
}
