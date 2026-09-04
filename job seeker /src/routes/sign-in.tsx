import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "../lib/auth/client.ts";
import { SiteHeader, SiteFooter } from "../components/site-chrome.tsx";
import { SocialSignIn } from "../components/social-sign-in.tsx";
import { MagicLoginForm } from "../components/magic-link-form.tsx";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Failed to sign in");
      } else {
        navigate({ to: "/profile" });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-ink">
      <SiteHeader solid />
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-line bg-white/70 p-8 shadow-sm backdrop-blur-sm">
          <div>
            <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-ink font-serif">
              Sign in to Jaya Talent
            </h2>
            <p className="mt-2 text-center text-sm text-ink/60">
              Or{" "}
              <Link to="/sign-up" className="font-semibold text-accent hover:underline transition-colors">
                create a new candidate account
              </Link>
            </p>
          </div>

          <div className="space-y-6">
            <SocialSignIn callbackURL="/profile" />

            <div className="flex rounded-xl bg-surface-muted p-1 border border-line">
              <button
                type="button"
                onClick={() => setMethod("magic")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  method === "magic"
                    ? "bg-white text-ink shadow-xs border border-line"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                ✨ Magic Link (Passwordless)
              </button>
              <button
                type="button"
                onClick={() => setMethod("password")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  method === "password"
                    ? "bg-white text-ink shadow-xs border border-line"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                🔑 Password
              </button>
            </div>

            {method === "magic" ? (
              <MagicLoginForm callbackURL="/profile" />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="-space-y-px rounded-xl overflow-hidden shadow-xs border border-line">
                  <div>
                    <label htmlFor="email-address" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="relative block w-full border-0 py-3 px-3.5 text-ink placeholder:text-ink/40 focus:z-10 focus:ring-2 focus:ring-accent sm:text-sm bg-transparent transition-all"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="border-t border-line">
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="relative block w-full border-0 py-3 px-3.5 text-ink placeholder:text-ink/40 focus:z-10 focus:ring-2 focus:ring-accent sm:text-sm bg-transparent transition-all"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 text-center font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full justify-center rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-bg hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50 transition-all duration-200 shadow-sm"
                  >
                    {loading ? "Signing in..." : "Sign in with Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
