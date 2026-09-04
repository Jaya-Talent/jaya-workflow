import { createFileRoute } from "@tanstack/react-router";
import { handleUploadCv } from "@/lib/applicants/api.server";

export const Route = createFileRoute("/api/applicants/$id/cv")({
  server: {
    handlers: {
      POST: async ({ params, request }) => handleUploadCv(params.id, request),
    },
  },
});
