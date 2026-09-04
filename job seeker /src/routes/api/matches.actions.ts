import { createFileRoute } from "@tanstack/react-router";
import { handleMatchAction } from "@/lib/matching/api.server";

export const Route = createFileRoute("/api/matches/actions")({
  server: {
    handlers: {
      POST: async ({ request }) => handleMatchAction(request),
    },
  },
});
