import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, Bookmark, Check, ShieldCheck, MapPin, Briefcase, DollarSign } from "lucide-react";
import { MatchActions, recordMatchAction } from "@/components/match-actions";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Badge, Button } from "@/components/ui";
import { categoryCopy, formatLocation, formatSalary, readStoredProfileId, scoreTone } from "@/lib/jobs/format";
import type { Job, StoredMatch } from "@/lib/matching/types";
import { SITE_NAME } from "@/lib/site";

type JobSearch = {
  applicant?: string;
  match?: string;
};

function asSearchString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/^"+|"+$/g, "");
}

// Server function to load job detail
const getJobDetailData = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const { getJobsRepository } = await import("@/lib/jobs/jobs-repository.server");
    const job = await getJobsRepository().getJob(data.id);
    return { job };
  });

export const Route = createFileRoute("/jobs_/$id")({
  validateSearch: (search: Record<string, unknown>): JobSearch => ({
    applicant: asSearchString(search.applicant),
    match: asSearchString(search.match),
  }),
  loader: async ({ params }) => {
    const data = await getJobDetailData({ data: { id: params.id } });
    return data;
  },
  component: JobDetailPage,
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.job ? `${loaderData.job.title} at ${loaderData.job.company} — ${SITE_NAME}` : `Role — ${SITE_NAME}` }],
  }),
});

function JobDetailPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const loaderData = Route.useLoaderData();
  const job = loaderData?.job ?? null;

  const [match, setMatch] = useState<StoredMatch | null>(null);
  const [applicantId, setApplicantId] = useState("");
  const [notice, setNotice] = useState("");
  const loggedView = useRef(false);

  useEffect(() => {
    const stored = search.applicant || readStoredProfileId();
    setApplicantId(stored);

    if (!job || !stored) return;

    // Load matches and log view action ONCE
    if (!loggedView.current) {
      loggedView.current = true;

      void (async () => {
        try {
          const matchRes = await fetch(`/api/matches/applicant/${stored}`);
          if (matchRes.ok) {
            const matchJson = (await matchRes.json()) as { matches?: Array<StoredMatch & { job?: Job | null }> };
            const found =
              matchJson.matches?.find((row) => row.match_id === search.match) ||
              matchJson.matches?.find((row) => row.job_id === id);
            if (found) setMatch(found);
          }
          await recordMatchAction({
            applicant_id: stored,
            job_id: id,
            match_id: search.match || undefined,
            action: "view",
          });
        } catch (err) {
          console.error("Error loading match data:", err);
        }
      })();
    }
  }, [id, search.applicant, search.match, job]);

  if (!job) {
    return (
      <div className="min-h-dvh flex flex-col bg-bg text-ink">
        <SiteHeader solid />
        <main className="flex-1 px-5 py-16 sm:px-8 max-w-3xl mx-auto w-full text-center">
          <h1 className="text-3xl font-bold font-serif mb-4">Role Not Found</h1>
          <p className="text-muted mb-8">The requested job listing may have expired or been removed.</p>
          <Link to="/jobs">
            <Button className="rounded-full px-6">Explore Active Roles</Button>
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const salaryStr = formatSalary(job);

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-ink">
      <SiteHeader solid />
      <main className="flex-1 px-4 py-8 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            {applicantId ? (
              <Link
                to="/profile/$id"
                params={{ id: applicantId }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline transition-colors"
              >
                <ArrowLeft className="size-4" /> Back to your matches
              </Link>
            ) : null}
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              {applicantId ? "All roles" : <><ArrowLeft className="size-4" /> Back to all roles</>}
            </Link>
          </div>

          <article className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-10 relative">
            {/* Header / Company Info */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-accent uppercase tracking-wider block">
                  {job.company}
                </span>
                <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-ink leading-tight">
                  {job.title}
                </h1>
              </div>

              {job.apply_url && (
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg hover:bg-ink/90 transition-all shadow-sm shrink-0"
                >
                  Apply Now <ExternalLink className="size-4" />
                </a>
              )}
            </div>

            {/* Quick Metadata Pill Tags */}
            <div className="mt-6 flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted border-y border-line py-4">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-accent" />
                {formatLocation(job)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="size-4 text-accent" />
                {job.employment_type || "Full-time"} {job.seniority ? `· ${job.seniority}` : ""}
              </span>
              {salaryStr && (
                <span className="inline-flex items-center gap-1.5 text-ink font-medium">
                  <DollarSign className="size-4 text-emerald-600" />
                  {salaryStr}
                </span>
              )}
            </div>

            {/* Badges / Skills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {job.category && <Badge tone="accent">{job.category}</Badge>}
              {job.required_skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>

            {/* Match Score Box */}
            {match && (
              <div className="mt-8 rounded-2xl bg-surface-muted border border-line p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={scoreTone(match.match_score)} className="tabular-nums text-sm py-1 px-3">
                    {match.match_score}% Match · {categoryCopy(match.score_category)}
                  </Badge>
                </div>
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
                  {match.match_reasons}
                </pre>
              </div>
            )}

            {/* Description Body */}
            <div className="mt-8 space-y-4 text-base leading-relaxed text-ink">
              <h2 className="text-xl font-bold font-serif">About this role</h2>
              <p className="whitespace-pre-wrap text-muted text-sm leading-relaxed">
                {job.description || "Direct opportunity at " + job.company + ". Click Apply Now to review full requirements and submit your application."}
              </p>

              {job.preferred_skills && job.preferred_skills.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
                    Preferred Skills
                  </span>
                  <p className="text-sm text-ink">{job.preferred_skills.join(", ")}</p>
                </div>
              )}
            </div>

            {notice && (
              <div className="mt-6 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
                ✓ {notice}
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {applicantId ? (
                <MatchActions
                  applicantId={applicantId}
                  jobId={job.id}
                  matchId={match?.match_id}
                  applyUrl={job.apply_url}
                  onChanged={(action) => {
                    if (action === "save") setNotice("Saved to your matches.");
                    if (action === "not_relevant") setNotice("We’ll use that to improve future matches.");
                    if (action === "apply") setNotice("Application click recorded.");
                  }}
                />
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {job.apply_url && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg hover:bg-ink/90 transition-all shadow-sm"
                    >
                      Apply Now <ExternalLink className="size-4" />
                    </a>
                  )}
                  <Link to="/apply" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full py-3">
                      Create Profile for Match Score
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
