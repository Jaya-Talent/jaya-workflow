import { categoryLabel } from "../matching/config.ts";
import type { Job, StoredMatch } from "../matching/types.ts";
import type { Applicant } from "../applicants/types.ts";

function salaryLine(job: Job) {
  if (!job.salary_min && !job.salary_max) return "";
  const currency = job.salary_currency || "USD";
  if (job.salary_min && job.salary_max) return `${currency} ${job.salary_min}–${job.salary_max}`;
  return `${currency} ${job.salary_min || job.salary_max}`;
}

export function telegramMatchText(applicant: Applicant, job: Job, match: StoredMatch) {
  const salary = salaryLine(job);
  const why = match.matched_skills.slice(0, 4).map((skill) => `✅ ${skill}`).join("\n");
  const gaps = match.partial_skills.slice(0, 2).map((skill) => `⚠️ ${skill} is preferred`).join("\n");
  return [
    `🚨 ${match.match_score}% Match — ${job.title}`,
    `🏢 ${job.company}`,
    `🌍 ${job.remote === "remote" ? "Remote" : job.location}`,
    salary ? `💰 ${salary}` : "",
    job.seniority ? `🧑‍💻 ${job.seniority}` : "",
    "",
    "Why you match",
    why || "✅ Profile alignment",
    gaps,
    "",
    `Match: ${match.match_score}% · ${categoryLabel(match.score_category)}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function emailSubject(job: Job, score: number) {
  return `New Job Match: ${job.title} — ${score}% Match`;
}

export function emailHtml(applicant: Applicant, job: Job, match: StoredMatch, viewUrl: string) {
  const salary = salaryLine(job) || "Not listed";
  const matched = match.matched_skills.map((skill) => `✓ ${skill}`).join("<br/>") || "✓ Profile alignment";
  const gaps = match.partial_skills.length
    ? match.partial_skills.map((skill) => `${skill} is preferred.`).join("<br/>")
    : "None noted.";
  const first = applicant.full_name.split(" ")[0] || "there";
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f6f4f1;font-family:Arial,sans-serif;color:#1a1523;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <p style="letter-spacing:0.16em;text-transform:uppercase;color:#5c3dcc;font-size:12px;font-weight:600;">Meridian</p>
    <h1 style="font-size:24px;line-height:1.3;margin:8px 0 16px;">Hi ${escapeHtml(first)},</h1>
    <p style="color:#6b6578;font-size:15px;line-height:1.6;">We found a new opportunity that closely matches your profile.</p>
    <div style="background:#ffffff;border-radius:16px;padding:20px;margin:20px 0;box-shadow:0 0 0 1px rgba(26,21,35,0.06);">
      <h2 style="margin:0 0 8px;font-size:20px;">${escapeHtml(job.title)}</h2>
      <p style="margin:0;color:#6b6578;font-size:14px;line-height:1.7;">
        Company: ${escapeHtml(job.company)}<br/>
        Location: ${escapeHtml(job.remote === "remote" ? "Remote" : job.location)}<br/>
        Salary: ${escapeHtml(salary)}<br/>
        Experience: ${escapeHtml(job.seniority || "—")}
      </p>
      <p style="margin:16px 0 8px;font-size:16px;"><strong>Your Match: ${match.match_score}%</strong></p>
      <p style="margin:0;font-size:14px;line-height:1.7;"><strong>Why it matches:</strong><br/>${matched}</p>
      <p style="margin:12px 0 0;font-size:14px;color:#6b6578;"><strong>Potential gap:</strong><br/>${gaps}</p>
    </div>
    <p><a href="${escapeHtml(viewUrl)}" style="display:inline-block;background:#5c3dcc;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:600;">View Job & Apply</a></p>
    <p style="color:#8c8796;font-size:12px;line-height:1.6;">You can update your preferences at any time to improve your recommendations.</p>
  </div>
</body>
</html>`;
}

export function digestSubject(count: number, period: "today" | "this week") {
  return `Your Top ${Math.min(count, 5)} Job Matches ${period === "today" ? "Today" : "This Week"}`;
}

export function digestHtml(
  applicant: Applicant,
  items: Array<{ job: Job; match: StoredMatch }>,
  total: number,
  viewAllUrl: string,
  period: "today" | "this week",
) {
  const first = applicant.full_name.split(" ")[0] || "there";
  const rows = items
    .slice(0, 5)
    .map(
      (item, index) =>
        `<p style="margin:8px 0;font-size:15px;">${index + 1}. ${escapeHtml(item.job.title)} — <strong>${item.match.match_score}%</strong></p>`,
    )
    .join("");
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f6f4f1;font-family:Arial,sans-serif;color:#1a1523;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <p style="letter-spacing:0.16em;text-transform:uppercase;color:#5c3dcc;font-size:12px;font-weight:600;">Meridian</p>
    <h1 style="font-size:24px;margin:8px 0 16px;">Hi ${escapeHtml(first)},</h1>
    <p style="color:#6b6578;font-size:15px;line-height:1.6;">We found ${total} jobs matching your profile ${period}.</p>
    <div style="background:#ffffff;border-radius:16px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:600;">Your strongest matches:</p>
      ${rows}
    </div>
    <p><a href="${escapeHtml(viewAllUrl)}" style="display:inline-block;background:#5c3dcc;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:600;">View All Matches</a></p>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return [...value]
    .map((ch) => {
      if (ch === "&") return "&" + "amp;";
      if (ch === "<") return "&" + "lt;";
      if (ch === ">") return "&" + "gt;";
      if (ch === '"') return "&" + "quot;";
      return ch;
    })
    .join("");
}
