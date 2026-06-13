import {
  GoogleGenerativeAI,
  type Content,
} from "@google/generative-ai";
import {
  CHAT_MAX_OUTPUT_TOKENS,
  CHAT_TEMPERATURE,
} from "@/lib/chat-generation-config";
import type { ChatMessage } from "@/lib/chat-types";
import { assertLastUserMessage, toApiMessages } from "@/lib/chat-providers/messages";
import type { ChatProvider, ChatProviderContext } from "@/lib/chat-providers/types";

function toGeminiHistory(messages: ChatMessage[]): Content[] {
  const prior = messages.slice(0, -1);

  let start = 0;
  while (start < prior.length && prior[start].role === "assistant") {
    start += 1;
  }

  return prior.slice(start).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

async function generateGemini(context: ChatProviderContext): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const apiMessages = toApiMessages(context.messages);
  const lastMessage = assertLastUserMessage(apiMessages);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: context.model,
    systemInstruction: context.systemPrompt,
    generationConfig: {
      temperature: CHAT_TEMPERATURE,
      maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
    },
  });

  const history = toGeminiHistory(apiMessages);
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  const text = result.response.text().trim();

  if (!text) {
    throw new Error("[gemini] Empty response from model");
  }

  return text;
}

export const geminiProvider: ChatProvider = {
  id: "gemini",
  isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
  generate: generateGemini,
};
