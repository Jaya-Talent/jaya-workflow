import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui";
import { storeProfileId } from "@/lib/jobs/format";
import { TELEGRAM_URL } from "@/lib/site";

type SuccessSearch = {
  id: string;
  completeness: string;
};

function asSearchString(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return "";
  return value.replace(/^"+|"+$/g, "");
}

export const Route = createFileRoute("/success")({
  validateSearch: (search: Record<string, unknown>): SuccessSearch => ({
    id: asSearchString(search.id),
    completeness: asSearchString(search.completeness),
  }),
  component: SuccessPage,
  head: () => ({
    meta: [{ title: "Profile Created | Jaya Talent" }],
  }),
});

function SuccessPage() {
  const { id, completeness } = Route.useSearch();
  const pct = Number(completeness) || 0;

  useEffect(() => {
    if (id) storeProfileId(id);
  }, [id]);

  return (
    <div className="min-h-dvh">
      <SiteHeader solid />
      <main className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/10 text-success">
            <Check className="size-7" strokeWidth={2.25} />
          </div>
          <h1 className="mt-8 font-serif text-4xl text-ink sm:text-5xl">
            Profile created successfully
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Thank you for joining our talent network. We're already scoring open roles against your
            profile and will notify you when a strong match appears.
          </p>
          <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-surface px-6 py-6 shadow-[var(--shadow-card)]">
            <p className="text-sm font-medium text-ink">Profile completeness: {pct}%</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 text-xs text-muted">
              A fuller profile improves the quality of future matches.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {id && (
              <Link to="/profile/$id" params={{ id }}>
                <Button size="lg" className="w-full sm:w-auto">
                  View your matches
                </Button>
              </Link>
            )}
            <Link to="/jobs">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Browse opportunities
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-muted">
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              Join Telegram
            </a>
            {" · "}
            <Link to="/" className="text-accent hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
