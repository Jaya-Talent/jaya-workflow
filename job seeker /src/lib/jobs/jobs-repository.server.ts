import { randomUUID } from "node:crypto";
import { joinList, splitList } from "../applicants/csv.server.ts";
import { getDatabaseUrl, getSql } from "../db.ts";
import type { Job } from "../matching/types.ts";
import { ensureCsvFile, readCsvFile, withFileLock, writeCsvFile } from "../store/csv-table.server.ts";
import { JOB_COLUMNS } from "./columns.ts";
import { getJobSlug } from "./format.ts";

const FILE = "jobs.csv";

function nowIso() {
  return new Date().toISOString();
}

function toRecord(job: Job): Record<string, string> {
  return {
    id: job.id,
    created_at: job.created_at,
    updated_at: job.updated_at,
    title: job.title,
    company: job.company,
    location: job.location,
    remote: job.remote,
    employment_type: job.employment_type,
    seniority: job.seniority,
    years_min: job.years_min,
    years_max: job.years_max,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_currency: job.salary_currency,
    category: job.category,
    required_skills: joinList(job.required_skills),
    preferred_skills: joinList(job.preferred_skills),
    technologies: joinList(job.technologies),
    description: job.description,
    apply_url: job.apply_url,
    status: job.status,
    source: job.source,
  };
}

function sanitizeJobSkills(job: Job): Job {
  const titleLower = (job.title || "").toLowerCase();
  const companyLower = (job.company || "").toLowerCase();
  const hasTrust = titleLower.includes("trust") || companyLower.includes("trust");
  const hasRustWord =
    titleLower.includes("rust") &&
    (titleLower.split(/\s+/).some((w) => w.replace(/[^a-z0-9+#]/g, "") === "rust") ||
      titleLower.includes("c++/rust") ||
      titleLower.includes("(rust)"));

  if (hasTrust && !hasRustWord) {
    return {
      ...job,
      required_skills: (job.required_skills || []).filter((s) => s.toLowerCase() !== "rust"),
      preferred_skills: (job.preferred_skills || []).filter((s) => s.toLowerCase() !== "rust"),
      technologies: (job.technologies || []).filter((s) => s.toLowerCase() !== "rust"),
    };
  }
  return job;
}

function fromRecord(record: Record<string, string>): Job {
  const remote = record.remote === "hybrid" || record.remote === "onsite" ? record.remote : "remote";
  return sanitizeJobSkills({
    id: record.id ?? "",
    created_at: record.created_at ?? "",
    updated_at: record.updated_at ?? "",
    title: record.title ?? "",
    company: record.company ?? "",
    location: record.location ?? "",
    remote,
    employment_type: record.employment_type ?? "",
    seniority: record.seniority ?? "",
    years_min: record.years_min ?? "",
    years_max: record.years_max ?? "",
    salary_min: record.salary_min ?? "",
    salary_max: record.salary_max ?? "",
    salary_currency: record.salary_currency ?? "USD",
    category: record.category ?? "",
    required_skills: splitList(record.required_skills ?? ""),
    preferred_skills: splitList(record.preferred_skills ?? ""),
    technologies: splitList(record.technologies ?? ""),
    description: record.description ?? "",
    apply_url: record.apply_url ?? "",
    status: record.status === "closed" ? "closed" : "active",
    source: record.source ?? "manual",
  });
}

function fromSqlRecord(record: any): Job {
  const remote = record.remote === "hybrid" || record.remote === "onsite" ? record.remote : "remote";
  const toArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return splitList(val);
    return [];
  };
  return sanitizeJobSkills({
    id: record.id ?? "",
    created_at: typeof record.created_at === "object" ? record.created_at?.toISOString() || "" : String(record.created_at || ""),
    updated_at: typeof record.updated_at === "object" ? record.updated_at?.toISOString() || "" : String(record.updated_at || ""),
    title: record.title ?? "",
    company: record.company ?? "",
    location: record.location ?? "",
    remote,
    employment_type: record.employment_type ?? "",
    seniority: record.seniority ?? "",
    years_min: record.years_min ?? "",
    years_max: record.years_max ?? "",
    salary_min: record.salary_min ?? "",
    salary_max: record.salary_max ?? "",
    salary_currency: record.salary_currency ?? "USD",
    category: record.category ?? "",
    required_skills: toArray(record.required_skills),
    preferred_skills: toArray(record.preferred_skills),
    technologies: toArray(record.technologies),
    description: record.description ?? "",
    apply_url: record.apply_url ?? "",
    status: record.status === "closed" ? "closed" : "active",
    source: record.source ?? "manual",
  });
}

const NON_CRYPTO_COMPANIES = new Set([
  "anthropic", "openai", "box", "crusoe", "shieldai", "xai", "elevenlabs", "scaleai",
  "harvey", "cohere", "perplexityai", "langchain", "glean", "baseten", "palantir",
  "veeam", "affirm", "addepar", "vercel", "ashby", "kong", "qonto", "yuno", "snaplogic",
  "workato", "sentry", "sentry.io", "scribe", "scribe.com", "replit", "modal", "modal.com",
  "hightouch", "blackforestlabs", "cerebras.ai", "characterai", "coderabbit", "cognition",
  "cradle.bio", "cursor", "deepmind", "dust", "eliseai", "isomorphiclabs", "lakera.ai",
  "llamaindex", "lovable", "lumalabs.ai", "meilisearch", "mistral", "modular", "neptuneai",
  "netomi", "polyai", "pony.ai", "radicalai", "retellai", "radai", "soundhound", "stackblitz",
  "temporal", "temporal.io", "uipath", "v7labs", "vectara.com", "you.com", "zushealth",
  "citadel securities", "jane street", "hudson river trading", "clearstreet", "pwc",
  "atticus.com", "baton corporation", "dr. now", "earnin", "life360", "moneybox",
  "rillet.com", "smartasset", "smartx", "swingdev", "tenable", "yugabyte", "complyadvantage",
  "9fin", "truelayer", "capitalontap", "trading212", "onepay.com", "flex", "capital", "finyard",
]);

interface CacheEntry {
  jobs: Job[];
  timestamp: number;
}

let cachedJobs: CacheEntry | null = null;
const CACHE_TTL_MS = 30_000; // 30s cache TTL to balance sub-second performance with real-time updates

function invalidateCache() {
  cachedJobs = null;
}

async function readAll(): Promise<Job[]> {
  const now = Date.now();
  if (cachedJobs && now - cachedJobs.timestamp < CACHE_TTL_MS) {
    return cachedJobs.jobs;
  }

  // 1. Neon PostgreSQL is the primary authoritative source of truth in production
  if (getDatabaseUrl()) {
    try {
      const sql = await getSql();
      const rows = await sql`SELECT * FROM jobs ORDER BY updated_at DESC`;
      if (rows.length > 0) {
        const sqlLoaded = rows
          .map(fromSqlRecord)
          .filter((j) => j.id && j.title && !NON_CRYPTO_COMPANIES.has((j.company || "").trim().toLowerCase()));
        if (sqlLoaded.length > 0) {
          cachedJobs = { jobs: sqlLoaded, timestamp: now };
          return sqlLoaded;
        }
      }
    } catch (err) {
      console.error("SQL read error in jobs repository:", err);
    }
  }

  // 2. Fallback to reading disk CSV (for local offline dev / build step)
  try {
    await ensureCsvFile(FILE, JOB_COLUMNS);
    const loaded = (await readCsvFile(FILE))
      .map(fromRecord)
      .filter((row) => row.id && row.title && !NON_CRYPTO_COMPANIES.has((row.company || "").trim().toLowerCase()));

    if (loaded.length > 0) {
      cachedJobs = { jobs: loaded, timestamp: now };
      return loaded;
    }
  } catch (err) {
    console.error("Error reading jobs.csv fallback:", err);
  }

  return [];
}

async function seedSqlFromJobs(jobs: Job[]) {
  try {
    await batchInsertJobsSql(jobs);
  } catch (err) {
    console.error("Async SQL job seed error:", err);
  }
}

async function batchInsertJobsSql(jobs: Job[]) {
  if (jobs.length === 0) return;
  try {
    const sql = await getSql();
    for (let i = 0; i < jobs.length; i += 200) {
      const chunk = jobs.slice(i, i + 200);
      const placeholders: string[] = [];
      const params: unknown[] = [];
      let paramIdx = 1;

      for (const j of chunk) {
        placeholders.push(
          `($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7}, $${paramIdx+8}, $${paramIdx+9}, $${paramIdx+10}, $${paramIdx+11}, $${paramIdx+12}, $${paramIdx+13}, $${paramIdx+14}, $${paramIdx+15}, $${paramIdx+16}, $${paramIdx+17}, $${paramIdx+18}, $${paramIdx+19}, $${paramIdx+20}, $${paramIdx+21})`
        );
        params.push(
          j.id,
          j.created_at || nowIso(),
          j.updated_at || nowIso(),
          j.title || "",
          j.company || "",
          j.location || "",
          j.remote || "remote",
          j.employment_type || "",
          j.seniority || "",
          j.years_min || "",
          j.years_max || "",
          j.salary_min || "",
          j.salary_max || "",
          j.salary_currency || "USD",
          j.category || "",
          j.required_skills || [],
          j.preferred_skills || [],
          j.technologies || [],
          j.description || "",
          j.apply_url || "",
          j.status || "active",
          j.source || "manual",
        );
        paramIdx += 22;
      }

      const queryText = `
        INSERT INTO jobs (
          id, created_at, updated_at, title, company, location, remote, employment_type,
          seniority, years_min, years_max, salary_min, salary_max, salary_currency,
          category, required_skills, preferred_skills, technologies, description, apply_url, status, source
        ) VALUES ${placeholders.join(", ")}
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at,
          title = EXCLUDED.title,
          company = EXCLUDED.company,
          location = EXCLUDED.location,
          remote = EXCLUDED.remote,
          employment_type = EXCLUDED.employment_type,
          seniority = EXCLUDED.seniority,
          category = EXCLUDED.category,
          required_skills = EXCLUDED.required_skills,
          preferred_skills = EXCLUDED.preferred_skills,
          technologies = EXCLUDED.technologies,
          description = EXCLUDED.description,
          apply_url = EXCLUDED.apply_url
      `;
      await sql.query(queryText, params);
    }
  } catch (err) {
    console.error("SQL batchInsertJobs error:", err);
  }
}

export type JobInput = Omit<Job, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
};

export class JobsRepository {
  async listJobs() {
    return readAll();
  }

  async listActiveJobs() {
    return (await readAll()).filter((job) => job.status === "active");
  }

  async countActiveJobs(): Promise<number> {
    const active = await this.listActiveJobs();
    return active.length;
  }

  async getJob(idOrSlug: string) {
    if (!idOrSlug) return null;
    const all = await readAll();
    const exact = all.find((job) => job.id === idOrSlug);
    if (exact) return exact;

    const slugMatch = all.find((job) => getJobSlug(job) === idOrSlug);
    if (slugMatch) return slugMatch;

    const cleanTarget = idOrSlug.replace(/^job_scraped_|^job_manual_|^job_/, "");
    const targetSuffix = idOrSlug.split("-").pop() || cleanTarget;

    return (
      all.find((job) => {
        const cleanJobId = job.id.replace(/^job_scraped_|^job_manual_|^job_/, "");
        return (
          job.id === cleanTarget ||
          cleanJobId === cleanTarget ||
          (targetSuffix.length >= 6 && cleanJobId.endsWith(targetSuffix))
        );
      }) ?? null
    );
  }

  async createJob(input: JobInput) {
    const timestamp = nowIso();
    const job: Job = {
      ...input,
      id: input.id || randomUUID(),
      created_at: timestamp,
      updated_at: timestamp,
      status: input.status ?? "active",
      source: input.source ?? "manual",
      remote: input.remote ?? "remote",
      salary_currency: input.salary_currency || "USD",
    };

    invalidateCache();

    try {
      const sql = await getSql();
      await sql`
        INSERT INTO jobs (
          id, created_at, updated_at, title, company, location, remote, employment_type,
          seniority, years_min, years_max, salary_min, salary_max, salary_currency,
          category, required_skills, preferred_skills, technologies, description, apply_url, status, source
        ) VALUES (
          ${job.id}, ${job.created_at}, ${job.updated_at}, ${job.title}, ${job.company}, ${job.location}, ${job.remote},
          ${job.employment_type}, ${job.seniority}, ${job.years_min}, ${job.years_max}, ${job.salary_min},
          ${job.salary_max}, ${job.salary_currency}, ${job.category}, ${job.required_skills}, ${job.preferred_skills},
          ${job.technologies}, ${job.description}, ${job.apply_url}, ${job.status}, ${job.source}
        ) ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at,
          title = EXCLUDED.title,
          company = EXCLUDED.company,
          location = EXCLUDED.location,
          remote = EXCLUDED.remote,
          employment_type = EXCLUDED.employment_type,
          seniority = EXCLUDED.seniority,
          category = EXCLUDED.category,
          required_skills = EXCLUDED.required_skills,
          preferred_skills = EXCLUDED.preferred_skills,
          technologies = EXCLUDED.technologies,
          description = EXCLUDED.description,
          apply_url = EXCLUDED.apply_url
      `;
    } catch (err) {
      console.error("SQL createJob error:", err);
    }

    void withFileLock(FILE, async () => {
      const jobs = await readAll();
      await writeCsvFile(FILE, JOB_COLUMNS, jobs.map(toRecord));
    });

    return job;
  }

  async replaceJobs(inputs: JobInput[]) {
    const timestamp = nowIso();
    const existingIds = new Set<string>();
    const jobs: Job[] = [];

    for (const input of inputs) {
      const id = input.id || randomUUID();
      if (existingIds.has(id)) continue;
      existingIds.add(id);

      const job: Job = {
        ...input,
        id,
        created_at: input.created_at || timestamp,
        updated_at: timestamp,
        status: input.status ?? "active",
        source: input.source ?? "manual",
        remote: input.remote ?? "remote",
        salary_currency: input.salary_currency || "USD",
      };
      jobs.push(job);
    }

    invalidateCache();

    try {
      const sql = await getSql();
      await sql`DELETE FROM jobs`;
      await batchInsertJobsSql(jobs);
    } catch (err) {
      console.error("SQL replaceJobs error:", err);
    }

    void withFileLock(FILE, async () => {
      await writeCsvFile(FILE, JOB_COLUMNS, jobs.map(toRecord));
    });

    return jobs;
  }

  async bulkCreateJobs(inputs: JobInput[]) {
    const timestamp = nowIso();
    const inputsToUpsert: Job[] = [];

    for (const input of inputs) {
      const id = input.id || randomUUID();
      const job: Job = {
        ...input,
        id,
        created_at: input.created_at || timestamp,
        updated_at: timestamp,
        status: input.status ?? "active",
        source: input.source ?? "bulk_upload",
        remote: input.remote ?? "remote",
        salary_currency: input.salary_currency || "USD",
      };
      inputsToUpsert.push(job);
    }

    invalidateCache();
    await batchInsertJobsSql(inputsToUpsert);

    // Update local CSV backup asynchronously without blocking the response
    void withFileLock(FILE, async () => {
      const allJobs = await readAll();
      await writeCsvFile(FILE, JOB_COLUMNS, allJobs.map(toRecord));
    });

    return inputsToUpsert;
  }

  async updateJob(id: string, patch: Partial<Job>) {
    const jobs = await readAll();
    const index = jobs.findIndex((job) => job.id === id);
    if (index === -1) return null;
    const current = jobs[index];
    if (!current) return null;
    const next: Job = { ...current, ...patch, id, updated_at: nowIso() };

    invalidateCache();

    try {
      const sql = await getSql();
      await sql`
        UPDATE jobs SET
          title = ${next.title},
          company = ${next.company},
          location = ${next.location},
          remote = ${next.remote},
          employment_type = ${next.employment_type},
          seniority = ${next.seniority},
          category = ${next.category},
          status = ${next.status},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
    } catch (err) {
      console.error("SQL updateJob error:", err);
    }

    void withFileLock(FILE, async () => {
      const all = await readAll();
      await writeCsvFile(FILE, JOB_COLUMNS, all.map(toRecord));
    });

    return next;
  }
}

let repository: JobsRepository | null = null;

export function getJobsRepository() {
  if (!repository) repository = new JobsRepository();
  return repository;
}
