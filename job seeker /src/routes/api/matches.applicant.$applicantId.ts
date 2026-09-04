import { createFileRoute } from "@tanstack/react-router";
import { handleApplicantMatches } from "@/lib/matching/api.server";

export const Route = createFileRoute("/api/matches/applicant/$applicantId")({
  server: {
    handlers: {
      GET: async ({ params }) => handleApplicantMatches(params.applicantId),
    },
  },
});
