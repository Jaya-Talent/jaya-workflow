import type { WeeklyIntelligenceReport } from "./types";

export const DEMO_INTELLIGENCE_REPORT: WeeklyIntelligenceReport = {
  id: "report_demo_2026-09-14",
  slug: "demo-sample-report",
  title: "Jaya Talent Weekend Intelligence",
  tagline: "Your weekly data-driven snapshot of the Web3 job market.",
  periodLabel: "September 14–20, 2026",
  weekStart: "2026-09-14",
  weekEnd: "2026-09-20",
  publishedAt: "2026-09-18T10:00:00.000Z",
  isDemoData: true,
  dataNotice: "Example report using sample demo data. Connect active job sources to view real metrics.",
  marketSnapshot: {
    jobsTracked: 347,
    remoteCount: 146,
    remotePercentage: 42,
    engineeringCount: 118,
    engineeringPercentage: 34,
    companiesHiringCount: 82,
    salaryDisclosedCount: 91,
    salaryDisclosedPercentage: 26,
  },
  topSkills: [
    { skill: "Solidity", jobCount: 82, percentage: 24 },
    { skill: "TypeScript", jobCount: 74, percentage: 21 },
    { skill: "Rust", jobCount: 61, percentage: 18 },
    { skill: "Python", jobCount: 55, percentage: 16 },
    { skill: "React", jobCount: 49, percentage: 14 },
    { skill: "Solana", jobCount: 44, percentage: 13 },
    { skill: "DeFi", jobCount: 39, percentage: 11 },
    { skill: "Go / Golang", jobCount: 32, percentage: 9 },
  ],
  salaryIntelligence: {
    isAvailable: true,
    disclaimer: "Advertised salary ranges are compiled from public job postings disclosing base compensation. Disclosed figures may differ from total compensation packages including tokens and equity.",
    roles: [
      {
        role: "Senior Solidity Developer",
        category: "Engineering / Development",
        experienceLevel: "Senior",
        salaryMin: 120000,
        salaryMax: 180000,
        salaryFormatted: "$120k–$180k",
        currency: "USD",
        remote: "Remote",
        sampleCount: 18,
      },
      {
        role: "Backend Engineer (Rust / Go)",
        category: "Engineering / Development",
        experienceLevel: "Mid-Level",
        salaryMin: 90000,
        salaryMax: 140000,
        salaryFormatted: "$90k–$140k",
        currency: "USD",
        remote: "Remote",
        sampleCount: 14,
      },
      {
        role: "Community Manager",
        category: "Community / Support",
        experienceLevel: "Mid-Level",
        salaryMin: 45000,
        salaryMax: 70000,
        salaryFormatted: "$45k–$70k",
        currency: "USD",
        remote: "Remote",
        sampleCount: 9,
      },
      {
        role: "Product Manager (DeFi / Protocols)",
        category: "Product Management",
        experienceLevel: "Senior",
        salaryMin: 130000,
        salaryMax: 190000,
        salaryFormatted: "$130k–$190k",
        currency: "USD",
        remote: "Remote / Hybrid",
        sampleCount: 11,
      },
    ],
  },
  geoDistribution: [
    { region: "Remote (Global)", jobCount: 146, percentage: 42 },
    { region: "North America", jobCount: 98, percentage: 28 },
    { region: "Europe", jobCount: 48, percentage: 14 },
    { region: "Asia / APAC", jobCount: 31, percentage: 9 },
    { region: "Latin America", jobCount: 14, percentage: 4 },
    { region: "Africa & Middle East", jobCount: 10, percentage: 3 },
  ],
  topCompanies: [
    {
      company: "Paxos",
      activeJobsCount: 16,
      categories: ["Engineering", "Operations", "Product"],
      locations: ["Remote", "New York", "Singapore"],
      hasRemote: true,
    },
    {
      company: "Circle",
      activeJobsCount: 14,
      categories: ["Engineering", "Product", "Compliance"],
      locations: ["Remote", "US", "APAC"],
      hasRemote: true,
    },
    {
      company: "Binance",
      activeJobsCount: 12,
      categories: ["Engineering", "Marketing", "Security"],
      locations: ["Global Remote", "Dubai"],
      hasRemote: true,
    },
    {
      company: "Chainlink Labs",
      activeJobsCount: 9,
      categories: ["Engineering", "Research"],
      locations: ["Remote"],
      hasRemote: true,
    },
  ],
  roleOfTheWeek: {
    roleTitle: "Smart Contract / Blockchain Developer",
    jobsTracked: 42,
    mostRequestedSkills: ["Solidity", "Foundry", "EVM", "TypeScript", "DeFi"],
    typicalExperience: "2–5 years",
    commonRequirements: [
      "Production smart contract deployment experience",
      "Proficiency with Foundry or Hardhat testing suites",
      "Strong understanding of EVM gas optimization and security patterns",
      "Experience auditing or participating in formal code reviews",
    ],
    competitiveAdvice: [
      "Publish an audited or open-source Foundry repo demonstrating test coverage > 90%",
      "Complete a competitive DeFi protocol clone or lending math implementation",
      "Highlight concrete security practices and past testnet/mainnet contracts on GitHub",
      "Apply to targeted mid/senior Web3 teams matching your specific chain preference",
    ],
  },
  opportunities: [
    {
      id: "demo_opp_1",
      title: "Senior Smart Contract Engineer",
      company: "Paxos",
      location: "Remote - United States",
      remote: "remote",
      seniority: "Senior",
      category: "Engineering / Development",
      salaryFormatted: "$130k–$175k",
      skills: ["Solidity", "Foundry", "EVM", "Security"],
      highlights: ["Tokenized RWAs", "High-growth protocol", "Comprehensive benefits"],
      applyUrl: "/jobs",
    },
    {
      id: "demo_opp_2",
      title: "Lead Product Manager, Protocol",
      company: "Circle",
      location: "Remote (US/Global)",
      remote: "remote",
      seniority: "Lead",
      category: "Product Management",
      salaryFormatted: "$140k–$185k",
      skills: ["Product Strategy", "DeFi", "Smart Contracts", "TradFi"],
      highlights: ["USDC ecosystem", "Tier 1 backing", "Global remote"],
      applyUrl: "/jobs",
    },
    {
      id: "demo_opp_3",
      title: "Rust Core Infrastructure Engineer",
      company: "Solana Ecosystem Partners",
      location: "Remote",
      remote: "remote",
      seniority: "Mid-Level",
      category: "Engineering / Development",
      salaryFormatted: "$110k–$150k",
      skills: ["Rust", "Solana", "Distributed Systems", "RPC"],
      highlights: ["High-throughput systems", "Performance engineering"],
      applyUrl: "/jobs",
    },
  ],
  careerAction: {
    skillHeadline: "TypeScript & Solidity appeared in 45% of technical listings this week.",
    context: "Employers are heavily prioritizing developers who can write smart contracts and immediately bridge them into clean frontends or indexers.",
    actionItems: [
      "Build a focused Web3 dApp with Foundry test scripts and a TypeScript frontend",
      "Publish your repository with clear README documentation and architecture notes",
      "Update your Jaya Talent profile with your latest contracts and GitHub link",
      "Apply to 3 relevant openings with personalized cover notes referencing your repo",
    ],
  },
  hiringSignals: {
    isAvailable: true,
    note: "Signals based on Jaya Talent's tracked job postings.",
    rising: ["Rust", "AI Agents / Cryptoeconomics", "Solana", "Foundry"],
    stable: ["Solidity", "TypeScript", "React", "Community Management"],
    emerging: ["ZK-Rollups", "DePIN Infrastructure", "Move Language"],
  },
  weekOverWeek: {
    isAvailable: true,
    previousWeekLabel: "Sep 7–13, 2026",
    note: "Comparison calculated against previous week's tracked opportunities.",
    metrics: [
      { key: "total", label: "Jobs Tracked", currentValue: 347, previousValue: 310, changePercentage: 12, direction: "up" },
      { key: "remote", label: "Remote Jobs", currentValue: 146, previousValue: 135, changePercentage: 8, direction: "up" },
      { key: "engineering", label: "Engineering Roles", currentValue: 118, previousValue: 103, changePercentage: 14, direction: "up" },
      { key: "companies", label: "Companies Hiring", currentValue: 82, previousValue: 78, changePercentage: 5, direction: "up" },
      { key: "salary", label: "Salary-Disclosed Roles", currentValue: 91, previousValue: 85, changePercentage: 7, direction: "up" },
    ],
  },
  telegramSummary: `*Jaya Talent Weekend Intelligence*
_Your weekly data-driven snapshot of the Web3 job market (Sep 14–20, 2026)_

*Market Snapshot:*
• 347 Web3 Jobs Tracked (+12% vs last week)
• 146 Remote Opportunities (42%)
• 118 Engineering Roles
• 82 Companies Actively Hiring

*Top In-Demand Skills:*
1. Solidity (82 jobs)
2. TypeScript (74 jobs)
3. Rust (61 jobs)
4. Python (55 jobs)
5. React (49 jobs)

*Role of the Week:* Smart Contract / Blockchain Developer
*Weekend Action:* Build a dApp pairing Solidity contracts with a TypeScript UI.

Read full report & opportunities: https://jobs.jayatalent.com/weekend-intelligence`,
  socialShareText: "Check out this week's data-driven snapshot of the Web3 job market from Jaya Talent Weekend Intelligence! Top skills, compensation ranges, and hiring companies: https://jobs.jayatalent.com/weekend-intelligence",
};
