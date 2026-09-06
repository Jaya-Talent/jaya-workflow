import type { Category, Job } from "@/data/dashboard";

export function formatIndividualTelegramPost(category: Category, job: Job): string {
  const lines: string[] = [
    `**Open Roles**`,
    "",
    `💼 **${job.title}** at **${job.company}**`,
    `📍 Location: ${job.location}`,
    `🔗 [Apply Now](${job.link})`,
  ];
  lines.push("", "— jayatalent.com - your trusted hiring partner");
  return `${lines.join("\n").trim()}\n`;
}

export function formatIndividualTelegramHtml(category: Category, job: Job): string {
  const lines: string[] = [
    `<strong>Open Roles</strong>`,
    "",
    `💼 <strong>${job.title}</strong> at <strong>${job.company}</strong>`,
    `📍 Location: ${job.location}`,
    `🔗 <a href="${job.link}">Apply Now</a>`,
  ];
  lines.push("", "— jayatalent.com - your trusted hiring partner");
  return lines.join("<br>");
}

export function formatTelegramPost(category: Category): string {
  const jobs = category.jobs.slice(0, 5);

  const lines: string[] = [
    `**Open Roles**`,
    "",
  ];

  for (const job of jobs) {
    lines.push(`${job.num}. **${job.title}** at **${job.company}**`);
    lines.push(`Location: ${job.location}`);
    lines.push(`Apply: [Apply Now](${job.link})`);
    lines.push("");
  }

  lines.push("— jayatalent.com - your trusted hiring partner");
  return `${lines.join("\n").trim()}\n`;
}

export function formatTelegramHtml(category: Category): string {
  const jobs = category.jobs.slice(0, 5);

  const lines: string[] = [
    `<strong>Open Roles</strong>`,
    "",
  ];

  for (const job of jobs) {
    lines.push(`${job.num}. <strong>${job.title}</strong> at <strong>${job.company}</strong>`);
    lines.push(`Location: ${job.location}`);
    lines.push(`Apply: <a href="${job.link}">Apply Now</a>`);
    lines.push("");
  }

  lines.push("— jayatalent.com - your trusted hiring partner");
  return lines.join("<br>");
}

function fallbackCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.width = "1px";
  area.style.height = "1px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

export async function copyText(text: string, html?: string): Promise<boolean> {
  if (html && typeof navigator !== "undefined" && navigator.clipboard && typeof ClipboardItem !== "undefined") {
    try {
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob([text], { type: "text/plain" });
      const item = new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText,
      });
      await navigator.clipboard.write([item]);
      return true;
    } catch (err) {
      console.error("ClipboardItem copy failed, falling back to writeText:", err);
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      const write = navigator.clipboard.writeText(text);
      const timeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("clipboard timeout")), 700);
      });
      await Promise.race([write, timeout]);
      return true;
    } catch {
      // fall through
    }
  }
  return fallbackCopy(text);
}
