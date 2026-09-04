import { createFileRoute } from "@tanstack/react-router";
import { handleAdminMatching } from "@/lib/matching/api.server";

export const Route = createFileRoute("/api/admin/matching")({
  server: {
    handlers: {
      GET: async ({ request }) => handleAdminMatching(request),
    },
  },
});
