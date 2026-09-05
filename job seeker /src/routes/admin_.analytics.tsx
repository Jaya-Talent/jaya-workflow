import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Target,
  MousePointer,
  Bookmark,
  Sparkles,
  Download,
  Copy,
  Calendar,
  Filter,
  Globe,
  Building2,
  CheckCircle2,
  Zap,
  Printer,
  FileText,
  Award,
  Layers,
  Check,
  ArrowRight
} from "lucide-react";
import { AdminGate } from "@/components/admin-gate";
import { AdminShell } from "@/components/admin-shell";
import { Badge, Button, Input, Select } from "@/components/ui";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/admin_/analytics")({
  component: AdminAnalyticsPage,
  head: () => ({
    meta: [{ title: `Analytics & Intelligence | ${SITE_NAME}` }],
  }),
});

type RawApplicant = {
  id: string;
  created_at: string;
  job_categories: string[];
  skills: string[];
  country: string;
  city: string;
  experience_level: string;
  work_preference: string;
  profile_completion: number;
  cv_attached: boolean;
};

type RawJob = {
  id: string;
  created_at: string;
  title: string;
  company: string;
  location: string;
  remote: "remote" | "hybrid" | "onsite";
  category: string;
  required_skills: string[];
  preferred_skills: string[];
  technologies: string[];
  salary_min: string;
  salary_currency: string;
  status: "active" | "closed";
};

type RawMatch = {
  match_id: string;
  created_at: string;
  match_score: number;
  score_category: string;
  job_id: string;
  applicant_id: string;
};

type RawInteraction = {
  interaction_id: string;
  timestamp: string;
  interaction_type: "view" | "click" | "save" | "apply" | "not_relevant" | "dismiss";
  job_id: string;
  applicant_id: string;
};

type AnalyticsData = {
  applicants: RawApplicant[];
  jobs: RawJob[];
  matches: RawMatch[];
  interactions: RawInteraction[];
};

function formatDateLabel(d: string): string {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function AdminAnalyticsPage() {
  return (
    <AdminGate checkUrl="/api/admin/analytics">
      {({ logout }) => (
        <AdminShell current="analytics" onLogout={() => void logout()}>
          <AnalyticsDashboard />
        </AdminShell>
      )}
    </AdminGate>
  );
}

function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Timeframe Controls
  const [timeframePreset, setTimeframePreset] = useState<"sept_2026" | "last_7" | "last_30" | "all" | "custom">("sept_2026");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-07");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/analytics", { credentials: "include" });
        if (!res.ok) return;
        const json = (await res.json()) as AnalyticsData;
        setData(json);
      } catch (err) {
        console.error("Failed loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Update dates based on preset selection
  const handlePresetChange = (val: string) => {
    setTimeframePreset(val as any);
    const now = new Date();
    if (val === "sept_2026") {
      setStartDate("2026-09-01");
      setEndDate("2026-09-30");
    } else if (val === "last_7") {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (val === "last_30") {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (val === "all") {
      setStartDate("");
      setEndDate("");
    }
  };

  // Filter Data based on selected date window
  const filteredMetrics = useMemo(() => {
    if (!data) {
      return {
        applicantsCount: 0,
        jobsCount: 0,
        activeJobsCount: 0,
        matchesCount: 0,
        highScoreMatchesCount: 0,
        clicksCount: 0,
        savesCount: 0,
        appSubmissions: 0,
        conversionRate: 0,
        categoryCounts: [] as { category: string; count: number; percentage: number }[],
        topSkills: [] as { skill: string; count: number; percentage: number }[],
        topCompanies: [] as { company: string; count: number; active: number }[],
        locationsBreakdown: [] as { location: string; count: number; percentage: number }[],
        categoryPerformance: [] as { category: string; jobs: number; matches: number; clicks: number; conversion: number }[],
        timeframeText: "All Time",
      };
    }

    const isWithinRange = (dateStr: string) => {
      if (!dateStr) return true;
      const d = new Date(dateStr).getTime();
      if (isNaN(d)) return true;
      if (startDate) {
        const start = new Date(startDate).getTime();
        if (!isNaN(start) && d < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (!isNaN(end.getTime()) && d > end.getTime()) return false;
      }
      return true;
    };

    const filteredApplicants = data.applicants.filter((a) => isWithinRange(a.created_at));
    const filteredJobs = data.jobs.filter((j) => isWithinRange(j.created_at));
    const filteredMatches = data.matches.filter((m) => isWithinRange(m.created_at));
    const filteredInteractions = data.interactions.filter((i) => isWithinRange(i.timestamp));

    const clicksCount = filteredInteractions.filter((i) => i.interaction_type === "click" || i.interaction_type === "apply").length;
    const savesCount = filteredInteractions.filter((i) => i.interaction_type === "save").length;
    const appSubmissions = filteredInteractions.filter((i) => i.interaction_type === "apply").length;

    const conversionRate = filteredMatches.length > 0 
      ? Math.round((clicksCount / Math.max(1, filteredMatches.length)) * 100 * 10) / 10
      : 0;

    // Jobs per Category
    const catMap = new Map<string, number>();
    for (const j of filteredJobs) {
      const cat = j.category || "Other";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    }
    const totalJobs = Math.max(1, filteredJobs.length);
    const categoryCounts = Array.from(catMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalJobs) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Most Requested Skills
    const skillMap = new Map<string, number>();
    for (const j of filteredJobs) {
      const skills = Array.from(new Set([...j.required_skills, ...j.preferred_skills, ...j.technologies]));
      for (const s of skills) {
        if (!s) continue;
        const normalized = s.trim();
        if (normalized.length > 1) {
          skillMap.set(normalized, (skillMap.get(normalized) || 0) + 1);
        }
      }
    }
    const topSkills = Array.from(skillMap.entries())
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: Math.round((count / totalJobs) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Most Active Companies
    const companyMap = new Map<string, { count: number; active: number }>();
    for (const j of filteredJobs) {
      const comp = j.company || "Stealth Startup";
      const curr = companyMap.get(comp) || { count: 0, active: 0 };
      companyMap.set(comp, {
        count: curr.count + 1,
        active: curr.active + (j.status === "active" ? 1 : 0),
      });
    }
    const topCompanies = Array.from(companyMap.entries())
      .map(([company, data]) => ({ company, count: data.count, active: data.active }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Locations Breakdown
    const locMap = new Map<string, number>();
    for (const j of filteredJobs) {
      let loc = j.location ? j.location.trim() : "Remote";
      if (j.remote === "remote" || loc.toLowerCase().includes("remote")) {
        loc = "Remote / Global";
      } else if (loc.includes(",")) {
        loc = loc.split(",")[0].trim();
      }
      locMap.set(loc, (locMap.get(loc) || 0) + 1);
    }
    const locationsBreakdown = Array.from(locMap.entries())
      .map(([location, count]) => ({
        location,
        count,
        percentage: Math.round((count / totalJobs) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Category Conversion Performance
    const jobCatLookup = new Map(filteredJobs.map((j) => [j.id, j.category || "Other"]));
    const catPerfMap = new Map<string, { jobs: number; matches: number; clicks: number }>();

    for (const j of filteredJobs) {
      const cat = j.category || "Other";
      const curr = catPerfMap.get(cat) || { jobs: 0, matches: 0, clicks: 0 };
      catPerfMap.set(cat, { ...curr, jobs: curr.jobs + 1 });
    }
    for (const m of filteredMatches) {
      const cat = jobCatLookup.get(m.job_id) || "Other";
      const curr = catPerfMap.get(cat) || { jobs: 0, matches: 0, clicks: 0 };
      catPerfMap.set(cat, { ...curr, matches: curr.matches + 1 });
    }
    for (const i of filteredInteractions) {
      if (i.interaction_type === "click" || i.interaction_type === "apply") {
        const cat = jobCatLookup.get(i.job_id) || "Other";
        const curr = catPerfMap.get(cat) || { jobs: 0, matches: 0, clicks: 0 };
        catPerfMap.set(cat, { ...curr, clicks: curr.clicks + 1 });
      }
    }

    const categoryPerformance = Array.from(catPerfMap.entries())
      .map(([category, stats]) => ({
        category,
        jobs: stats.jobs,
        matches: stats.matches,
        clicks: stats.clicks,
        conversion: stats.matches > 0 ? Math.round((stats.clicks / stats.matches) * 100) : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    let timeframeText = "All Time";
    if (startDate && endDate) {
      timeframeText = `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}`;
    } else if (startDate) {
      timeframeText = `Since ${formatDateLabel(startDate)}`;
    }

    return {
      applicantsCount: filteredApplicants.length,
      jobsCount: filteredJobs.length,
      activeJobsCount: filteredJobs.filter((j) => j.status === "active").length,
      matchesCount: filteredMatches.length,
      highScoreMatchesCount: filteredMatches.filter((m) => m.match_score >= 80).length,
      clicksCount,
      savesCount,
      appSubmissions,
      conversionRate,
      categoryCounts,
      topSkills,
      topCompanies,
      locationsBreakdown,
      categoryPerformance,
      timeframeText,
    };
  }, [data, startDate, endDate]);

  // Export Executive Report to Clipboard
  const generateReportText = () => {
    const skillsList = filteredMetrics.topSkills
      .map((s, idx) => `${idx + 1}. **${s.skill}** — Required in ${s.count} job postings (${s.percentage}% of roles)`)
      .join("\n");

    const categoriesList = filteredMetrics.categoryCounts
      .slice(0, 5)
      .map((c) => `- **${c.category}**: ${c.count} active roles (${c.percentage}%)`)
      .join("\n");

    const locationsList = filteredMetrics.locationsBreakdown
      .map((l) => `- **${l.location}**: ${l.count} positions (${l.percentage}%)`)
      .join("\n");

    return `# Executive Market Intelligence Report — ${filteredMetrics.timeframeText}
*Generated by Jaya Talent Intelligence Network*

## Key Performance Indicators & Metrics
- **Total Registered Applicants**: ${filteredMetrics.applicantsCount}
- **Active Job Postings**: ${filteredMetrics.jobsCount} (${filteredMetrics.activeJobsCount} active)
- **Talent-Job Matches Computed**: ${filteredMetrics.matchesCount} (${filteredMetrics.highScoreMatchesCount} high-match scores >=80%)
- **Application Link Clicks / Conversions**: ${filteredMetrics.clicksCount} clicks
- **Saved Jobs**: ${filteredMetrics.savesCount} bookmarks
- **Match-to-Application Conversion Rate**: ${filteredMetrics.conversionRate}%

## Top 10 Web3 & Tech Skills Employers Are Hiring For
${skillsList}

## Hiring Demand by Category
${categoriesList}

## Geographic & Remote Distribution
${locationsList}

---
*Report published by Jaya Talent — Web3 & Tech Recruitment Intelligence*`;
  };

  const copyReport = async () => {
    const reportText = generateReportText();
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const printPdfReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Jaya Talent Analytics & Intelligence Report (${filteredMetrics.timeframeText})</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; max-width: 900px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 2px solid #710193; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #710193; }
            .title { font-size: 28px; font-weight: 800; margin: 0; color: #0f172a; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; rounded: 8px; border-radius: 8px; }
            .card-val { font-size: 28px; font-weight: bold; color: #710193; }
            .card-lbl { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
            h2 { font-size: 18px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            th { background: #f1f5f9; font-weight: 600; color: #334155; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; background: #e9d5ff; color: #710193; font-weight: 600; font-size: 11px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Jaya Talent</div>
              <div class="subtitle">Recruitment Intelligence & Employer Demand Network</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600; font-size: 14px;">Market Intelligence Report</div>
              <div class="subtitle">${filteredMetrics.timeframeText}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-val">${filteredMetrics.applicantsCount}</div>
              <div class="card-lbl">Applicants</div>
            </div>
            <div class="card">
              <div class="card-val">${filteredMetrics.jobsCount}</div>
              <div class="card-lbl">Job Postings</div>
            </div>
            <div class="card">
              <div class="card-val">${filteredMetrics.matchesCount}</div>
              <div class="card-lbl">Talent Matches</div>
            </div>
            <div class="card">
              <div class="card-val">${filteredMetrics.conversionRate}%</div>
              <div class="card-lbl">Match Conversion</div>
            </div>
          </div>

          <h2>Top 10 Web3 & Technical Skills in Demand</h2>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Skill / Technology</th>
                <th>Employer Demand Count</th>
                <th>% of Role Requirements</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMetrics.topSkills
                .map(
                  (s, idx) => `
                <tr>
                  <td>#${idx + 1}</td>
                  <td><strong>${s.skill}</strong></td>
                  <td>${s.count} postings</td>
                  <td><span class="badge">${s.percentage}%</span></td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>

          <h2>Hiring Volume by Job Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Active Roles</th>
                <th>Share of Platform Jobs</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMetrics.categoryCounts
                .map(
                  (c) => `
                <tr>
                  <td><strong>${c.category}</strong></td>
                  <td>${c.count} positions</td>
                  <td>${c.percentage}%</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>

          <h2>Most Active Employers & Top Hiring Hubs</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h3>Top Hiring Companies</h3>
              <ul>
                ${filteredMetrics.topCompanies.map((c) => `<li><strong>${c.company}</strong> — ${c.count} postings (${c.active} active)</li>`).join("")}
              </ul>
            </div>
            <div>
              <h3>Top Hiring Locations</h3>
              <ul>
                ${filteredMetrics.locationsBreakdown.map((l) => `<li><strong>${l.location}</strong> — ${l.count} positions (${l.percentage}%)</li>`).join("")}
              </ul>
            </div>
          </div>

          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} — Confidential Jaya Talent Intelligence Document
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl sm:text-4xl text-ink">Analytics & Intelligence</h1>
            <Badge tone="accent" className="bg-accent/10 text-accent border-accent/20">
              <Zap className="mr-1 h-3 w-3" /> Live Telemetry
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Platform performance tracking, employer hiring demand trends, and skill intelligence metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyReport} className="gap-1.5">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied Digest!" : "Copy Report Digest"}
          </Button>
          <Button variant="secondary" size="sm" onClick={printPdfReport} className="gap-1.5 bg-accent text-white hover:bg-accent/90">
            <Printer className="h-4 w-4" /> Export Intelligence PDF
          </Button>
        </div>
      </div>

      {/* Filter & Customizable Timeframe Control Bar */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Calendar className="h-4 w-4 text-accent" />
            <span>Customizable Analysis Timeframe</span>
          </div>
          <div className="text-xs font-medium text-muted bg-surface-muted px-3 py-1.5 rounded-full border border-line">
            Showing analysis for: <strong className="text-ink">{filteredMetrics.timeframeText}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Timeframe Preset</label>
            <Select value={timeframePreset} onChange={(e) => handlePresetChange(e.target.value)}>
              <option value="sept_2026">September 2026 (Current Month)</option>
              <option value="last_7">Last 7 Days</option>
              <option value="last_30">Last 30 Days</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Date Window</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setTimeframePreset("custom");
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setTimeframePreset("custom");
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => handlePresetChange("sept_2026")}
            >
              Reset to Sept 2026
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted animate-pulse">Loading analytics & telemetry data...</div>
      ) : (
        <>
          {/* Top KPI Metric Scorecards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl bg-surface p-4 border border-line shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between text-muted text-xs font-medium">
                <span>Applicants</span>
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-ink tabular-nums">{filteredMetrics.applicantsCount}</p>
              <p className="mt-1 text-[11px] text-muted">Registered in window</p>
            </div>

            <div className="rounded-2xl bg-surface p-4 border border-line shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between text-muted text-xs font-medium">
                <span>Job Postings</span>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-ink tabular-nums">{filteredMetrics.jobsCount}</p>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">{filteredMetrics.activeJobsCount} active roles</p>
            </div>

            <div className="rounded-2xl bg-surface p-4 border border-line shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between text-muted text-xs font-medium">
                <span>Matches Created</span>
                <Target className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-ink tabular-nums">{filteredMetrics.matchesCount}</p>
              <p className="mt-1 text-[11px] text-muted">{filteredMetrics.highScoreMatchesCount} high score (≥80%)</p>
            </div>

            <div className="rounded-2xl bg-surface p-4 border border-line shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between text-muted text-xs font-medium">
                <span>Apply Link Clicks</span>
                <MousePointer className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-ink tabular-nums">{filteredMetrics.clicksCount}</p>
              <p className="mt-1 text-[11px] text-muted">Outbound applications</p>
            </div>

            <div className="rounded-2xl bg-surface p-4 border border-line shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between text-muted text-xs font-medium">
                <span>Saved Jobs</span>
                <Bookmark className="h-4 w-4 text-rose-600" />
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-ink tabular-nums">{filteredMetrics.savesCount}</p>
              <p className="mt-1 text-[11px] text-muted">Candidate bookmarks</p>
            </div>

            <div className="rounded-2xl bg-surface p-4 border border-line shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between text-muted text-xs font-medium">
                <span>Conversion Rate</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-3xl font-serif font-bold text-emerald-600 tabular-nums">
                {filteredMetrics.conversionRate}%
              </p>
              <p className="mt-1 text-[11px] text-muted">Match → Application</p>
            </div>
          </div>

          {/* Core Analytics Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top 10 Web3 & Tech Skills in High Demand */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] space-y-5">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="font-serif text-xl text-ink flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" /> Top 10 Web3 Skills Employers Are Hiring For
                  </h3>
                  <p className="text-xs text-muted mt-0.5">Most requested skills extracted from job requirements ({filteredMetrics.timeframeText})</p>
                </div>
                <Badge tone="accent" className="bg-purple-100 text-purple-800 border-purple-200">
                  High Demand
                </Badge>
              </div>

              {filteredMetrics.topSkills.length === 0 ? (
                <p className="text-xs text-muted italic">No skill requirements logged in this date range.</p>
              ) : (
                <div className="space-y-3">
                  {filteredMetrics.topSkills.map((item, idx) => (
                    <div key={item.skill} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-ink flex items-center gap-1.5">
                          <span className="text-muted font-mono w-5">#{idx + 1}</span>
                          <strong className="font-semibold">{item.skill}</strong>
                        </span>
                        <span className="text-muted">
                          {item.count} postings ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-500"
                          style={{ width: `${Math.max(5, Math.min(100, item.percentage * 2))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Jobs per Category Distribution */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] space-y-5">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="font-serif text-xl text-ink flex items-center gap-2">
                    <Layers className="h-5 w-5 text-accent" /> Jobs per Category Distribution
                  </h3>
                  <p className="text-xs text-muted mt-0.5">Hiring volume split across Web3 sectors</p>
                </div>
                <Badge tone="neutral">{filteredMetrics.categoryCounts.length} Categories</Badge>
              </div>

              {filteredMetrics.categoryCounts.length === 0 ? (
                <p className="text-xs text-muted italic">No categories found in selected date range.</p>
              ) : (
                <div className="space-y-3.5">
                  {filteredMetrics.categoryCounts.slice(0, 8).map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-ink font-semibold">{cat.category}</span>
                        <span className="text-muted">
                          {cat.count} roles ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-surface-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-600 transition-all duration-500"
                          style={{ width: `${Math.max(4, cat.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Analytics: Most Active Employers & Popular Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Most Active Companies */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="font-serif text-xl text-ink flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-accent" /> Most Active Employers
                  </h3>
                  <p className="text-xs text-muted mt-0.5">Companies with highest hiring volume in period</p>
                </div>
              </div>

              {filteredMetrics.topCompanies.length === 0 ? (
                <p className="text-xs text-muted italic">No hiring companies recorded.</p>
              ) : (
                <div className="divide-y divide-line">
                  {filteredMetrics.topCompanies.map((c) => (
                    <div key={c.company} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-ink text-sm">{c.company}</div>
                        <div className="text-muted mt-0.5">{c.active} active job listings</div>
                      </div>
                      <Badge tone="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {c.count} Total Positions
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Hiring Hubs & Locations */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="font-serif text-xl text-ink flex items-center gap-2">
                    <Globe className="h-5 w-5 text-accent" /> Popular Hiring Locations
                  </h3>
                  <p className="text-xs text-muted mt-0.5">Remote vs Top global crypto tech hubs</p>
                </div>
              </div>

              {filteredMetrics.locationsBreakdown.length === 0 ? (
                <p className="text-xs text-muted italic">No locations data recorded.</p>
              ) : (
                <div className="space-y-3">
                  {filteredMetrics.locationsBreakdown.map((loc) => (
                    <div key={loc.location} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-ink font-semibold">{loc.location}</span>
                        <span className="text-muted">{loc.count} positions ({loc.percentage}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.max(5, loc.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Conversion & Performance Funnel */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-serif text-xl text-ink flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" /> Category Performance & Match Conversion Funnel
                </h3>
                <p className="text-xs text-muted mt-0.5">Match creation to application conversion performance by sector</p>
              </div>
            </div>

            {filteredMetrics.categoryPerformance.length === 0 ? (
              <p className="text-xs text-muted italic">No performance data recorded for this date range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line text-muted font-semibold bg-surface-muted/50">
                      <th className="py-2.5 px-3">Job Category</th>
                      <th className="py-2.5 px-3">Active Roles</th>
                      <th className="py-2.5 px-3">Matches Generated</th>
                      <th className="py-2.5 px-3">Outbound Clicks</th>
                      <th className="py-2.5 px-3">Match → App Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredMetrics.categoryPerformance.map((row) => (
                      <tr key={row.category} className="hover:bg-surface-muted/30">
                        <td className="py-3 px-3 font-semibold text-ink text-sm">{row.category}</td>
                        <td className="py-3 px-3 tabular-nums text-muted">{row.jobs}</td>
                        <td className="py-3 px-3 tabular-nums text-muted">{row.matches}</td>
                        <td className="py-3 px-3 tabular-nums font-semibold text-ink">{row.clicks}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {row.conversion}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Generated Market Intelligence Digest Preview Box */}
          <div className="rounded-2xl border-2 border-accent/30 bg-purple-900/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <h3 className="font-serif text-lg font-bold text-ink">
                  Published Intelligence Digest Preview ({filteredMetrics.timeframeText})
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={copyReport} className="text-xs gap-1">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Report Text"}
              </Button>
            </div>

            <pre className="whitespace-pre-wrap font-sans text-xs bg-surface p-4 rounded-xl border border-line text-ink leading-relaxed max-h-72 overflow-y-auto">
              {generateReportText()}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
