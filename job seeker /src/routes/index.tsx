import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Briefcase, Globe, Target } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui";
import { SITE_DESCRIPTION } from "@/lib/site";

export const Route = createFileRoute("/")({ component: Home });

const STEPS = [
  {
    n: "01",
    title: "Create your profile",
    body: "Share your background, skills and what you want next — it takes a few minutes.",
  },
  {
    n: "02",
    title: "Tell us what you're looking for",
    body: "Roles, locations, seniority and working style. The more we know, the better the match.",
  },
  {
    n: "03",
    title: "Get matched with relevant opportunities",
    body: "We use your profile to connect you with roles that actually fit — as they become available.",
  },
];

const REASONS = [
  {
    icon: Target,
    title: "Better job matching",
    body: "Structured skills and experience data means future matches start from who you actually are.",
  },
  {
    icon: Bell,
    title: "Relevant opportunity alerts",
    body: "Be first in line when a role aligns with your category, seniority and location preferences.",
  },
  {
    icon: Briefcase,
    title: "Roles that fit your experience",
    body: "From junior engineers to operators and executives — we route opportunities by real profile depth.",
  },
  {
    icon: Globe,
    title: "Remote and global opportunities",
    body: "Work from anywhere, or tell us the cities and regions that matter to you.",
  },
];

function Home() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main>
        <section className="relative px-5 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-36 overflow-hidden">
          <div className="absolute inset-0 bg-surface pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          <div className="mx-auto max-w-6xl relative z-10">
            <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">
              Exclusive Web3 Talent Network
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.05] text-ink sm:text-7xl">
              Elevate Your Career in
              <span className="mt-1 block italic text-accent">Web3 & Crypto</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{SITE_DESCRIPTION}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/apply">
                <Button size="lg" className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all">
                  Join the Network
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white border border-line hover:border-accent transition-colors">
                  Explore Roles
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-subtle">Join the network trusted by top VC-backed founders.</p>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-line px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase">Process</p>
            <h2 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">How it works</h2>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {STEPS.map((item) => (
                <article key={item.n} className="rounded-2xl bg-white border border-line hover:border-accent/30 p-6 shadow-sm hover:shadow-md transition-all sm:p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <span className="text-8xl font-black text-accent">{item.n}</span>
                  </div>
                  <p className="font-serif text-3xl text-accent relative z-10">{item.n}</p>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink relative z-10">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted relative z-10">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase">Why join</p>
            <h2 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">Why create a profile?</h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {REASONS.map((item) => (
                <article key={item.title} className="rounded-2xl bg-white border border-line hover:border-accent/30 p-6 shadow-sm hover:shadow-md transition-all sm:p-8 group">
                  <div className="inline-flex p-3 rounded-xl bg-surface-muted text-accent group-hover:scale-110 transition-transform">
                    <item.icon className="size-6" strokeWidth={2} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="consultation" className="px-5 pb-20 sm:px-8 sm:pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl bg-ink text-bg px-6 py-14 sm:px-12 sm:py-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
              
              <div className="relative z-10 text-center max-w-2xl mx-auto mb-12">
                <p className="text-sm font-bold tracking-[0.18em] text-accent uppercase">Expert Advisory & Sourcing</p>
                <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Consultation Services</h2>
                <p className="mt-4 text-sm sm:text-base text-bg/80 leading-relaxed">
                  Tailored career guidance for job seekers and dedicated talent sourcing solutions for Web3 employers.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 relative z-10">
                {/* Job Seekers Card */}
                <div id="job-seekers" className="rounded-2xl border border-bg/15 bg-bg/5 p-6 sm:p-8 flex flex-col justify-between backdrop-blur-sm">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-md bg-accent/20 px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
                      For Job Seekers
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-bg">Career Advisory & Prep</h3>
                    <p className="mt-3 text-sm text-bg/80 leading-relaxed">
                      Stand out to top crypto founders and recruiters with expert CV optimization and interview prep.
                    </p>
                    <ul className="mt-6 space-y-2.5 text-sm text-bg/90">
                      <li className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent font-bold text-xs shrink-0">✓</span>
                        CV review & resume optimization
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent font-bold text-xs shrink-0">✓</span>
                        Career strategy & salary consultation
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent font-bold text-xs shrink-0">✓</span>
                        Mock technical & behavioral interview prep
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent font-bold text-xs shrink-0">✓</span>
                        LinkedIn & Web3 profile optimization
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <a 
                      href="https://calendly.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-md border border-transparent bg-accent px-4 py-3 text-sm font-semibold text-ink hover:bg-accent/90 transition-colors"
                    >
                      Book Candidate Session
                    </a>
                    <a 
                      href="mailto:marketing@jayatalent.com?subject=Job%20Seeker%20Consultation%20Inquiry"
                      className="text-center rounded-md border border-bg/30 px-4 py-3 text-sm font-medium text-bg hover:bg-bg/10 transition-colors"
                    >
                      Email Us
                    </a>
                  </div>
                </div>

                {/* Employers Card */}
                <div id="employers" className="rounded-2xl border border-bg/15 bg-bg/5 p-6 sm:p-8 flex flex-col justify-between backdrop-blur-sm">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-md bg-bg/20 px-3 py-1 text-xs font-semibold text-bg uppercase tracking-wider mb-4">
                      For Employers
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-bg">Talent Sourcing & Support</h3>
                    <p className="mt-3 text-sm text-bg/80 leading-relaxed">
                      Partner with Jaya Talent to source vetted, high-quality candidates perfectly matched to your team.
                    </p>
                    <ul className="mt-6 space-y-2.5 text-sm text-bg/90">
                      <li className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent font-bold text-xs shrink-0">✓</span>
                        Job posting & passive candidate sourcing
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent font-bold text-xs shrink-0">✓</span>
                        Vetted candidate matching & technical screening
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent font-bold text-xs shrink-0">✓</span>
                        Recruitment consultation & hiring support
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent font-bold text-xs shrink-0">✓</span>
                        Long-term talent pipeline building
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <a 
                      href="https://calendly.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-md border border-transparent bg-accent px-4 py-3 text-sm font-semibold text-ink hover:bg-accent/90 transition-colors"
                    >
                      Book Employer Session
                    </a>
                    <a 
                      href="mailto:marketing@jayatalent.com?subject=Employer%20Sourcing%20Inquiry"
                      className="text-center rounded-md border border-bg/30 px-4 py-3 text-sm font-medium text-bg hover:bg-bg/10 transition-colors"
                    >
                      Email Sourcing Team
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8">
          <div className="mx-auto max-w-6xl rounded-3xl bg-surface-muted border border-line px-6 py-14 text-center sm:px-16 sm:py-20 relative overflow-hidden">
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl text-ink relative z-10">
              Your next Web3 opportunity is waiting.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted relative z-10">
              Create a profile once. We'll use it to introduce you to roles that match your experience,
              skills, and career goals with top-tier Web3 startups.
            </p>
            <Link to="/apply" className="mt-8 inline-flex relative z-10">
              <Button size="lg" className="shadow-sm hover:shadow-md transition-shadow">
                Join Jaya Talent
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
