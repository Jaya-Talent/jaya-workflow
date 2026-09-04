type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

type EmailResult = { ok: true } | { ok: false; error: string; retry: boolean };

export function emailConfigured() {
  return Boolean(process.env.EMAIL_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();
  if (!apiKey || !from) {
    return { ok: false, error: "Email is not configured", retry: false };
  }

  try {
    if (provider === "resend" || provider === "") {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });
      if (!response.ok) {
        const retry = response.status >= 500 || response.status === 429;
        return { ok: false, error: `Email provider HTTP ${response.status}`, retry };
      }
      return { ok: true };
    }

    const endpoint = process.env.EMAIL_ENDPOINT?.trim();
    if (!endpoint) return { ok: false, error: `Unknown email provider: ${provider}`, retry: false };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, ...payload }),
    });
    if (!response.ok) {
      return { ok: false, error: `Email provider HTTP ${response.status}`, retry: response.status >= 500 };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Email send failed",
      retry: true,
    };
  }
}
