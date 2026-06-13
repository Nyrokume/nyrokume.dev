"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { TerminalReveal, TypewriterPrompt } from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";

export function AboutSection() {
  const { content } = useLocale();
  const { about } = content;

  return (
    <TerminalWindow title={about.windowTitle} meta={about.meta} cwd="~/about">
      <div className="space-y-4">
        <TypewriterPrompt command={about.command} cwd="~/about" />

        <TerminalReveal delay={500}>
          <div className="rounded border border-border bg-surface-elevated p-4 md:p-5">
            <pre className="whitespace-pre-wrap font-[family-name:var(--font-jetbrains)] text-sm leading-7 text-muted-light">
              <span className="text-muted">{"/**"}</span>
              {"\n"}
              {about.sections.map((section) => (
                <span key={section.title}>
                  {" * "}
                  <span className="text-accent-bright">{section.title}:</span>
                  {"\n"}
                  {section.items.map((item) => (
                    <span key={item}>
                      {" *   - "}
                      {item}
                      {"\n"}
                    </span>
                  ))}
                  {"\n"}
                </span>
              ))}
              <span className="text-muted">{" */"}</span>
            </pre>
          </div>
        </TerminalReveal>
      </div>
    </TerminalWindow>
  );
}
