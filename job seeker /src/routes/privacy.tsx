import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [{ title: `Privacy policy — ${SITE_NAME}` }],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader solid />
      <main className="px-5 py-16 sm:px-8 sm:py-24">
        <article className="mx-auto max-w-2xl">
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase">Legal</p>
          <h1 className="mt-3 font-serif text-5xl text-ink">Privacy policy</h1>
          <p className="mt-6 text-sm text-muted">Last updated {new Date().getFullYear()}</p>
          <div className="mt-10 space-y-6 text-base leading-relaxed text-ink">
            <p>
              {SITE_NAME} collects professional information so we can match job seekers with relevant
              opportunities. We only store what you submit through the profile form.
            </p>
            <h2 className="pt-4 font-serif text-3xl">What we collect</h2>
            <p>
              Name, email, optional contact links, career preferences, skills, location preferences,
              salary expectations, a short bio, and an optional CV. We also store the time your
              profile was created or updated, and a profile-completeness score.
            </p>
            <h2 className="pt-4 font-serif text-3xl">How we use it</h2>
            <p>
              Your information is used to operate the talent network: reviewing profiles, scoring
              matches against open roles, and contacting you about relevant opportunities through
              email or Telegram when you opt in. We do not sell applicant data.
            </p>
            <h2 className="pt-4 font-serif text-3xl">How it is stored</h2>
            <p>
              For this version of the product, applicant records, jobs, matches, notifications and
              interaction events are stored as structured files on our application server. Uploaded
              CVs are kept in a private directory and are not published. Access to the applicant
              list is restricted to authenticated administrators.
            </p>
            <h2 className="pt-4 font-serif text-3xl">How long we keep it</h2>
            <p>
              We keep your profile for as long as it is useful for matching, or until you ask us to
              delete it. You can request deletion by contacting us through the details on your
              confirmation screen or Telegram community.
            </p>
            <h2 className="pt-4 font-serif text-3xl">Your choices</h2>
            <p>
              Creating a profile is optional. Required fields are limited to identity basics and
              consent. You may leave other fields blank, though a fuller profile improves matching.
              You can change notification preferences, minimum match score, and channels from your
              matches page at any time.
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
