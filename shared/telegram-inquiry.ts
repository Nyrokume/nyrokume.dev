export type InquiryLocale = "ru" | "en";

export type InquiryClientMeta = {
  page?: string;
  referrer?: string;
  language?: string;
  languages?: string;
  timezone?: string;
  screen?: string;
  viewport?: string;
  platform?: string;
  userAgent?: string;
};

export type InquiryMeta = InquiryClientMeta & {
  ip?: string;
  country?: string;
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
const MAX_USER_AGENT = 320;

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
    page: trimMetaField(body.page),
    referrer: trimMetaField(body.referrer),
    language: trimMetaField(body.language, 32),
    languages: trimMetaField(body.languages, 120),
    timezone: trimMetaField(body.timezone, 64),
    screen: trimMetaField(body.screen, 32),
    viewport: trimMetaField(body.viewport, 32),
    platform: trimMetaField(body.platform, 64),
    userAgent: trimMetaField(body.userAgent, MAX_USER_AGENT),
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
  const country = request.headers.get("CF-IPCountry")?.trim().toUpperCase();
  const ip = getClientIp(request);
  const requestUserAgent = request.headers.get("user-agent")?.trim();

  const meta: InquiryMeta = {
    ...payload.meta,
    ip: ip ?? payload.meta?.ip,
    country: country && country !== "XX" ? country : payload.meta?.country,
    userAgent:
      payload.meta?.userAgent ??
      (requestUserAgent
        ? requestUserAgent.length > MAX_USER_AGENT
          ? requestUserAgent.slice(0, MAX_USER_AGENT)
          : requestUserAgent
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
          country: "Country",
          page: "Page",
          referrer: "Referrer",
          language: "Language",
          languages: "Languages",
          timezone: "Timezone",
          screen: "Screen",
          viewport: "Viewport",
          platform: "Platform",
          userAgent: "User-Agent",
        }
      : {
          section: "Клиент",
          ip: "IP",
          country: "Страна",
          page: "Страница",
          referrer: "Referrer",
          language: "Язык",
          languages: "Языки",
          timezone: "Часовой пояс",
          screen: "Экран",
          viewport: "Viewport",
          platform: "Платформа",
          userAgent: "User-Agent",
        };

  const entries: Array<[string, string | undefined]> = [
    [labels.ip, meta.ip],
    [labels.country, meta.country],
    [labels.page, meta.page],
    [labels.referrer, meta.referrer],
    [labels.language, meta.language],
    [labels.languages, meta.languages],
    [labels.timezone, meta.timezone],
    [labels.screen, meta.screen],
    [labels.viewport, meta.viewport],
    [labels.platform, meta.platform],
    [labels.userAgent, meta.userAgent],
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
