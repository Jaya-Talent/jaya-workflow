import { createFileRoute } from "@tanstack/react-router";
import { ensureMatchingWorker } from "@/lib/workers/matching-worker.server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        ensureMatchingWorker();
        return Response.json({
          ok: true,
          status: "healthy",
          timestamp: new Date().toISOString(),
        });
      },
    },
  },
});
