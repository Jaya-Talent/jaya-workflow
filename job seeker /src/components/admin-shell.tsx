import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function AdminShell({
  children,
  current,
  onLogout,
}: {
  children: ReactNode;
  current: "applicants" | "jobs" | "matching";
  onLogout: () => void;
}) {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Logo />
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              to="/admin"
              className={cn("hover:text-ink", current === "applicants" ? "font-medium text-ink" : "text-muted")}
            >
              Applicants
            </Link>
            <Link
              to="/admin/jobs"
              className={cn("hover:text-ink", current === "jobs" ? "font-medium text-ink" : "text-muted")}
            >
              Jobs
            </Link>
            <Link
              to="/admin/matching"
              className={cn("hover:text-ink", current === "matching" ? "font-medium text-ink" : "text-muted")}
            >
              Matching
            </Link>
            <Link to="/" className="text-muted hover:text-ink">
              Site
            </Link>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Sign out
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}

export function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface px-5 py-5 shadow-[var(--shadow-card)]">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-serif text-4xl tabular-nums text-ink">{value}</p>
    </div>
  );
}