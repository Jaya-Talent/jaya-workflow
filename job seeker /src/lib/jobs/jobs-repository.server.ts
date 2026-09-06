import { randomUUID } from "node:crypto";
import { joinList, splitList } from "../applicants/csv.server.ts";
import type { Job } from "../matching/types.ts";
import { ensureCsvFile, readCsvFile, withFileLock, writeCsvFile } from "../store/csv-table.server.ts";
import { JOB_COLUMNS } from "./columns.ts";

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

let inMemoryJobs: Job[] | null = null;

async function readAll(): Promise<Job[]> {
  if (inMemoryJobs && inMemoryJobs.length > 0) {
    return inMemoryJobs;
  }
  await ensureCsvFile(FILE, JOB_COLUMNS);
  const loaded = (await readCsvFile(FILE)).map(fromRecord).filter((row) => row.id && row.title);
  if (loaded.length > 0) {
    inMemoryJobs = loaded;
  }
  return loaded;
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

  async getJob(id: string) {
    return (await readAll()).find((job) => job.id === id) ?? null;
  }

  async createJob(input: JobInput) {
    return withFileLock(FILE, async () => {
      const jobs = await readAll();
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
      jobs.push(job);
      inMemoryJobs = jobs;
      await writeCsvFile(FILE, JOB_COLUMNS, jobs.map(toRecord));
      return job;
    });
  }

  async replaceJobs(inputs: JobInput[]) {
    return withFileLock(FILE, async () => {
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
      await writeCsvFile(FILE, JOB_COLUMNS, jobs.map(toRecord));
      return jobs;
    });
  }

  async bulkCreateJobs(inputs: JobInput[]) {
    return withFileLock(FILE, async () => {
      const jobs = await readAll();
      const timestamp = nowIso();
      const existingIds = new Set(jobs.map((j) => j.id));
      const created: Job[] = [];

      for (const input of inputs) {
        const id = input.id || randomUUID();
        if (existingIds.has(id)) {
          const idx = jobs.findIndex((j) => j.id === id);
          if (idx !== -1 && jobs[idx]) {
            jobs[idx] = {
              ...jobs[idx],
              status: input.status ?? jobs[idx].status,
              updated_at: timestamp,
            };
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
        jobs.push(job);
        created.push(job);
      }

      inMemoryJobs = jobs;
      await writeCsvFile(FILE, JOB_COLUMNS, jobs.map(toRecord));
      return created;
    });
  }

  async updateJob(id: string, patch: Partial<Job>) {
    return withFileLock(FILE, async () => {
      const jobs = await readAll();
      const index = jobs.findIndex((job) => job.id === id);
      if (index === -1) return null;
      const current = jobs[index];
      if (!current) return null;
      const next: Job = { ...current, ...patch, id, updated_at: nowIso() };
      jobs[index] = next;
      inMemoryJobs = jobs;
      await writeCsvFile(FILE, JOB_COLUMNS, jobs.map(toRecord));
      return next;
    });
  }
}

let repository: JobsRepository | null = null;

export function getJobsRepository() {
  if (!repository) repository = new JobsRepository();
  return repository;
}
