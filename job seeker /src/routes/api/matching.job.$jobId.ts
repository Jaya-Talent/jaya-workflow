import { createFileRoute } from "@tanstack/react-router";
import { handleMatchJob } from "@/lib/matching/api.server";

export const Route = createFileRoute("/api/matching/job/$jobId")({
  server: {
    handlers: {
      POST: async ({ params, request }) => handleMatchJob(params.jobId, request),
    },
  },
});
