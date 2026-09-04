import { createFileRoute } from "@tanstack/react-router";
import { clearAdminCookie } from "@/lib/applicants/admin-auth.server";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        Response.json({ ok: true }, { headers: { "set-cookie": clearAdminCookie(request.url) } }),
    },
  },
});
