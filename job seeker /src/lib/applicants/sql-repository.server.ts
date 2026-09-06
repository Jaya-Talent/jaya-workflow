import { getSql } from "../db.ts";
import { calculateProfileCompletion } from "./completion.ts";
import { type Applicant, type ApplicantInput, type ApplicantPatch, type ApplicantRepository, NotFoundError, DuplicateEmailError } from "./types.ts";

function fromRecord(record: any): Applicant {
  const applicant: Applicant = {
    id: record.id,
    created_at: record.created_at?.toISOString() || "",
    updated_at: record.updated_at?.toISOString() || "",
    full_name: record.full_name || "",
    email: record.email || "",
    telegram_username: record.telegram_username || "",
    country: record.country || "",
    city: record.city || "",
    linkedin_url: record.linkedin_url || "",
    github_url: record.github_url || "",
    portfolio_url: record.portfolio_url || "",
    job_categories: record.job_categories || [],
    target_job_titles: record.target_job_titles || [],
    experience_level: record.experience_level || "",
    years_experience: record.years_experience || "",
    employment_type: record.employment_type || [],
    skills: record.skills || [],
    work_preference: record.work_preference || "",
    preferred_locations: record.preferred_locations || [],
    salary_min: record.salary_min || "",
    salary_currency: record.salary_currency || "",
    availability: record.availability || "",
    professional_bio: record.professional_bio || "",
    cv_filename: record.cv_filename || "",
    profile_completion: Number(record.profile_completion || 0),
    consent: record.consent || false,
    telegram_notifications: record.telegram_notifications || false,
    email_notifications: record.email_notifications || false,
    notification_frequency: record.notification_frequency || "weekly",
    minimum_match_score: record.minimum_match_score || 0,
    telegram_chat_id: record.telegram_chat_id || "",
    last_digest_at: record.last_digest_at?.toISOString() || "",
  };

  const computed = calculateProfileCompletion({
    ...applicant,
    has_cv: Boolean(applicant.cv_filename),
  });
  if (computed > applicant.profile_completion) {
    applicant.profile_completion = computed;
  }

  return applicant;
}

export class SqlApplicantRepository implements ApplicantRepository {
  async createApplicant(input: ApplicantInput): Promise<Applicant> {
    const sql = await getSql();
    
    // Check if email already exists
    const existing = await sql`SELECT id FROM applicants WHERE email = ${input.email}`;
    if (existing.length > 0) {
      throw new DuplicateEmailError();
    }

    const completionScore = calculateProfileCompletion({
      ...input,
      has_cv: Boolean(input.cv_filename),
    });

    const rows = await sql`
      INSERT INTO applicants (
        id, full_name, email, telegram_username, country, city, linkedin_url, github_url, portfolio_url,
        job_categories, target_job_titles, experience_level, years_experience, employment_type, skills,
        work_preference, preferred_locations, salary_min, salary_currency, availability, professional_bio,
        cv_filename, profile_completion, consent, telegram_notifications, email_notifications, notification_frequency,
        minimum_match_score, telegram_chat_id
      ) VALUES (
        ${input.id || crypto.randomUUID()}, ${input.full_name}, ${input.email}, ${input.telegram_username}, ${input.country}, ${input.city},
        ${input.linkedin_url}, ${input.github_url}, ${input.portfolio_url}, ${input.job_categories}, ${input.target_job_titles},
        ${input.experience_level}, ${input.years_experience}, ${input.employment_type}, ${input.skills}, ${input.work_preference},
        ${input.preferred_locations}, ${input.salary_min}, ${input.salary_currency}, ${input.availability}, ${input.professional_bio},
        ${input.cv_filename}, ${completionScore}, ${input.consent}, ${input.telegram_notifications}, ${input.email_notifications},
        ${input.notification_frequency}, ${input.minimum_match_score}, ${input.telegram_chat_id}
      ) RETURNING *
    `;
    
    return fromRecord(rows[0]);
  }

  async getApplicant(id: string): Promise<Applicant | null> {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM applicants WHERE id = ${id}`;
    if (rows.length === 0) return null;
    return fromRecord(rows[0]);
  }

  async updateApplicant(id: string, patch: ApplicantPatch): Promise<Applicant | null> {
    const sql = await getSql();
    const existing = await this.getApplicant(id);
    if (!existing) return null;
    
    const merged = { ...existing, ...patch };
    merged.profile_completion = calculateProfileCompletion({
      ...merged,
      has_cv: Boolean(merged.cv_filename),
    });
    
    const rows = await sql`
      UPDATE applicants SET
        full_name = ${merged.full_name},
        email = ${merged.email},
        telegram_username = ${merged.telegram_username},
        country = ${merged.country},
        city = ${merged.city},
        linkedin_url = ${merged.linkedin_url},
        github_url = ${merged.github_url},
        portfolio_url = ${merged.portfolio_url},
        job_categories = ${merged.job_categories},
        target_job_titles = ${merged.target_job_titles},
        experience_level = ${merged.experience_level},
        years_experience = ${merged.years_experience},
        employment_type = ${merged.employment_type},
        skills = ${merged.skills},
        work_preference = ${merged.work_preference},
        preferred_locations = ${merged.preferred_locations},
        salary_min = ${merged.salary_min},
        salary_currency = ${merged.salary_currency},
        availability = ${merged.availability},
        professional_bio = ${merged.professional_bio},
        cv_filename = ${merged.cv_filename},
        profile_completion = ${merged.profile_completion},
        consent = ${merged.consent},
        telegram_notifications = ${merged.telegram_notifications},
        email_notifications = ${merged.email_notifications},
        notification_frequency = ${merged.notification_frequency},
        minimum_match_score = ${merged.minimum_match_score},
        telegram_chat_id = ${merged.telegram_chat_id},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return fromRecord(rows[0]);
  }

  async findApplicantByEmail(email: string): Promise<Applicant | null> {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM applicants WHERE email = ${email}`;
    if (rows.length === 0) return null;
    return fromRecord(rows[0]);
  }

  async listApplicants(): Promise<Applicant[]> {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM applicants ORDER BY created_at DESC`;
    return rows.map(fromRecord);
  }
}

let repository: ApplicantRepository | null = null;
export function getApplicantRepository(): ApplicantRepository {
  if (!repository) {
    repository = new SqlApplicantRepository();
  }
  return repository;
}
