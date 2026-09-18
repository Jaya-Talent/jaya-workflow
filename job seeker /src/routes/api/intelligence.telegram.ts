import { createFileRoute } from "@tanstack/react-router";
import { getLatestIntelligenceReport } from "@/lib/intelligence/reports-store.server";

export const Route = createFileRoute("/api/intelligence/telegram")({
  server: {
    handlers: {
      GET: async () => {
        const report = await getLatestIntelligenceReport();
        return new Response(report.telegramSummary, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        });
      },
    },
  },
});
