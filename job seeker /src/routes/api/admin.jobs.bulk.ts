import { createFileRoute } from "@tanstack/react-router";
import { handleBulkCreateJobs } from "@/lib/jobs/api.server";

export const Route = createFileRoute("/api/admin/jobs/bulk")({
  server: {
    handlers: {
      POST: async ({ request }) => handleBulkCreateJobs(request),
    },
  },
});
