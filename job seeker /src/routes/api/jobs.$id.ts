import { createFileRoute } from "@tanstack/react-router";
import { handleGetJob } from "@/lib/jobs/api.server";

export const Route = createFileRoute("/api/jobs/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => handleGetJob(params.id),
    },
  },
});
