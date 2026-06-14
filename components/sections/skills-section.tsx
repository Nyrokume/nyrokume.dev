"use client";

import { SkillCategoryIcon } from "@/components/icons/skill-category-icon";
import { useLocale } from "@/components/providers/locale-provider";
import { TerminalReveal, TypewriterPrompt } from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";
import type { SkillCategory, SkillGroup } from "@/lib/types";
import { countCategoryItems } from "@/lib/skills";

function categorySpansFull(category: SkillCategory): boolean {
  if (category.groups) return true;
  return countCategoryItems(category) > 6;
}

function SkillTag({ item }: { item: string }) {
  return (
    <span className="group/tag inline-flex max-w-full min-w-0 items-center gap-0.5 rounded-md border border-border/80 bg-background/55 px-2.5 py-1.5 text-xs text-foreground/85 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-accent/45 hover:bg-accent-muted/20 hover:text-foreground hover:shadow-[0_0_18px_var(--accent-muted)] sm:text-sm">
      <span className="shrink-0 text-muted/55 transition-colors group-hover/tag:text-accent/70">
        &quot;
      </span>
      <span className="truncate">{item}</span>
      <span className="shrink-0 text-muted/55 transition-colors group-hover/tag:text-accent/70">
        &quot;
      </span>
    </span>
  );
}

function SkillTags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <SkillTag key={item} item={item} />
      ))}
    </div>
  );
}

function CategoryHeader({
  category,
  itemCount,
  entriesLabel,
}: {
  category: SkillCategory;
  itemCount: number;
  entriesLabel: string;
}) {
  return (
    <header className="border-b border-border/60 bg-gradient-to-r from-surface/95 via-surface-elevated/80 to-surface/90">
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-light shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors group-hover:border-accent/45 group-hover:bg-accent-muted/15 group-hover:text-accent-bright">
          <SkillCategoryIcon id={category.id} className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-terminal-success">
              [dir]
            </span>
            <span className="text-sm font-semibold tracking-tight text-accent-bright">
              {category.label}
            </span>
          </div>
          {category.hint ? (
            <p className="mt-1 text-xs text-muted">{`# ${category.hint}`}</p>
          ) : null}
        </div>

        <span className="shrink-0 rounded-md border border-border bg-background px-2 py-1 text-[10px] tabular-nums text-muted">
          {itemCount} {entriesLabel}
        </span>
      </div>

      <p className="border-t border-border/40 px-4 py-1.5 text-[10px] tracking-wide text-muted/75">
        drwxr-xr-x · nyrokume · arch
      </p>
    </header>
  );
}

function SkillGroupPanel({ group, isLast }: { group: SkillGroup; isLast?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border/70 bg-background/45 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
      <div
        className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-accent/25"
        aria-hidden
      />

      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 pl-2">
        <span className="text-xs text-terminal-success" aria-hidden>
          {isLast ? "└──" : "├──"}
        </span>
        <span className="text-sm font-medium text-foreground">{group.label}</span>
        {group.hint ? (
          <span className="text-xs text-muted">{`# ${group.hint}`}</span>
        ) : null}
        <span className="ml-auto rounded border border-border/70 bg-surface px-1.5 py-0.5 text-[10px] tabular-nums text-muted">
          {group.items.length}
        </span>
      </div>

      <div className="pl-2">
        <SkillTags items={group.items} />
      </div>
    </div>
  );
}

function SkillCategoryCard({
  category,
  entriesLabel,
}: {
  category: SkillCategory;
  entriesLabel: string;
}) {
  const itemCount = countCategoryItems(category);

  return (
    <article className="group relative overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-all duration-300 hover:border-accent/35 hover:shadow-[0_10px_40px_-12px_var(--accent-muted)]">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <span
        className="absolute inset-y-0 left-0 w-1 bg-terminal-success/45 transition-colors duration-300 group-hover:bg-terminal-success"
        aria-hidden
      />

      <CategoryHeader
        category={category}
        itemCount={itemCount}
        entriesLabel={entriesLabel}
      />

      <div className="p-4 sm:p-5">
        {category.groups ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {category.groups.map((group, index) => (
              <SkillGroupPanel
                key={group.label}
                group={group}
                isLast={index === category.groups!.length - 1 && category.groups!.length > 1}
              />
            ))}
          </div>
        ) : (
          <SkillTags items={category.items ?? []} />
        )}
      </div>
    </article>
  );
}

function SkillsFooter({ comment, total }: { comment: string; total: number }) {
  const parts = comment.split("{total}");

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-surface-elevated/60 px-4 py-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--accent-muted)]"
        aria-hidden
      />
      <p className="text-sm leading-relaxed text-muted">
        {parts[0]}
        <span className="font-semibold tabular-nums text-accent-bright">{total}</span>
        {parts[1] ?? ""}
      </p>
    </div>
  );
}

export function SkillsSection() {
  const { content, locale } = useLocale();
  const { skills } = content;
  const entriesLabel = locale === "ru" ? "зап." : "entries";
  const totalItems = skills.categories.reduce(
    (sum, category) => sum + countCategoryItems(category),
    0,
  );

  return (
    <TerminalWindow id="skills" title={skills.windowTitle} meta={skills.meta} cwd="~/skills">
      <div className="space-y-6">
        <TypewriterPrompt command={skills.command} cwd="~/skills" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {skills.categories.map((category, categoryIndex) => (
            <TerminalReveal
              key={category.id}
              delay={450 + categoryIndex * 100}
              className={categorySpansFull(category) ? "md:col-span-2" : undefined}
            >
              <SkillCategoryCard category={category} entriesLabel={entriesLabel} />
            </TerminalReveal>
          ))}
        </div>

        <TerminalReveal delay={450 + skills.categories.length * 100 + 200}>
          <SkillsFooter comment={skills.footerComment} total={totalItems} />
        </TerminalReveal>
      </div>
    </TerminalWindow>
  );
}
