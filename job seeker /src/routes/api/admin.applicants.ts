import { createFileRoute } from "@tanstack/react-router";
import { handleListApplicants } from "@/lib/applicants/api.server";

export const Route = createFileRoute("/api/admin/applicants")({
  server: {
    handlers: {
      GET: async ({ request }) => handleListApplicants(request),
    },
  },
});
