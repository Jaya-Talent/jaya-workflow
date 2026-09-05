import { createFileRoute } from "@tanstack/react-router";
import { handleAdminAnalytics } from "@/lib/analytics/analytics.server";

export const Route = createFileRoute("/api/admin/analytics")({
  server: {
    handlers: {
      GET: async ({ request }) => handleAdminAnalytics(request),
    },
  },
});
