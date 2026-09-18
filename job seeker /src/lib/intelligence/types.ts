export type MarketSnapshot = {
  jobsTracked: number;
  remoteCount: number;
  remotePercentage: number;
  engineeringCount: number;
  engineeringPercentage: number;
  companiesHiringCount: number;
  salaryDisclosedCount: number;
  salaryDisclosedPercentage: number;
};

export type SkillDemandStat = {
  skill: string;
  jobCount: number;
  percentage: number;
};

export type SalaryInsightItem = {
  role: string;
  category: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryFormatted: string;
  currency: string;
  remote: string;
  sampleCount: number;
};

export type SalaryIntelligenceData = {
  isAvailable: boolean;
  disclaimer: string;
  roles: SalaryInsightItem[];
};

export type GeoDistributionItem = {
  region: string;
  jobCount: number;
  percentage: number;
};

export type HiringCompanyItem = {
  company: string;
  activeJobsCount: number;
  categories: string[];
  locations: string[];
  hasRemote: boolean;
};

export type RoleOfTheWeek = {
  roleTitle: string;
  jobsTracked: number;
  mostRequestedSkills: string[];
  typicalExperience: string;
  commonRequirements: string[];
  competitiveAdvice: string[];
};

export type CuratedOpportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: string;
  seniority: string;
  category: string;
  salaryFormatted?: string;
  skills: string[];
  highlights: string[];
  applyUrl: string;
};

export type WeekendCareerAction = {
  skillHeadline: string;
  context: string;
  actionItems: string[];
};

export type HiringSignals = {
  isAvailable: boolean;
  note: string;
  rising: string[];
  stable: string[];
  emerging: string[];
};

export type ComparisonMetric = {
  key: string;
  label: string;
  currentValue: number;
  previousValue?: number;
  changePercentage?: number;
  direction?: "up" | "down" | "flat";
};

export type WeekOverWeekComparison = {
  isAvailable: boolean;
  previousWeekLabel?: string;
  note: string;
  metrics: ComparisonMetric[];
};

export type WeeklyIntelligenceReport = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  periodLabel: string;
  weekStart: string;
  weekEnd: string;
  publishedAt: string;
  isDemoData: boolean;
  dataNotice: string;
  marketSnapshot: MarketSnapshot;
  topSkills: SkillDemandStat[];
  salaryIntelligence: SalaryIntelligenceData;
  geoDistribution: GeoDistributionItem[];
  topCompanies: HiringCompanyItem[];
  roleOfTheWeek: RoleOfTheWeek;
  opportunities: CuratedOpportunity[];
  careerAction: WeekendCareerAction;
  hiringSignals: HiringSignals;
  weekOverWeek: WeekOverWeekComparison;
  telegramSummary: string;
  socialShareText: string;
};

export type ArchiveReportSummary = {
  id: string;
  slug: string;
  periodLabel: string;
  jobsTracked: number;
  topSkill: string;
  publishedAt: string;
  isCurrent: boolean;
};
