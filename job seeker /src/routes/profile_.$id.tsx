import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MatchActions } from "@/components/match-actions";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Badge, Button, Input, Label, Select } from "@/components/ui";
import type { Applicant } from "@/lib/applicants/types";
import { categoryCopy, formatLocation, formatSalary, scoreTone, storeProfileId } from "@/lib/jobs/format";
import type { Job, StoredMatch } from "@/lib/matching/types";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/profile_/$id")({
  component: ProfilePage,
  head: () => ({
    meta: [{ title: `Your Matches | ${SITE_NAME}` }],
  }),
});

type MatchRow = StoredMatch & { job: Job | null };

function ProfilePage() {
  const { id } = Route.useParams();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [minVisible, setMinVisible] = useState(50);
  const [telegram, setTelegram] = useState(true);
  const [email, setEmail] = useState(true);
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("instant");
  const [minScore, setMinScore] = useState(75);
  const [chatId, setChatId] = useState("");
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  async function load() {
    const [personRes, matchRes] = await Promise.all([
      fetch(`/api/applicants/${id}`),
      fetch(`/api/matches/applicant/${id}`),
    ]);
    const personJson = (await personRes.json()) as { applicant?: Applicant; error?: string };
    if (!personRes.ok || !personJson.applicant) {
      setError(personJson.error || "Profile not found");
      return;
    }
    const person = personJson.applicant;
    setApplicant(person);
    storeProfileId(person.id);
    setTelegram(person.telegram_notifications !== false);
    setEmail(person.email_notifications !== false);
    setFrequency(person.notification_frequency || "instant");
    setMinScore(person.minimum_match_score || 75);
    setChatId(person.telegram_chat_id || "");
    if (matchRes.ok) {
      const matchJson = (await matchRes.json()) as { matches?: MatchRow[] };
      setMatches(matchJson.matches ?? []);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  const visible = useMemo(
    () =>
      matches
        .filter((row) => row.match_score >= minVisible && !hidden.has(row.job_id))
        .sort((a, b) => b.match_score - a.match_score),
    [matches, minVisible, hidden],
  );

  async function savePrefs(event: FormEvent) {
    event.preventDefault();
    setSaved("");
    const response = await fetch(`/api/applicants/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        telegram_notifications: telegram,
        email_notifications: email,
        notification_frequency: frequency,
        minimum_match_score: Number(minScore),
        telegram_chat_id: chatId,
      }),
    });
    if (!response.ok) {
      setSaved("Could not save preferences.");
      return;
    }
    setSaved("Preferences saved.");
  }

  return (
    <div className="min-h-dvh">
      <SiteHeader solid />
      <main className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors"
            >
              &larr; Back to Profile Dashboard
            </Link>
          </div>
          {error && <p className="text-danger">{error}</p>}
          {!error && !applicant && <p className="text-muted">Loading your matches…</p>}
          {applicant && (
            <>
              <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase">Your profile matches</p>
              <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">{applicant.full_name}</h1>
              <p className="mt-3 text-muted">
                {applicant.target_job_titles.join(", ") || "Open to relevant roles"} · profile {applicant.profile_completion}% complete
              </p>

              {applicant.profile_completion < 50 && (
                <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl shrink-0">⚠️</div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-amber-950 font-serif">Profile Completeness Below Requirement</h3>
                      <p className="text-sm text-amber-900/90 leading-relaxed">
                        Your profile completeness is currently <strong>{applicant.profile_completion}%</strong>, which is below the <strong>50% minimum threshold</strong> required to view tailored job matches. Please complete your target roles, skills, and experience details to unlock personalized AI matching.
                      </p>
                      <div className="pt-2">
                        <Link
                          to="/apply"
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-950 transition-all shadow-xs"
                        >
                          Complete Application to Unlock Matches &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form
                onSubmit={savePrefs}
                className="mt-10 rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
              >
                <h2 className="text-lg font-semibold text-ink">Notification settings</h2>
                <p className="mt-1 text-sm text-muted">
                  Strong matches can be sent over Telegram and email. Missing keys simply skip that channel.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="flex items-center gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={telegram}
                      onChange={(e) => setTelegram(e.target.checked)}
                      className="size-4 accent-accent"
                    />
                    Telegram notifications
                  </label>
                  <label className="flex items-center gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={email}
                      onChange={(e) => setEmail(e.target.checked)}
                      className="size-4 accent-accent"
                    />
                    Email notifications
                  </label>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      id="frequency"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as typeof frequency)}
                    >
                      <option value="instant">Instant for 90%+ · digest otherwise</option>
                      <option value="daily">Daily digest</option>
                      <option value="weekly">Weekly digest</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="minScore">Minimum match score</Label>
                    <Input
                      id="minScore"
                      type="number"
                      min={0}
                      max={100}
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="chat">Telegram chat ID (optional)</Label>
                    <Input
                      id="chat"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      placeholder="Required to receive Telegram alerts"
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <Button type="submit" size="sm">
                    Save preferences
                  </Button>
                  {saved && <p className="text-sm text-muted">{saved}</p>}
                </div>
              </form>

              <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-serif text-3xl text-ink">Your matches</h2>
                  <p className="mt-1 text-sm text-muted">{visible.length} roles above {minVisible}%</p>
                </div>
                <Select value={String(minVisible)} onChange={(e) => setMinVisible(Number(e.target.value))}>
                  <option value="75">75% and up</option>
                  <option value="50">50% and up</option>
                  <option value="0">Show all</option>
                </Select>
              </div>

              <div className="mt-6 space-y-4">
                {applicant.profile_completion < 50 ? (
                  <div className="rounded-2xl bg-amber-50/50 border border-amber-200 p-8 text-center text-amber-900 shadow-xs space-y-3">
                    <p className="font-semibold text-base font-serif">Matches Locked (Completeness Below 50%)</p>
                    <p className="text-xs text-amber-800/80 max-w-md mx-auto leading-relaxed">
                      Your current profile completeness is <strong>{applicant.profile_completion}%</strong>. You must reach at least <strong>50%</strong> by filling out your skills, target job titles, and experience to unlock AI job matches.
                    </p>
                    <div>
                      <Link to="/apply" className="inline-block text-xs font-bold text-accent hover:underline">
                        Fill Out Profile Application to Unlock &rarr;
                      </Link>
                    </div>
                  </div>
                ) : visible.length === 0 ? (
                  <p className="rounded-2xl bg-surface px-6 py-12 text-center text-muted shadow-[var(--shadow-card)]">
                    No matches yet. New roles are scored as they arrive.
                  </p>
                ) : (
                  visible.map((row) => {
                  const job = row.job;
                  if (!job) return null;
                  return (
                    <article key={row.match_id} className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted">{job.company}</p>
                          <Link
                            to="/jobs/$id"
                            params={{ id: job.id }}
                            search={{ applicant: id, match: row.match_id }}
                            className="mt-1 block text-lg font-semibold text-ink hover:text-accent"
                          >
                            {job.title}
                          </Link>
                          <p className="mt-1 text-sm text-muted">
                            {formatLocation(job)}
                            {formatSalary(job) ? ` · ${formatSalary(job)}` : ""}
                          </p>
                        </div>
                        <Badge tone={scoreTone(row.match_score)} className="tabular-nums">
                          {row.match_score}% · {categoryCopy(row.score_category)}
                        </Badge>
                      </div>
                      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted">
                        {row.match_reasons}
                      </pre>
                      <div className="mt-5">
                        <MatchActions
                          applicantId={id}
                          jobId={job.id}
                          matchId={row.match_id}
                          applyUrl={job.apply_url}
                          onChanged={(action) => {
                            if (action === "not_relevant") {
                              setHidden((prev) => new Set(prev).add(job.id));
                            }
                          }}
                        />
                      </div>
                    </article>
                  );
                }))}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
