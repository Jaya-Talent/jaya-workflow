import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  TrendingUp,
  Globe,
  Briefcase,
  DollarSign,
  Building2,
  Target,
  ArrowRight,
  Share2,
  Check,
  Copy,
  Calendar,
  Layers,
  CheckCircle2,
  Award,
  Zap,
  ChevronRight,
  Info,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Badge, Button, Card } from "@/components/ui";
import { SITE_NAME } from "@/lib/site";
import type { ArchiveReportSummary, WeeklyIntelligenceReport } from "@/lib/intelligence/types";

// Server loader to fetch current weekly intelligence report & archive list
const getIntelligenceData = createServerFn({ method: "GET" })
  .validator((data: { slug?: string } | undefined) => data)
  .handler(async ({ data }) => {
    const { getLatestIntelligenceReport, getIntelligenceReportBySlug, listIntelligenceArchives } =
      await import("@/lib/intelligence/reports-store.server");

    const [report, archives] = await Promise.all([
      data?.slug ? getIntelligenceReportBySlug(data.slug) : getLatestIntelligenceReport(),
      listIntelligenceArchives(),
    ]);

    return { report, archives };
  });

type WeekendIntelligenceSearchParams = {
  week?: string;
};

export const Route = createFileRoute("/weekend-intelligence")({
  validateSearch: (search: Record<string, unknown>): WeekendIntelligenceSearchParams => search,
  loaderDeps: ({ search }: { search: WeekendIntelligenceSearchParams }) => ({ week: search?.week }),
  loader: async ({ deps }) => {
    return await getIntelligenceData({ data: { slug: deps.week } });
  },
  component: WeekendIntelligencePage,
  head: ({ loaderData }) => {
    const period = loaderData?.report?.periodLabel || "Latest Web3 Insights";
    return {
      meta: [
        {
          title: `Jaya Talent Weekend Intelligence (${period}) | Web3 Job Market Insights`,
        },
        {
          name: "description",
          content:
            "Weekly data-driven insights into Web3 jobs, salaries, hiring trends, skills and career opportunities from Jaya Talent.",
        },
        {
          property: "og:site_name",
          content: "Jaya Talent",
        },
        {
          property: "og:title",
          content: `Jaya Talent Weekend Intelligence (${period}) | Web3 Market Insights`,
        },
        {
          property: "og:description",
          content:
            "Weekly data-driven insights into Web3 jobs, salaries, hiring trends, skills and career opportunities from Jaya Talent.",
        },
        {
          property: "og:type",
          content: "article",
        },
        {
          property: "og:image",
          content: "https://job.jayatalent.com/og-intelligence.png",
        },
        {
          property: "og:image:secure_url",
          content: "https://job.jayatalent.com/og-intelligence.png",
        },
        {
          property: "og:image:type",
          content: "image/png",
        },
        {
          property: "og:image:width",
          content: "1200",
        },
        {
          property: "og:image:height",
          content: "630",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:site",
          content: "@JayaTalent",
        },
        {
          name: "twitter:title",
          content: `Jaya Talent Weekend Intelligence (${period})`,
        },
        {
          name: "twitter:description",
          content:
            "Weekly data-driven insights into Web3 jobs, salaries, hiring trends, skills and career opportunities from Jaya Talent.",
        },
        {
          name: "twitter:image",
          content: "https://job.jayatalent.com/og-intelligence.png",
        },
      ],
    };
  },
});

function WeekendIntelligencePage() {
  const { report, archives } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const [selectedOpportunityFilter, setSelectedOpportunityFilter] = useState<string>("all");

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Jaya Talent Weekend Intelligence",
          text: report.socialShareText,
          url: typeof window !== "undefined" ? window.location.href : "https://jobs.jayatalent.com/weekend-intelligence",
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Filter opportunities
  const filteredOpportunities = report.opportunities.filter((opp) => {
    if (selectedOpportunityFilter === "all") return true;
    if (selectedOpportunityFilter === "remote") return opp.remote === "remote";
    if (selectedOpportunityFilter === "salary") return Boolean(opp.salaryFormatted);
    if (selectedOpportunityFilter === "engineering")
      return opp.category.toLowerCase().includes("engineering") || opp.title.toLowerCase().includes("engineer");
    if (selectedOpportunityFilter === "product")
      return opp.category.toLowerCase().includes("product") || opp.title.toLowerCase().includes("product");
    if (selectedOpportunityFilter === "community")
      return opp.category.toLowerCase().includes("community") || opp.category.toLowerCase().includes("marketing");
    return true;
  });

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-ink">
      <SiteHeader solid />

      <main className="flex-1 pb-24">
        {/* Top Header Hero */}
        <section className="relative px-4 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-16 bg-surface border-b border-line overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[360px] bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="mx-auto max-w-6xl relative z-10">
            {/* Tag & Archive Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-none border border-accent bg-accent/[0.08] px-3.5 py-1.5 text-[11px] font-mono font-bold tracking-widest text-accent uppercase shadow-[1px_1px_0_#7B00A6]">
                  [ WEEKEND INTELLIGENCE ]
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-none border border-line bg-white px-3.5 py-1.5 text-xs font-mono font-semibold text-ink shadow-[1px_1px_0_rgba(0,0,0,0.06)]">
                  <Calendar className="size-3.5 text-accent" /> {report.periodLabel}
                </span>
                {report.isDemoData && (
                  <span className="inline-flex items-center gap-1 rounded-none bg-amber-500/[0.08] border border-amber-500/40 px-3 py-1 text-xs font-mono font-bold text-amber-900 shadow-2xs">
                    DEMO DATA
                  </span>
                )}
              </div>

              {/* Share & Copy Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleShare}
                  variant="secondary"
                  size="sm"
                  className="rounded-none gap-2 text-xs font-bold uppercase tracking-wider h-9 px-4 bg-white border-line hover:border-accent hover:text-accent shadow-[0_2px_0_rgba(0,0,0,0.06)] transition-all"
                >
                  <Share2 className="size-3.5 text-accent" />
                  Share Report
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="secondary"
                  size="sm"
                  className="rounded-none gap-2 text-xs font-bold uppercase tracking-wider h-9 px-4 bg-white border-line hover:border-accent hover:text-accent shadow-[0_2px_0_rgba(0,0,0,0.06)] transition-all"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-accent" />}
                  {copied ? "Link Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>

            {/* Title & Tagline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight font-bold">
              Jaya Talent <span className="italic text-accent">Weekend Intelligence</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
              {report.tagline}
            </p>

            {/* Data Provenance Notice */}
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-none bg-surface-muted border border-line px-4 py-2 text-xs font-mono text-muted">
              <Info className="size-4 text-accent shrink-0" />
              <span>{report.dataNotice}</span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-8 space-y-16 mt-12">
          {/* SECTION 1 — MARKET SNAPSHOT */}
          <section id="market-snapshot" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Executive Summary</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1 font-bold">Market Snapshot</h2>
              </div>
              <span className="text-xs font-mono text-muted font-medium bg-surface-muted px-2.5 py-1 rounded-none border border-line">UPDATED WEEKLY</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="rounded-none border border-line bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.03)] transition-all hover:border-accent hover:-translate-y-0.5">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-accent" /> Jobs Tracked
                </p>
                <p className="mt-3 font-serif text-3xl sm:text-4xl text-ink font-bold tabular-nums">
                  {report.marketSnapshot.jobsTracked.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted">Active opportunities</p>
              </div>

              <div className="rounded-none border border-line bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.03)] transition-all hover:border-accent hover:-translate-y-0.5">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Globe className="size-3.5 text-accent" /> Remote Roles
                </p>
                <p className="mt-3 font-serif text-3xl sm:text-4xl text-ink font-bold tabular-nums">
                  {report.marketSnapshot.remoteCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-accent font-semibold font-mono">
                  {report.marketSnapshot.remotePercentage}% of all roles
                </p>
              </div>

              <div className="rounded-none border border-line bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.03)] transition-all hover:border-accent hover:-translate-y-0.5">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Layers className="size-3.5 text-accent" /> Engineering
                </p>
                <p className="mt-3 font-serif text-3xl sm:text-4xl text-ink font-bold tabular-nums">
                  {report.marketSnapshot.engineeringCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted font-mono">
                  {report.marketSnapshot.engineeringPercentage}% technical
                </p>
              </div>

              <div className="rounded-none border border-line bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.03)] transition-all hover:border-accent hover:-translate-y-0.5">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-accent" /> Companies
                </p>
                <p className="mt-3 font-serif text-3xl sm:text-4xl text-ink font-bold tabular-nums">
                  {report.marketSnapshot.companiesHiringCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted">Distinct active teams</p>
              </div>

              <div className="col-span-2 lg:col-span-1 rounded-none border border-line bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.03)] transition-all hover:border-accent hover:-translate-y-0.5">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <DollarSign className="size-3.5 text-accent" /> Salary Disclosed
                </p>
                <p className="mt-3 font-serif text-3xl sm:text-4xl text-ink font-bold tabular-nums">
                  {report.marketSnapshot.salaryDisclosedCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted font-mono">
                  {report.marketSnapshot.salaryDisclosedPercentage}% transparent
                </p>
              </div>
            </div>
          </section>

          {/* GRID SECTION: TOP SKILLS & WHERE WEB3 IS HIRING */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* SECTION 2 — TOP SKILLS EMPLOYERS REQUEST */}
            <section id="top-skills" className="lg:col-span-7 space-y-4">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Skill Extraction</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1 font-bold">Skills Employers Are Hiring For</h2>
                <p className="text-sm text-muted mt-1">
                  Most frequently requested skills and protocol stacks extracted from active job descriptions.
                </p>
              </div>

              <div className="rounded-none border border-line bg-white p-6 sm:p-7 shadow-[0_2px_6px_rgba(0,0,0,0.03)] space-y-4">
                {report.topSkills.length === 0 ? (
                  <p className="text-sm text-muted py-6 text-center">No skill records found for this period.</p>
                ) : (
                  report.topSkills.map((item, idx) => (
                    <div key={item.skill} className="space-y-1.5 group">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-ink flex items-center gap-2.5">
                          <span className="inline-flex size-6 items-center justify-center rounded-none bg-surface-muted border border-line text-xs font-mono font-bold text-muted group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-colors">
                            {idx + 1}
                          </span>
                          {item.skill}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted tabular-nums font-mono">
                          <span className="font-bold text-ink">{item.jobCount} jobs</span>
                          <span className="text-subtle">({item.percentage}%)</span>
                        </div>
                      </div>
                      {/* Horizontal bar meter */}
                      <div className="h-2 w-full rounded-none bg-surface-muted overflow-hidden border border-line/40">
                        <div
                          className="h-full rounded-none bg-accent transition-all duration-500"
                          style={{ width: `${Math.max(6, Math.min(100, item.percentage * 2.8))}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* SECTION 4 — WHERE WEB3 IS HIRING */}
            <section id="where-is-web3-hiring" className="lg:col-span-5 space-y-4">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Geographic Distribution</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1 font-bold">Where Is Web3 Hiring?</h2>
                <p className="text-sm text-muted mt-1">
                  Among jobs tracked by Jaya Talent this week.
                </p>
              </div>

              <div className="rounded-none border border-line bg-white p-6 sm:p-7 shadow-[0_2px_6px_rgba(0,0,0,0.03)] space-y-4">
                {report.geoDistribution.map((geo) => (
                  <div key={geo.region} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink flex items-center gap-2">
                        <Globe className="size-3.5 text-accent shrink-0" />
                        {geo.region}
                      </span>
                      <span className="text-xs font-bold font-mono text-ink tabular-nums">
                        {geo.jobCount} <span className="text-muted font-normal">({geo.percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-none bg-surface-muted overflow-hidden border border-line/40">
                      <div
                        className="h-full rounded-none bg-accent/80"
                        style={{ width: `${Math.max(5, geo.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SECTION 3 — WEB3 SALARY INTELLIGENCE */}
          <section id="salary-intelligence" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Compensation Benchmarks</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">What Does Web3 Pay?</h2>
                <p className="text-sm text-muted mt-1">
                  Base compensation insights derived from jobs disclosing transparent salary ranges.
                </p>
              </div>
            </div>

            {!report.salaryIntelligence.isAvailable || report.salaryIntelligence.roles.length === 0 ? (
              <div className="rounded-none border border-line bg-surface-muted p-8 text-center">
                <DollarSign className="size-8 text-muted mx-auto mb-2" />
                <h3 className="text-base font-semibold text-ink">Salary Data Notice</h3>
                <p className="text-sm text-muted mt-1 max-w-lg mx-auto font-mono text-xs">
                  {report.salaryIntelligence.disclaimer}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {report.salaryIntelligence.roles.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-none border border-line bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:border-accent hover:shadow-[0_4px_16px_rgba(123,0,166,0.12)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider bg-accent/8 border border-accent/20 px-2 py-0.5 rounded-none">
                            {item.category.split("/")[0]}
                          </span>
                          <span className="text-xs font-mono text-muted bg-surface-muted border border-line px-2 py-0.5 rounded-none">
                            {item.experienceLevel}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base text-ink line-clamp-1 group-hover:text-accent transition-colors">{item.role}</h3>
                        <div className="mt-3 p-3 rounded-none bg-surface-muted/60 border border-line">
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted block">Benchmark Median</span>
                          <p className="font-serif text-2xl text-ink font-bold mt-0.5 text-accent">
                            {item.salaryFormatted}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-mono text-muted">
                        <span className="font-medium">{item.remote}</span>
                        <span className="text-subtle">{item.sampleCount} verified role{item.sampleCount > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-subtle italic">
                  * Note: {report.salaryIntelligence.disclaimer}
                </p>
              </div>
            )}
          </section>

          {/* SECTION 5 — COMPANIES HIRING */}
          <section id="companies-hiring" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Active Employers</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Companies Hiring This Week</h2>
                <p className="text-sm text-muted mt-1">
                  Protocols and Web3 startups with multiple verified active openings.
                </p>
              </div>
              <Link
                to="/jobs"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline uppercase"
              >
                Browse all companies <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.topCompanies.map((c) => (
                <div
                  key={c.company}
                  className="group rounded-none border border-line bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:border-accent hover:shadow-[0_4px_16px_rgba(123,0,166,0.12)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-none bg-accent-soft border border-accent/25 flex items-center justify-center font-mono font-bold text-accent text-sm shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                          {c.company.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold text-ink group-hover:text-accent transition-colors">{c.company}</h3>
                          <p className="text-xs font-mono text-accent font-semibold mt-0.5">
                            {c.activeJobsCount} active {c.activeJobsCount === 1 ? "opportunity" : "opportunities"}
                          </p>
                        </div>
                      </div>
                      {c.hasRemote && (
                        <span className="inline-flex items-center rounded-none bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-300 uppercase tracking-wider">
                          Remote
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {c.categories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-none bg-surface-muted border border-line px-2 py-0.5 text-[11px] font-mono text-muted"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                    <span className="text-xs font-mono text-muted truncate max-w-[140px]">
                      {c.locations.join(", ")}
                    </span>
                    <Link
                      to="/jobs"
                      search={{ query: c.company }}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-accent hover:underline group-hover:translate-x-0.5 transition-transform uppercase"
                    >
                      View Jobs <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TWO-COLUMN SECTION: ROLE OF THE WEEK & CAREER ACTION */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* SECTION 6 — ROLE OF THE WEEK */}
            <section id="role-of-the-week" className="lg:col-span-7 space-y-4">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Spotlight</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Role of the Week</h2>
              </div>

              <div className="rounded-none border border-accent/30 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(123,0,166,0.08)] space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-none bg-accent/10 border border-accent px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider text-accent uppercase">
                    <Award className="size-3.5" /> High Demand Protocol Stack
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-ink font-bold mt-3">
                    {report.roleOfTheWeek.roleTitle}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    <strong className="text-ink font-semibold">{report.roleOfTheWeek.jobsTracked} jobs tracked</strong> across the ecosystem this week.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-none border border-line bg-surface-muted/30 p-4">
                    <h4 className="text-xs font-mono font-bold text-muted uppercase tracking-wider mb-2">Most Requested Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {report.roleOfTheWeek.mostRequestedSkills.map((s) => (
                        <Badge key={s} tone="accent">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-none border border-line bg-surface-muted/30 p-4">
                    <h4 className="text-xs font-mono font-bold text-muted uppercase tracking-wider mb-2">Experience Expectation</h4>
                    <p className="text-sm font-semibold text-ink">{report.roleOfTheWeek.typicalExperience}</p>
                    <p className="text-xs text-muted mt-1">Hands-on technical depth prioritized over years</p>
                  </div>
                </div>

                <div className="space-y-2.5 rounded-none bg-surface-muted/50 border border-line p-4">
                  <h4 className="text-xs font-mono font-bold text-ink uppercase tracking-wider">How to become competitive</h4>
                  <ul className="space-y-2">
                    {report.roleOfTheWeek.competitiveAdvice.map((advice, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-ink/90">
                        <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* SECTION 8 — THIS WEEK'S CAREER ACTION */}
            <section id="weekend-career-action" className="lg:col-span-5 space-y-4">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Practical Playbook</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Your Weekend Career Action</h2>
              </div>

              <div className="rounded-none border border-line bg-ink text-white p-6 sm:p-8 shadow-md space-y-6 flex flex-col justify-between relative">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-none bg-purple-500/20 px-2.5 py-1 text-xs font-mono font-bold text-purple-300 border border-purple-400/40 uppercase tracking-wider">
                    <Zap className="size-3.5" /> Action Plan
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-bold mt-3">
                    {report.careerAction.skillHeadline}
                  </h3>
                  <p className="text-sm text-bg/80 mt-2 leading-relaxed">
                    {report.careerAction.context}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">This Weekend's Checklist</p>
                  <ul className="space-y-2.5">
                    {report.careerAction.actionItems.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-bg/90">
                        <span className="flex size-5 items-center justify-center rounded-none bg-purple-500/30 text-purple-200 font-mono font-bold shrink-0 text-xs border border-purple-400/30">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/15">
                  <Link to="/apply">
                    <Button size="sm" className="w-full text-white">
                      Update Profile & Matches →
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* SECTION 7 — OPPORTUNITIES YOU MAY HAVE MISSED */}
          <section id="curated-opportunities" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Handpicked Roles</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Opportunities You May Have Missed</h2>
                <p className="text-sm text-muted mt-1">
                  Notable positions from this week's intake across various disciplines and seniority levels.
                </p>
              </div>

              {/* Bespoke Segmented Filter Control */}
              <div className="inline-flex items-center p-1 rounded-none bg-surface-muted border border-line gap-1 overflow-x-auto max-w-full">
                {[
                  { id: "all", label: "All Roles" },
                  { id: "remote", label: "Remote Only" },
                  { id: "salary", label: "Salary Disclosed" },
                  { id: "engineering", label: "Engineering" },
                  { id: "product", label: "Product" },
                  { id: "community", label: "Community & Mktg" },
                ].map((tab) => {
                  const isActive = selectedOpportunityFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedOpportunityFilter(tab.id)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-none transition-all whitespace-nowrap uppercase ${
                        isActive
                          ? "bg-accent text-white shadow-xs border border-[#640087]"
                          : "text-muted hover:text-ink hover:bg-white border border-transparent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.map((opp) => (
                <Link
                  key={opp.id}
                  to={opp.applyUrl as any}
                  className="group rounded-none border border-line bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:border-accent hover:shadow-[0_4px_16px_rgba(123,0,166,0.12)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-none bg-accent-soft border border-accent/25 flex items-center justify-center font-mono font-bold text-accent text-xs shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                          {opp.company.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider">{opp.company}</span>
                      </div>
                      {opp.salaryFormatted && (
                        <span className="text-[11px] font-mono font-bold text-emerald-800 tabular-nums bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-none">
                          {opp.salaryFormatted}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-accent transition-colors mt-3">
                      {opp.title}
                    </h3>
                    <p className="text-xs font-mono text-muted mt-2">
                      {opp.location} · {opp.seniority} · {opp.remote}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {opp.skills.map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs font-mono">
                    <span className="text-muted font-medium">{opp.highlights.join(" · ")}</span>
                    <span className="font-bold text-accent group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 uppercase">
                      Apply <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* TWO-COLUMN: HIRING SIGNALS & WEEK-OVER-WEEK */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* SECTION 9 — HIRING SIGNALS */}
            <section id="hiring-signals" className="lg:col-span-6 space-y-4">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Market Trajectory</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Web3 Hiring Signals</h2>
                <p className="text-xs text-muted mt-1">{report.hiringSignals.note}</p>
              </div>

              <div className="rounded-none border border-line bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.03)] space-y-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-none mb-2">
                    <TrendingUp className="size-3.5" /> Rising Demand
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {report.hiringSignals.rising.map((item) => (
                      <span
                        key={item}
                        className="rounded-none bg-emerald-50/50 border border-emerald-200 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-800"
                      >
                        ↑ {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-line">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-none mb-2">
                    • Stable Demand
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {report.hiringSignals.stable.map((item) => (
                      <span
                        key={item}
                        className="rounded-none bg-surface-muted border border-line px-3 py-1.5 text-xs font-mono font-medium text-ink"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-line">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent bg-accent-soft border border-accent/25 px-2.5 py-1 rounded-none mb-2">
                    Emerging Signals
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {report.hiringSignals.emerging.map((item) => (
                      <span
                        key={item}
                        className="rounded-none bg-accent-soft border border-accent/25 px-3 py-1.5 text-xs font-mono font-semibold text-accent"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 10 — WEEK-OVER-WEEK COMPARISON */}
            <section id="week-over-week" className="lg:col-span-6 space-y-4">
              <div>
                <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Comparative Deltas</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">This Week vs Last Week</h2>
                <p className="text-xs text-muted mt-1">{report.weekOverWeek.note}</p>
              </div>

              <div className="rounded-none border border-line bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.03)]">
                <div className="divide-y divide-line">
                  {report.weekOverWeek.metrics.map((metric) => (
                    <div key={metric.key} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">{metric.label}</p>
                        <p className="text-xs font-mono text-muted">
                          Current: <span className="font-semibold text-ink tabular-nums">{metric.currentValue}</span>
                          {typeof metric.previousValue === "number" && (
                            <span> · Prior: <span className="tabular-nums">{metric.previousValue}</span></span>
                          )}
                        </p>
                      </div>

                      {typeof metric.changePercentage === "number" && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-xs font-mono font-bold tabular-nums ${
                            metric.changePercentage >= 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-red-50 text-red-700 border border-red-300"
                          }`}
                        >
                          {metric.changePercentage >= 0 ? `+${metric.changePercentage}%` : `${metric.changePercentage}%`}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* SECTION 11 — PREVIOUS INTELLIGENCE REPORTS (ARCHIVE) */}
          <section id="archive-reports" className="space-y-4 pt-4 border-t border-line">
            <div>
              <p className="text-xs font-mono font-bold tracking-[0.2em] text-accent uppercase">Archive</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Previous Intelligence Reports</h2>
              <p className="text-sm text-muted mt-1">
                Browse historical weekly career snapshots and trend records.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {archives.map((arch) => (
                <Link
                  key={arch.id}
                  to="/weekend-intelligence"
                  search={{ week: arch.slug }}
                  className={`rounded-none border p-5 transition-all block ${
                    arch.slug === report.slug
                      ? "border-accent bg-accent/5 ring-1 ring-accent"
                      : "border-line bg-white hover:border-accent hover:shadow-[0_4px_16px_rgba(123,0,166,0.1)] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-accent uppercase">
                      {arch.isCurrent ? "Current Issue" : "Archived Edition"}
                    </span>
                    <span className="text-xs font-mono text-muted tabular-nums font-medium">{arch.jobsTracked} jobs</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ink mt-1.5">{arch.periodLabel}</h3>
                  <p className="text-xs text-muted mt-1 font-mono">Top focus: <span className="font-semibold text-ink">{arch.topSkill}</span></p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
