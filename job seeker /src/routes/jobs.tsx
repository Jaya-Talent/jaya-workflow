import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Search, SlidersHorizontal, ArrowUpDown, RotateCcw, Filter } from "lucide-react";
import { JobCard } from "@/components/job-card";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Button, Input, Select } from "@/components/ui";
import { JOB_CATEGORIES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/lib/applicants/constants";
import { readStoredProfileId } from "@/lib/jobs/format";
import type { Job, StoredMatch } from "@/lib/matching/types";
import { SITE_NAME } from "@/lib/site";

// Server function to load initial jobs list
const getInitialJobs = createServerFn({ method: "GET" }).handler(async () => {
  const { getJobsRepository } = await import("@/lib/jobs/jobs-repository.server");
  const jobs = await getJobsRepository().listActiveJobs();
  return { jobs };
});

export const Route = createFileRoute("/jobs")({
  loader: async () => {
    return await getInitialJobs();
  },
  component: JobsPage,
  head: () => ({
    meta: [{ title: `Open Web3 Roles — ${SITE_NAME}` }],
  }),
});

const PAGE_SIZE = 24;

function JobsPage() {
  const loaderData = Route.useLoaderData();
  const initialJobs = loaderData?.jobs ?? [];

  const [jobs] = useState<Job[]>(initialJobs);
  const [matches, setMatches] = useState<StoredMatch[]>([]);
  const [profileId, setProfileId] = useState("");

  // Filters & Sorting state
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [remote, setRemote] = useState("");
  const [seniority, setSeniority] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "match" | "company" | "title">("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = readStoredProfileId();
    setProfileId(id);

    if (id) {
      void (async () => {
        try {
          const matchRes = await fetch(`/api/matches/applicant/${id}`);
          if (matchRes.ok) {
            const matchJson = (await matchRes.json()) as { matches?: StoredMatch[] };
            setMatches(matchJson.matches ?? []);
          }
        } catch (err) {
          console.error("Error fetching matches:", err);
        }
      })();
    }
  }, []);

  const matchByJob = useMemo(() => {
    const map = new Map<string, StoredMatch>();
    for (const match of matches) map.set(match.job_id, match);
    return map;
  }, [matches]);

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let rows = jobs;
    const q = query.trim().toLowerCase();

    // 1. Text Search
    if (q) {
      rows = rows.filter((job) =>
        [
          job.title,
          job.company,
          job.location,
          job.required_skills.join(" "),
          job.category,
          job.technologies.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    // 2. Category Filter
    if (category) {
      rows = rows.filter((job) => job.category === category);
    }

    // 3. Location / Remote Filter
    if (remote) {
      rows = rows.filter((job) => job.remote === remote);
    }

    // 4. Seniority Filter
    if (seniority) {
      rows = rows.filter((job) => job.seniority?.toLowerCase() === seniority.toLowerCase());
    }

    // 5. Employment Type Filter
    if (employmentType) {
      rows = rows.filter(
        (job) => job.employment_type?.toLowerCase() === employmentType.toLowerCase(),
      );
    }

    // 6. Sorting
    return [...rows].sort((a, b) => {
      if (sortBy === "match") {
        const scoreA = matchByJob.get(a.id)?.match_score ?? 0;
        const scoreB = matchByJob.get(b.id)?.match_score ?? 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      if (sortBy === "company") {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      // Default: Newest / Recently updated first
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [jobs, query, category, remote, seniority, employmentType, sortBy, matchByJob]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, category, remote, seniority, employmentType, sortBy]);

  const visibleJobs = useMemo(() => {
    return filteredAndSorted.slice(0, page * PAGE_SIZE);
  }, [filteredAndSorted, page]);

  const hasMore = visibleJobs.length < filteredAndSorted.length;
  const hasActiveFilters = Boolean(query || category || remote || seniority || employmentType);

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setRemote("");
    setSeniority("");
    setEmploymentType("");
    setSortBy("newest");
    setPage(1);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-ink">
      <SiteHeader solid />
      <main className="flex-1 px-4 py-8 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Hero Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
                Verified Web3 Opportunities
              </p>
              <h1 className="mt-2 font-serif text-4xl sm:text-5xl text-ink">
                Web3 & Crypto Jobs
              </h1>
              <p className="mt-3 max-w-xl text-sm sm:text-base text-muted leading-relaxed">
                Discover active roles compiled from top crypto projects and protocols. Create a profile to view personalized match scores.
              </p>
            </div>
            <div className="text-right hidden md:block">
              <span className="text-2xl font-bold font-serif text-ink tabular-nums">
                {jobs.length.toLocaleString()}
              </span>
              <span className="block text-xs text-muted uppercase tracking-wider">Active Roles Live</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
            {/* Top Row: Search & Sort */}
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="relative sm:col-span-8">
                <Search className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-subtle" />
                <Input
                  className="pl-10 text-sm h-11"
                  placeholder="Search by role title, company, skill (Solidity, Rust, React)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <div className="relative w-full">
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-11 text-sm pl-9"
                  >
                    <option value="newest">Sort: Newest First</option>
                    {matches.length > 0 && <option value="match">Sort: Highest Match Score</option>}
                    <option value="company">Sort: Company (A-Z)</option>
                    <option value="title">Sort: Role Title (A-Z)</option>
                  </Select>
                  <ArrowUpDown className="pointer-events-none absolute top-3.5 left-3 size-4 text-subtle" />
                </div>
              </div>
            </div>

            {/* Bottom Row: Detailed Category & Work Filters */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              >
                <option value="">All Categories</option>
                {JOB_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>

              <Select
                value={remote}
                onChange={(e) => setRemote(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              >
                <option value="">All Work Types</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </Select>

              <Select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              >
                <option value="">All Seniorities</option>
                {EXPERIENCE_LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>

              <Select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="h-10 text-xs sm:text-sm"
              >
                <option value="">All Job Types</option>
                {EMPLOYMENT_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>

            {/* Active Filters Bar & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted border-t border-line">
              <span className="font-medium">
                Showing <strong className="text-ink font-semibold tabular-nums">{visibleJobs.length}</strong> of{" "}
                <strong className="text-ink font-semibold tabular-nums">{filteredAndSorted.length}</strong> matching roles
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                >
                  <RotateCcw className="size-3" /> Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Job Listings Grid */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {filteredAndSorted.length === 0 && (
              <div className="col-span-full py-16 text-center rounded-2xl border border-line bg-white p-8">
                <Filter className="size-10 text-subtle mx-auto mb-3" />
                <h3 className="text-lg font-bold text-ink">No roles match your search filters</h3>
                <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms or clearing specific category and location filters.
                </p>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="mt-6 rounded-full px-5 text-xs"
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {visibleJobs.map((job) => {
              const match = matchByJob.get(job.id);
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  score={match?.match_score}
                  category={match?.score_category}
                  applicantId={profileId}
                />
              );
            })}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="mt-12 text-center">
              <Button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full px-8 py-3 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
              >
                Load More Roles ({filteredAndSorted.length - visibleJobs.length} remaining)
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
