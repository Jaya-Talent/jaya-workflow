import { categoryLabel, DEFAULT_WEIGHTS, scoreCategory } from "./config.ts";
import { bestSkillMatch, canonicalSkill, canonicalSkills, conceptOverlap } from "./skill-normalizer.ts";
import type { ApplicantLike, Job, MatchBreakdown, MatchingWeights, MatchResult } from "./types.ts";

const SENIORITY_RANK: Record<string, number> = {
  student: 0,
  "entry level": 1,
  entry: 1,
  junior: 2,
  "mid-level": 3,
  mid: 3,
  middle: 3,
  senior: 4,
  lead: 5,
  staff: 5,
  principal: 5,
  executive: 6,
  director: 6,
  "c-level": 6,
};

const TITLE_ALIASES: Record<string, string[]> = {
  "solidity engineer": ["smart contract engineer", "smart contract developer", "evm engineer", "blockchain engineer"],
  "smart contract engineer": ["solidity engineer", "smart contract developer", "blockchain engineer"],
  "frontend developer": ["frontend engineer", "front end engineer", "react developer", "ui engineer"],
  "frontend engineer": ["frontend developer", "react developer"],
  "backend engineer": ["backend developer", "server engineer", "api engineer"],
  "solana rust engineer": ["solana engineer", "rust engineer", "solana developer"],
  "protocol engineer": ["protocol developer", "blockchain protocol engineer"],
};

export function parseYears(value: string): number | null {
  if (!value) return null;
  const compact = value.toLowerCase().replace(/years?|yrs?|\+/g, " ").trim();
  if (value.includes("8+")) return 9;
  if (/1\s*[–-]\s*2/.test(value)) return 1.5;
  if (/3\s*[–-]\s*5/.test(value)) return 4;
  if (/5\s*[–-]\s*8/.test(value)) return 6.5;
  const numbers = compact.match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length === 0) return value.trim() === "0" ? 0 : null;
  const parsed = numbers.map(Number).filter((n) => Number.isFinite(n));
  if (parsed.length === 0) return null;
  if (parsed.length === 1) return parsed[0] ?? null;
  return ((parsed[0] ?? 0) + (parsed[1] ?? parsed[0] ?? 0)) / 2;
}

export function seniorityRank(value: string) {
  const key = value.toLowerCase().trim();
  if (!key) return null;
  if (key in SENIORITY_RANK) return SENIORITY_RANK[key] ?? null;
  for (const [label, rank] of Object.entries(SENIORITY_RANK)) {
    if (key.includes(label)) return rank;
  }
  return null;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function weightedTotal(breakdown: MatchBreakdown, weights: MatchingWeights) {
  const totalWeight =
    weights.skills +
    weights.experience +
    weights.title +
    weights.seniority +
    weights.location +
    weights.employment +
    weights.salary +
    weights.other;
  if (totalWeight <= 0) return 0;
  const sum =
    breakdown.skills * weights.skills +
    breakdown.experience * weights.experience +
    breakdown.title * weights.title +
    breakdown.seniority * weights.seniority +
    breakdown.location * weights.location +
    breakdown.employment * weights.employment +
    breakdown.salary * weights.salary +
    breakdown.other * weights.other;
  return sum / totalWeight;
}

function scoreSkills(applicant: ApplicantLike, job: Job) {
  const applicantSkills = canonicalSkills(applicant.skills);
  const required = job.required_skills;
  const preferred = [...job.preferred_skills, ...job.technologies];
  const matched: string[] = [];
  const missing: string[] = [];
  const partial: string[] = [];

  let requiredScore = 100;
  if (required.length > 0) {
    let acc = 0;
    for (const skill of required) {
      const { score, matched: name } = bestSkillMatch(applicantSkills, skill);
      if (score >= 0.85) {
        matched.push(canonicalSkill(skill));
        acc += 1;
      } else if (score >= 0.45) {
        partial.push(canonicalSkill(skill) || name);
        acc += score;
      } else {
        missing.push(canonicalSkill(skill) || skill);
      }
    }
    requiredScore = (acc / required.length) * 100;
  }

  let preferredScore = 80;
  if (preferred.length > 0) {
    let acc = 0;
    for (const skill of preferred) {
      const { score } = bestSkillMatch(applicantSkills, skill);
      acc += score;
      if (score >= 0.85) matched.push(canonicalSkill(skill));
      else if (score >= 0.45) partial.push(canonicalSkill(skill));
    }
    preferredScore = (acc / preferred.length) * 100;
  }

  const unique = (items: string[]) => [...new Set(items.filter(Boolean))];
  const score = required.length > 0 ? requiredScore * 0.75 + preferredScore * 0.25 : preferredScore;
  return {
    score: clamp(score),
    matched: unique(matched),
    missing: unique(missing),
    partial: unique(partial).filter((item) => !matched.includes(item)),
  };
}

function scoreExperience(applicant: ApplicantLike, job: Job) {
  const years = parseYears(applicant.years_experience);
  const min = parseYears(job.years_min);
  const max = parseYears(job.years_max);
  if (years === null && min === null && max === null) return 80;
  if (years === null) return 70;
  if (min === null && max === null) return 80;
  if (min !== null && years >= min && (max === null || years <= max + 2)) return 100;
  if (min !== null && years >= min - 1) return 78;
  if (min !== null && years >= min - 2) return 55;
  if (max !== null && years > max + 3) return 70;
  if (min !== null && years < min) return clamp(40 - (min - years) * 8);
  return 75;
}

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/\b(senior|junior|staff|lead|principal|mid-level|mid)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const TITLE_STOP = new Set(["engineer", "developer", "dev", "software", "role", "specialist"]);

function titlesRelated(left: string, right: string) {
  const a = normalizeTitle(left);
  const b = normalizeTitle(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.92;
  const leftTokens = new Set(a.split(" ").filter((token) => token && !TITLE_STOP.has(token)));
  const rightTokens = b.split(" ").filter((token) => token && !TITLE_STOP.has(token));
  if (leftTokens.size === 0 || rightTokens.length === 0) return tokenScoreFallback(a, b);
  const overlap = rightTokens.filter((token) => leftTokens.has(token)).length;
  const tokenScore = overlap / Math.max(rightTokens.length, 1);
  const aliases = TITLE_ALIASES[a] ?? [];
  if (aliases.some((alias) => normalizeTitle(alias) === b || b.includes(normalizeTitle(alias)))) {
    return 0.9;
  }
  for (const [key, values] of Object.entries(TITLE_ALIASES)) {
    const group = [key, ...values].map(normalizeTitle);
    if (group.includes(a) && group.includes(b)) return 0.88;
  }
  return tokenScore;
}

function tokenScoreFallback(a: string, b: string) {
  if (a.includes(b) || b.includes(a)) return 0.4;
  return 0;
}

function scoreTitle(applicant: ApplicantLike, job: Job) {
  const desired = applicant.target_job_titles;
  if (desired.length === 0) return 60;
  let best = 0;
  for (const title of desired) {
    best = Math.max(best, titlesRelated(title, job.title));
  }
  return clamp(best * 100);
}

function scoreSeniority(applicant: ApplicantLike, job: Job) {
  const left = seniorityRank(applicant.experience_level);
  const right = seniorityRank(job.seniority);
  if (left === null || right === null) return 75;
  const diff = Math.abs(left - right);
  if (diff === 0) return 100;
  if (diff === 1) return 86;
  if (diff === 2) return 52;
  if (diff === 3) return 24;
  return 10;
}

function isRemotePref(value: string) {
  const token = value.toLowerCase();
  return token.includes("remote") || token.includes("flexible");
}

function scoreLocation(applicant: ApplicantLike, job: Job) {
  const prefs = applicant.preferred_locations.map((item) => item.toLowerCase());
  const work = applicant.work_preference.toLowerCase();
  const jobLoc = job.location.toLowerCase();
  const remoteJob = job.remote === "remote";
  const onsiteJob = job.remote === "onsite";
  const wantsRemote = work.includes("remote") || prefs.some((item) => item.includes("remote"));
  const wantsOnsite = work.includes("on-site") || work.includes("onsite");
  const country = applicant.country.toLowerCase();
  const city = applicant.city.toLowerCase();

  if (wantsRemote && onsiteJob && !jobLoc.includes(country) && !jobLoc.includes(city)) return 12;
  if (wantsOnsite && remoteJob && work === "on-site") return 35;
  if ((wantsRemote || isRemotePref(work)) && remoteJob) return 100;
  if (city && jobLoc.includes(city)) return 96;
  if (country && jobLoc.includes(country)) return 88;
  if (prefs.some((pref) => pref && (jobLoc.includes(pref) || pref.includes(jobLoc)))) return 90;
  if (job.remote === "hybrid" && (wantsRemote || work.includes("hybrid") || work.includes("flexible"))) {
    return 80;
  }
  if (work.includes("flexible")) return 72;
  if (onsiteJob && wantsRemote) return 14;
  return 48;
}

function scoreEmployment(applicant: ApplicantLike, job: Job) {
  if (applicant.employment_type.length === 0 || !job.employment_type) return 80;
  const wanted = applicant.employment_type.map((item) => item.toLowerCase());
  const jobType = job.employment_type.toLowerCase();
  if (wanted.some((item) => jobType.includes(item) || item.includes(jobType))) return 100;
  return 28;
}

function scoreSalary(applicant: ApplicantLike, job: Job) {
  const expect = Number(applicant.salary_min);
  const jobMin = Number(job.salary_min);
  const jobMax = Number(job.salary_max);
  if (!Number.isFinite(expect) || expect <= 0) return 88;
  if (!Number.isFinite(jobMax) && !Number.isFinite(jobMin)) return 90;
  const max = Number.isFinite(jobMax) && jobMax > 0 ? jobMax : jobMin;
  const min = Number.isFinite(jobMin) && jobMin > 0 ? jobMin : jobMax;
  if (expect <= max) return 100;
  if (expect <= max * 1.15) return 70;
  if (expect <= max * 1.3) return 45;
  if (min && expect < min * 0.6) return 70;
  return 22;
}

function scoreOther(applicant: ApplicantLike, job: Job) {
  let score = 35;
  const categories = applicant.job_categories.map((item) => item.toLowerCase());
  if (categories.length === 0) score += 10;
  else if (categories.some((item) => job.category.toLowerCase().includes(item) || item.includes(job.category.toLowerCase()))) {
    score += 20;
  }
  const overlap = conceptOverlap(
    `${applicant.professional_bio} ${applicant.skills.join(" ")} ${applicant.target_job_titles.join(" ")}`,
    `${job.description} ${job.title}`,
  );
  score += overlap * 45;
  if (applicant.availability.toLowerCase().includes("not currently")) score -= 15;
  return clamp(score);
}

export function shouldPrefilter(applicant: ApplicantLike, job: Job) {
  const left = seniorityRank(applicant.experience_level);
  const right = seniorityRank(job.seniority);
  if (left !== null && right !== null && Math.abs(left - right) >= 4) {
    const wantsIntern = applicant.employment_type.some((item) => item.toLowerCase().includes("intern"));
    if (!(wantsIntern && job.employment_type.toLowerCase().includes("intern"))) return true;
  }
  const internOnly =
    applicant.employment_type.length > 0 &&
    applicant.employment_type.every((item) => item.toLowerCase().includes("intern"));
  if (internOnly && !job.employment_type.toLowerCase().includes("intern")) return true;
  return false;
}

export function scoreMatch(
  applicant: ApplicantLike,
  job: Job,
  weights: MatchingWeights = DEFAULT_WEIGHTS,
): MatchResult {
  if (job.status && job.status !== "active") {
    return emptyResult("This role is no longer active.");
  }

  const skills = scoreSkills(applicant, job);
  const breakdown: MatchBreakdown = {
    skills: skills.score,
    experience: scoreExperience(applicant, job),
    title: scoreTitle(applicant, job),
    seniority: scoreSeniority(applicant, job),
    location: scoreLocation(applicant, job),
    employment: scoreEmployment(applicant, job),
    salary: scoreSalary(applicant, job),
    other: scoreOther(applicant, job),
  };

  let score = Math.round(weightedTotal(breakdown, weights));
  if (job.required_skills.length > 0 && skills.matched.length === 0) {
    score = Math.min(score, 42);
  } else if (job.required_skills.length > 0 && skills.score < 25) {
    score = Math.min(score, 48);
  }
  const category = scoreCategory(score);
  const strongReasons: string[] = [...skills.matched];
  if (breakdown.experience >= 85) strongReasons.push("Relevant years of experience");
  if (breakdown.location >= 85) {
    strongReasons.push(job.remote === "remote" ? "Remote" : job.location);
  }
  if (breakdown.title >= 85) strongReasons.push("Target role alignment");

  const partialReasons = skills.partial.map((skill) => skill);
  const gaps = [...skills.missing];
  if (breakdown.location < 30) gaps.push("Location / remote preference");
  if (breakdown.seniority < 30) gaps.push("Seniority mismatch");

  const summary =
    skills.matched.length > 0
      ? `Your ${skills.matched.slice(0, 3).join(", ")} experience closely aligns with the core requirements of this position.`
      : "This role only partially overlaps with your current skills and preferences.";

  const explanation = formatExplanation({
    score,
    category,
    matchedSkills: skills.matched,
    missingSkills: skills.missing,
    partialSkills: skills.partial,
    strongReasons,
    partialReasons,
    gaps,
    summary,
    explanation: "",
    breakdown,
  });

  return {
    score,
    category,
    matchedSkills: skills.matched,
    missingSkills: skills.missing,
    partialSkills: skills.partial,
    strongReasons,
    partialReasons,
    gaps,
    summary,
    explanation,
    breakdown,
  };
}

function emptyResult(summary: string): MatchResult {
  return {
    score: 0,
    category: "poor",
    matchedSkills: [],
    missingSkills: [],
    partialSkills: [],
    strongReasons: [],
    partialReasons: [],
    gaps: [],
    summary,
    explanation: summary,
    breakdown: {
      skills: 0,
      experience: 0,
      title: 0,
      seniority: 0,
      location: 0,
      employment: 0,
      salary: 0,
      other: 0,
    },
  };
}

export function formatExplanation(result: MatchResult) {
  const lines = [
    `Match Score: ${result.score}%`,
    "",
    `Strong matches:`,
    ...(result.strongReasons.length
      ? result.strongReasons.map((item) => `✓ ${item}`)
      : ["✓ Profile captured"]),
  ];
  if (result.partialSkills.length || result.partialReasons.length) {
    lines.push("", "Partial match:");
    for (const item of [...new Set([...result.partialSkills, ...result.partialReasons])]) {
      lines.push(`~ ${item}`);
    }
  }
  if (result.gaps.length) {
    lines.push("", "Potential gap:");
    for (const item of result.gaps) lines.push(`! ${item}`);
  }
  lines.push("", "Why this job matches:", result.summary);
  return lines.join("\n");
}

export { categoryLabel };
