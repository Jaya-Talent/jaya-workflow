import { ArrowUpRight, Send, Check, ExternalLink } from "lucide-react";
import type { Category, Job } from "@/data/dashboard";
import { telegramUrl } from "@/data/dashboard";
import { copyText, formatIndividualTelegramPost, formatIndividualTelegramHtml } from "@/lib/telegram";
import { useState, useEffect } from "react";

const MAX_JOBS = 5;

function JobActionButtons({ category, job }: { category: Category; job: Job }) {
  const [copied, setCopied] = useState(false);
  const [posted, setPosted] = useState(false);

  // Check local storage for individual posted jobs, appended with date to refresh daily
  const today = new Date().toDateString();
  const jobKey = `posted_job_${today}_${category.num}_${job.num}`;
  
  useEffect(() => {
    try {
      const isPosted = localStorage.getItem(jobKey) === "true";
      setPosted(isPosted);
    } catch {}
  }, [jobKey]);

  async function handleCopy() {
    const text = formatIndividualTelegramPost(category, job);
    const html = formatIndividualTelegramHtml(category, job);
    const ok = await copyText(text, html);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleOpenAndPost() {
    const text = formatIndividualTelegramPost(category, job);
    const html = formatIndividualTelegramHtml(category, job);
    const ok = await copyText(text, html);
    
    // Mark as posted
    try {
      localStorage.setItem(jobKey, "true");
      setPosted(true);
    } catch {}
    
    // Open Telegram link
    const url = telegramUrl(category.channel);
    window.open(url, "_blank");
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleCopy}
        title="Copy individual Telegram post text"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted transition-all duration-200 hover:bg-row-hover hover:text-foreground cursor-pointer ${copied ? "border-emerald-500 bg-emerald-50 text-emerald-600 hover:text-emerald-700" : ""}`}
      >
        {copied ? <Check className="size-3.5" /> : <Send className="size-3.5" />}
      </button>
      <button
        onClick={handleOpenAndPost}
        title="Copy text & open Telegram channel"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted transition-all duration-200 hover:bg-row-hover hover:text-foreground cursor-pointer ${posted ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white" : ""}`}
      >
        <ExternalLink className="size-3.5" />
      </button>
    </div>
  );
}

export function JobTable({ category }: { category: Category }) {
  const jobs = category.jobs.slice(0, MAX_JOBS);

  if (jobs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-sage-soft/50 px-6 py-14 text-center">
        <p className="font-serif text-xl text-foreground">No open roles this week</p>
        <p className="mt-2 text-sm text-muted">This channel is quiet. Check back on the next harvest.</p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="hidden overflow-x-auto md:block">
        <table className="jobs-table w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs tracking-wider text-muted uppercase">
              <th className="w-10 py-3 pr-3 font-medium">#</th>
              <th className="py-3 pr-4 font-medium">Company</th>
              <th className="py-3 pr-4 font-medium">Job Title</th>
              <th className="py-3 pr-4 font-medium">Location</th>
              <th className="py-3 pr-4 font-medium">Notes</th>
              <th className="py-3 pr-4 font-medium">Apply</th>
              <th className="py-3 pl-2 font-medium">Telegram</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.num}
                className="border-b border-border/80 transition-colors duration-200 ease-in-out last:border-b-0 hover:bg-row-hover"
              >
                <td className="py-3.5 pr-3 align-top tabular-nums text-muted">{job.num}</td>
                <td className="py-3.5 pr-4 align-top font-medium text-foreground">{job.company}</td>
                <td className="py-3.5 pr-4 align-top text-foreground">
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {job.title}
                    {job.is_relisted && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800 uppercase tracking-wide">
                        Reposted
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-3.5 pr-4 align-top text-muted">{job.location}</td>
                <td className="max-w-52 py-3.5 pr-4 align-top text-muted" title={job.notes}>
                  {job.notes}
                </td>
                <td className="py-3.5 pr-4 align-top whitespace-nowrap">
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 font-medium text-clay transition-colors duration-200 ease-in-out hover:text-clay-dark"
                  >
                    Apply Now
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </td>
                <td className="py-3.5 pl-2 align-top">
                  <JobActionButtons category={category} job={job} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {jobs.map((job) => (
          <li
            key={job.num}
            className="rounded-md border border-border bg-background px-4 py-4 shadow-soft"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="font-serif text-lg leading-snug text-foreground">{job.title}</p>
                {job.is_relisted && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800 uppercase tracking-wide">
                    Reposted
                  </span>
                )}
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted">#{job.num}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">{job.company}</p>
            <p className="mt-2 text-sm text-muted">
              {job.location}
            </p>
            {job.notes ? <p className="mt-2 text-sm text-muted">{job.notes}</p> : null}
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <a
                href={job.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-clay transition-colors duration-200 ease-in-out hover:text-clay-dark"
              >
                Apply Now
                <ArrowUpRight className="size-3.5" />
              </a>
              <JobActionButtons category={category} job={job} />
            </div>
          </li>
        ))}
      </ul>

      {category.jobs.length > MAX_JOBS ? (
        <p className="mt-4 text-xs text-muted">
          Showing {MAX_JOBS} of {category.jobs.length} roles.
        </p>
      ) : null}
    </div>
  );
}
