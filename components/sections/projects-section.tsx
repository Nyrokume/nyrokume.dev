"use client";

import { useEffect, useState } from "react";
import { ChatSection } from "@/components/sections/chat-section";
import { ProjectShowcaseCard } from "@/components/sections/project-showcase-card";
import { useLocale } from "@/components/providers/locale-provider";
import { TerminalReveal, TypewriterPrompt } from "@/components/ui/terminal-anim";
import { TerminalWindow } from "@/components/ui/terminal-window";
import type { ProjectItem } from "@/lib/types";

const CHAT_PROJECT_ID = "ai-chat";

export function ProjectsSection() {
  const { content } = useLocale();
  const { projects } = content;
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const activeProject =
    projects.items.find((project) => project.id === activeProjectId) ?? null;

  useEffect(() => {
    function syncFromHash() {
      if (window.location.hash === "#chat") {
        setActiveProjectId(CHAT_PROJECT_ID);
        return;
      }

      const match = window.location.hash.match(/^#project-(.+)$/);
      if (match) {
        const id = match[1];
        if (projects.items.some((project) => project.id === id)) {
          setActiveProjectId(id);
          return;
        }
      }

      setActiveProjectId(null);
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [projects.items]);

  function openProject(project: ProjectItem) {
    setActiveProjectId(project.id);

    const hash = project.action === "chat" ? "#chat" : `#project-${project.id}`;
    window.history.replaceState(null, "", hash);

    requestAnimationFrame(() => {
      if (project.action === "chat") {
        document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  function closeProject() {
    setActiveProjectId(null);
    if (window.location.hash === "#chat" || window.location.hash.startsWith("#project-")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  return (
    <div className="space-y-8">
      <TerminalWindow id="projects" title={projects.windowTitle} meta={projects.meta} cwd="~/projects">
        <div className="space-y-5">
          <TypewriterPrompt
            command={activeProject?.slug ?? projects.command}
            cwd="~/projects"
          />

          {activeProject ? (
            <TerminalReveal delay={120}>
              {activeProject.showcase ? (
                <ProjectShowcaseCard
                  project={activeProject}
                  statusLabel={projects.statusLabels[activeProject.status]}
                  highlightLabel={projects.highlightLabel}
                  technologiesLabel={projects.technologiesLabel}
                  backLabel={projects.backToListLabel}
                  onBack={closeProject}
                />
              ) : (
                <ProjectFocusCard
                  project={activeProject}
                  statusLabel={projects.statusLabels[activeProject.status]}
                  backLabel={projects.backToListLabel}
                  onBack={closeProject}
                />
              )}
            </TerminalReveal>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3">
                {projects.items.map((project, index) => (
                  <TerminalReveal key={project.id} delay={450 + index * 180}>
                    <ProjectCard
                      project={project}
                      statusLabel={projects.statusLabels[project.status]}
                      onOpen={() => openProject(project)}
                    />
                  </TerminalReveal>
                ))}
              </div>

              <TerminalReveal delay={450 + projects.items.length * 180 + 150}>
                <a
                  href={projects.footerHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex cursor-pointer text-sm text-muted transition-colors hover:text-prompt-user"
                >
                  {projects.footerComment}
                </a>
              </TerminalReveal>
            </>
          )}
        </div>
      </TerminalWindow>

      {activeProject?.action === "chat" ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeProject}
              className="focus-ring cursor-pointer rounded border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground"
            >
              {projects.chatCloseLabel}
            </button>
          </div>
          <ChatSection chat={projects.chat} />
        </div>
      ) : null}
    </div>
  );
}

function ProjectFocusCard({
  project,
  statusLabel,
  backLabel,
  onBack,
}: {
  project: ProjectItem;
  statusLabel: string;
  backLabel: string;
  onBack: () => void;
}) {
  const isActive = project.status === "active" || project.status === "done";
  const isChat = project.action === "chat";
  const isExternalLink = project.href?.startsWith("http");

  return (
    <article className="overflow-hidden rounded border border-accent/30 bg-surface-elevated text-sm">
      <div className="flex flex-col sm:flex-row">
        <aside className="flex shrink-0 flex-row items-stretch gap-2 border-b border-border bg-surface px-3 py-2 sm:w-28 sm:flex-col sm:border-b-0 sm:border-r md:w-32">
          <div
            className="w-0.5 shrink-0 self-stretch rounded-full bg-accent sm:hidden"
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-accent-bright">
              {project.sideLabel}
            </p>
            <p className="text-[11px] leading-4 text-muted">{project.sideHint}</p>
          </div>
          <div
            className="hidden w-0.5 shrink-0 self-stretch rounded-full bg-accent sm:block"
            aria-hidden
          />
        </aside>

        <div className="min-w-0 flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 shrink-0 fill-none stroke-current text-muted"
                aria-hidden
              >
                {isChat ? (
                  <path strokeWidth="2" d="M4 6h16v12H4z M8 10h8M8 14h5" />
                ) : (
                  <path strokeWidth="2" d="M4 7h5l2 2h9v9H4z" />
                )}
              </svg>
              <span className="truncate text-sm font-medium text-foreground">
                {project.showcase?.title ?? project.slug}
              </span>
            </div>
            <span
              className={`shrink-0 rounded border px-1.5 py-px text-[10px] ${
                isActive
                  ? "border-terminal-success/50 text-terminal-success"
                  : "border-accent-wip/50 text-accent-wip"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-muted-light">{project.description}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-dashed border-border px-1.5 py-px text-[10px] text-muted"
              >
                --{tag}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
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
      </div>
    </article>
  );
}

function ProjectCard({
  project,
  statusLabel,
  onOpen,
}: {
  project: ProjectItem;
  statusLabel: string;
  onOpen: () => void;
}) {
  const isActive = project.status === "active" || project.status === "done";
  const isChat = project.action === "chat";

  return (
    <article className="overflow-hidden rounded border border-border bg-surface-elevated text-sm">
      <div className="flex flex-col sm:flex-row">
        <aside className="flex shrink-0 flex-row items-stretch gap-2 border-b border-border bg-surface px-3 py-2 sm:w-28 sm:flex-col sm:border-b-0 sm:border-r md:w-32">
          <div
            className="w-0.5 shrink-0 self-stretch rounded-full bg-accent sm:hidden"
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-accent-bright">
              {project.sideLabel}
            </p>
            <p className="text-[11px] leading-4 text-muted">{project.sideHint}</p>
          </div>
          <div
            className="hidden w-0.5 shrink-0 self-stretch rounded-full bg-accent sm:block"
            aria-hidden
          />
        </aside>

        <div className="min-w-0 flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 shrink-0 fill-none stroke-current text-muted"
                aria-hidden
              >
                {isChat ? (
                  <path strokeWidth="2" d="M4 6h16v12H4z M8 10h8M8 14h5" />
                ) : (
                  <path strokeWidth="2" d="M4 7h5l2 2h9v9H4z" />
                )}
              </svg>
              <span className="truncate text-sm font-medium text-foreground">
                {project.showcase?.title ?? project.slug}
              </span>
            </div>
            <span
              className={`shrink-0 rounded border px-1.5 py-px text-[10px] ${
                isActive
                  ? "border-terminal-success/50 text-terminal-success"
                  : "border-accent-wip/50 text-accent-wip"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-muted-light">{project.description}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-dashed border-border px-1.5 py-px text-[10px] text-muted"
              >
                --{tag}
              </span>
            ))}
          </div>

          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => onOpen()}
              className="focus-ring w-full cursor-pointer rounded border border-accent/50 bg-accent-muted px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent hover:bg-accent/20 sm:w-auto"
            >
              {project.actionLabel}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
