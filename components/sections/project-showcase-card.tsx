"use client";

import { useState } from "react";
import { assetPath } from "@/lib/seo";
import type { ProjectItem } from "@/lib/types";

type ProjectShowcaseCardProps = {
  project: ProjectItem;
  statusLabel: string;
  highlightLabel: string;
  technologiesLabel: string;
  backLabel: string;
  onBack: () => void;
};

function resolveMediaSrc(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  return assetPath(src);
}

function StatusBadge({ status, label }: { status: ProjectItem["status"]; label: string }) {
  const styles =
    status === "done"
      ? "border-terminal-success/50 text-terminal-success"
      : status === "wip"
        ? "border-accent-wip/50 text-accent-wip"
        : "border-terminal-success/50 text-terminal-success";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

export function ProjectShowcaseCard({
  project,
  statusLabel,
  highlightLabel,
  technologiesLabel,
  backLabel,
  onBack,
}: ProjectShowcaseCardProps) {
  const showcase = project.showcase;
  const [activeIndex, setActiveIndex] = useState(0);

  if (!showcase) {
    return null;
  }

  const previews = showcase.preview;
  const active = previews[activeIndex] ?? previews[0];
  const isExternalLink = project.href?.startsWith("http");
  const isChat = project.action === "chat";

  function openVideo(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <article className="overflow-hidden rounded border border-border bg-surface-elevated">
      {previews.length > 0 && active ? (
        <div className="border-b border-border bg-surface">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
            {active.type === "video" ? (
              <button
                type="button"
                onClick={() => openVideo(active.src)}
                className="focus-ring group relative block h-full w-full cursor-pointer"
                aria-label={active.alt}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveMediaSrc(active.poster ?? active.src)}
                  alt={active.alt}
                  className="h-full w-full object-cover object-top transition-opacity group-hover:opacity-90"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/45">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/60 bg-surface/90 text-accent-bright">
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </button>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={resolveMediaSrc(active.src)}
                alt={active.alt}
                className="h-full w-full object-cover object-top"
              />
            )}
          </div>

          {previews.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto px-3 py-2.5">
              {previews.map((item, index) => {
                const isVideo = item.type === "video";
                const thumbSrc = resolveMediaSrc(item.poster ?? item.src);

                return (
                  <button
                    key={`${item.src}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`focus-ring relative h-14 w-24 shrink-0 cursor-pointer overflow-hidden rounded border bg-black transition-colors ${
                      index === activeIndex
                        ? "border-accent"
                        : "border-border hover:border-accent/40"
                    }`}
                    aria-label={item.alt}
                    aria-pressed={index === activeIndex}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbSrc}
                      alt=""
                      className="h-full w-full object-cover object-top"
                    />
                    {isVideo ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent/50 bg-surface/80 text-accent-bright">
                          <svg viewBox="0 0 24 24" className="ml-px h-3 w-3 fill-current" aria-hidden>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] tracking-wide text-muted">{showcase.meta}</p>
          <StatusBadge status={project.status} label={statusLabel} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground sm:text-2xl">{showcase.title}</h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-light">{project.description}</p>
        </div>

        {showcase.highlight ? (
          <div className="flex gap-3 border-l-2 border-accent pl-4">
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-accent-bright">
                {highlightLabel}
              </p>
              <p className="text-sm font-medium leading-6 text-foreground sm:text-base">
                {showcase.highlight.text}
              </p>
            </div>
          </div>
        ) : null}

        {showcase.technologies && showcase.technologies.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted">
              {technologiesLabel}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {showcase.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-dashed border-border bg-surface px-2 py-0.5 text-[11px] text-muted-light"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {project.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-dashed border-border px-1.5 py-px text-[10px] text-muted"
              >
                --{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="focus-ring cursor-pointer rounded border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground"
          >
            {backLabel}
          </button>

          {!isChat && project.href ? (
            <a
              href={project.href}
              target={isExternalLink ? "_blank" : undefined}
              rel={isExternalLink ? "noopener noreferrer" : undefined}
              className="focus-ring inline-flex cursor-pointer items-center rounded border border-accent/50 bg-accent-muted px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent hover:bg-accent/20"
            >
              {project.actionLabel} {isExternalLink ? "↗" : ""}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
