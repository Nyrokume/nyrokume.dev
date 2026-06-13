"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import {
  TerminalReveal,
  TypewriterPrompt,
} from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";
import type { ContactCard } from "@/lib/types";

export function ContactSection() {
  const { content } = useLocale();
  const { contact } = content;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (phase !== 1) return;
    const timer = window.setTimeout(
      () => setPhase(2),
      contact.cards.length * 200 + 500,
    );
    return () => window.clearTimeout(timer);
  }, [phase, contact.cards.length]);

  return (
    <TerminalWindow
      id="contact"
      title={contact.windowTitle}
      meta={contact.meta}
      cwd="~/contact"
    >
      <div className="space-y-5">
        {phase === 0 ? (
          <TypewriterPrompt
            command={contact.command}
            cwd="~/contact"
            onComplete={() => setPhase(1)}
          />
        ) : (
          <p className="terminal-log text-sm">
            <span className="text-prompt-user">nyrokume</span>
            <span className="text-prompt-host">@arch</span>
            <span className="text-foreground">:</span>
            <span className="text-prompt-path">~/contact</span>
            <span className="text-foreground">$ </span>
            <span className="text-foreground">{contact.command}</span>
          </p>
        )}

        {phase >= 1 ? (
          <TerminalReveal delay={150} className="text-sm text-terminal-info">
            {contact.handshakeLine}
          </TerminalReveal>
        ) : null}

        {phase >= 1 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {contact.cards.map((card, index) => (
              <ContactTerminalRow
                key={card.id}
                card={card}
                delay={250 + index * 180}
              />
            ))}
          </div>
        ) : null}

        {phase >= 2 ? (
          <>
            <TypewriterPrompt command={contact.echoCommand} cwd="~/contact" />
            <TerminalReveal delay={450} className="text-sm font-medium text-foreground">
              {contact.echoOutput}
            </TerminalReveal>
            <TerminalReveal
              delay={700}
              className="flex items-center gap-2 text-sm text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-terminal-success" aria-hidden />
              {contact.exitLine}
            </TerminalReveal>
          </>
        ) : null}
      </div>
    </TerminalWindow>
  );
}

function ContactTerminalRow({
  card,
  delay,
}: {
  card: ContactCard;
  delay: number;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <TerminalReveal delay={delay}>
      <article className="group relative overflow-hidden rounded-lg border border-border bg-surface-elevated p-4 transition-colors hover:border-accent/40 hover:bg-surface-elevated/90">
        <span
          className="absolute inset-y-0 left-0 w-1 bg-terminal-success/70 transition-colors group-hover:bg-terminal-success"
          aria-hidden
        />

        <div className="flex items-start gap-3 pl-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-light transition-colors group-hover:border-accent/40 group-hover:text-accent-bright">
            <ContactIcon icon={card.icon} className="h-4 w-4" />
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-terminal-success">
                [ok]
              </span>
              <span className="text-xs text-muted">{card.label}</span>
            </div>

            <p className="truncate text-base font-semibold text-foreground sm:text-lg">
              {card.value}
            </p>
          </div>
        </div>

        <div className="mt-4 pl-2">
          {card.copy ? (
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(card.value);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
              className="focus-ring w-full cursor-pointer rounded border border-border bg-background px-3 py-2 text-sm text-muted-light transition-colors hover:border-terminal-success/50 hover:bg-terminal-success/10 hover:text-terminal-success"
            >
              {copied ? "copied to clipboard" : "copy to clipboard"}
            </button>
          ) : card.href?.startsWith("mailto:") ? (
            <a
              href={card.href}
              className="focus-ring block w-full rounded border border-border bg-background px-3 py-2 text-center text-sm text-muted-light transition-colors hover:border-terminal-success/50 hover:bg-terminal-success/10 hover:text-terminal-success"
            >
              send email
            </a>
          ) : (
            <a
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring block w-full rounded border border-border bg-background px-3 py-2 text-center text-sm text-muted-light transition-colors hover:border-accent/50 hover:bg-accent-muted hover:text-accent-bright"
            >
              open link
            </a>
          )}
        </div>
      </article>
    </TerminalReveal>
  );
}

function ContactIcon({
  icon,
  className = "h-3.5 w-3.5",
}: {
  icon: ContactCard["icon"];
  className?: string;
}) {
  if (icon === "github") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
        <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-3 .7-3.6-1.3-3.6-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 1.7 2.5 1.2.1-.9.4-1.5.7-1.8-2.4-.3-4.9-1.2-4.9-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10.3 10.3 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.2-2.5 5.1-4.9 5.4.4.3.8 1 .8 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
      </svg>
    );
  }

  if (icon === "telegram") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38Z" />
      </svg>
    );
  }

  if (icon === "mail") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} aria-hidden>
        <path strokeWidth="2" d="M4 6h16v12H4z" />
        <path strokeWidth="2" d="m4 7 8 5 8-5" />
      </svg>
    );
  }

  return (
    <span className={`${className} text-xs font-semibold`} aria-hidden>
      &lt;/&gt;
    </span>
  );
}
