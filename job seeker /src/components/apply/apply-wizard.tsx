import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileText, Upload } from "lucide-react";
import { ChipGroup } from "@/components/chip-group";
import { TagInput } from "@/components/tag-input";
import { Button, FieldError, FieldHint, Input, Label, Select, Textarea } from "@/components/ui";
import { calculateProfileCompletion } from "@/lib/applicants/completion";
import { authClient } from "@/lib/auth/client.ts";
import {
  AVAILABILITY_OPTIONS,
  COUNTRIES,
  CURRENCIES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  JOB_TITLE_SUGGESTIONS,
  LOCATION_SUGGESTIONS,
  MAX_CV_BYTES,
  SKILL_SUGGESTIONS,
  WORK_PREFERENCES,
  YEARS_EXPERIENCE,
} from "@/lib/applicants/constants";
import { Link } from "@tanstack/react-router";

type FormState = {
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
  consent: boolean;
};

const INITIAL: FormState = {
  full_name: "",
  email: "",
  telegram_username: "",
  country: "",
  city: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  job_categories: [],
  target_job_titles: [],
  experience_level: "",
  years_experience: "",
  employment_type: [],
  skills: [],
  work_preference: "",
  preferred_locations: [],
  salary_min: "",
  salary_currency: "USD",
  availability: "",
  professional_bio: "",
  consent: false,
};

const STEPS = ["Basic information", "Career profile", "Skills & preferences", "CV & profile"];

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isUrl(value: string) {
  if (!value.trim()) return true;
  return /^https?:\/\/[^\s]+$/i.test(value.trim());
}

export function ApplyWizard() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  
  useEffect(() => {
    if (session?.user) {
      setForm((current) => ({
        ...current,
        full_name: current.full_name || session.user.name || "",
        email: current.email || session.user.email || "",
      }));
    }
  }, [session]);

  const [cv, setCv] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const completion = useMemo(
    () => calculateProfileCompletion({ ...form, has_cv: Boolean(cv) }),
    [form, cv],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validateStep(index: number) {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (!form.full_name.trim()) next.full_name = "Full name is required.";
      if (!form.email.trim()) next.email = "Email is required.";
      else if (!isEmail(form.email)) next.email = "Enter a valid email address.";
      if (!form.country) next.country = "Country is required.";
      if (!isUrl(form.linkedin_url)) next.linkedin_url = "Enter a valid URL.";
      if (!isUrl(form.github_url)) next.github_url = "Enter a valid URL.";
      if (!isUrl(form.portfolio_url)) next.portfolio_url = "Enter a valid URL.";
    }
    if (index === 1) {
      if (form.job_categories.length === 0) next.job_categories = "Select at least one category.";
      if (!form.experience_level) next.experience_level = "Select your experience level.";
    }
    if (index === 2) {
      if (form.skills.length === 0) next.skills = "Add at least one skill.";
    }
    if (index === 3) {
      if (!form.consent) next.consent = "Please agree before submitting.";
      if (cv && cv.size > MAX_CV_BYTES) next.cv = "CV must be 10MB or smaller.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onContinue() {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const body = new FormData();
      body.append("payload", JSON.stringify({ ...form, consent: form.consent }));
      if (cv) body.append("cv", cv);
      const response = await fetch("/api/applicants", { method: "POST", body });
      const data = (await response.json()) as {
        applicant?: { id: string; profile_completion: number };
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error || "Unable to save your profile.");
        return;
      }
      await navigate({
        to: "/success",
        search: {
          id: data.applicant?.id ?? "",
          completeness: String(data.applicant?.profile_completion ?? completion),
        },
      });
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-accent">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-ink sm:text-5xl">
          {STEPS[step]}
        </h1>
        <p className="mt-3 text-sm text-muted">Profile completeness: {completion}%</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] sm:p-8">
        {step === 0 && (
          <div className="grid gap-5">
            <div>
              <Label htmlFor="full_name">Full name *</Label>
              <Input
                id="full_name"
                autoComplete="name"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
              />
              <FieldError>{errors.full_name}</FieldError>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
              <FieldError>{errors.email}</FieldError>
            </div>
            <div>
              <Label htmlFor="telegram_username">Telegram username</Label>
              <Input
                id="telegram_username"
                placeholder="@username"
                value={form.telegram_username}
                onChange={(e) => update("telegram_username", e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select
                  id="country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.country}</FieldError>
              </div>
              <div>
                <Label htmlFor="city">Current city</Label>
                <Input
                  id="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                inputMode="url"
                placeholder="https://linkedin.com/in/…"
                value={form.linkedin_url}
                onChange={(e) => update("linkedin_url", e.target.value)}
              />
              <FieldError>{errors.linkedin_url}</FieldError>
            </div>
            <div>
              <Label htmlFor="github_url">GitHub URL (optional)</Label>
              <Input
                id="github_url"
                inputMode="url"
                placeholder="https://github.com/…"
                value={form.github_url}
                onChange={(e) => update("github_url", e.target.value)}
              />
              <FieldError>{errors.github_url}</FieldError>
            </div>
            <div>
              <Label htmlFor="portfolio_url">Portfolio URL (optional)</Label>
              <Input
                id="portfolio_url"
                inputMode="url"
                placeholder="https://"
                value={form.portfolio_url}
                onChange={(e) => update("portfolio_url", e.target.value)}
              />
              <FieldError>{errors.portfolio_url}</FieldError>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-7">
            <div>
              <Label>Job category *</Label>
              <ChipGroup
                multiple
                options={JOB_CATEGORIES}
                value={form.job_categories}
                onChange={(value) => update("job_categories", value as string[])}
                maxVisible={7}
              />
              <FieldError>{errors.job_categories}</FieldError>
            </div>
            <div>
              <Label htmlFor="titles">Target job titles</Label>
              <TagInput
                id="titles"
                value={form.target_job_titles}
                onChange={(value) => update("target_job_titles", value)}
                suggestions={JOB_TITLE_SUGGESTIONS}
                placeholder="e.g. Solidity Engineer"
              />
              <FieldHint>Add as many as you like. Press Enter to add a custom title.</FieldHint>
            </div>
            <div>
              <Label>Experience level *</Label>
              <ChipGroup
                options={EXPERIENCE_LEVELS}
                value={form.experience_level}
                onChange={(value) => update("experience_level", String(value))}
              />
              <FieldError>{errors.experience_level}</FieldError>
            </div>
            <div>
              <Label>Years of experience</Label>
              <ChipGroup
                options={YEARS_EXPERIENCE}
                value={form.years_experience}
                onChange={(value) => update("years_experience", String(value))}
              />
            </div>
            <div>
              <Label>Employment type</Label>
              <ChipGroup
                multiple
                options={EMPLOYMENT_TYPES}
                value={form.employment_type}
                onChange={(value) => update("employment_type", value as string[])}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-7">
            <div>
              <Label htmlFor="skills">Skills *</Label>
              <TagInput
                id="skills"
                value={form.skills}
                onChange={(value) => update("skills", value)}
                suggestions={SKILL_SUGGESTIONS}
                placeholder="Search or add a skill"
              />
              <FieldError>{errors.skills}</FieldError>
            </div>
            <div>
              <Label>Work preference</Label>
              <ChipGroup
                options={WORK_PREFERENCES}
                value={form.work_preference}
                onChange={(value) => update("work_preference", String(value))}
              />
            </div>
            <div>
              <Label htmlFor="locations">Preferred locations</Label>
              <TagInput
                id="locations"
                value={form.preferred_locations}
                onChange={(value) => update("preferred_locations", value)}
                suggestions={LOCATION_SUGGESTIONS}
                placeholder="Remote, London, Dubai…"
              />
            </div>
            <div>
              <Label htmlFor="salary_min">Salary expectation</Label>
              <div className="grid grid-cols-[7.5rem_1fr] gap-3">
                <Select
                  value={form.salary_currency}
                  onChange={(e) => update("salary_currency", e.target.value)}
                  aria-label="Currency"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
                <Input
                  id="salary_min"
                  inputMode="numeric"
                  placeholder="Minimum expected"
                  value={form.salary_min}
                  onChange={(e) => update("salary_min", e.target.value.replace(/[^\d.]/g, ""))}
                />
              </div>
              <FieldHint>Optional. Helps us avoid sending mismatched roles.</FieldHint>
            </div>
            <div>
              <Label>Availability</Label>
              <ChipGroup
                options={AVAILABILITY_OPTIONS}
                value={form.availability}
                onChange={(value) => update("availability", String(value))}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-7">
            <div>
              <Label htmlFor="cv">CV / resume</Label>
              <label
                htmlFor="cv"
                className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-bg px-4 py-8 text-center"
              >
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setCv(file);
                    if (file && file.size > MAX_CV_BYTES) {
                      setErrors((current) => ({ ...current, cv: "CV must be 10MB or smaller." }));
                    } else {
                      setErrors((current) => {
                        const next = { ...current };
                        delete next.cv;
                        return next;
                      });
                    }
                  }}
                />
                {cv ? (
                  <>
                    <FileText className="mb-2 size-6 text-accent" />
                    <p className="text-sm font-medium text-ink">{cv.name}</p>
                    <p className="mt-1 text-xs text-muted">{Math.round(cv.size / 1024)} KB · tap to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2 size-6 text-muted" />
                    <p className="text-sm font-medium text-ink">Upload PDF, DOC or DOCX</p>
                    <p className="mt-1 text-xs text-muted">Maximum 10MB</p>
                  </>
                )}
              </label>
              <FieldHint>
                Your CV helps us better understand your experience and improve future job matching.
              </FieldHint>
              <FieldError>{errors.cv}</FieldError>
            </div>
            <div>
              <Label htmlFor="professional_bio">Short professional bio</Label>
              <Textarea
                id="professional_bio"
                maxLength={2000}
                placeholder="A few sentences about your experience, strengths and what you want next."
                value={form.professional_bio}
                onChange={(e) => update("professional_bio", e.target.value)}
              />
              <FieldHint>{form.professional_bio.length}/2000</FieldHint>
            </div>
            <label className="flex items-start gap-3 rounded-xl bg-bg px-4 py-4">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
                className="mt-1 size-4 accent-[var(--color-accent)]"
              />
              <span className="text-sm leading-relaxed text-ink">
                I agree to have my information stored and used to provide relevant job opportunities.{" "}
                <Link to="/privacy" className="font-medium text-accent underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            <FieldError>{errors.consent}</FieldError>
          </div>
        )}

        {formError && (
          <p className="mt-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</p>
        )}
      </div>

      <div className="sticky bottom-0 z-20 -mx-5 mt-6 border-t border-line bg-bg/95 px-5 py-3 backdrop-blur-sm safe-bottom sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
        <div className="flex gap-3">
          {step > 0 ? (
            <Button
              type="button"
              variant="secondary"
              className="min-w-24"
              onClick={() => {
                setFormError("");
                setStep((current) => current - 1);
              }}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : (
            <div className="hidden sm:block sm:min-w-24" />
          )}
          <Button type="button" className="flex-1" onClick={onContinue} disabled={submitting}>
            {submitting ? "Saving…" : step === STEPS.length - 1 ? "Create profile" : "Continue"}
            {step < STEPS.length - 1 && <ArrowRight className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
