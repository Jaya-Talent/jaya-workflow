import { createFileRoute } from "@tanstack/react-router";
import { handleAdminJobs } from "@/lib/jobs/api.server";

export const Route = createFileRoute("/api/admin/jobs")({
  server: {
    handlers: {
      GET: async ({ request }) => handleAdminJobs(request),
    },
  },
});
