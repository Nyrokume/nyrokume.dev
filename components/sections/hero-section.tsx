"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { StatCard } from "@/components/ui/stat-card";
import {
  TerminalReveal,
  TypewriterPrompt,
} from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";
import type { HeroAction } from "@/lib/types";

export function HeroSection({
  onOpenChat,
  chatOpen = false,
}: {
  onOpenChat?: () => void;
  chatOpen?: boolean;
}) {
  const { content } = useLocale();
  const { hero } = content;

  return (
    <TerminalWindow
      title={hero.windowTitle}
      cwd="~"
      badge={
        <span className="rounded border border-terminal-success/40 bg-terminal-success/10 px-2 py-0.5 text-xs text-terminal-success">
          ● {hero.availableBadge}
        </span>
      }
    >
      <div className="space-y-5">
        <TerminalReveal delay={0} className="text-sm text-muted">
          {hero.bootLine}
        </TerminalReveal>

        <TypewriterPrompt command={hero.command} cwd="~" delay={200} />

        <motion.div
          className="pt-1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <h1 className="flex min-w-0 items-center text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            <span className="shrink-0 text-muted-light">&gt;_ </span>
            <span className="truncate">{hero.heading}</span>
            <span
              className="ml-1 inline-block h-8 w-2 cursor-blink"
              aria-hidden
            />
          </h1>
          <p className="mt-3 text-sm text-muted">{hero.tagline}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {hero.stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        <motion.div
          className="flex flex-wrap gap-3 pt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 1.1 }}
        >
          {hero.actions.map((action) => (
            <HeroActionButton
              key={action.id}
              action={action}
              onOpenChat={onOpenChat}
              chatOpen={chatOpen}
            />
          ))}
        </motion.div>
      </div>
    </TerminalWindow>
  );
}

function HeroActionButton({
  action,
  onOpenChat,
  chatOpen = false,
}: {
  action: HeroAction;
  onOpenChat?: () => void;
  chatOpen?: boolean;
}) {
  const baseClass =
    "focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors";
  const className = action.primary
    ? `${baseClass} border-accent/50 text-foreground hover:border-accent hover:bg-accent-muted`
    : `${baseClass} border-border text-muted-light hover:border-muted hover:text-foreground`;

  const icon = action.icon === "github" ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-3 .7-3.6-1.3-3.6-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 1.7 2.5 1.2.1-.9.4-1.5.7-1.8-2.4-.3-4.9-1.2-4.9-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10.3 10.3 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.2-2.5 5.1-4.9 5.4.4.3.8 1 .8 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  ) : action.icon === "telegram" ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38Z" />
    </svg>
  ) : action.icon === "mail" ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden>
      <path strokeWidth="2" d="M4 6h16v12H4z" />
      <path strokeWidth="2" d="m4 7 8 5 8-5" />
    </svg>
  ) : action.icon === "chat" ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden>
      <path strokeWidth="2" d="M4 5h16v11H8l-4 4V5Z" strokeLinejoin="round" />
      <path strokeWidth="2" d="M8 9h8M8 12h5" strokeLinecap="round" />
    </svg>
  ) : null;

  if (action.behavior === "openChat" && onOpenChat) {
    const activeClass = chatOpen
      ? `${baseClass} border-accent/50 bg-accent-muted/30 text-foreground`
      : className;

    return (
      <button type="button" className={activeClass} onClick={onOpenChat}>
        {icon}
        {action.label}
      </button>
    );
  }

  const isExternal = action.href?.startsWith("http");
  const isMailto = action.href?.startsWith("mailto:");

  if (isExternal || isMailto) {
    return (
      <a
        href={action.href}
        target={isMailto ? undefined : "_blank"}
        rel={isMailto ? undefined : "noopener noreferrer"}
        className={className}
      >
        {icon}
        {action.label}
        {action.icon === "github" || action.icon === "telegram" ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" aria-hidden>
            <path strokeWidth="2" d="M7 17 17 7M9 7h8v8" />
          </svg>
        ) : null}
      </a>
    );
  }

  return (
    <Link href={action.href ?? "/"} className={className}>
      {icon}
      {action.label}
    </Link>
  );
}
