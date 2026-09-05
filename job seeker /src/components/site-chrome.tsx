import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X, User, LogOut, LogIn, Sparkles, Briefcase, ChevronRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import { readStoredProfileId } from "@/lib/jobs/format";
import { authClient } from "@/lib/auth/client.ts";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [profileId, setProfileId] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    setProfileId(readStoredProfileId());
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.state.location.pathname]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.invalidate();
  };

  return (
    <header
      className={
        solid
          ? "sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-xl transition-colors"
          : "absolute inset-x-0 top-0 z-40 bg-transparent transition-colors"
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted lg:gap-8 md:flex">
          <Link
            to="/jobs"
            className="hover:text-ink transition-colors flex items-center gap-1.5"
            activeProps={{ className: "text-ink font-semibold" }}
          >
            Jobs
          </Link>
          <Link
            to="/services"
            className="hover:text-ink transition-colors flex items-center gap-1.5 text-accent font-medium"
            activeProps={{ className: "text-accent font-bold" }}
          >
            Consultation
          </Link>
          <a
            href="https://www.jayatalent.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            Companies
          </a>
          <a
            href="https://www.jayatalent.com/candidates"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            Community
          </a>
          <a
            href="https://www.jayatalent.com/team"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            Team
          </a>
          {profileId && !session?.user && (
            <Link
              to="/profile/$id"
              params={{ id: profileId }}
              className="hover:text-ink transition-colors"
            >
              My Matches
            </Link>
          )}
          {session?.user && (
            <Link
              to="/profile"
              className="hover:text-ink transition-colors font-semibold text-ink"
              activeProps={{ className: "text-accent font-bold" }}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Header Action Buttons */}
        <div className="hidden items-center gap-3 md:flex shrink-0">
          {!session?.user ? (
            <>
              <Link
                to="/sign-in"
                className="px-3.5 py-2 text-sm font-medium text-muted hover:text-ink transition-colors rounded-lg hover:bg-surface-muted"
              >
                Log In
              </Link>
              <Link to="/apply">
                <Button size="sm" className="shadow-sm hover:shadow-md transition-all gap-1.5 rounded-full px-5">
                  Create profile
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile">
                <Button size="sm" className="shadow-sm hover:shadow-md transition-all bg-accent text-white hover:bg-accent-hover border-transparent rounded-full px-5 gap-1.5 font-semibold">
                  <User className="size-3.5" />
                  My Profile
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSignOut}
                className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                title="Sign Out"
              >
                <LogOut className="size-3.5" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          {!session?.user ? (
            <Link to="/apply">
              <Button size="sm" className="rounded-full px-4 text-xs">
                Create profile
              </Button>
            </Link>
          ) : (
            <Link to="/profile">
              <Button size="sm" className="rounded-full px-3 text-xs bg-accent text-ink">
                Profile
              </Button>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-white/80 p-2 text-ink shadow-xs hover:bg-surface focus:outline-none transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-line bg-white/95 p-6 backdrop-blur-2xl shadow-lift md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4 text-base font-medium">
            <Link
              to="/jobs"
              className="flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-surface-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-3">
                <Briefcase className="size-5 text-accent" /> Jobs Directory
              </span>
              <ChevronRight className="size-4 text-subtle" />
            </Link>

            <Link
              to="/services"
              className="flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-surface-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-3 text-accent font-semibold">
                Consultation Services
              </span>
              <ChevronRight className="size-4 text-subtle" />
            </Link>

            <a
              href="https://www.jayatalent.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-surface-muted transition-colors"
            >
              <span>Companies</span>
              <ChevronRight className="size-4 text-subtle" />
            </a>

            <a
              href="https://www.jayatalent.com/candidates"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-surface-muted transition-colors"
            >
              <span>Community</span>
              <ChevronRight className="size-4 text-subtle" />
            </a>

            <a
              href="https://www.jayatalent.com/team"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-surface-muted transition-colors"
            >
              <span>Team</span>
              <ChevronRight className="size-4 text-subtle" />
            </a>

            {session?.user && (
              <Link
                to="/profile"
                className="flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-surface-muted transition-colors font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <User className="size-5 text-accent" /> My Profile Dashboard
                </span>
                <ChevronRight className="size-4 text-subtle" />
              </Link>
            )}

            <div className="my-2 border-t border-line" />

            {/* Mobile Auth Actions */}
            {!session?.user ? (
              <div className="flex flex-col gap-3 pt-1">
                <Link
                  to="/apply"
                  className="block w-full text-center rounded-xl bg-ink py-3 text-sm font-semibold text-bg shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Profile
                </Link>
                <Link
                  to="/sign-in"
                  className="block w-full text-center rounded-xl border border-line py-3 text-sm font-medium text-ink hover:bg-surface"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4" /> Sign Out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-muted relative overflow-hidden py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 sm:flex-row sm:justify-between sm:px-8 relative z-10">
        
        {/* Column 1: Brand & Info */}
        <div className="flex flex-col gap-4 max-w-xs">
          <h3 className="text-xl font-bold text-ink">Jaya Talent</h3>
          <p className="text-sm text-muted">
            We are here to make the world a better place for humanity
          </p>
          <p className="text-sm text-muted mt-2">
            HQ: Dubai
          </p>
          <div className="mt-8 text-sm text-muted">
            © {new Date().getFullYear()} by Jaya Talent
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="flex flex-wrap gap-12 sm:gap-20">
          
          {/* Column 2: Menu */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-ink mb-1">Menu</h4>
            <a href="https://www.jayatalent.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Companies</a>
            <a href="https://www.jayatalent.com/candidates" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Community</a>
            <a href="https://www.jayatalent.com/team" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Team</a>
            <a href="https://www.jayatalent.com/meditation" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Meditation</a>
            <a href="https://www.jayatalent.com/zhannamanzyk" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Our CEO</a>
            <Link to="/jobs" className="text-sm text-muted hover:text-accent transition-colors">Jobs</Link>
            <Link to="/services" className="text-sm text-muted hover:text-accent transition-colors">Consultation Services</Link>
            <Link to="/apply" className="text-sm text-muted hover:text-accent transition-colors">Create Profile</Link>
          </div>

          {/* Column 3: Policy */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-ink mb-1">Policy</h4>
            <a href="https://www.jayatalent.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Privacy Policy</a>
            <a href="https://www.jayatalent.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Term & Conditions</a>
            <a href="https://www.jayatalent.com/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Cookie Policy</a>
          </div>

          {/* Column 4: Social */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-ink mb-1">Social</h4>
            <a href="https://www.linkedin.com/company/jayatalent/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Linkedin</a>
            <a href="https://www.instagram.com/jaya_talent/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Instagram</a>
            <a href="https://www.youtube.com/channel/UCycN9WorUCr72kFA-JbHVTA" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Youtube</a>
            <a href="https://twitter.com/JayaTalent" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-accent transition-colors">X</a>
          </div>

        </div>
      </div>
    </footer>
  );
}
