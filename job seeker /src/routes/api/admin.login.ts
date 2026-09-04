import { createFileRoute } from "@tanstack/react-router";
import { createAdminCookie, passwordsMatch } from "@/lib/applicants/admin-auth.server";

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
