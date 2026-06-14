import {
  enrichInquiryFromRequest,
  parseInquiryBody,
  sendTelegramInquiry,
} from "@/shared/telegram-inquiry";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = enrichInquiryFromRequest(parseInquiryBody(body), request);
    await sendTelegramInquiry(
      {
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      },
      payload,
    );

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Inquiry failed";

    if (
      message === "Invalid body" ||
      message.startsWith("Invalid name") ||
      message.startsWith("Invalid contact") ||
      message.startsWith("Invalid message")
    ) {
      return Response.json({ error: message }, { status: 400 });
    }

    if (message === "Spam detected") {
      return Response.json({ ok: true });
    }

    if (message === "Telegram is not configured") {
      return Response.json({ error: "Inquiry is not configured" }, { status: 503 });
    }

    console.error("[inquiry]", error);
    return Response.json({ error: "Inquiry temporarily unavailable" }, { status: 502 });
  }
}
