import { getApplicantRepository } from "../applicants/sql-repository.server.ts";
import { getMatchesRepository } from "../matching/matches-repository.server.ts";
import { getInteractionsRepository } from "./interactions-repository.server.ts";
import { answerCallback, relevanceKeyboard, sendTelegramText } from "./telegram.server.ts";

type TelegramUpdate = {
  message?: { text?: string; chat?: { id?: number }; from?: { username?: string } };
  callback_query?: {
    id: string;
    data?: string;
    from?: { id?: number; username?: string };
    message?: { chat?: { id?: number } };
  };
};

export async function handleTelegramWebhook(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  if (!update) return Response.json({ ok: true });

  if (update.message?.text?.startsWith("/start")) {
    const chatId = String(update.message.chat?.id ?? "");
    const payload = update.message.text.replace("/start", "").trim();
    if (chatId && payload) {
      await getApplicantRepository().updateApplicant(payload, { telegram_chat_id: chatId });
      if (chatId) await sendTelegramText(chatId, "Telegram connected. We'll send strong job matches here.");
    } else if (chatId) {
      await sendTelegramText(
        chatId,
        "Open your Meridian profile and tap Connect Telegram so we can link this chat.",
      );
    }
    return Response.json({ ok: true });
  }

  const callback = update.callback_query;
  if (!callback?.data) return Response.json({ ok: true });
  const [kind, matchId, extra] = callback.data.split(":");
  const match = matchId ? await getMatchesRepository().getMatch(matchId) : null;
  const chatId = String(callback.message?.chat?.id ?? callback.from?.id ?? "");
  if (!match) {
    await answerCallback(callback.id, "Match not found");
    return Response.json({ ok: true });
  }

  if (kind === "save") {
    await getInteractionsRepository().record({
      applicant_id: match.applicant_id,
      job_id: match.job_id,
      interaction_type: "save",
    });
    await answerCallback(callback.id, "Saved");
  } else if (kind === "no") {
    await getInteractionsRepository().record({
      applicant_id: match.applicant_id,
      job_id: match.job_id,
      interaction_type: "not_relevant",
    });
    await answerCallback(callback.id, "We'll hide this role");
    if (chatId) {
      await sendTelegramText(chatId, "Why isn't this relevant?", { reply_markup: relevanceKeyboard(match.match_id) });
    }
  } else if (kind === "why") {
    await getInteractionsRepository().record({
      applicant_id: match.applicant_id,
      job_id: match.job_id,
      interaction_type: "feedback",
      detail: extra || "other",
    });
    await answerCallback(callback.id, "Thanks — this helps matching");
  }

  return Response.json({ ok: true });
}
