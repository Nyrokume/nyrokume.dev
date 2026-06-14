export type InquiryLocale = "ru" | "en";

export type InquiryPayload = {
  name: string;
  contact: string;
  message: string;
  locale: InquiryLocale;
  /** Honeypot — must stay empty */
  website?: string;
};

export type TelegramInquiryEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

const MAX_NAME = 100;
const MAX_CONTACT = 120;
const MAX_MESSAGE = 2000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function parseInquiryBody(raw: unknown): InquiryPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid body");
  }

  const body = raw as Record<string, unknown>;

  if (typeof body.website === "string" && body.website.trim()) {
    throw new Error("Spam detected");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const locale: InquiryLocale = body.locale === "en" ? "en" : "ru";

  if (!name || name.length > MAX_NAME) {
    throw new Error("Invalid name");
  }

  if (!contact || contact.length > MAX_CONTACT) {
    throw new Error("Invalid contact");
  }

  if (!message || message.length > MAX_MESSAGE) {
    throw new Error("Invalid message");
  }

  return { name, contact, message, locale };
}

export function formatInquiryTelegramMessage(payload: InquiryPayload): string {
  const title =
    payload.locale === "en"
      ? "New inquiry from nyrokume.dev"
      : "Новая заявка с nyrokume.dev";

  const labels =
    payload.locale === "en"
      ? { name: "Name", contact: "Contact", message: "Task", locale: "Locale" }
      : { name: "Имя", contact: "Контакт", message: "Задача", locale: "Язык" };

  return [
    `<b>${escapeHtml(title)}</b>`,
    "",
    `<b>${labels.name}:</b> ${escapeHtml(payload.name)}`,
    `<b>${labels.contact}:</b> ${escapeHtml(payload.contact)}`,
    `<b>${labels.message}:</b>`,
    escapeHtml(payload.message),
    "",
    `<b>${labels.locale}:</b> ${payload.locale}`,
  ].join("\n");
}

export async function sendTelegramInquiry(
  env: TelegramInquiryEnv,
  payload: InquiryPayload,
): Promise<void> {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    throw new Error("Telegram is not configured");
  }

  const text = formatInquiryTelegramMessage(payload);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const data = (await response.json()) as { ok?: boolean; description?: string };

  if (!response.ok || !data.ok) {
    throw new Error(data.description ?? "Telegram send failed");
  }
}
