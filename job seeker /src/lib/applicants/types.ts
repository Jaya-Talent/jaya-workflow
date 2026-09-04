export type NotificationFrequency = "instant" | "daily" | "weekly";

export type Applicant = {
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
  telegram_notifications: boolean;
  email_notifications: boolean;
  notification_frequency: NotificationFrequency;
  minimum_match_score: number;
  telegram_chat_id: string;
  last_digest_at: string;
};

export type ApplicantInput = Omit<
  Applicant,
  "id" | "created_at" | "updated_at" | "profile_completion" | "cv_filename"
> & {
  cv_filename?: string;
};

export type ApplicantPatch = Partial<ApplicantInput>;

export interface ApplicantRepository {
  createApplicant(input: ApplicantInput): Promise<Applicant>;
  getApplicant(id: string): Promise<Applicant | null>;
  updateApplicant(id: string, patch: ApplicantPatch): Promise<Applicant | null>;
  findApplicantByEmail(email: string): Promise<Applicant | null>;
  listApplicants(): Promise<Applicant[]>;
}

export class DuplicateEmailError extends Error {
  constructor() {
    super(
      "An account with this email already exists. You can update your profile instead.",
    );
    this.name = "DuplicateEmailError";
  }
}

export class ValidationError extends Error {
  fields: Record<string, string>;
  constructor(message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export class NotFoundError extends Error {
  constructor(message = "Applicant not found") {
    super(message);
    this.name = "NotFoundError";
  }
}
