import type { ReactNode } from "react";

type TerminalWindowProps = {
  title: string;
  meta?: string;
  badge?: ReactNode;
  children: ReactNode;
  id?: string;
  cwd?: string;
};

export function TerminalWindow({
  title,
  meta,
  badge,
  children,
  id,
  cwd = "~",
}: TerminalWindowProps) {
  return (
    <section
      id={id}
      className="linux-window overflow-hidden border border-border bg-surface"
    >
      <div className="linux-titlebar flex min-w-0 items-center gap-1.5 border-b border-border px-2 py-2 sm:gap-2 sm:px-3">
        <span className="hidden shrink-0 text-terminal-success sm:inline" aria-hidden>
          ┌─
        </span>
        <span className="min-w-0 truncate text-xs text-muted-light sm:text-sm">
          <span className="text-prompt-user">nyrokume</span>
          <span className="text-prompt-host">@arch</span>
          <span className="text-foreground">:</span>
          <span className="text-prompt-path">{cwd}</span>
          <span className="text-muted"> — </span>
          <span className="text-foreground">{title}</span>
        </span>
        <span className="hidden shrink-0 text-terminal-success sm:inline" aria-hidden>
          ─┐
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {badge}
          {meta ? <span className="hidden text-xs text-muted sm:inline">{meta}</span> : null}
        </div>
      </div>
      <div className="p-4 sm:p-5 md:p-6">{children}</div>
    </section>
  );
}
