import { createFileRoute } from "@tanstack/react-router";
import { handleDownloadCv } from "@/lib/applicants/api.server";

export const Route = createFileRoute("/api/admin/applicants/$id/cv")({
  server: {
    handlers: {
      GET: async ({ params, request }) => handleDownloadCv(params.id, request),
    },
  },
});
