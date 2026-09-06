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
  return (
    <Link
      to="/jobs/$id"
      params={{ id: slug }}
      className="block rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)] transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{job.company}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">{job.title}</h2>
        </div>
        {typeof score === "number" && (
          <Badge tone={scoreTone(score)} className="shrink-0 tabular-nums">
            {score}%
            {category ? ` · ${categoryCopy(category)}` : ""}
          </Badge>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">
        {formatLocation(job)}
        {job.employment_type ? ` · ${job.employment_type}` : ""}
        {job.seniority ? ` · ${job.seniority}` : ""}
      </p>
      {salary && <p className="mt-1 text-sm text-ink">{salary}</p>}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.required_skills.slice(0, 4).map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
        {job.required_skills.length > 4 && <Badge>+{job.required_skills.length - 4}</Badge>}
      </div>
    </Link>
  );
}
