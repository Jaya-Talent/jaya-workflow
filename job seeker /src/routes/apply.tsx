import { createFileRoute } from "@tanstack/react-router";
import { ApplyWizard } from "@/components/apply/apply-wizard";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/apply")({
  component: ApplyPage,
  head: () => ({
    meta: [{ title: "Create your job profile — Meridian" }],
  }),
});

function ApplyPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader solid />
      <main className="px-5 py-10 sm:px-8 sm:py-16">
        <ApplyWizard />
      </main>
      <SiteFooter />
    </div>
  );
}
