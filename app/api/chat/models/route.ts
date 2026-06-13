import { buildChatProviders, CHAT_PROVIDER_DEFS, getDefaultLiteModel } from "@/lib/chat-catalog";
import type { Locale } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale");
  const locale: Locale = localeParam === "en" ? "en" : "ru";

  const groqLive = await fetchGroqModelIds();

  return Response.json({
    providers: buildChatProviders(locale),
    defaults: {
      provider: "gemini",
      model: getDefaultLiteModel("gemini"),
    },
    groqLive,
  });
}

async function fetchGroqModelIds(): Promise<string[] | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { data?: Array<{ id: string }> };
    return (data.data ?? []).map((item) => item.id).sort();
  } catch {
    return null;
  }
}

export { CHAT_PROVIDER_DEFS };
