import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AdminGate } from "@/components/admin-gate";
import { AdminShell, AdminStat } from "@/components/admin-shell";
import { Badge, Button, Input, Select } from "@/components/ui";
import { categoryCopy, scoreTone } from "@/lib/jobs/format";
import type { StoredMatch } from "@/lib/matching/types";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/admin_/matching")({
  component: AdminMatchingPage,
  head: () => ({
    meta: [{ title: `Matching — ${SITE_NAME}` }],
  }),
});

type MatchRow = StoredMatch & {
  applicant_name: string;
  applicant_email: string;
  job_title: string;
  job_company: string;
  job_category: string;
};

type MatchingResponse = {
  stats: {
    applicants: number;
    activeJobs: number;
    matches: number;
    above80: number;
    notificationsSent: number;
  };
  matches: MatchRow[];
};

function AdminMatchingPage() {
  return (
    <AdminGate checkUrl="/api/admin/matching">
      {({ logout }) => (
        <AdminShell current="matching" onLogout={() => void logout()}>
          <MatchingDashboard />
        </AdminShell>
      )}
    </AdminGate>
  );
}

function MatchingDashboard() {
  const [data, setData] = useState<MatchingResponse | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minScore, setMinScore] = useState("0");
  const [selected, setSelected] = useState<MatchRow | null>(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/admin/matching", { credentials: "include" });
    if (!response.ok) return;
    setData((await response.json()) as MatchingResponse);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    let rows = data?.matches ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) =>
        [row.applicant_name, row.job_title, row.job_company, row.score_category]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (category) rows = rows.filter((row) => row.score_category === category);
    const min = Number(minScore);
    if (min) rows = rows.filter((row) => row.match_score >= min);
    return rows;
  }, [data, query, category, minScore]);

  async function runMatching() {
    setBusy("run");
    setNotice("");
    const response = await fetch("/api/matching/run", { method: "POST", credentials: "include" });
    const json = (await response.json()) as { stored?: number; notified?: number; error?: string };
    setNotice(
      response.ok
        ? `Matching finished · ${json.stored ?? 0} stored · ${json.notified ?? 0} notified`
        : json.error || "Matching failed",
    );
    await load();
    setBusy("");
  }

  async function retry() {
    setBusy("retry");
    setNotice("");
    const response = await fetch("/api/admin/notifications/retry", {
      method: "POST",
      credentials: "include",
    });
    const json = (await response.json()) as { retried?: number; error?: string };
    setNotice(response.ok ? `Retried ${json.retried ?? 0} notifications` : json.error || "Retry failed");
    await load();
    setBusy("");
  }

  const stats = data?.stats ?? {
    applicants: 0,
    activeJobs: 0,
    matches: 0,
    above80: 0,
    notificationsSent: 0,
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl text-ink">Matching</h1>
          <p className="mt-2 text-sm text-muted">Scores, explanations and notification status</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={Boolean(busy)} onClick={() => void runMatching()}>
            {busy === "run" ? "Running…" : "Run matching"}
          </Button>
          <Button size="sm" variant="secondary" disabled={Boolean(busy)} onClick={() => void retry()}>
            {busy === "retry" ? "Retrying…" : "Retry failed notifications"}
          </Button>
        </div>
      </div>
      {notice && <p className="mt-4 text-sm text-muted">{notice}</p>}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AdminStat label="Total applicants" value={String(stats.applicants)} />
        <AdminStat label="Active jobs" value={String(stats.activeJobs)} />
        <AdminStat label="Matches generated" value={String(stats.matches)} />
        <AdminStat label="Matches above 80%" value={String(stats.above80)} />
        <AdminStat label="Notifications sent" value={String(stats.notificationsSent)} />
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)] sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-subtle" />
          <Input
            className="pl-10"
            placeholder="Search applicant or role…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="excellent">Excellent</option>
          <option value="strong">Strong</option>
          <option value="good">Good</option>
          <option value="possible">Possible</option>
          <option value="poor">Poor</option>
        </Select>
        <Select value={minScore} onChange={(e) => setMinScore(e.target.value)}>
          <option value="0">Any score</option>
          <option value="50">50%+</option>
          <option value="75">75%+</option>
          <option value="80">80%+</option>
          <option value="90">90%+</option>
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-line text-xs font-medium tracking-wide text-muted uppercase">
            <tr>
              <th className="w-[26%] px-3 py-3">Applicant</th>
              <th className="w-[26%] px-3 py-3">Job</th>
              <th className="w-[20%] px-3 py-3">Match</th>
              <th className="w-[12%] px-3 py-3">Status</th>
              <th className="w-[16%] px-3 py-3">Notifications</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-muted">
                  No matches yet. Run matching to score applicants against open roles.
                </td>
              </tr>
            )}
            {filtered.map((row) => (
              <tr
                key={row.match_id}
                className="cursor-pointer border-b border-line last:border-0 hover:bg-bg"
                onClick={() => setSelected(row)}
              >
                <td className="px-3 py-3">
                  <Link
                    to="/admin/$id"
                    params={{ id: row.applicant_id }}
                    className="block truncate font-medium text-ink hover:text-accent"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {row.applicant_name}
                  </Link>
                  <p className="truncate text-xs text-muted">{row.applicant_email}</p>
                </td>
                <td className="px-3 py-3">
                  <p className="truncate text-ink">{row.job_title}</p>
                  <p className="truncate text-xs text-muted">{row.job_company}</p>
                </td>
                <td className="px-3 py-3">
                  <Badge tone={scoreTone(row.match_score)} className="tabular-nums">
                    {row.match_score}%
                  </Badge>
                  <p className="mt-1 truncate text-xs text-muted">{categoryCopy(row.score_category)}</p>
                </td>
                <td className="truncate px-3 py-3 text-muted">{row.notification_status || "pending"}</td>
                <td className="px-3 py-3 text-xs text-muted">
                  <p className="truncate">Tg {row.telegram_status || "—"}</p>
                  <p className="truncate">Em {row.email_status || "—"}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-6 rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">
                {selected.applicant_name} · {selected.job_title}
              </p>
              <h2 className="mt-1 font-serif text-3xl text-ink">
                {selected.match_score}% · {categoryCopy(selected.score_category)}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
            {selected.match_reasons}
          </pre>
        </div>
      )}
    </>
  );
}
