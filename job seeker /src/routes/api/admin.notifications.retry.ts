import { createFileRoute } from "@tanstack/react-router";
import { handleRetryNotifications } from "@/lib/matching/api.server";

export const Route = createFileRoute("/api/admin/notifications/retry")({
  server: {
    handlers: {
      POST: async ({ request }) => handleRetryNotifications(request),
    },
  },
});
