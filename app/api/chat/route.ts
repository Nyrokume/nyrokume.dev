import { generateChatReply } from "@/lib/chat-generate";
import { resolveChatSelection } from "@/lib/chat-catalog";
import { mapChatError } from "@/lib/chat-models";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/chat-types";
import type { Locale } from "@/lib/types";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

function isValidLocale(value: unknown): value is Locale {
  return value === "ru" || value === "en";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ error: "Invalid messages" }, { status: 400 });
    }

    if (body.messages.length > MAX_MESSAGES) {
      return Response.json({ error: "Too many messages" }, { status: 400 });
    }

    const messages = body.messages.map((message, index) => {
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

      return {
        role: message.role,
        content,
      };
    });

    if (messages.at(-1)?.role !== "user") {
      return Response.json({ error: "Last message must be from user" }, { status: 400 });
    }

    const locale = isValidLocale(body.locale) ? body.locale : "ru";
    const selection = resolveChatSelection(body.provider, body.model);
    const result = await generateChatReply(messages, locale, selection);

    const response: ChatResponseBody = {
      message: {
        role: "assistant",
        content: result.content,
      },
    };

    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";

    if (message.startsWith("Invalid message")) {
      return Response.json({ error: message }, { status: 400 });
    }

    if (message === "No chat providers configured") {
      return Response.json({ error: "Chat is not configured" }, { status: 503 });
    }

    console.error("[chat]", error);
    return Response.json({ error: mapChatError(error) }, { status: 502 });
  }
}
