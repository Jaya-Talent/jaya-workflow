import { useState } from "react";
import { authClient } from "@/lib/auth/client.ts";
import { useNavigate } from "@tanstack/react-router";

export function MagicLoginForm({ callbackURL = "/profile" }: { callbackURL?: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInstantSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    // Deterministic password for passwordless 1-click convenience
    const autoPassword = `JayaTalent_${cleanEmail.replace(/[^a-z0-9]/g, "")}_2026!`;

    try {
      // 1. Try signing in directly
      let res = await authClient.signIn.email({
        email: cleanEmail,
        password: autoPassword,
      });

      // 2. If account doesn't exist yet, auto-register instantly
      if (res.error) {
        const namePart = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        
        const signUpRes = await authClient.signUp.email({
          name: formattedName,
          email: cleanEmail,
          password: autoPassword,
        });

        if (signUpRes.error) {
          // If autoPassword failed due to password policy or existing user, try magic link dispatch
          const magicRes = await authClient.signIn.magicLink({
            email: cleanEmail,
            callbackURL,
          });
          if (magicRes.error) {
            setError(signUpRes.error.message || magicRes.error.message || "Failed to sign in.");
            return;
          }
        }
      }

      // Also trigger magic link dispatch in background for inbox confirmation
      authClient.signIn.magicLink({ email: cleanEmail, callbackURL }).catch(() => {});

      // Instant redirect to candidate profile/dashboard
      navigate({ to: callbackURL as any });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during instant sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleInstantSignIn} className="w-full space-y-4">
      <div>
        <label htmlFor="magic-email" className="block text-xs font-semibold text-ink/80 mb-1.5">
          Enter your email for 1-click passwordless access
        </label>
        <div className="relative">
          <input
            id="magic-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-line bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-xs"
          />
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-lg border border-red-100 leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full relative flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-bg hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60 transition-all duration-200 shadow-sm"
      >
        {loading ? (
          <span>Signing in instantly...</span>
        ) : (
          <>
            <span>✨ 1-Click Instant Sign In</span>
          </>
        )}
      </button>
    </form>
  );
}
