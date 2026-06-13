"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { TypewriterPrompt } from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";
import { buildChatProviders, getDefaultLiteModel } from "@/lib/chat-catalog";
import type { ChatMessage } from "@/lib/chat-types";
import { getChatApiUrl } from "@/lib/chat-api-url";
import type { ChatConfig } from "@/lib/types";

type ChatSectionProps = {
  chat: ChatConfig;
};

const selectClassName =
  "focus-ring cursor-pointer rounded border border-accent/40 bg-accent-muted px-2 py-0.5 text-xs text-accent-bright outline-none transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-60";

export function ChatSection({ chat }: ChatSectionProps) {
  const { locale } = useLocale();
  const providers = buildChatProviders(locale);
  const initialProvider =
    providers.find((item) => item.id === chat.defaultProvider) ?? providers[0];
  const [providerId, setProviderId] = useState(initialProvider.id);
  const [model, setModel] = useState(getDefaultLiteModel(initialProvider.id));
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: chat.welcome },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeProvider = providers.find((item) => item.id === providerId) ?? providers[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  function handleProviderChange(nextProviderId: string) {
    const nextProvider = providers.find((item) => item.id === nextProviderId);
    if (!nextProvider) return;

    setProviderId(nextProvider.id);
    setModel(getDefaultLiteModel(nextProvider.id));
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setInput("");
    setError(null);
    setLoading(true);
    setMessages(nextMessages);
    setStarted(true);

    try {
      const response = await fetch(getChatApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(nextMessages),
          locale,
          provider: providerId,
          model,
        }),
      });

      const data = (await response.json()) as {
        message?: ChatMessage;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? chat.error);
      }

      if (!data.message?.content) {
        throw new Error(chat.error);
      }

      setMessages([...nextMessages, data.message]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : chat.error);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <TerminalWindow
      id="chat"
      title={chat.windowTitle}
      meta={chat.meta}
      cwd="~/projects"
      badge={
        <div className="flex max-w-[min(100%,20rem)] flex-col items-end gap-1 sm:max-w-none sm:flex-row sm:items-center">
          <label className="flex items-center gap-1">
            <span className="sr-only">{chat.providerLabel}</span>
            <select
              value={providerId}
              onChange={(event) => handleProviderChange(event.target.value)}
              disabled={loading}
              aria-label={chat.providerLabel}
              className={selectClassName}
            >
              {providers.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1">
            <span className="sr-only">{chat.modelLabel}</span>
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              disabled={loading}
              aria-label={chat.modelLabel}
              className={selectClassName}
            >
              {activeProvider.models.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.recommended ? `★ ${option.label}` : option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      }
    >
      <div className="space-y-4">
        {!started ? (
          <TypewriterPrompt
            command={chat.command}
            cwd="~/projects"
            onComplete={() => setStarted(true)}
          />
        ) : (
          <p className="terminal-log text-sm">
            <span className="text-prompt-user">nyrokume</span>
            <span className="text-prompt-host">@arch</span>
            <span className="text-foreground">:</span>
            <span className="text-prompt-path">~/projects</span>
            <span className="text-foreground">$ </span>
            <span className="text-foreground">{chat.command}</span>
          </p>
        )}

        <p className="text-sm text-muted">{chat.bootLine}</p>

        <div
          ref={scrollRef}
          className="max-h-[min(28rem,55vh)] space-y-3 overflow-y-auto rounded-lg border border-border bg-surface-elevated p-3 sm:p-4"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((message, index) => (
            <ChatBubble key={`${message.role}-${index}`} message={message} />
          ))}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-bright" />
              {chat.thinking}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="rounded border border-accent/40 bg-accent-muted px-3 py-2 text-sm text-accent-bright">
            {error}
          </p>
        ) : null}

        <div className="rounded-lg border border-border bg-surface-elevated p-3 sm:p-4">
          <label htmlFor="chat-input" className="mb-2 block text-xs text-muted">
            {chat.inputLabel}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chat.placeholder}
              rows={3}
              disabled={loading}
              className="focus-ring min-h-[4.5rem] w-full resize-y rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-accent/50 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className="focus-ring shrink-0 cursor-pointer rounded border border-accent/50 bg-accent-muted px-4 py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? chat.sendingLabel : chat.sendLabel}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">{chat.hint}</p>
        </div>
      </div>
    </TerminalWindow>
  );
}

function toApiMessages(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length > 0 && messages[0].role === "assistant") {
    return messages.slice(1);
  }

  return messages;
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <article
      className={`rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3 ${
        isUser
          ? "ml-4 border-accent/30 bg-accent-muted/40 sm:ml-8"
          : "mr-4 border-border bg-background sm:mr-8"
      }`}
    >
      <p className="mb-1 text-xs uppercase tracking-wide text-muted">
        {isUser ? "you" : "assistant"}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
        {message.content}
      </p>
    </article>
  );
}
