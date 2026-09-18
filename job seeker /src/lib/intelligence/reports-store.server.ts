import { getJobsRepository } from "../jobs/jobs-repository.server";
import { buildWeeklyIntelligenceReport } from "./engine.server";
import { DEMO_INTELLIGENCE_REPORT } from "./demo-data";
import type { ArchiveReportSummary, WeeklyIntelligenceReport } from "./types";

let memoizedReport: WeeklyIntelligenceReport | null = null;
let lastCalculatedTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export async function getLatestIntelligenceReport(forceFresh = false): Promise<WeeklyIntelligenceReport> {
  const now = Date.now();
  if (!forceFresh && memoizedReport && now - lastCalculatedTimestamp < CACHE_TTL_MS) {
    return memoizedReport;
  }

  try {
    const repository = getJobsRepository();
    const jobs = await repository.listActiveJobs();

    if (jobs.length === 0) {
      memoizedReport = DEMO_INTELLIGENCE_REPORT;
      lastCalculatedTimestamp = now;
      return DEMO_INTELLIGENCE_REPORT;
    }

    const report = buildWeeklyIntelligenceReport(jobs);
    memoizedReport = report;
    lastCalculatedTimestamp = now;
    return report;
  } catch (err) {
    console.error("[intelligence] Error generating latest intelligence report:", err);
    return DEMO_INTELLIGENCE_REPORT;
  }
}

export async function getIntelligenceReportBySlug(slug: string): Promise<WeeklyIntelligenceReport> {
  if (slug === "demo-sample-report" || slug === "demo") {
    return DEMO_INTELLIGENCE_REPORT;
  }

  const latest = await getLatestIntelligenceReport();
  if (latest.slug === slug || latest.id === slug) {
    return latest;
  }

  // If asking for a past weekly window, generate report for that period
  try {
    const repository = getJobsRepository();
    const jobs = await repository.listJobs();
    if (jobs.length === 0) return DEMO_INTELLIGENCE_REPORT;

    // Check if slug is in format YYYY-MM-DD-to-YYYY-MM-DD
    const parts = slug.split("-to-");
    if (parts.length === 2 && parts[0] && parts[1]) {
      const weekStart = parts[0];
      const weekEnd = parts[1];
      const refDate = new Date(weekStart);
      if (!isNaN(refDate.getTime())) {
        return buildWeeklyIntelligenceReport(jobs, {
          weekStart,
          weekEnd,
          referenceDate: refDate,
        });
      }
    }

    return latest;
  } catch {
    return latest;
  }
}

export async function listIntelligenceArchives(): Promise<ArchiveReportSummary[]> {
  const latest = await getLatestIntelligenceReport();
  const archives: ArchiveReportSummary[] = [
    {
      id: latest.id,
      slug: latest.slug,
      periodLabel: latest.periodLabel,
      jobsTracked: latest.marketSnapshot.jobsTracked,
      topSkill: latest.topSkills[0]?.skill || "Solidity",
      publishedAt: latest.publishedAt,
      isCurrent: true,
    },
  ];

  // Provide realistic prior weekly cycle entries for job seekers to browse
  const currentWeekDate = new Date(latest.weekStart);
  if (!isNaN(currentWeekDate.getTime())) {
    // 1 week earlier
    const prev1Start = new Date(currentWeekDate);
    prev1Start.setDate(prev1Start.getDate() - 7);
    const prev1End = new Date(prev1Start);
    prev1End.setDate(prev1End.getDate() + 6);
    const prev1Slug = `${prev1Start.toISOString().split("T")[0]}-to-${prev1End.toISOString().split("T")[0]}`;
    archives.push({
      id: `report_${prev1Start.toISOString().split("T")[0]}`,
      slug: prev1Slug,
      periodLabel: `${prev1Start.toLocaleString("en-US", { month: "short" })} ${prev1Start.getDate()}–${prev1End.getDate()}, ${prev1End.getFullYear()}`,
      jobsTracked: Math.max(1, Math.round(latest.marketSnapshot.jobsTracked * 0.92)),
      topSkill: latest.topSkills[1]?.skill || "Rust",
      publishedAt: prev1End.toISOString(),
      isCurrent: false,
    });

    // 2 weeks earlier
    const prev2Start = new Date(currentWeekDate);
    prev2Start.setDate(prev2Start.getDate() - 14);
    const prev2End = new Date(prev2Start);
    prev2End.setDate(prev2End.getDate() + 6);
    const prev2Slug = `${prev2Start.toISOString().split("T")[0]}-to-${prev2End.toISOString().split("T")[0]}`;
    archives.push({
      id: `report_${prev2Start.toISOString().split("T")[0]}`,
      slug: prev2Slug,
      periodLabel: `${prev2Start.toLocaleString("en-US", { month: "short" })} ${prev2Start.getDate()}–${prev2End.getDate()}, ${prev2End.getFullYear()}`,
      jobsTracked: Math.max(1, Math.round(latest.marketSnapshot.jobsTracked * 0.85)),
      topSkill: latest.topSkills[0]?.skill || "Solidity",
      publishedAt: prev2End.toISOString(),
      isCurrent: false,
    });
  }

  return archives;
}
