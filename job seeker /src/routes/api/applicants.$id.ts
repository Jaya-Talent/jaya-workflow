import { createFileRoute } from "@tanstack/react-router";
import { handleGetApplicant, handlePatchApplicant } from "@/lib/applicants/api.server";

export const Route = createFileRoute("/api/applicants/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => handleGetApplicant(params.id),
      PATCH: async ({ params, request }) => handlePatchApplicant(params.id, request),
    },
  },
});
