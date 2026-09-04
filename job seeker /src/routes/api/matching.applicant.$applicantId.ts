import { createFileRoute } from "@tanstack/react-router";
import { handleMatchApplicant } from "@/lib/matching/api.server";

export const Route = createFileRoute("/api/matching/applicant/$applicantId")({
  server: {
    handlers: {
      POST: async ({ params, request }) => handleMatchApplicant(params.applicantId, request),
    },
  },
});
