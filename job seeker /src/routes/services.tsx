import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, User, Building2, Calendar, Mail, ArrowRight, Award, Compass, FileText, Users } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui";

export const Route = createFileRoute("/services")({ component: ServicesPage });

const JOB_SEEKER_OFFERINGS = [
  {
    icon: FileText,
    title: "CV Review & Optimization",
    description: "Transform your resume into a high-impact narrative highlighting your Web3 achievements, protocol contributions, and technical depth.",
  },
  {
    icon: Compass,
    title: "Career Consultation & Strategy",
    description: "One-on-one advisory session to map out your career progression, token compensation benchmarks, and ideal team transitions.",
  },
  {
    icon: Award,
    title: "Interview Preparation",
    description: "Mock technical and operational interviews with experienced Web3 recruitment specialists to ensure you communicate value effectively.",
  },
  {
    icon: Users,
    title: "LinkedIn & Profile Optimization",
    description: "Optimize your LinkedIn, GitHub, and Jaya Talent profile so top VC-backed founders and talent partners reach out to you first.",
  },
];

const EMPLOYER_OFFERINGS = [
  {
    icon: Users,
    title: "Job Posting & Talent Sourcing",
    description: "Tap into our private network of pre-screened Web3 engineers, researchers, operators, and executives.",
  },
  {
    icon: CheckCircle2,
    title: "Candidate Matching & Vetting",
    description: "Rigorous technical and cultural screening tailored to your specific protocol, chain ecosystem, or product architecture.",
  },
  {
    icon: Compass,
    title: "Recruitment Consultation & Hiring Support",
    description: "Full-cycle recruitment advisory, compensation benchmarking, and hiring strategy designed for fast-growing crypto startups.",
  },
  {
    icon: Building2,
    title: "Talent Pipeline Building",
    description: "Establish an ongoing pool of qualified Web3 talent ready to deploy as your protocol scales to new milestones.",
  },
];

function ServicesPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-surface text-ink">
      <SiteHeader solid />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-5 py-20 sm:px-8 sm:py-28 overflow-hidden bg-surface">
          <div className="absolute top-0 left-0 right-0 h-[400px] bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          <div className="mx-auto max-w-6xl text-center relative z-10">
            <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">
              Expert Advisory & Recruitment
            </p>
            <h1 className="mt-4 font-serif text-5xl sm:text-6xl lg:text-7xl text-ink leading-tight">
              Consultation Services
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted leading-relaxed">
              Whether you are a Web3 professional aiming for your next career milestone or a crypto protocol building an elite team, we provide personalized guidance and talent solutions.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="#job-seekers" className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors">
                <User className="size-4" /> For Job Seekers
              </a>
              <a href="#employers" className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/10 transition-colors">
                <Building2 className="size-4" /> For Employers
              </a>
            </div>
          </div>
        </section>

        {/* Section 1: For Job Seekers */}
        <section id="job-seekers" className="px-5 py-20 sm:px-8 sm:py-24 border-t border-line bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="inline-flex items-center gap-2 rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
                  <User className="size-3.5" /> For Candidates & Job Seekers
                </span>
                <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-ink">
                  Accelerate Your Web3 Career
                </h2>
                <p className="mt-3 max-w-xl text-base text-muted">
                  Get personalized support from industry experts to refine your profile, pass interviews, and secure top-tier roles.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a
                  href="https://calendly.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-ink hover:bg-accent/90 transition-colors shadow-sm"
                >
                  <Calendar className="size-4" /> Book Candidate Session
                </a>
                <a
                  href="mailto:marketing@jayatalent.com?subject=Job%20Seeker%20Consultation%20Inquiry"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-5 py-3 text-sm font-medium text-ink hover:bg-surface transition-colors"
                >
                  <Mail className="size-4" /> Email Us
                </a>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {JOB_SEEKER_OFFERINGS.map((item) => (
                <div key={item.title} className="rounded-2xl border border-line bg-surface p-6 hover:shadow-md hover:border-accent/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="inline-flex p-3 rounded-xl bg-accent/10 text-accent mb-5">
                      <item.icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-2">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: For Employers */}
        <section id="employers" className="px-5 py-20 sm:px-8 sm:py-24 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="inline-flex items-center gap-2 rounded-md bg-ink text-bg px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  <Building2 className="size-3.5" /> For Companies & Employers
                </span>
                <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-ink">
                  Build & Scale Your Team
                </h2>
                <p className="mt-3 max-w-xl text-base text-muted">
                  Partner with Jaya Talent for specialized Web3 talent acquisition, executive search, and recruitment strategy.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a
                  href="https://calendly.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-bg hover:bg-ink/90 transition-colors shadow-sm"
                >
                  <Calendar className="size-4" /> Book Employer Consultation
                </a>
                <a
                  href="mailto:marketing@jayatalent.com?subject=Employer%20Sourcing%20Inquiry"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-5 py-3 text-sm font-medium text-ink hover:bg-surface transition-colors"
                >
                  <Mail className="size-4" /> Email Sourcing Team
                </a>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {EMPLOYER_OFFERINGS.map((item) => (
                <div key={item.title} className="rounded-2xl border border-line bg-white p-6 hover:shadow-md hover:border-ink/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="inline-flex p-3 rounded-xl bg-ink/5 text-ink mb-5">
                      <item.icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-2">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Banner */}
        <section className="px-5 py-16 sm:px-8 border-t border-line bg-ink text-bg">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-serif text-3xl sm:text-4xl">Ready to take the next step?</h2>
            <p className="mt-4 text-sm sm:text-base text-bg/80 max-w-lg mx-auto">
              Schedule a call with our advisory team or email us directly at marketing@jayatalent.com
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <a
                href="https://calendly.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-ink hover:bg-accent/90 transition-colors"
              >
                Schedule via Calendly <ArrowRight className="size-4" />
              </a>
              <a
                href="mailto:marketing@jayatalent.com"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-bg/30 px-6 py-3 text-sm font-medium text-bg hover:bg-bg/10 transition-colors"
              >
                marketing@jayatalent.com
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
