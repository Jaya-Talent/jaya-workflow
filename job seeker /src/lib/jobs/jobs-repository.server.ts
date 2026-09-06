import { randomUUID } from "node:crypto";
import { joinList, splitList } from "../applicants/csv.server.ts";
import { getSql } from "../db.ts";
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

function fromRecord(record: Record<string, string>): Job {
  const remote = record.remote === "hybrid" || record.remote === "onsite" ? record.remote : "remote";
  return {
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
  };
}

function fromSqlRecord(record: any): Job {
  const remote = record.remote === "hybrid" || record.remote === "onsite" ? record.remote : "remote";
  const toArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return splitList(val);
    return [];
  };
  return {
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
  };
}

let inMemoryJobs: Job[] | null = null;

async function readAll(): Promise<Job[]> {
  if (inMemoryJobs && inMemoryJobs.length > 0) {
    return inMemoryJobs;
  }

  try {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM jobs ORDER BY updated_at DESC`;
    if (rows.length > 0) {
      const loaded = rows.map(fromSqlRecord);
      inMemoryJobs = loaded;
      return loaded;
    }
  } catch {
    // Fallback to CSV if SQL query fails
  }

  await ensureCsvFile(FILE, JOB_COLUMNS);
  const loaded = (await readCsvFile(FILE)).map(fromRecord).filter((row) => row.id && row.title);
  if (loaded.length > 0) {
    inMemoryJobs = loaded;
    void seedSqlFromJobs(loaded);
  }
  return loaded;
}

async function seedSqlFromJobs(jobs: Job[]) {
  try {
    const sql = await getSql();
    for (const j of jobs) {
      await sql`
        INSERT INTO jobs (
          id, created_at, updated_at, title, company, location, remote, employment_type,
          seniority, years_min, years_max, salary_min, salary_max, salary_currency,
          category, required_skills, preferred_skills, technologies, description, apply_url, status, source
        ) VALUES (
          ${j.id}, ${j.created_at || nowIso()}, ${j.updated_at || nowIso()},
          ${j.title}, ${j.company}, ${j.location}, ${j.remote}, ${j.employment_type},
          ${j.seniority}, ${j.years_min}, ${j.years_max}, ${j.salary_min}, ${j.salary_max}, ${j.salary_currency},
          ${j.category}, ${j.required_skills}, ${j.preferred_skills}, ${j.technologies}, ${j.description}, ${j.apply_url}, ${j.status}, ${j.source}
        ) ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at
      `;
    }
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
          updated_at = EXCLUDED.updated_at
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

    if (inMemoryJobs) {
      inMemoryJobs.push(job);
    } else {
      inMemoryJobs = [job];
    }

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
          updated_at = EXCLUDED.updated_at
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

    inMemoryJobs = jobs;

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
    const current = await readAll();
    const existingIds = new Set(current.map((j) => j.id));
    const created: Job[] = [];
    const inputsToInsert: Job[] = [];

    for (const input of inputs) {
      const id = input.id || randomUUID();
      if (existingIds.has(id)) {
        const idx = current.findIndex((j) => j.id === id);
        if (idx !== -1 && current[idx]) {
          current[idx] = {
            ...current[idx],
            status: input.status ?? current[idx].status,
            updated_at: timestamp,
          };
          inputsToInsert.push(current[idx]!);
        }
        continue;
      }

      existingIds.add(id);
      const job: Job = {
        ...input,
        id,
        created_at: timestamp,
        updated_at: timestamp,
        status: input.status ?? "active",
        source: input.source ?? "manual",
        remote: input.remote ?? "remote",
        salary_currency: input.salary_currency || "USD",
      };
      current.push(job);
      created.push(job);
      inputsToInsert.push(job);
    }

    inMemoryJobs = current;
    await batchInsertJobsSql(inputsToInsert);

    void withFileLock(FILE, async () => {
      await writeCsvFile(FILE, JOB_COLUMNS, current.map(toRecord));
    });

    return created;
  }

  async updateJob(id: string, patch: Partial<Job>) {
    const jobs = await readAll();
    const index = jobs.findIndex((job) => job.id === id);
    if (index === -1) return null;
    const current = jobs[index];
    if (!current) return null;
    const next: Job = { ...current, ...patch, id, updated_at: nowIso() };
    jobs[index] = next;
    inMemoryJobs = jobs;

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
      await writeCsvFile(FILE, JOB_COLUMNS, jobs.map(toRecord));
    });

    return next;
  }
}

let repository: JobsRepository | null = null;

export function getJobsRepository() {
  if (!repository) repository = new JobsRepository();
  return repository;
}
