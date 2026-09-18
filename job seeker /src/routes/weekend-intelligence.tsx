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
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-[11px] font-mono font-semibold tracking-wider text-accent uppercase">
                  Weekend Intelligence
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-2xs">
                  <Calendar className="size-3.5 text-accent" /> {report.periodLabel}
                </span>
                {report.isDemoData && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 text-xs font-medium text-amber-900">
                    Demo Data
                  </span>
                )}
              </div>

              {/* Share & Copy Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-2 text-xs font-medium h-9 bg-white border-line shadow-2xs hover:border-ink/20 hover:bg-surface-muted transition-all"
                >
                  <Share2 className="size-3.5 text-muted" />
                  Share Report
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-2 text-xs font-medium h-9 bg-white border-line shadow-2xs hover:border-ink/20 hover:bg-surface-muted transition-all"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5 text-muted" />}
                  {copied ? "Link Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>

            {/* Title & Tagline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight">
              Jaya Talent <span className="italic text-accent">Weekend Intelligence</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
              {report.tagline}
            </p>

            {/* Data Provenance Notice */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-surface-muted border border-line px-4 py-2.5 text-xs text-muted">
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
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Executive Summary</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Market Snapshot</h2>
              </div>
              <span className="text-xs text-muted font-medium">Updated weekly</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition-all hover:border-accent/40">
                <p className="text-xs font-medium text-muted flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-accent" /> Jobs Tracked
                </p>
                <p className="mt-2 font-serif text-3xl sm:text-4xl text-ink tabular-nums">
                  {report.marketSnapshot.jobsTracked.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted">Active opportunities</p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition-all hover:border-accent/40">
                <p className="text-xs font-medium text-muted flex items-center gap-1.5">
                  <Globe className="size-3.5 text-accent" /> Remote Roles
                </p>
                <p className="mt-2 font-serif text-3xl sm:text-4xl text-ink tabular-nums">
                  {report.marketSnapshot.remoteCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-accent font-semibold">
                  {report.marketSnapshot.remotePercentage}% of all tracked roles
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition-all hover:border-accent/40">
                <p className="text-xs font-medium text-muted flex items-center gap-1.5">
                  <Layers className="size-3.5 text-accent" /> Engineering
                </p>
                <p className="mt-2 font-serif text-3xl sm:text-4xl text-ink tabular-nums">
                  {report.marketSnapshot.engineeringCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {report.marketSnapshot.engineeringPercentage}% technical positions
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition-all hover:border-accent/40">
                <p className="text-xs font-medium text-muted flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-accent" /> Companies Hiring
                </p>
                <p className="mt-2 font-serif text-3xl sm:text-4xl text-ink tabular-nums">
                  {report.marketSnapshot.companiesHiringCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted">Distinct active teams</p>
              </div>

              <div className="col-span-2 lg:col-span-1 rounded-2xl border border-line bg-white p-5 shadow-xs transition-all hover:border-accent/40">
                <p className="text-xs font-medium text-muted flex items-center gap-1.5">
                  <DollarSign className="size-3.5 text-accent" /> Salary Disclosed
                </p>
                <p className="mt-2 font-serif text-3xl sm:text-4xl text-ink tabular-nums">
                  {report.marketSnapshot.salaryDisclosedCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {report.marketSnapshot.salaryDisclosedPercentage}% transparent pay
                </p>
              </div>
            </div>
          </section>

          {/* GRID SECTION: TOP SKILLS & WHERE WEB3 IS HIRING */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* SECTION 2 — TOP SKILLS EMPLOYERS REQUEST */}
            <section id="top-skills" className="lg:col-span-7 space-y-4">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Skill Extraction</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Skills Employers Are Hiring For</h2>
                <p className="text-sm text-muted mt-1">
                  Most frequently requested skills and protocol stacks extracted from active job descriptions.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-4">
                {report.topSkills.length === 0 ? (
                  <p className="text-sm text-muted py-6 text-center">No skill records found for this period.</p>
                ) : (
                  report.topSkills.map((item, idx) => (
                    <div key={item.skill} className="space-y-1.5 group">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-ink flex items-center gap-2">
                          <span className="inline-flex size-5 items-center justify-center rounded-md bg-surface-muted text-xs font-bold text-muted group-hover:bg-accent group-hover:text-white transition-colors">
                            {idx + 1}
                          </span>
                          {item.skill}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted tabular-nums">
                          <span className="font-semibold text-ink">{item.jobCount} jobs</span>
                          <span className="text-subtle">({item.percentage}%)</span>
                        </div>
                      </div>
                      {/* Horizontal bar meter */}
                      <div className="h-2.5 w-full rounded-full bg-surface-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-500"
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
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Geographic Distribution</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Where Is Web3 Hiring?</h2>
                <p className="text-sm text-muted mt-1">
                  Among jobs tracked by Jaya Talent this week.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-4">
                {report.geoDistribution.map((geo) => (
                  <div key={geo.region} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ink flex items-center gap-2">
                        <Globe className="size-3.5 text-accent shrink-0" />
                        {geo.region}
                      </span>
                      <span className="text-xs font-semibold text-ink tabular-nums">
                        {geo.jobCount} <span className="text-muted font-normal">({geo.percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent/80"
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
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Compensation Benchmarks</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">What Does Web3 Pay?</h2>
                <p className="text-sm text-muted mt-1">
                  Base compensation insights derived from jobs disclosing transparent salary ranges.
                </p>
              </div>
            </div>

            {!report.salaryIntelligence.isAvailable || report.salaryIntelligence.roles.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface-muted p-8 text-center">
                <DollarSign className="size-8 text-muted mx-auto mb-2" />
                <h3 className="text-base font-semibold text-ink">Salary Data Notice</h3>
                <p className="text-sm text-muted mt-1 max-w-lg mx-auto">
                  {report.salaryIntelligence.disclaimer}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {report.salaryIntelligence.roles.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-line bg-white p-5 shadow-xs hover:border-accent/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                            {item.category.split("/")[0]}
                          </span>
                          <span className="text-xs font-medium text-muted bg-surface-muted px-2 py-0.5 rounded-md">
                            {item.experienceLevel}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base text-ink line-clamp-1">{item.role}</h3>
                        <p className="font-serif text-2xl text-ink font-bold mt-3 text-accent">
                          {item.salaryFormatted}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs text-muted">
                        <span>{item.remote}</span>
                        <span>{item.sampleCount} tracked role{item.sampleCount > 1 ? "s" : ""}</span>
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
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Active Employers</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Companies Hiring This Week</h2>
                <p className="text-sm text-muted mt-1">
                  Protocols and Web3 startups with multiple verified active openings.
                </p>
              </div>
              <Link
                to="/jobs"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                Browse all companies <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {report.topCompanies.map((c) => (
                <div
                  key={c.company}
                  className="rounded-2xl border border-line bg-white p-6 shadow-xs hover:shadow-sm hover:border-accent/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-ink">{c.company}</h3>
                        <p className="text-xs text-accent font-semibold mt-0.5">
                          {c.activeJobsCount} active {c.activeJobsCount === 1 ? "opportunity" : "opportunities"}
                        </p>
                      </div>
                      {c.hasRemote && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          Remote
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {c.categories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-muted"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                    <span className="text-xs text-muted truncate max-w-[140px]">
                      {c.locations.join(", ")}
                    </span>
                    <Link
                      to="/jobs"
                      search={{ query: c.company }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
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
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Spotlight</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Role of the Week</h2>
              </div>

              <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-white to-purple-50/40 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 border border-accent/25 px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider text-accent uppercase">
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
                  <div className="rounded-xl border border-line bg-white/90 p-4">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Most Requested Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {report.roleOfTheWeek.mostRequestedSkills.map((s) => (
                        <Badge key={s} tone="accent">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-white/90 p-4">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Experience Expectation</h4>
                    <p className="text-sm font-semibold text-ink">{report.roleOfTheWeek.typicalExperience}</p>
                    <p className="text-xs text-muted mt-1">Hands-on technical depth prioritized over years</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">How to become competitive</h4>
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
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Practical Playbook</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Your Weekend Career Action</h2>
              </div>

              <div className="rounded-2xl border border-line bg-ink text-white p-6 sm:p-8 shadow-md space-y-6 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/25 px-2.5 py-1 text-xs font-semibold text-purple-300 border border-purple-400/30 uppercase tracking-wider">
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
                  <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">This Weekend's Checklist</p>
                  <ul className="space-y-2.5">
                    {report.careerAction.actionItems.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-bg/90">
                        <span className="flex size-5 items-center justify-center rounded-md bg-purple-500/30 text-purple-200 font-bold shrink-0 text-xs">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/15">
                  <Link to="/apply">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
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
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Handpicked Roles</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Opportunities You May Have Missed</h2>
                <p className="text-sm text-muted mt-1">
                  Notable positions from this week's intake across various disciplines and seniority levels.
                </p>
              </div>

              {/* Bespoke Segmented Filter Control */}
              <div className="inline-flex items-center p-1 rounded-xl bg-surface-muted border border-line shadow-2xs gap-1 overflow-x-auto max-w-full">
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
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                        isActive
                          ? "bg-white text-ink font-semibold shadow-xs border border-line/70 ring-1 ring-black/[0.04]"
                          : "text-muted hover:text-ink hover:bg-white/60"
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
                  className="rounded-2xl border border-line bg-white p-6 shadow-xs hover:border-accent/40 hover:shadow-sm transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-muted">{opp.company}</span>
                      {opp.salaryFormatted && (
                        <span className="text-xs font-bold text-accent tabular-nums bg-accent-soft px-2 py-0.5 rounded-md">
                          {opp.salaryFormatted}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-accent transition-colors mt-1.5">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-muted mt-2">
                      {opp.location} · {opp.seniority} · {opp.remote}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {opp.skills.map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs">
                    <span className="text-muted">{opp.highlights.join(" · ")}</span>
                    <span className="font-semibold text-accent group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
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
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Market Trajectory</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">Web3 Hiring Signals</h2>
                <p className="text-xs text-muted mt-1">{report.hiringSignals.note}</p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
                    <TrendingUp className="size-3.5" /> Rising Demand
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {report.hiringSignals.rising.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg bg-emerald-50/50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                      >
                        ↑ {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-line">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
                    • Stable Demand
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {report.hiringSignals.stable.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg bg-surface-muted border border-line px-3 py-1.5 text-xs font-medium text-ink"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-line">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md mb-2">
                    Emerging Signals
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {report.hiringSignals.emerging.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-accent"
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
                <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Comparative Deltas</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-1">This Week vs Last Week</h2>
                <p className="text-xs text-muted mt-1">{report.weekOverWeek.note}</p>
              </div>

              <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
                <div className="divide-y divide-line">
                  {report.weekOverWeek.metrics.map((metric) => (
                    <div key={metric.key} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">{metric.label}</p>
                        <p className="text-xs text-muted">
                          Current: <span className="font-semibold text-ink tabular-nums">{metric.currentValue}</span>
                          {typeof metric.previousValue === "number" && (
                            <span> · Prior: <span className="tabular-nums">{metric.previousValue}</span></span>
                          )}
                        </p>
                      </div>

                      {typeof metric.changePercentage === "number" && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono font-bold tabular-nums ${
                            metric.changePercentage >= 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
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
              <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Archive</p>
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
                  className={`rounded-2xl border p-5 transition-all block ${
                    arch.slug === report.slug
                      ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                      : "border-line bg-white hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-accent uppercase">
                      {arch.isCurrent ? "Current Issue" : "Archived Edition"}
                    </span>
                    <span className="text-xs text-muted tabular-nums">{arch.jobsTracked} jobs</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ink mt-1">{arch.periodLabel}</h3>
                  <p className="text-xs text-muted mt-1">Top focus: {arch.topSkill}</p>
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
