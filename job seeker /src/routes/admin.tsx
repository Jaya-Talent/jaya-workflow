import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AdminGate } from "@/components/admin-gate";
import { AdminShell, AdminStat } from "@/components/admin-shell";
import { Badge, Input, Select } from "@/components/ui";
import { EXPERIENCE_LEVELS, JOB_CATEGORIES } from "@/lib/applicants/constants";
import type { Applicant } from "@/lib/applicants/types";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin | Jaya Talent" }],
  }),
});

type AdminApplicant = Applicant & { has_cv?: boolean };

type ListResponse = {
  stats: { total: number; averageCompletion: number; newToday: number };
  applicants: AdminApplicant[];
  error?: string;
};

function AdminPage() {
  return (
    <AdminGate>
      {({ logout }) => (
        <AdminShell current="applicants" onLogout={() => void logout()}>
          <ApplicantsDashboard />
        </AdminShell>
      )}
    </AdminGate>
  );
}

function ApplicantsDashboard() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "completion">("newest");

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/admin/applicants", { credentials: "include" });
      if (!response.ok) return;
      setData((await response.json()) as ListResponse);
    })();
  }, []);

  const countries = useMemo(() => {
    const set = new Set((data?.applicants ?? []).map((row) => row.country).filter(Boolean));
    return [...set].sort();
  }, [data]);

  const filtered = useMemo(() => {
    let rows = data?.applicants ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) =>
        [row.full_name, row.email, row.country, row.skills.join(" "), row.job_categories.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (category) rows = rows.filter((row) => row.job_categories.includes(category));
    if (experience) rows = rows.filter((row) => row.experience_level === experience);
    if (country) rows = rows.filter((row) => row.country === country);
    if (sort === "oldest") rows = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (sort === "completion") {
      rows = [...rows].sort((a, b) => b.profile_completion - a.profile_completion);
    }
    return rows;
  }, [data, query, category, experience, country, sort]);

  const stats = data?.stats ?? { total: 0, averageCompletion: 0, newToday: 0 };

  return (
    <>
      <h1 className="font-serif text-4xl text-ink">Applicants</h1>
      <p className="mt-2 text-sm text-muted">Talent network intake</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <AdminStat label="Total applicants" value={String(stats.total)} />
        <AdminStat label="Profile completion average" value={`${stats.averageCompletion}%`} />
        <AdminStat label="New applicants today" value={String(stats.newToday)} />
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-subtle" />
          <Input
            className="pl-10"
            placeholder="Search name, skills…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {JOB_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={experience} onChange={(e) => setExperience(e.target.value)}>
          <option value="">All experience</option>
          {EXPERIENCE_LEVELS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All countries</option>
          {countries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="completion">Profile %</option>
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs font-medium tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Skills</th>
              <th className="px-4 py-3">Profile %</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted">
                  No applicants yet. Profiles submitted from the site will appear here.
                </td>
              </tr>
            )}
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0 hover:bg-bg">
                <td className="px-4 py-3">
                  <Link
                    to="/admin/$id"
                    params={{ id: row.id }}
                    className="font-medium text-ink hover:text-accent"
                  >
                    {row.full_name}
                  </Link>
                  <p className="text-xs text-muted">{row.email}</p>
                </td>
                <td className="px-4 py-3 text-muted">{row.job_categories[0] || "—"}</td>
                <td className="px-4 py-3 text-muted">{row.experience_level || "—"}</td>
                <td className="px-4 py-3 text-muted">{row.country || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex max-w-xs flex-wrap gap-1">
                    {row.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                    {row.skills.length > 3 && <Badge>+{row.skills.length - 3}</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums text-ink">{row.profile_completion}%</td>
                <td className="px-4 py-3 text-muted tabular-nums">{row.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
