import { createFileRoute } from "@tanstack/react-router";
import { handleCreateApplicant } from "@/lib/applicants/api.server";

export const Route = createFileRoute("/api/applicants")({
  server: {
    handlers: {
      POST: async ({ request }) => handleCreateApplicant(request),
    },
  },
});
