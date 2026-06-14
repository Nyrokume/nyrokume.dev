export interface Env {
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  CHAT_PROVIDER_ORDER?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

import {
  buildChatScopeReminder,
  buildChatSystemPrompt,
} from "../../../shared/chat-prompt";
import {
  CHAT_MAX_OUTPUT_TOKENS,
  CHAT_TEMPERATURE,
} from "../../../shared/chat-generation-config";
import { parseInquiryBody, sendTelegramInquiry } from "../../../shared/telegram-inquiry";

type Locale = "ru" | "en";
type Role = "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
};

type ProviderId = "gemini" | "groq" | "openrouter";

const ALLOWED_ORIGINS = [
  "https://nyrokume.github.io",
  "https://nyrokume.dev",
  "http://localhost:3000",
];

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

const DEFAULT_MODELS: Record<ProviderId, string> = {
  gemini: "gemini-2.5-flash-lite",
  groq: "llama-3.1-8b-instant",
  openrouter: "liquid/lfm-2.5-1.2b-instruct:free",
};

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

function buildSystemPrompt(locale: Locale): string {
  return `${buildChatSystemPrompt(locale)}\n\n${buildChatScopeReminder(locale)}`;
}

function isProviderId(value: string): value is ProviderId {
  return value === "gemini" || value === "groq" || value === "openrouter";
}

function getProviderOrder(env: Env, preferred?: ProviderId): ProviderId[] {
  const raw = env.CHAT_PROVIDER_ORDER ?? "gemini,groq,openrouter";
  const configured = raw
    .split(",")
    .map((item) => item.trim())
    .filter(isProviderId)
    .filter((id) => {
      if (id === "gemini") return Boolean(env.GEMINI_API_KEY);
      if (id === "groq") return Boolean(env.GROQ_API_KEY);
      return Boolean(env.OPENROUTER_API_KEY);
    });

  if (!preferred) return configured;
  return [preferred, ...configured.filter((id) => id !== preferred)];
}

function isRetryable(message: string): boolean {
  return (
    message.includes("[429") ||
    message.includes("[500") ||
    message.includes("[502") ||
    message.includes("[503") ||
    message.includes("[504") ||
    message.includes("quota") ||
    message.includes("Too Many Requests") ||
    message.includes("overloaded") ||
    message.includes("unavailable") ||
    message.includes("fetch failed")
  );
}

async function generateGemini(
  env: Env,
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
): Promise<string> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const apiMessages = messages.filter((m) => m.role === "user" || m.role === "assistant");
  const last = apiMessages.at(-1);
  if (!last || last.role !== "user") throw new Error("Last message must be from user");

  let start = 0;
  while (start < apiMessages.length - 1 && apiMessages[start].role === "assistant") {
    start += 1;
  }

  const history = apiMessages.slice(start, -1).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...history,
          { role: "user", parts: [{ text: last.content }] },
        ],
        generationConfig: {
          temperature: CHAT_TEMPERATURE,
          maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
        },
      }),
    },
  );

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(`[gemini:${response.status}] ${data.error?.message ?? response.statusText}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("[gemini] Empty response from model");
  return text;
}

async function generateOpenAICompatible(
  env: Env,
  provider: "groq" | "openrouter",
  messages: ChatMessage[],
  model: string,
  systemPrompt: string,
): Promise<string> {
  const apiKey = provider === "groq" ? env.GROQ_API_KEY : env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error(`${provider.toUpperCase()}_API_KEY is not configured`);

  const baseUrl =
    provider === "groq"
      ? "https://api.groq.com/openai/v1"
      : "https://openrouter.ai/api/v1";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://nyrokume.dev";
    headers["X-Title"] = "nyrokume.dev";
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: CHAT_TEMPERATURE,
      max_tokens: CHAT_MAX_OUTPUT_TOKENS,
    }),
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(`[${provider}:${response.status}] ${data.error?.message ?? response.statusText}`);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error(`[${provider}] Empty response from model`);
  return text;
}

async function generateReply(
  env: Env,
  messages: ChatMessage[],
  locale: Locale,
  provider?: string,
  model?: string,
): Promise<string> {
  const preferred = provider && isProviderId(provider) ? provider : undefined;
  const order = getProviderOrder(env, preferred);

  if (order.length === 0) {
    throw new Error("No chat providers configured");
  }

  const systemPrompt = buildSystemPrompt(locale);
  const failures: string[] = [];

  for (let index = 0; index < order.length; index += 1) {
    const providerId = order[index];
    const isLast = index === order.length - 1;
    const resolvedModel =
      providerId === preferred && index === 0 && model ? model : DEFAULT_MODELS[providerId];

    try {
      if (providerId === "gemini") {
        return await generateGemini(env, messages, resolvedModel, systemPrompt);
      }

      return await generateOpenAICompatible(
        env,
        providerId,
        messages,
        resolvedModel,
        systemPrompt,
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      failures.push(`${providerId}: ${detail}`);

      if (!isRetryable(detail) || isLast) {
        if (!isRetryable(detail)) throw error;
      }
    }
  }

  throw new Error(failures.join(" | "));
}

function parseMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Invalid messages");
  }

  if (raw.length > MAX_MESSAGES) {
    throw new Error("Too many messages");
  }

  return raw.map((message, index) => {
    if (
      !message ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string"
    ) {
      throw new Error(`Invalid message at index ${index}`);
    }

    const content = message.content.trim();
    if (!content || content.length > MAX_CONTENT_LENGTH) {
      throw new Error(`Invalid message content at index ${index}`);
    }

    return { role: message.role, content };
  });
}

async function handleChat(request: Request, env: Env, origin: string | null): Promise<Response> {
  try {
    const body = (await request.json()) as {
      messages?: unknown;
      locale?: unknown;
      provider?: string;
      model?: string;
    };

    const messages = parseMessages(body.messages);
    if (messages.at(-1)?.role !== "user") {
      return jsonResponse({ error: "Last message must be from user" }, 400, origin);
    }

    const locale: Locale = body.locale === "en" ? "en" : "ru";
    const content = await generateReply(
      env,
      messages,
      locale,
      body.provider,
      body.model,
    );

    return jsonResponse({ message: { role: "assistant", content } }, 200, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";

    if (message.startsWith("Invalid message") || message === "Invalid messages") {
      return jsonResponse({ error: message }, 400, origin);
    }

    if (message === "No chat providers configured") {
      return jsonResponse({ error: "Chat is not configured" }, 503, origin);
    }

    return jsonResponse({ error: "Chat temporarily unavailable" }, 502, origin);
  }
}

async function handleInquiry(request: Request, env: Env, origin: string | null): Promise<Response> {
  try {
    const body = await request.json();
    const payload = parseInquiryBody(body);
    await sendTelegramInquiry(env, payload);
    return jsonResponse({ ok: true }, 200, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Inquiry failed";

    if (
      message === "Invalid body" ||
      message.startsWith("Invalid name") ||
      message.startsWith("Invalid contact") ||
      message.startsWith("Invalid message")
    ) {
      return jsonResponse({ error: message }, 400, origin);
    }

    if (message === "Spam detected") {
      return jsonResponse({ ok: true }, 200, origin);
    }

    if (message === "Telegram is not configured") {
      return jsonResponse({ error: "Inquiry is not configured" }, 503, origin);
    }

    return jsonResponse({ error: "Inquiry temporarily unavailable" }, 502, origin);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Not found" }, 404, origin);
    }

    if (url.pathname.endsWith("/api/chat")) {
      return handleChat(request, env, origin);
    }

    if (url.pathname.endsWith("/api/inquiry")) {
      return handleInquiry(request, env, origin);
    }

    return jsonResponse({ error: "Not found" }, 404, origin);
  },
};
