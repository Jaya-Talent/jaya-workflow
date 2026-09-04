import { createFileRoute } from "@tanstack/react-router";
import { handleTelegramWebhook } from "@/lib/notifications/telegram-webhook.server";

export const Route = createFileRoute("/api/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => handleTelegramWebhook(request),
    },
  },
});
