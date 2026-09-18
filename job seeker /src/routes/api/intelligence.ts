import { createFileRoute } from "@tanstack/react-router";
import { getIntelligenceReportBySlug, getLatestIntelligenceReport, listIntelligenceArchives } from "@/lib/intelligence/reports-store.server";

export const Route = createFileRoute("/api/intelligence")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");
        const listArchives = url.searchParams.get("archives") === "true";
        const refresh = url.searchParams.get("refresh") === "true";

        const cacheHeader = refresh
          ? "no-cache, no-store, must-revalidate"
          : "public, s-maxage=300, stale-while-revalidate=600";

        if (listArchives) {
          const archives = await listIntelligenceArchives();
          return Response.json({ archives }, { headers: { "Cache-Control": cacheHeader } });
        }

        if (slug) {
          const report = await getIntelligenceReportBySlug(slug);
          return Response.json({ report }, { headers: { "Cache-Control": cacheHeader } });
        }

        const report = await getLatestIntelligenceReport(refresh);
        return Response.json({ report }, { headers: { "Cache-Control": cacheHeader } });
      },
    },
  },
});
