import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { calculateProfileCompletion } from "./completion.ts";
import { CSV_COLUMNS } from "./constants.ts";
import { parseCsv, serializeCsv, joinList, splitList } from "./csv.server.ts";
import { getCsvPath } from "./paths.server.ts";
import {
  DuplicateEmailError,
  type Applicant,
  type ApplicantInput,
  type ApplicantPatch,
  type ApplicantRepository,
} from "./types.ts";

let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function nowIso() {
  return new Date().toISOString();
}

function toRecord(applicant: Applicant): Record<string, string> {
  return {
    id: applicant.id,
    created_at: applicant.created_at,
    updated_at: applicant.updated_at,
    full_name: applicant.full_name,
    email: applicant.email,
    telegram_username: applicant.telegram_username,
    country: applicant.country,
    city: applicant.city,
    linkedin_url: applicant.linkedin_url,
    github_url: applicant.github_url,
    portfolio_url: applicant.portfolio_url,
    job_categories: joinList(applicant.job_categories),
    target_job_titles: joinList(applicant.target_job_titles),
    experience_level: applicant.experience_level,
    years_experience: applicant.years_experience,
    employment_type: joinList(applicant.employment_type),
    skills: joinList(applicant.skills),
    work_preference: applicant.work_preference,
    preferred_locations: joinList(applicant.preferred_locations),
    salary_min: applicant.salary_min,
    salary_currency: applicant.salary_currency,
    availability: applicant.availability,
    professional_bio: applicant.professional_bio,
    cv_filename: applicant.cv_filename,
    profile_completion: String(applicant.profile_completion),
    consent: applicant.consent ? "true" : "false",
    telegram_notifications: applicant.telegram_notifications ? "true" : "false",
    email_notifications: applicant.email_notifications ? "true" : "false",
    notification_frequency: applicant.notification_frequency,
    minimum_match_score: String(applicant.minimum_match_score),
    telegram_chat_id: applicant.telegram_chat_id,
    last_digest_at: applicant.last_digest_at,
  };
}

function fromRecord(record: Record<string, string>): Applicant {
  return {
    id: record.id ?? "",
    created_at: record.created_at ?? "",
    updated_at: record.updated_at ?? "",
    full_name: record.full_name ?? "",
    email: record.email ?? "",
    telegram_username: record.telegram_username ?? "",
    country: record.country ?? "",
    city: record.city ?? "",
    linkedin_url: record.linkedin_url ?? "",
    github_url: record.github_url ?? "",
    portfolio_url: record.portfolio_url ?? "",
    job_categories: splitList(record.job_categories ?? ""),
    target_job_titles: splitList(record.target_job_titles ?? ""),
    experience_level: record.experience_level ?? "",
    years_experience: record.years_experience ?? "",
    employment_type: splitList(record.employment_type ?? ""),
    skills: splitList(record.skills ?? ""),
    work_preference: record.work_preference ?? "",
    preferred_locations: splitList(record.preferred_locations ?? ""),
    salary_min: record.salary_min ?? "",
    salary_currency: record.salary_currency ?? "",
    availability: record.availability ?? "",
    professional_bio: record.professional_bio ?? "",
    cv_filename: record.cv_filename ?? "",
    profile_completion: Number(record.profile_completion || 0),
    consent: record.consent === "true",
    telegram_notifications: record.telegram_notifications !== "false",
    email_notifications: record.email_notifications !== "false",
    notification_frequency:
      record.notification_frequency === "daily" || record.notification_frequency === "weekly"
        ? record.notification_frequency
        : "instant",
    minimum_match_score: Number(record.minimum_match_score || 75) || 75,
    telegram_chat_id: record.telegram_chat_id ?? "",
    last_digest_at: record.last_digest_at ?? "",
  };
}

async function ensureCsv() {
  const csvPath = await getCsvPath();
  await mkdir(path.dirname(csvPath), { recursive: true });
  try {
    await readFile(csvPath, "utf8");
  } catch {
    await writeFile(csvPath, serializeCsv(CSV_COLUMNS, []), "utf8");
  }
}

async function readAll(): Promise<Applicant[]> {
  await ensureCsv();
  const csvPath = await getCsvPath();
  const text = await readFile(csvPath, "utf8");
  return parseCsv(text).map(fromRecord).filter((row) => row.id && row.email);
}

async function writeAll(applicants: Applicant[]) {
  const csvPath = await getCsvPath();
  const records = applicants.map(toRecord);
  await writeFile(csvPath, serializeCsv(CSV_COLUMNS, records), "utf8");
}

function mergeApplicant(current: Applicant, patch: ApplicantPatch): Applicant {
  const next: Applicant = {
    ...current,
    ...patch,
    job_categories: patch.job_categories ?? current.job_categories,
    target_job_titles: patch.target_job_titles ?? current.target_job_titles,
    employment_type: patch.employment_type ?? current.employment_type,
    skills: patch.skills ?? current.skills,
    preferred_locations: patch.preferred_locations ?? current.preferred_locations,
    updated_at: nowIso(),
  };
  next.profile_completion = calculateProfileCompletion(next);
  return next;
}

export class CsvApplicantRepository implements ApplicantRepository {
  async createApplicant(input: ApplicantInput): Promise<Applicant> {
    return withLock(async () => {
      const applicants = await readAll();
      const email = input.email.toLowerCase();
      if (applicants.some((row) => row.email.toLowerCase() === email)) {
        throw new DuplicateEmailError();
      }
      const timestamp = nowIso();
      const applicant: Applicant = {
        id: randomUUID(),
        created_at: timestamp,
        updated_at: timestamp,
        full_name: input.full_name,
        email,
        telegram_username: input.telegram_username ?? "",
        country: input.country,
        city: input.city ?? "",
        linkedin_url: input.linkedin_url ?? "",
        github_url: input.github_url ?? "",
        portfolio_url: input.portfolio_url ?? "",
        job_categories: input.job_categories ?? [],
        target_job_titles: input.target_job_titles ?? [],
        experience_level: input.experience_level ?? "",
        years_experience: input.years_experience ?? "",
        employment_type: input.employment_type ?? [],
        skills: input.skills ?? [],
        work_preference: input.work_preference ?? "",
        preferred_locations: input.preferred_locations ?? [],
        salary_min: input.salary_min ?? "",
        salary_currency: input.salary_currency ?? "USD",
        availability: input.availability ?? "",
        professional_bio: input.professional_bio ?? "",
        cv_filename: input.cv_filename ?? "",
        profile_completion: 0,
        consent: Boolean(input.consent),
        telegram_notifications: input.telegram_notifications ?? true,
        email_notifications: input.email_notifications ?? true,
        notification_frequency: input.notification_frequency ?? "instant",
        minimum_match_score: input.minimum_match_score ?? 75,
        telegram_chat_id: input.telegram_chat_id ?? "",
        last_digest_at: input.last_digest_at ?? "",
      };
      applicant.profile_completion = calculateProfileCompletion(applicant);
      applicants.push(applicant);
      await writeAll(applicants);
      return applicant;
    });
  }

  async getApplicant(id: string): Promise<Applicant | null> {
    const applicants = await readAll();
    return applicants.find((row) => row.id === id) ?? null;
  }

  async updateApplicant(id: string, patch: ApplicantPatch): Promise<Applicant | null> {
    return withLock(async () => {
      const applicants = await readAll();
      const index = applicants.findIndex((row) => row.id === id);
      if (index === -1) return null;
      const current = applicants[index];
      if (!current) return null;
      if (patch.email) {
        const email = patch.email.toLowerCase();
        if (applicants.some((row) => row.id !== id && row.email.toLowerCase() === email)) {
          throw new DuplicateEmailError();
        }
        patch = { ...patch, email };
      }
      const next = mergeApplicant(current, patch);
      applicants[index] = next;
      await writeAll(applicants);
      return next;
    });
  }

  async findApplicantByEmail(email: string): Promise<Applicant | null> {
    const applicants = await readAll();
    const needle = email.toLowerCase();
    return applicants.find((row) => row.email.toLowerCase() === needle) ?? null;
  }

  async listApplicants(): Promise<Applicant[]> {
    const applicants = await readAll();
    return applicants.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

let repository: ApplicantRepository | null = null;

export function getApplicantRepository(): ApplicantRepository {
  if (!repository) {
    repository = new CsvApplicantRepository();
  }
  return repository;
}
