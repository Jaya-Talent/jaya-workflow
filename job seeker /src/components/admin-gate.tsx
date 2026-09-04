import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { Button, Input, Label } from "@/components/ui";

export function AdminGate({
  children,
  checkUrl = "/api/admin/applicants",
}: {
  children: (api: { logout: () => Promise<void> }) => ReactNode;
  checkUrl?: string;
}) {
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  async function check() {
    const response = await fetch(checkUrl, { credentials: "include" });
    if (response.status === 401) {
      setAuthed(false);
      setChecking(false);
      return false;
    }
    setAuthed(true);
    setChecking(false);
    return true;
  }

  useEffect(() => {
    void check();
  }, [checkUrl]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setAuthError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setAuthError("Incorrect password.");
      return;
    }
    setPassword("");
    await check();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthed(false);
  }

  if (checking) {
    return <div className="grid min-h-dvh place-items-center bg-bg text-muted">Loading…</div>;
  }

  if (!authed) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-5">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-[var(--shadow-card)]"
        >
          <Logo />
          <h1 className="mt-6 font-serif text-3xl text-ink">Admin access</h1>
          <p className="mt-2 text-sm text-muted">Enter the team password to continue.</p>
          <div className="mt-6">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {authError && <p className="mt-3 text-sm text-danger">{authError}</p>}
          <Button type="submit" className="mt-6 w-full">
            Continue
          </Button>
        </form>
      </div>
    );
  }

  return <>{children({ logout })}</>;
}