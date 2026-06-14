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

function LsSummary({
  dirCount,
  total,
  entriesLabel,
}: {
  dirCount: number;
  total: number;
  entriesLabel: string;
}) {
  return (
    <div className="rounded border border-border bg-surface-elevated px-4 py-3 sm:px-5 sm:py-3.5">
      <p className="terminal-log text-sm leading-6">
        <span className="text-terminal-success">total</span>{" "}
        <span className="tabular-nums text-foreground">{dirCount}</span>{" "}
        <span className="text-muted-light">dirs</span>
        <span className="text-muted"> · </span>
        <span className="tabular-nums text-foreground">{total}</span>{" "}
        <span className="text-muted-light">{entriesLabel}</span>
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">
        drwxr-xr-x · nyrokume · arch · ./skills/
      </p>
    </div>
  );
}

function SkillTag({ item }: { item: string }) {
  return (
    <span className="group/tag inline-flex max-w-full min-w-0 items-center gap-0.5 rounded-md border border-border bg-background px-3 py-2 text-sm leading-snug text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/45 hover:bg-accent-muted/20">
      <span className="shrink-0 text-muted transition-colors group-hover/tag:text-accent/80">
        &quot;
      </span>
      <span className="break-words">{item}</span>
      <span className="shrink-0 text-muted transition-colors group-hover/tag:text-accent/80">
        &quot;
      </span>
    </span>
  );
}

function SkillTags({ items }: { items: string[] }) {
  return (
    <div className="relative pl-4 sm:pl-5">
      <span className="absolute bottom-2 left-0 top-2 w-px bg-border" aria-hidden />
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {items.map((item) => (
          <SkillTag key={item} item={item} />
        ))}
      </div>
    </div>
  );
}

function CategoryHeader({
  category,
  itemCount,
  entriesLabel,
  index,
}: {
  category: SkillCategory;
  itemCount: number;
  entriesLabel: string;
  index: number;
}) {
  return (
    <header className="border-b border-border bg-surface-elevated">
      <div className="flex items-start gap-4 px-4 py-4 sm:px-5">
        <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-background text-muted-light shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <span className="text-[10px] tabular-nums leading-none text-muted-light">
            {String(index + 1).padStart(2, "0")}
          </span>
          <SkillCategoryIcon id={category.id} className="mt-1 h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-terminal-success">
                [dir]
              </p>
              <p className="text-base font-semibold leading-snug text-accent-bright">
                {category.label}
              </p>
            </div>
            <span className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 text-xs tabular-nums leading-none text-muted-light">
              {itemCount} {entriesLabel}
            </span>
          </div>
          {category.hint ? (
            <p className="text-sm leading-relaxed text-muted-light">{`# ${category.hint}`}</p>
          ) : null}
        </div>
      </div>

      <p className="border-t border-border/40 px-4 py-2 text-xs leading-none text-muted sm:px-5">
        drwxr-xr-x · nyrokume · arch
      </p>
    </header>
  );
}

function SkillGroupPanel({
  group,
  isLast,
}: {
  group: SkillGroup;
  isLast?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-background/45 p-4 sm:p-5">
      <span className="absolute inset-y-4 left-0 w-0.5 bg-accent/25" aria-hidden />

      <div className="mb-4 flex flex-wrap items-start gap-x-2 gap-y-1 pl-2">
        <span className="pt-0.5 text-sm text-terminal-success" aria-hidden>
          {isLast ? "└──" : "├──"}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-sm font-semibold leading-snug text-foreground">
              {group.label}
            </span>
            <span className="shrink-0 rounded border border-border bg-surface px-2 py-0.5 text-xs tabular-nums text-muted-light">
              {group.items.length}
            </span>
          </div>
          {group.hint ? (
            <p className="text-sm leading-relaxed text-muted">{`# ${group.hint}`}</p>
          ) : null}
        </div>
      </div>

      <SkillTags items={group.items} />
    </div>
  );
}

function SkillCategoryCard({
  category,
  entriesLabel,
  index,
  adjacent = false,
}: {
  category: SkillCategory;
  entriesLabel: string;
  index: number;
  adjacent?: boolean;
}) {
  const itemCount = countCategoryItems(category);

  return (
    <article
      className={`group relative h-full overflow-hidden bg-surface-elevated transition-colors ${
        adjacent
          ? "rounded-none border-0"
          : "rounded-lg border border-border hover:border-accent/35"
      }`}
    >
      <span
        className="absolute inset-y-0 left-0 w-1 bg-terminal-success/45 transition-colors group-hover:bg-terminal-success"
        aria-hidden
      />

      <CategoryHeader
        category={category}
        itemCount={itemCount}
        entriesLabel={entriesLabel}
        index={index}
      />

      <div className="space-y-1 px-4 py-5 pl-5 sm:px-5 sm:py-6 sm:pl-6">
        {category.groups ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {category.groups.map((group, groupIndex) => (
              <SkillGroupPanel
                key={group.label}
                group={group}
                isLast={
                  groupIndex === category.groups!.length - 1 && category.groups!.length > 1
                }
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
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-elevated px-4 py-4 sm:px-5">
      <span
        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--accent-muted)]"
        aria-hidden
      />
      <p className="text-sm leading-7 text-muted-light">
        {parts[0]}
        <span className="font-semibold tabular-nums text-foreground">{total}</span>
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

  const wideCategories: Array<{ category: SkillCategory; index: number }> = [];
  const compactCategories: Array<{ category: SkillCategory; index: number }> = [];

  skills.categories.forEach((category, index) => {
    if (categorySpansFull(category)) {
      wideCategories.push({ category, index });
    } else {
      compactCategories.push({ category, index });
    }
  });

  return (
    <TerminalWindow id="skills" title={skills.windowTitle} meta={skills.meta} cwd="~/skills">
      <div className="space-y-7 sm:space-y-8">
        <div className="space-y-4">
          <TypewriterPrompt command={skills.command} cwd="~/skills" />
          <TerminalReveal delay={280}>
            <LsSummary
              dirCount={skills.categories.length}
              total={totalItems}
              entriesLabel={entriesLabel}
            />
          </TerminalReveal>
        </div>

        <div className="space-y-5 md:space-y-6">
          {wideCategories.map(({ category, index }, blockIndex) => (
            <TerminalReveal key={category.id} delay={420 + blockIndex * 90}>
              <SkillCategoryCard
                category={category}
                entriesLabel={entriesLabel}
                index={index}
              />
            </TerminalReveal>
          ))}

          {compactCategories.length > 0 ? (
            <TerminalReveal
              delay={420 + wideCategories.length * 90}
              className="overflow-hidden rounded-lg border border-border"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {compactCategories.map(({ category, index }, compactIndex) => (
                  <div
                    key={category.id}
                    className={compactIndex > 0 ? "border-t border-border md:border-l md:border-t-0" : ""}
                  >
                    <SkillCategoryCard
                      category={category}
                      entriesLabel={entriesLabel}
                      index={index}
                      adjacent
                    />
                  </div>
                ))}
              </div>
            </TerminalReveal>
          ) : null}
        </div>

        <TerminalReveal delay={420 + skills.categories.length * 90 + 180}>
          <SkillsFooter comment={skills.footerComment} total={totalItems} />
        </TerminalReveal>
      </div>
    </TerminalWindow>
  );
}
