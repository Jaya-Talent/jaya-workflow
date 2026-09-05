import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Download,
  Printer,
  Mail,
  Send,
  FileText,
  X,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  UserCheck,
  Briefcase,
  Globe,
  DollarSign,
  Calendar,
  CheckSquare,
  Square,
  Eye
} from "lucide-react";
import { AdminGate } from "@/components/admin-gate";
import { AdminShell, AdminStat } from "@/components/admin-shell";
import { Badge, Button, Input, Select } from "@/components/ui";
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

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function exportToCsv(filename: string, rows: AdminApplicant[]) {
  const headers = [
    "ID",
    "Date Registered",
    "Full Name",
    "Email",
    "Telegram Username",
    "Country",
    "City",
    "Job Categories",
    "Target Job Titles",
    "Experience Level",
    "Years Experience",
    "Employment Type",
    "Skills",
    "Work Preference",
    "Preferred Locations",
    "Salary Min",
    "Salary Currency",
    "Availability",
    "Profile Completion %",
    "CV Attached",
    "LinkedIn URL",
    "GitHub URL",
    "Portfolio URL",
    "Professional Bio"
  ];

  const escapeCsv = (str: string | number | boolean | undefined | null) => {
    if (str == null) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      [
        escapeCsv(row.id),
        escapeCsv(row.created_at ? row.created_at.slice(0, 10) : ""),
        escapeCsv(row.full_name),
        escapeCsv(row.email),
        escapeCsv(row.telegram_username ? `@${row.telegram_username.replace(/^@/, "")}` : ""),
        escapeCsv(row.country),
        escapeCsv(row.city),
        escapeCsv((row.job_categories || []).join(" | ")),
        escapeCsv((row.target_job_titles || []).join(" | ")),
        escapeCsv(row.experience_level),
        escapeCsv(row.years_experience),
        escapeCsv((row.employment_type || []).join(" | ")),
        escapeCsv((row.skills || []).join(" | ")),
        escapeCsv(row.work_preference),
        escapeCsv((row.preferred_locations || []).join(" | ")),
        escapeCsv(row.salary_min),
        escapeCsv(row.salary_currency),
        escapeCsv(row.availability),
        escapeCsv(row.profile_completion),
        escapeCsv(row.cv_filename ? "Yes" : "No"),
        escapeCsv(row.linkedin_url),
        escapeCsv(row.github_url),
        escapeCsv(row.portfolio_url),
        escapeCsv(row.professional_bio)
      ].join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToPdfReport(rows: AdminApplicant[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const avgCompletion =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((s, r) => s + (r.profile_completion || 0), 0) / rows.length);

  const cvCount = rows.filter((r) => r.cv_filename).length;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Jaya Talent - Candidate Intake Report (${dateStr})</title>
      <style>
        body { font-family: 'Outfit', system-ui, -apple-system, sans-serif; color: #1f2937; padding: 32px; background: #fff; font-size: 13px; line-height: 1.5; }
        .header { border-bottom: 2px solid #710193; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .logo { font-size: 26px; font-weight: 800; color: #710193; letter-spacing: -0.02em; }
        .subtitle { color: #64748b; font-size: 13px; margin-top: 4px; }
        .summary-cards { display: flex; gap: 16px; margin-bottom: 28px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; flex: 1; }
        .card-num { font-size: 24px; font-weight: 800; color: #710193; }
        .card-label { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; font-weight: 600; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
        th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 1px solid #cbd5e1; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        .badge { display: inline-block; background: #f1f5f9; color: #475569; border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 500; margin-right: 4px; margin-bottom: 3px; }
        .badge-purple { background: rgba(113, 1, 147, 0.1); color: #710193; font-weight: 600; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">Jaya Talent</div>
          <div class="subtitle">Exclusive Web3 Talent Network — Candidate Intake Report</div>
        </div>
        <div style="text-align: right; color: #64748b; font-size: 12px;">
          Generated: ${dateStr}<br/>
          Exported Records: <strong>${rows.length}</strong>
        </div>
      </div>

      <div class="summary-cards">
        <div class="card">
          <div class="card-num">${rows.length}</div>
          <div class="card-label">Total Candidates</div>
        </div>
        <div class="card">
          <div class="card-num">${avgCompletion}%</div>
          <div class="card-label">Avg Profile Completion</div>
        </div>
        <div class="card">
          <div class="card-num">${cvCount}</div>
          <div class="card-label">Resumes On File</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Candidate & Contact</th>
            <th>Location</th>
            <th>Category & Level</th>
            <th>Top Skills</th>
            <th>Salary Expectation</th>
            <th>Completion</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>
                <strong>${escapeHtml(r.full_name)}</strong><br/>
                <span style="color: #64748b;">${escapeHtml(r.email)}</span>
                ${
                  r.telegram_username
                    ? `<br/><span style="color: #0284c7; font-size: 11px;">Tg: @${escapeHtml(
                        r.telegram_username.replace(/^@/, "")
                      )}</span>`
                    : ""
                }
              </td>
              <td>${escapeHtml([r.city, r.country].filter(Boolean).join(", ") || "—")}</td>
              <td>
                <span class="badge badge-purple">${escapeHtml(
                  r.job_categories[0] || "General"
                )}</span><br/>
                <span style="font-size: 11px; color: #64748b;">${escapeHtml(
                  r.experience_level || "N/A"
                )} (${escapeHtml(r.years_experience || "N/A")})</span>
              </td>
              <td>${(r.skills || [])
                .slice(0, 4)
                .map((s) => `<span class="badge">${escapeHtml(s)}</span>`)
                .join("")}</td>
              <td>${
                r.salary_min
                  ? `${escapeHtml(r.salary_currency || "USD")} ${escapeHtml(r.salary_min)}`
                  : "—"
              }</td>
              <td><strong>${r.profile_completion}%</strong></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

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
  const [availability, setAvailability] = useState("");
  const [cvFilter, setCvFilter] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "completion" | "name">("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inspectingApplicant, setInspectingApplicant] = useState<AdminApplicant | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

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

  const availabilities = useMemo(() => {
    const set = new Set((data?.applicants ?? []).map((row) => row.availability).filter(Boolean));
    return [...set].sort();
  }, [data]);

  const filtered = useMemo(() => {
    let rows = data?.applicants ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) =>
        [
          row.full_name,
          row.email,
          row.country,
          row.city,
          row.telegram_username,
          row.skills.join(" "),
          row.job_categories.join(" "),
          row.target_job_titles.join(" ")
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (category) rows = rows.filter((row) => row.job_categories.includes(category));
    if (experience) rows = rows.filter((row) => row.experience_level === experience);
    if (country) rows = rows.filter((row) => row.country === country);
    if (availability) rows = rows.filter((row) => row.availability === availability);
    if (cvFilter === "has_cv") rows = rows.filter((row) => Boolean(row.cv_filename));
    if (cvFilter === "no_cv") rows = rows.filter((row) => !row.cv_filename);

    if (sort === "oldest") rows = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (sort === "completion") rows = [...rows].sort((a, b) => b.profile_completion - a.profile_completion);
    if (sort === "name") rows = [...rows].sort((a, b) => a.full_name.localeCompare(b.full_name));
    if (sort === "newest") rows = [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at));

    return rows;
  }, [data, query, category, experience, country, availability, cvFilter, sort]);

  const stats = data?.stats ?? { total: 0, averageCompletion: 0, newToday: 0 };
  const cvCount = useMemo(() => (data?.applicants ?? []).filter((r) => Boolean(r.cv_filename)).length, [data]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportCsv = (targets: AdminApplicant[] = filtered) => {
    if (targets.length === 0) return;
    const dateTag = new Date().toISOString().slice(0, 10);
    exportToCsv(`jaya_talent_candidates_${dateTag}.csv`, targets);
    showToast(`Downloaded CSV report for ${targets.length} candidate(s).`);
  };

  const handleExportPdf = (targets: AdminApplicant[] = filtered) => {
    if (targets.length === 0) return;
    exportToPdfReport(targets);
  };

  const handleCopyEmails = (targets: AdminApplicant[] = filtered) => {
    const emails = targets.map((r) => r.email).filter(Boolean).join(", ");
    if (!emails) return;
    void navigator.clipboard.writeText(emails);
    showToast(`Copied ${targets.length} email address(es) to clipboard.`);
  };

  const handleCopyTelegrams = (targets: AdminApplicant[] = filtered) => {
    const handles = targets
      .map((r) => r.telegram_username)
      .filter(Boolean)
      .map((t) => `@${t.replace(/^@/, "")}`)
      .join(", ");
    if (!handles) {
      showToast("No Telegram handles found in current selection.");
      return;
    }
    void navigator.clipboard.writeText(handles);
    showToast(`Copied ${handles.split(",").length} Telegram handle(s) to clipboard.`);
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setExperience("");
    setCountry("");
    setAvailability("");
    setCvFilter("");
    setSort("newest");
  };

  const selectedRows = useMemo(
    () => (data?.applicants ?? []).filter((r) => selectedIds.has(r.id)),
    [data, selectedIds]
  );

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));

  return (
    <>
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          {notification}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-ink font-bold">Candidate Intake</h1>
          <p className="mt-1 text-sm text-muted">Web3 Talent Network Applicants & Profiles</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleExportCsv(filtered)}
            className="bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm gap-1.5"
          >
            <Download className="size-4" /> Export CSV ({filtered.length})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportPdf(filtered)}
            className="gap-1.5 border-line hover:border-accent"
          >
            <Printer className="size-4 text-muted" /> Print PDF Report
          </Button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat label="Total Candidates Intake" value={String(stats.total)} />
        <AdminStat label="Avg Profile Completion" value={`${stats.averageCompletion}%`} />
        <AdminStat label="Resumes On File" value={String(cvCount)} />
        <AdminStat label="New Today" value={String(stats.newToday)} />
      </div>

      {/* Quick Action Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-muted border border-line p-3.5 px-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
          <SlidersHorizontal className="size-4 text-accent" /> Quick Actions
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCopyEmails(filtered)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent transition-colors"
          >
            <Mail className="size-3.5 text-accent" /> Copy All Emails
          </button>
          <button
            onClick={() => handleCopyTelegrams(filtered)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent transition-colors"
          >
            <Send className="size-3.5 text-sky-500" /> Copy Telegram Handles
          </button>
          {(query || category || experience || country || availability || cvFilter || sort !== "newest") && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              <RotateCcw className="size-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Multi-Select Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-ink px-5 py-3.5 text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-accent text-xs font-bold text-white">
              {selectedIds.size}
            </span>
            <span>Candidate(s) Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleExportCsv(selectedRows)}
              className="bg-accent text-white hover:bg-accent-hover text-xs h-9 px-3 gap-1.5"
            >
              <Download className="size-3.5" /> Export Selected CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopyEmails(selectedRows)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-9 px-3 gap-1.5"
            >
              <Mail className="size-3.5" /> Copy Emails
            </Button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
              title="Clear selection"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="mt-6 grid gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-subtle" />
          <Input
            className="pl-10"
            placeholder="Search name, email, skills, country…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {JOB_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={experience} onChange={(e) => setExperience(e.target.value)}>
          <option value="">All Experience</option>
          {EXPERIENCE_LEVELS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All Countries</option>
          {countries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={cvFilter} onChange={(e) => setCvFilter(e.target.value)}>
          <option value="">All Resumes</option>
          <option value="has_cv">Has CV File</option>
          <option value="no_cv">No CV File</option>
        </Select>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted">
        <span>Showing {filtered.length} of {data?.applicants.length ?? 0} candidates</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">Sort by:</span>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-8 py-0 px-2 text-xs bg-transparent border-none focus:ring-0"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="completion">Highest Completion %</option>
            <option value="name">Name (A-Z)</option>
          </Select>
        </div>
      </div>

      {/* Main Candidates Data Table */}
      <div className="mt-3 overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-card)] border border-line">
        <table className="w-full min-w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-muted text-xs font-semibold tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3.5 w-10">
                <button
                  type="button"
                  onClick={() => handleSelectAll(!allFilteredSelected)}
                  className="text-muted hover:text-ink transition-colors"
                >
                  {allFilteredSelected ? (
                    <CheckSquare className="size-4 text-accent" />
                  ) : (
                    <Square className="size-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3.5">Candidate</th>
              <th className="px-4 py-3.5">Category & Titles</th>
              <th className="px-4 py-3.5">Location</th>
              <th className="px-4 py-3.5">Experience</th>
              <th className="px-4 py-3.5">Top Skills</th>
              <th className="px-4 py-3.5">Completion</th>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center text-muted">
                  No candidate records found matching your filters.
                </td>
              </tr>
            )}
            {filtered.map((row) => {
              const isSelected = selectedIds.has(row.id);
              return (
                <tr
                  key={row.id}
                  className={`border-b border-line last:border-0 transition-colors ${
                    isSelected ? "bg-accent/5" : "hover:bg-surface-muted"
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(row.id)}
                      className="text-muted hover:text-ink transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="size-4 text-accent" />
                      ) : (
                        <Square className="size-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 font-bold text-accent text-sm">
                        {row.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setInspectingApplicant(row)}
                          className="font-semibold text-ink hover:text-accent text-left transition-colors"
                        >
                          {row.full_name}
                        </button>
                        <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                          <span>{row.email}</span>
                          {row.telegram_username && (
                            <span className="text-sky-600 font-medium">@{row.telegram_username.replace(/^@/, "")}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                      {row.job_categories[0] || "General"}
                    </span>
                    {row.target_job_titles.length > 0 && (
                      <p className="mt-1 text-xs text-muted truncate max-w-[180px]">
                        {row.target_job_titles.join(", ")}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-muted text-xs">
                    {[row.city, row.country].filter(Boolean).join(", ") || "—"}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-muted">
                    <div className="font-medium text-ink">{row.experience_level || "—"}</div>
                    {row.years_experience && <div>{row.years_experience} yrs</div>}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex max-w-[200px] flex-wrap gap-1">
                      {row.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill}>{skill}</Badge>
                      ))}
                      {row.skills.length > 3 && <Badge>+{row.skills.length - 3}</Badge>}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 tabular-nums">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink text-xs">{row.profile_completion}%</span>
                      <div className="h-1.5 w-12 rounded-full bg-line overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${row.profile_completion}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-muted text-xs tabular-nums">
                    {row.created_at ? row.created_at.slice(0, 10) : "—"}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectingApplicant(row)}
                        className="rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-accent transition-colors"
                        title="Quick Inspect Profile"
                      >
                        <Eye className="size-4" />
                      </button>

                      {row.cv_filename && (
                        <a
                          href={`/api/admin/applicants/${row.id}/cv`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-muted hover:bg-accent/10 hover:text-accent transition-colors"
                          title="Download CV Resume"
                        >
                          <FileText className="size-4 text-accent" />
                        </a>
                      )}

                      <Link
                        to="/admin/$id"
                        params={{ id: row.id }}
                        className="rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-ink transition-colors"
                        title="View Full Detail & Matches"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Inspector Side Drawer / Modal */}
      {inspectingApplicant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto p-6 sm:p-8 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white font-bold text-lg">
                    {inspectingApplicant.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-ink">{inspectingApplicant.full_name}</h2>
                    <p className="text-xs text-muted">{inspectingApplicant.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingApplicant(null)}
                  className="rounded-full p-2 text-muted hover:bg-surface-muted hover:text-ink transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Profile Completion Header Banner */}
              <div className="mt-6 flex items-center justify-between rounded-xl bg-accent/5 p-4 border border-accent/15">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Profile Completion</p>
                  <p className="text-2xl font-extrabold text-accent mt-0.5">{inspectingApplicant.profile_completion}%</p>
                </div>
                {inspectingApplicant.cv_filename ? (
                  <a
                    href={`/api/admin/applicants/${inspectingApplicant.id}/cv`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover transition-colors shadow-sm"
                  >
                    <FileText className="size-4" /> Download CV Resume
                  </a>
                ) : (
                  <span className="text-xs text-muted italic">No CV file attached</span>
                )}
              </div>

              {/* Quick Details Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-line p-3.5 bg-surface-muted">
                  <p className="text-xs font-semibold uppercase text-muted">Telegram</p>
                  <p className="mt-1 font-medium text-sky-600">
                    {inspectingApplicant.telegram_username ? `@${inspectingApplicant.telegram_username.replace(/^@/, "")}` : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-line p-3.5 bg-surface-muted">
                  <p className="text-xs font-semibold uppercase text-muted">Location</p>
                  <p className="mt-1 font-medium text-ink">
                    {[inspectingApplicant.city, inspectingApplicant.country].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-line p-3.5 bg-surface-muted">
                  <p className="text-xs font-semibold uppercase text-muted">Experience Level</p>
                  <p className="mt-1 font-medium text-ink">
                    {inspectingApplicant.experience_level || "—"} {inspectingApplicant.years_experience ? `(${inspectingApplicant.years_experience} yrs)` : ""}
                  </p>
                </div>
                <div className="rounded-xl border border-line p-3.5 bg-surface-muted">
                  <p className="text-xs font-semibold uppercase text-muted">Salary Expectation</p>
                  <p className="mt-1 font-medium text-ink">
                    {inspectingApplicant.salary_min ? `${inspectingApplicant.salary_currency || "USD"} ${inspectingApplicant.salary_min}` : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-line p-3.5 bg-surface-muted col-span-2">
                  <p className="text-xs font-semibold uppercase text-muted">Target Job Titles</p>
                  <p className="mt-1 font-medium text-ink">
                    {inspectingApplicant.target_job_titles.join(", ") || "—"}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Technical Skills & Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingApplicant.skills.map((skill) => (
                    <Badge key={skill} tone="accent" className="text-xs py-1 px-2.5">
                      {skill}
                    </Badge>
                  ))}
                  {inspectingApplicant.skills.length === 0 && <span className="text-sm text-muted italic">No skills listed</span>}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Professional Bio</p>
                <div className="rounded-xl border border-line p-4 bg-surface-muted text-sm text-ink leading-relaxed whitespace-pre-line">
                  {inspectingApplicant.professional_bio || "No professional bio provided."}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-line flex items-center justify-between">
              <Link
                to="/admin/$id"
                params={{ id: inspectingApplicant.id }}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/90 transition-colors"
                onClick={() => setInspectingApplicant(null)}
              >
                View Full Matches & Profile <ExternalLink className="size-4" />
              </Link>
              <Button variant="outline" size="sm" onClick={() => setInspectingApplicant(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

