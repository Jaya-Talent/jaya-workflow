import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AdminGate } from "@/components/admin-gate";
import { AdminShell } from "@/components/admin-shell";
import { Badge, Button } from "@/components/ui";
import type { Applicant } from "@/lib/applicants/types";
import { categoryCopy, formatLocation, formatSalary, scoreTone } from "@/lib/jobs/format";
import type { Job, StoredMatch } from "@/lib/matching/types";

export const Route = createFileRoute("/admin_/$id")({
  component: AdminDetailPage,
  head: () => ({
    meta: [{ title: "Applicant | Jaya Talent" }],
  }),
});

type MatchRow = StoredMatch & { job: Job | null };

function AdminDetailPage() {
  const { id } = Route.useParams();
  return (
    <AdminGate>
      {({ logout }) => (
        <AdminShell current="applicants" onLogout={() => void logout()}>
          <ApplicantDetail id={id} />
        </AdminShell>
      )}
    </AdminGate>
  );
}

function ApplicantDetail({ id }: { id: string }) {
  const [applicant, setApplicant] = useState<(Applicant & { has_cv?: boolean }) | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/applicants/${id}`);
      const json = (await response.json()) as { applicant?: Applicant; error?: string };
      if (!response.ok || !json.applicant) {
        setError(json.error || "Applicant not found");
        return;
      }
      setApplicant(json.applicant);
      const matchRes = await fetch(`/api/matches/applicant/${id}`);
      if (matchRes.ok) {
        const matchJson = (await matchRes.json()) as { matches?: MatchRow[] };
        setMatches(matchJson.matches ?? []);
      }
    }
    void load();
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All applicants
      </Link>
      {error && <p className="mt-6 text-danger">{error}</p>}
      {!error && !applicant && <p className="mt-6 text-muted">Loading…</p>}
      {applicant && (
        <article className="mt-6 rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
          <p className="text-sm text-muted">Profile completeness: {applicant.profile_completion}%</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">{applicant.full_name}</h1>
          <p className="mt-2 text-muted">{applicant.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {applicant.job_categories.map((item) => (
              <Badge key={item} tone="accent">
                {item}
              </Badge>
            ))}
          </div>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field label="Telegram" value={applicant.telegram_username ? `@${applicant.telegram_username}` : "—"} />
            <Field label="Location" value={[applicant.city, applicant.country].filter(Boolean).join(", ") || "—"} />
            <Field label="Experience" value={applicant.experience_level || "—"} />
            <Field label="Years" value={applicant.years_experience || "—"} />
            <Field label="Employment" value={applicant.employment_type.join(", ") || "—"} />
            <Field label="Work preference" value={applicant.work_preference || "—"} />
            <Field label="Availability" value={applicant.availability || "—"} />
            <Field
              label="Salary"
              value={applicant.salary_min ? `${applicant.salary_currency} ${applicant.salary_min}` : "—"}
            />
            <Field label="LinkedIn" value={applicant.linkedin_url || "—"} href={applicant.linkedin_url} />
            <Field label="GitHub" value={applicant.github_url || "—"} href={applicant.github_url} />
            <Field label="Portfolio" value={applicant.portfolio_url || "—"} href={applicant.portfolio_url} />
            <Field label="Preferred locations" value={applicant.preferred_locations.join(", ") || "—"} />
            <Field label="Target titles" value={applicant.target_job_titles.join(", ") || "—"} />
            <Field label="Created" value={applicant.created_at.replace("T", " ").slice(0, 16)} />
            <Field
              label="Notifications"
              value={`${applicant.notification_frequency || "instant"} · min ${applicant.minimum_match_score ?? 75}%`}
            />
          </dl>
          <div className="mt-8">
            <h2 className="text-sm font-medium text-muted">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {applicant.skills.length === 0 && <span className="text-sm text-muted">—</span>}
              {applicant.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-sm font-medium text-muted">Professional bio</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {applicant.professional_bio || "—"}
            </p>
          </div>
          <div className="mt-8">
            {applicant.cv_filename ? (
              <a href={`/api/admin/applicants/${applicant.id}/cv`}>
                <Button type="button">Download CV</Button>
              </a>
            ) : (
              <p className="text-sm text-muted">No CV uploaded.</p>
            )}
          </div>
          <div className="mt-10">
            <h2 className="text-sm font-medium tracking-wide text-muted uppercase">Top matches</h2>
            <ul className="mt-4 space-y-3">
              {matches.length === 0 && <li className="text-sm text-muted">No matches stored yet.</li>}
              {matches
                .slice()
                .sort((a, b) => b.match_score - a.match_score)
                .slice(0, 8)
                .map((row) => (
                  <li key={row.match_id} className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-ink">{row.job?.title ?? row.job_id}</p>
                      <p className="text-xs text-muted">
                        {row.job ? `${row.job.company} · ${formatLocation(row.job)}` : ""}
                        {row.job && formatSalary(row.job) ? ` · ${formatSalary(row.job)}` : ""}
                      </p>
                    </div>
                    <Badge tone={scoreTone(row.match_score)} className="tabular-nums">
                      {row.match_score}% · {categoryCopy(row.score_category)}
                    </Badge>
                  </li>
                ))}
            </ul>
          </div>
        </article>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 break-all text-sm text-ink">
        {href ? (
          <a href={href} className="text-accent hover:underline" target="_blank" rel="noreferrer">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
