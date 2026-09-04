import type { Applicant } from "../applicants/types.ts";
import type { Job, StoredMatch } from "../matching/types.ts";
import { telegramMatchText } from "./templates.ts";

type TelegramResult = { ok: true; id?: string } | { ok: false; error: string; retry: boolean };

function botToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

export function telegramConfigured() {
  return Boolean(botToken());
}

async function telegramApi(method: string, body: Record<string, unknown>) {
  const token = botToken();
  if (!token) return { ok: false as const, error: "Telegram is not configured", retry: false };
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await response.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
  if (!response.ok || !json?.ok) {
    const retry = response.status >= 500 || response.status === 429;
    return { ok: false as const, error: json?.description || `Telegram HTTP ${response.status}`, retry };
  }
  return { ok: true as const };
}

export async function sendTelegramMatch(
  applicant: Applicant,
  job: Job,
  match: StoredMatch,
  applyUrl: string,
): Promise<TelegramResult> {
  if (!botToken()) return { ok: false, error: "Telegram is not configured", retry: false };
  const chatId = applicant.telegram_chat_id;
  if (!chatId) {
    return { ok: false, error: "Applicant has not connected Telegram", retry: false };
  }
  const result = await telegramApi("sendMessage", {
    chat_id: chatId,
    text: telegramMatchText(applicant, job, match),
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🚀 Apply Now", url: applyUrl },
          { text: "💾 Save", callback_data: `save:${match.match_id}` },
        ],
        [{ text: "👎 Not Relevant", callback_data: `no:${match.match_id}` }],
      ],
    },
  });
  return result;
}

export async function sendTelegramText(chatId: string, text: string, extra?: Record<string, unknown>) {
  return telegramApi("sendMessage", { chat_id: chatId, text, ...extra });
}

export async function answerCallback(id: string, text: string) {
  return telegramApi("answerCallbackQuery", { callback_query_id: id, text });
}

export function relevanceKeyboard(matchId: string) {
  return {
    inline_keyboard: [
      [
        { text: "Wrong experience", callback_data: `why:${matchId}:experience` },
        { text: "Wrong location", callback_data: `why:${matchId}:location` },
      ],
      [
        { text: "Wrong role", callback_data: `why:${matchId}:role` },
        { text: "Salary", callback_data: `why:${matchId}:salary` },
      ],
      [
        { text: "Already applied", callback_data: `why:${matchId}:applied` },
        { text: "Other", callback_data: `why:${matchId}:other` },
      ],
    ],
  };
}
