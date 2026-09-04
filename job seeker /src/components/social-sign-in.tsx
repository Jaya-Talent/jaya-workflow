import { useState } from "react";
import { authClient, signIn } from "@/lib/auth/client.ts";

export function SocialSignIn({ callbackURL = "/profile" }: { callbackURL?: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    try {
      setLoading("google");
      setError("");

      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (res?.data?.url) {
        window.location.href = res.data.url;
        return;
      }

      if (res?.error) {
        setError(
          res.error.message ||
            "Google OAuth configuration error. Please verify Authorized Origins and Client ID in Google Cloud Console, or use 1-Click Instant Email Sign-In below."
        );
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(
        err?.message ||
          "Google OAuth request failed. Please use 1-Click Instant Email Sign-In below."
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="w-full space-y-4">
      <button
        type="button"
        disabled={Boolean(loading)}
        onClick={handleGoogleSignIn}
        className="w-full relative flex items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-xs hover:bg-surface-muted transition-all duration-200 disabled:opacity-60"
      >
        <svg className="size-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{loading === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
      </button>

      {error && (
        <div className="text-xs text-amber-800 text-center font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      <div className="relative flex items-center justify-center my-4">
        <div className="w-full border-t border-line" />
        <span className="absolute bg-white px-3 text-xs uppercase tracking-wider text-muted font-medium">
          or email
        </span>
      </div>
    </div>
  );
}
