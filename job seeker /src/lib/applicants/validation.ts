import { z } from "zod";
import { MAX_CV_BYTES } from "./constants.ts";
import { ValidationError, type ApplicantInput } from "./types.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

const optionalUrl = z
  .string()
  .max(500)
  .transform((v) => v.trim())
  .refine((v) => v === "" || URL_RE.test(v), "Enter a valid URL starting with http:// or https://");

const stringList = z.array(z.string().min(1).max(80)).max(30).optional();

export const applicantPayloadSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(120),
  email: z
    .string()
    .min(1, "Email is required")
    .max(254)
    .refine((v) => EMAIL_RE.test(v.trim()), "Enter a valid email address"),
  telegram_username: z.string().max(64).optional(),
  country: z.string().min(1, "Country is required").max(80),
  city: z.string().max(80).optional(),
  linkedin_url: optionalUrl.optional(),
  github_url: optionalUrl.optional(),
  portfolio_url: optionalUrl.optional(),
  job_categories: stringList,
  target_job_titles: stringList,
  experience_level: z.string().max(40).optional(),
  years_experience: z.string().max(20).optional(),
  employment_type: stringList,
  skills: stringList,
  work_preference: z.string().max(40).optional(),
  preferred_locations: stringList,
  salary_min: z
    .string()
    .max(20)
    .refine((v) => v.trim() === "" || /^\d+(\.\d{1,2})?$/.test(v.trim()), "Enter a valid salary amount")
    .optional(),
  salary_currency: z.string().max(8).optional(),
  availability: z.string().max(40).optional(),
  professional_bio: z.string().max(2000).optional(),
  consent: z.boolean(),
  telegram_notifications: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  notification_frequency: z.enum(["instant", "daily", "weekly"]).optional(),
  minimum_match_score: z.number().min(0).max(100).optional(),
  telegram_chat_id: z.string().max(64).optional(),
  last_digest_at: z.string().max(40).optional(),
});

export const applicantPatchSchema = applicantPayloadSchema.partial();

export type ApplicantPayload = z.infer<typeof applicantPayloadSchema>;

function issuesToFields(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

function normalizeList(value: string[] | undefined) {
  return (value ?? []).map((item) => item.trim()).filter(Boolean);
}

function normalizeText(value: string | undefined) {
  return (value ?? "").trim();
}

export function parseApplicantPayload(raw: unknown): ApplicantInput {
  const result = applicantPayloadSchema.safeParse(raw);
  if (!result.success) {
    const fields = issuesToFields(result.error);
    const first = Object.values(fields)[0] ?? "Please check the form and try again.";
    throw new ValidationError(first, fields);
  }
  if (!result.data.consent) {
    throw new ValidationError("Please agree to the privacy policy to continue.", {
      consent: "Consent is required",
    });
  }
  const telegram = normalizeText(result.data.telegram_username).replace(/^@+/, "");
  return {
    full_name: result.data.full_name.trim(),
    email: result.data.email.trim().toLowerCase(),
    telegram_username: telegram,
    country: result.data.country.trim(),
    city: normalizeText(result.data.city),
    linkedin_url: normalizeText(result.data.linkedin_url),
    github_url: normalizeText(result.data.github_url),
    portfolio_url: normalizeText(result.data.portfolio_url),
    job_categories: normalizeList(result.data.job_categories),
    target_job_titles: normalizeList(result.data.target_job_titles),
    experience_level: normalizeText(result.data.experience_level),
    years_experience: normalizeText(result.data.years_experience),
    employment_type: normalizeList(result.data.employment_type),
    skills: normalizeList(result.data.skills),
    work_preference: normalizeText(result.data.work_preference),
    preferred_locations: normalizeList(result.data.preferred_locations),
    salary_min: normalizeText(result.data.salary_min),
    salary_currency: normalizeText(result.data.salary_currency) || "USD",
    availability: normalizeText(result.data.availability),
    professional_bio: normalizeText(result.data.professional_bio),
    consent: result.data.consent,
    telegram_notifications: result.data.telegram_notifications ?? true,
    email_notifications: result.data.email_notifications ?? true,
    notification_frequency: result.data.notification_frequency ?? "instant",
    minimum_match_score: result.data.minimum_match_score ?? 75,
    telegram_chat_id: normalizeText(result.data.telegram_chat_id),
    last_digest_at: normalizeText(result.data.last_digest_at),
  };
}

export function parseApplicantPatch(raw: unknown): Partial<ApplicantInput> {
  const result = applicantPatchSchema.safeParse(raw);
  if (!result.success) {
    const fields = issuesToFields(result.error);
    const first = Object.values(fields)[0] ?? "Please check the form and try again.";
    throw new ValidationError(first, fields);
  }
  const data = result.data;
  const patch: Partial<ApplicantInput> = {};
  if (data.full_name !== undefined) patch.full_name = data.full_name.trim();
  if (data.email !== undefined) patch.email = data.email.trim().toLowerCase();
  if (data.telegram_username !== undefined) {
    patch.telegram_username = data.telegram_username.trim().replace(/^@+/, "");
  }
  if (data.country !== undefined) patch.country = data.country.trim();
  if (data.city !== undefined) patch.city = data.city.trim();
  if (data.linkedin_url !== undefined) patch.linkedin_url = data.linkedin_url.trim();
  if (data.github_url !== undefined) patch.github_url = data.github_url.trim();
  if (data.portfolio_url !== undefined) patch.portfolio_url = data.portfolio_url.trim();
  if (data.job_categories !== undefined) patch.job_categories = normalizeList(data.job_categories);
  if (data.target_job_titles !== undefined) patch.target_job_titles = normalizeList(data.target_job_titles);
  if (data.experience_level !== undefined) patch.experience_level = data.experience_level.trim();
  if (data.years_experience !== undefined) patch.years_experience = data.years_experience.trim();
  if (data.employment_type !== undefined) patch.employment_type = normalizeList(data.employment_type);
  if (data.skills !== undefined) patch.skills = normalizeList(data.skills);
  if (data.work_preference !== undefined) patch.work_preference = data.work_preference.trim();
  if (data.preferred_locations !== undefined) {
    patch.preferred_locations = normalizeList(data.preferred_locations);
  }
  if (data.salary_min !== undefined) patch.salary_min = data.salary_min.trim();
  if (data.salary_currency !== undefined) patch.salary_currency = data.salary_currency.trim();
  if (data.availability !== undefined) patch.availability = data.availability.trim();
  if (data.professional_bio !== undefined) patch.professional_bio = data.professional_bio.trim();
  if (data.consent !== undefined) patch.consent = data.consent;
  if (data.telegram_notifications !== undefined) patch.telegram_notifications = data.telegram_notifications;
  if (data.email_notifications !== undefined) patch.email_notifications = data.email_notifications;
  if (data.notification_frequency !== undefined) patch.notification_frequency = data.notification_frequency;
  if (data.minimum_match_score !== undefined) patch.minimum_match_score = data.minimum_match_score;
  if (data.telegram_chat_id !== undefined) patch.telegram_chat_id = data.telegram_chat_id.trim();
  if (data.last_digest_at !== undefined) patch.last_digest_at = data.last_digest_at.trim();
  return patch;
}

export function stripControlChars(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

export function sanitizeText(value: string) {
  return stripControlChars(stripTags(value)).trim();
}

export function isAllowedCvFile(filename: string, mime: string, size: number) {
  if (size > MAX_CV_BYTES) {
    throw new ValidationError("CV must be 10MB or smaller.", {
      cv: "CV must be 10MB or smaller.",
    });
  }
  const lower = filename.toLowerCase();
  const extOk = lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx");
  if (!extOk) {
    throw new ValidationError("CV must be a PDF, DOC or DOCX file.", {
      cv: "CV must be a PDF, DOC or DOCX file.",
    });
  }
  if (mime && mime !== "application/octet-stream") {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(mime)) {
      throw new ValidationError("CV must be a PDF, DOC or DOCX file.", {
        cv: "CV must be a PDF, DOC or DOCX file.",
      });
    }
  }
}

export function extensionFromFilename(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".doc")) return "doc";
  return "pdf";
}

export function looksLikeCvBytes(bytes: Uint8Array, ext: string) {
  if (bytes.length < 4) return false;
  if (ext === "pdf") {
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  }
  if (ext === "docx") {
    return bytes[0] === 0x50 && bytes[1] === 0x4b;
  }
  if (ext === "doc") {
    return bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
  }
  return false;
}
