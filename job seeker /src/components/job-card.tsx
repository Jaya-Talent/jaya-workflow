import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui";
import { categoryCopy, formatLocation, formatSalary, getJobSlug, scoreTone } from "@/lib/jobs/format";
import type { Job } from "@/lib/matching/types";

export function JobCard({
  job,
  score,
  category,
  applicantId,
}: {
  job: Job;
  score?: number;
  category?: string;
  applicantId?: string;
}) {
  const salary = formatSalary(job);
  const slug = getJobSlug(job);
  const initial = (job.company || "W").charAt(0).toUpperCase();

  return (
    <Link
      to="/jobs/$id"
      params={{ id: slug }}
      className="group block rounded-2xl border border-line/90 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_16px_-2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] hover:border-accent/40 hover:shadow-[0_4px_24px_-2px_rgba(123,0,166,0.1)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/[0.08] text-accent border border-accent/20 font-bold text-sm shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
            {initial}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{job.company}</p>
            <h2 className="mt-0.5 text-base sm:text-lg font-bold tracking-tight text-ink group-hover:text-accent transition-colors">
              {job.title}
            </h2>
          </div>
        </div>

        {typeof score === "number" && (
          <Badge tone={scoreTone(score)} className="shrink-0 tabular-nums font-mono font-bold">
            {score}%
            {category ? ` · ${categoryCopy(category)}` : ""}
          </Badge>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-muted">
        <span>{formatLocation(job)}</span>
        {job.employment_type && <span>· {job.employment_type}</span>}
        {job.seniority && <span>· {job.seniority}</span>}
      </div>

      {salary && (
        <p className="mt-2.5 text-sm font-bold text-emerald-700 bg-emerald-500/[0.08] border border-emerald-500/20 px-2.5 py-1 rounded-lg inline-block">
          {salary}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-line/60">
        {job.required_skills.slice(0, 4).map((skill) => (
          <Badge key={skill} tone="neutral">
            {skill}
          </Badge>
        ))}
        {job.required_skills.length > 4 && (
          <span className="inline-flex items-center rounded-lg bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-subtle">
            +{job.required_skills.length - 4}
          </span>
        )}
      </div>
    </Link>
  );
}
