export type InquiryLocale = "ru" | "en";

export type InquiryClientMeta = {
  language?: string;
  browser?: string;
};

export type InquiryMeta = InquiryClientMeta & {
  ip?: string;
};

export type InquiryPayload = {
  name: string;
  contact: string;
  message: string;
  locale: InquiryLocale;
  /** Honeypot — must stay empty */
  website?: string;
  meta?: InquiryMeta;
};

export type TelegramInquiryEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

import {
  formatInquiryContactForStorage,
  isValidInquiryContact,
  isValidInquiryMessage,
  isValidInquiryName,
} from "./inquiry-validation";

const MAX_META_FIELD = 512;
const MAX_BROWSER = 320;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function trimMetaField(value: unknown, max = MAX_META_FIELD): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function parseInquiryClientMeta(raw: unknown): InquiryMeta | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const body = raw as Record<string, unknown>;
  const meta: InquiryMeta = {
    language: trimMetaField(body.language, 32),
    browser: trimMetaField(body.browser ?? body.userAgent, MAX_BROWSER),
  };

  const hasValue = Object.values(meta).some(Boolean);
  return hasValue ? meta : undefined;
}

export function getClientIp(request: Request): string | undefined {
  const cfIp = request.headers.get("CF-Connecting-IP")?.trim();
  if (cfIp) return cfIp;

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

  return request.headers.get("x-real-ip")?.trim() || undefined;
}

export function enrichInquiryFromRequest(
  payload: InquiryPayload,
  request: Request,
): InquiryPayload {
  const ip = getClientIp(request);
  const requestBrowser = request.headers.get("user-agent")?.trim();

  const meta: InquiryMeta = {
    ...payload.meta,
    ip: ip ?? payload.meta?.ip,
    browser:
      payload.meta?.browser ??
      (requestBrowser
        ? requestBrowser.length > MAX_BROWSER
          ? requestBrowser.slice(0, MAX_BROWSER)
          : requestBrowser
        : undefined),
  };

  const hasMeta = Object.values(meta).some(Boolean);
  return hasMeta ? { ...payload, meta } : payload;
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
  const meta = parseInquiryClientMeta(body.meta);

  if (!isValidInquiryName(name)) {
    throw new Error("Invalid name format");
  }

  if (!isValidInquiryContact(contact)) {
    throw new Error("Invalid contact format");
  }

  if (!isValidInquiryMessage(message)) {
    throw new Error("Invalid message format");
  }

  return {
    name,
    contact: formatInquiryContactForStorage(contact),
    message,
    locale,
    meta,
  };
}

function formatMetaLines(meta: InquiryMeta | undefined, locale: InquiryLocale): string[] {
  if (!meta) return [];

  const labels =
    locale === "en"
      ? {
          section: "Client",
          ip: "IP",
          language: "Language",
          browser: "Browser",
        }
      : {
          section: "Клиент",
          ip: "IP",
          language: "Язык",
          browser: "Браузер",
        };

  const entries: Array<[string, string | undefined]> = [
    [labels.ip, meta.ip],
    [labels.language, meta.language],
    [labels.browser, meta.browser],
  ];

  const lines = entries
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `<b>${label}:</b> ${escapeHtml(value!)}`);

  if (lines.length === 0) return [];

  return ["", `<b>${labels.section}</b>`, ...lines];
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
    ...formatMetaLines(payload.meta, payload.locale),
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
