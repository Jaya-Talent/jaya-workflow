import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AdminGate } from "@/components/admin-gate";
import { AdminShell, AdminStat } from "@/components/admin-shell";
import { Badge, Button, Input, Label, Select, Textarea } from "@/components/ui";
import {
  CURRENCIES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
} from "@/lib/applicants/constants";
import { categoryCopy, formatLocation, formatSalary, scoreTone } from "@/lib/jobs/format";
import type { Job, StoredMatch } from "@/lib/matching/types";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/admin_/jobs")({
  component: AdminJobsPage,
  head: () => ({
    meta: [{ title: `Jobs — ${SITE_NAME}` }],
  }),
});

type Candidate = StoredMatch & {
  applicant: {
    id: string;
    full_name: string;
    email: string;
    experience_level: string;
    country: string;
  } | null;
};

function AdminJobsPage() {
  return (
    <AdminGate checkUrl="/api/admin/jobs">
      {({ logout }) => (
        <AdminShell current="jobs" onLogout={() => void logout()}>
          <JobsDashboard />
        </AdminShell>
      )}
    </AdminGate>
  );
}

function JobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/admin/jobs", { credentials: "include" });
    if (!response.ok) return;
    const json = (await response.json()) as { jobs?: Job[] };
    setJobs(json.jobs ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function openJob(job: Job) {
    setSelected(job);
    const response = await fetch(`/api/matches/job/${job.id}`, { credentials: "include" });
    if (!response.ok) {
      setCandidates([]);
      return;
    }
    const json = (await response.json()) as { matches?: Candidate[] };
    setCandidates(json.matches ?? []);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((job) =>
      [job.title, job.company, job.location, job.category, job.required_skills.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [jobs, query]);

  const active = jobs.filter((job) => job.status === "active").length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl text-ink">Jobs</h1>
          <p className="mt-2 text-sm text-muted">Roles used by the matching engine</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close form" : "Add job"}
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <AdminStat label="Total jobs" value={String(jobs.length)} />
        <AdminStat label="Active" value={String(active)} />
        <AdminStat label="Closed" value={String(jobs.length - active)} />
      </div>

      {showForm && (
        <JobForm
          onCreated={async () => {
            setShowForm(false);
            setNotice("Job saved. Matching will run in the background.");
            await load();
          }}
        />
      )}
      {notice && <p className="mt-4 text-sm text-muted">{notice}</p>}

      <div className="relative mt-8">
        <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-subtle" />
        <Input
          className="pl-10"
          placeholder="Search jobs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs font-medium tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Skills</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => (
              <tr
                key={job.id}
                className="cursor-pointer border-b border-line last:border-0 hover:bg-bg"
                onClick={() => void openJob(job)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{job.title}</p>
                  <p className="text-xs text-muted">{job.company}</p>
                </td>
                <td className="px-4 py-3 text-muted">{formatLocation(job)}</td>
                <td className="px-4 py-3 text-muted">{job.category}</td>
                <td className="px-4 py-3">
                  <div className="flex max-w-xs flex-wrap gap-1">
                    {job.required_skills.slice(0, 3).map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{job.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-6 rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">{selected.company}</p>
              <h2 className="mt-1 font-serif text-3xl text-ink">{selected.title}</h2>
              <p className="mt-2 text-sm text-muted">
                {formatLocation(selected)} · {selected.employment_type}
                {formatSalary(selected) ? ` · ${formatSalary(selected)}` : ""}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>
          <h3 className="mt-8 text-sm font-medium tracking-wide text-muted uppercase">
            Best matching candidates
          </h3>
          <ol className="mt-4 space-y-3">
            {candidates.length === 0 && <p className="text-sm text-muted">No scored candidates yet.</p>}
            {candidates
              .slice()
              .sort((a, b) => b.match_score - a.match_score)
              .slice(0, 8)
              .map((row, index) => (
                <li key={row.match_id} className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-ink">
                    {index === 0 ? "1." : `${index + 1}.`} {row.applicant?.full_name ?? "Unknown"}
                    <span className="text-muted"> · {row.applicant?.experience_level || "—"}</span>
                  </p>
                  <Badge tone={scoreTone(row.match_score)} className="tabular-nums">
                    {row.match_score}% · {categoryCopy(row.score_category)}
                  </Badge>
                </li>
              ))}
          </ol>
        </div>
      )}
    </>
  );
}

function JobForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("Remote");
  const [remote, setRemote] = useState<"remote" | "hybrid" | "onsite">("remote");
  const [employment, setEmployment] = useState("Full-time");
  const [seniority, setSeniority] = useState("Mid-Level");
  const [category, setCategory] = useState("Software Engineering");
  const [skills, setSkills] = useState("");
  const [preferred, setPreferred] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [applyUrl, setApplyUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/jobs", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        company,
        location,
        remote,
        employment_type: employment,
        seniority,
        category,
        required_skills: skills.split("|").map((item) => item.trim()).filter(Boolean),
        preferred_skills: preferred.split("|").map((item) => item.trim()).filter(Boolean),
        salary_min: salaryMin,
        salary_max: salaryMax,
        salary_currency: currency,
        apply_url: applyUrl,
        description,
      }),
    });
    if (!response.ok) {
      const json = (await response.json()) as { error?: string };
      setError(json.error || "Could not save job");
      setBusy(false);
      return;
    }
    setBusy(false);
    await onCreated();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)] sm:grid-cols-2">
      <div className="sm:col-span-2">
        <h2 className="text-lg font-semibold text-ink">New job</h2>
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="remote">Remote</Label>
        <Select id="remote" value={remote} onChange={(e) => setRemote(e.target.value as typeof remote)}>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="employment">Employment</Label>
        <Select id="employment" value={employment} onChange={(e) => setEmployment(e.target.value)}>
          {EMPLOYMENT_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="seniority">Seniority</Label>
        <Select id="seniority" value={seniority} onChange={(e) => setSeniority(e.target.value)}>
          {EXPERIENCE_LEVELS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {JOB_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {CURRENCIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="skills">Required skills (pipe-separated)</Label>
        <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Solidity|Foundry" />
      </div>
      <div>
        <Label htmlFor="preferred">Preferred skills</Label>
        <Input id="preferred" value={preferred} onChange={(e) => setPreferred(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="smin">Salary min</Label>
        <Input id="smin" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="smax">Salary max</Label>
        <Input id="smax" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="apply">Apply URL</Label>
        <Input id="apply" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save job"}
        </Button>
      </div>
    </form>
  );
}
