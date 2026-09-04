import { createFileRoute } from "@tanstack/react-router";
import { handleJobMatches } from "@/lib/matching/api.server";

export const Route = createFileRoute("/api/matches/job/$jobId")({
  server: {
    handlers: {
      GET: async ({ params, request }) => handleJobMatches(params.jobId, request),
    },
  },
});
