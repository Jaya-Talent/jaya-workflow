import { createFileRoute, redirect, Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import { Button } from "../components/ui.tsx";
import { SiteHeader, SiteFooter } from "../components/site-chrome.tsx";

const getProfileLoaderData = createServerFn({ method: "GET" })
  .handler(async ({ request }) => {
    const { auth } = await import("../lib/auth/server.ts");
    const { getApplicantRepository } = await import("../lib/applicants/sql-repository.server.ts");

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return { user: null, applicant: null };
    }

    const repo = getApplicantRepository();
    const applicant = await repo.findApplicantByEmail(session.user.email);

    return { user: session.user, applicant };
  });

export const Route = createFileRoute("/profile")({
  loader: async ({ request }) => {
    const data = await getProfileLoaderData({ request });

    if (!data.user) {
      throw redirect({ to: "/sign-in" });
    }

    return data;
  },
  component: ProfileDashboard,
});

function ProfileDashboard() {
  const { user, applicant } = Route.useLoaderData();
  const router = useRouter();

  // Notification state
  const [telegram, setTelegram] = useState(applicant?.telegram_notifications ?? true);
  const [emailNotif, setEmailNotif] = useState(applicant?.email_notifications ?? true);
  const [frequency, setFrequency] = useState(applicant?.notification_frequency || "weekly");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState("");

  const cvInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvMessage, setCvMessage] = useState("");

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicant) return;
    setSavingPrefs(true);
    setPrefsMessage("");

    try {
      const res = await fetch(`/api/applicants/${applicant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_notifications: telegram,
          email_notifications: emailNotif,
          notification_frequency: frequency,
        }),
      });
      if (res.ok) {
        setPrefsMessage("Preferences updated successfully");
        router.invalidate();
      } else {
        setPrefsMessage("Failed to update preferences");
      }
    } catch (error) {
      setPrefsMessage("Error updating preferences");
    }
    setSavingPrefs(false);
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!applicant || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingCv(true);
    setCvMessage("");

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const res = await fetch(`/api/applicants/${applicant.id}/cv`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setCvMessage("CV uploaded successfully");
        router.invalidate();
      } else {
        setCvMessage("Failed to upload CV");
      }
    } catch (error) {
      setCvMessage("Error uploading CV");
    }
    setUploadingCv(false);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-ink">
      <SiteHeader solid />
      
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <h1 className="text-4xl font-serif mb-8">Hello, {user.name}</h1>
        
        {!applicant ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center backdrop-blur-sm shadow-xs space-y-4">
            <div className="mx-auto size-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-950 font-serif">Profile Completeness Below Minimum (0%)</h2>
              <p className="mt-2 text-sm text-amber-900/80 max-w-lg mx-auto leading-relaxed">
                Your profile completeness is currently <strong>0%</strong>, which is below the <strong>50% minimum requirement</strong> to view tailored job matches. Please complete your Web3 talent application to unlock personalized matches.
              </p>
            </div>
            <div className="pt-2">
              <Link 
                to="/apply" 
                className="inline-flex justify-center items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-bg hover:bg-ink/90 transition-all shadow-sm"
              >
                Complete Profile Now &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <section className="rounded-2xl border border-line p-6 bg-white/70 backdrop-blur-sm shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold font-serif">Profile Overview</h2>
                  <Link to="/apply" className="text-sm font-medium hover:underline text-accent">
                    Edit Profile
                  </Link>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted block uppercase tracking-wider">Full Name</span>
                    <span className="font-medium text-ink">{applicant.full_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block uppercase tracking-wider">Email</span>
                    <span className="font-medium text-ink">{applicant.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block uppercase tracking-wider">Experience</span>
                    <span className="font-medium text-ink">{applicant.experience_level} ({applicant.years_experience} years)</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block uppercase tracking-wider">Profile Completeness</span>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${applicant.profile_completion >= 50 ? "bg-emerald-600" : "bg-amber-500"}`} 
                          style={{ width: `${applicant.profile_completion}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-ink">{applicant.profile_completion}%</span>
                    </div>
                  </div>

                  {applicant.profile_completion < 50 ? (
                    <div className="pt-4 mt-4 border-t border-line space-y-2">
                      <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
                        <span className="text-base shrink-0">⚠️</span>
                        <span>
                          Profile completeness (<strong>{applicant.profile_completion}%</strong>) is below the <strong>50% minimum threshold</strong> required to view tailored job matches.
                        </span>
                      </div>
                      <Link
                        to="/apply"
                        className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        Fill up profile to 50%+ to unlock matches &rarr;
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-4 mt-4 border-t border-line">
                      <Link
                        to="/profile/$id"
                        params={{ id: applicant.id }}
                        className="text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
                      >
                        View your job matches &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-line p-6 bg-white/70 backdrop-blur-sm shadow-sm">
                <h2 className="text-xl font-bold mb-4 font-serif">Resume / CV</h2>
                <div className="space-y-4">
                  {applicant.cv_filename ? (
                    <div className="flex items-center justify-between p-3 border border-line rounded-xl bg-white">
                      <span className="text-sm truncate mr-4 text-ink">{applicant.cv_filename}</span>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Uploaded</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">No CV uploaded yet.</p>
                  )}
                  
                  <div>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      className="hidden" 
                      ref={cvInputRef}
                      onChange={handleCvUpload}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => cvInputRef.current?.click()}
                      disabled={uploadingCv}
                      className="rounded-full"
                    >
                      {uploadingCv ? "Uploading..." : "Upload New CV"}
                    </Button>
                    {cvMessage && <p className="text-sm mt-2 text-muted">{cvMessage}</p>}
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section className="rounded-2xl border border-line p-6 bg-white/70 backdrop-blur-sm shadow-sm">
                <h2 className="text-xl font-bold mb-4 font-serif">Notification Preferences</h2>
                <form onSubmit={handleSavePrefs} className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailNotif} 
                      onChange={(e) => setEmailNotif(e.target.checked)}
                      className="w-4 h-4 rounded border-line text-ink focus:ring-accent"
                    />
                    <span className="text-sm font-medium">Email Notifications</span>
                  </label>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={telegram} 
                        onChange={(e) => setTelegram(e.target.checked)}
                        className="w-4 h-4 rounded border-line text-ink focus:ring-accent"
                      />
                      <span className="text-sm font-medium">Telegram Notifications</span>
                    </label>
                    {telegram && !applicant.telegram_chat_id && (
                      <div className="pl-7 mt-1">
                        <a 
                          href="https://t.me/TechJobsme" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-accent hover:underline font-medium"
                        >
                          Connect Telegram Bot &rarr;
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Frequency</label>
                    <select 
                      value={frequency} 
                      onChange={(e) => setFrequency(e.target.value as "instant" | "daily" | "weekly")}
                      className="block w-full rounded-xl border border-line py-2.5 pl-3 pr-10 text-ink ring-1 ring-transparent focus:ring-accent sm:text-sm bg-white"
                    >
                      <option value="instant">Instant Match</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={savingPrefs} className="rounded-full">
                      {savingPrefs ? "Saving..." : "Save Preferences"}
                    </Button>
                    {prefsMessage && <span className="ml-3 text-sm text-muted">{prefsMessage}</span>}
                  </div>
                </form>
              </section>

              <section className="rounded-2xl border border-line p-6 bg-white/70 backdrop-blur-sm shadow-sm">
                <h2 className="text-xl font-bold mb-3 font-serif">Consultation Services</h2>
                <p className="text-sm text-muted mb-4 leading-relaxed">
                  Need help standing out? Our experts can help you optimize your CV, prepare for interviews, and strategize your job search.
                </p>
                <div className="space-y-3">
                  <a 
                    href="https://calendly.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-bg hover:bg-ink/90 transition-colors shadow-xs"
                  >
                    Book a Consultation via Calendly
                  </a>
                  <a 
                    href="mailto:marketing@jayatalent.com?subject=Consultation%20Inquiry"
                    className="block w-full text-center rounded-full border border-line px-4 py-2.5 text-sm font-medium hover:bg-surface transition-colors"
                  >
                    Email us at marketing@jayatalent.com
                  </a>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

