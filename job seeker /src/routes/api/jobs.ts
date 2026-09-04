import { createFileRoute } from "@tanstack/react-router";
import { handleCreateJob, handleListJobs } from "@/lib/jobs/api.server";

export const Route = createFileRoute("/api/jobs")({
  server: {
    handlers: {
      GET: async () => handleListJobs(),
      POST: async ({ request }) => handleCreateJob(request),
    },
  },
});
