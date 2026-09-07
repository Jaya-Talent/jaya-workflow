import { createFileRoute } from "@tanstack/react-router";
import { createAdminCookie, passwordsMatch } from "@/lib/applicants/admin-auth.server";
import { checkRateLimit } from "@/lib/rate-limit.server";

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
        const rl = checkRateLimit(`admin-login:${clientIp}`, 5, 60_000);
        if (!rl.success) {
          return Response.json(
            { error: "Too many login attempts. Please wait a minute and try again." },
            { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
          );
        }

        const body = (await request.json().catch(() => null)) as { password?: string } | null;
        if (!body?.password || !passwordsMatch(body.password)) {
          return Response.json({ error: "Incorrect password." }, { status: 401 });
        }
        return Response.json(
          { ok: true },
          { headers: { "set-cookie": createAdminCookie(request.url) } },
        );
      },
    },
  },
});
