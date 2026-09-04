import { createFileRoute } from "@tanstack/react-router";
import { handleMatchRun } from "@/lib/matching/api.server";

export const Route = createFileRoute("/api/matching/run")({
  server: {
    handlers: {
      POST: async ({ request }) => handleMatchRun(request),
    },
  },
});
