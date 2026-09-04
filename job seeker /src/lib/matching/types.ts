import type { Applicant } from "../applicants/types.ts";

export type ScoreCategory =
  | "excellent"
  | "strong"
  | "good"
  | "possible"
  | "poor";

export type MatchBreakdown = {
  skills: number;
  experience: number;
  title: number;
  seniority: number;
  location: number;
  employment: number;
  salary: number;
  other: number;
};

export type MatchResult = {
  score: number;
  category: ScoreCategory;
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  strongReasons: string[];
  partialReasons: string[];
  gaps: string[];
  summary: string;
  explanation: string;
  breakdown: MatchBreakdown;
};

export type Job = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  company: string;
  location: string;
  remote: "remote" | "hybrid" | "onsite";
  employment_type: string;
  seniority: string;
  years_min: string;
  years_max: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  category: string;
  required_skills: string[];
  preferred_skills: string[];
  technologies: string[];
  description: string;
  apply_url: string;
  status: "active" | "closed";
  source: string;
};

export type StoredMatch = {
  match_id: string;
  applicant_id: string;
  job_id: string;
  match_score: number;
  score_category: ScoreCategory;
  matched_skills: string[];
  missing_skills: string[];
  partial_skills: string[];
  match_reasons: string;
  created_at: string;
  updated_at: string;
  notification_status: string;
  telegram_status: string;
  email_status: string;
};

export type ApplicantLike = Pick<
  Applicant,
  | "id"
  | "full_name"
  | "skills"
  | "target_job_titles"
  | "experience_level"
  | "years_experience"
  | "employment_type"
  | "work_preference"
  | "preferred_locations"
  | "country"
  | "city"
  | "salary_min"
  | "salary_currency"
  | "job_categories"
  | "professional_bio"
  | "availability"
>;

export type MatchingWeights = {
  skills: number;
  experience: number;
  title: number;
  seniority: number;
  location: number;
  employment: number;
  salary: number;
  other: number;
};
