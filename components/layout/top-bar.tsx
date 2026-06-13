"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import type { ResumeContent } from "@/lib/types";

/** Inline nav from lg (1024px). Below — hamburger menu. */
const COMPACT_NAV_QUERY = "(max-width: 1023px)";

function subscribeCompactNav(onChange: () => void) {
  const media = window.matchMedia(COMPACT_NAV_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getCompactNavSnapshot() {
  return window.matchMedia(COMPACT_NAV_QUERY).matches;
}

function getCompactNavServerSnapshot() {
  return false;
}

function useCompactNav() {
  return useSyncExternalStore(
    subscribeCompactNav,
    getCompactNavSnapshot,
    getCompactNavServerSnapshot,
  );
}

export function TopBar() {
  const { content, locale, setLocale } = useLocale();
  const { header } = content;
  const pathname = usePathname();
  const [time, setTime] = useState("00:00:00");
  const [menuOpen, setMenuOpen] = useState(false);
  const isCompact = useCompactNav();

  const currentNav =
    header.nav.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    ) ?? header.nav[0];

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen && isCompact ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, isCompact]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="header-shell flex flex-col py-3 sm:py-4 lg:min-h-[4.25rem] lg:flex-row lg:items-center lg:gap-6 lg:py-3">
        <div className="flex min-w-0 items-center justify-between gap-3 lg:shrink-0 lg:min-w-[11rem]">
          <div className="flex min-w-0 items-center gap-1.5 text-sm sm:gap-2">
            <Link
              href="/"
              className="focus-ring truncate text-foreground transition-colors hover:text-accent-bright"
            >
              {header.site}
            </Link>
            <span className="shrink-0 text-muted">/</span>
            <span className="truncate text-accent-bright">{currentNav.label}</span>
          </div>

          {isCompact ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="tabular-nums text-xs text-muted">{time}</span>
              <LanguageSwitch locale={locale} setLocale={setLocale} />
              <MobileMenuButton
                open={menuOpen}
                onClick={() => setMenuOpen((value) => !value)}
              />
            </div>
          ) : null}
        </div>

        {!isCompact ? (
          <>
            <nav
              className="scrollbar-none hidden min-w-0 flex-1 items-center gap-2 overflow-hidden lg:flex"
              aria-label="Site"
            >
              <NavLinks pathname={pathname} nav={header.nav} />
              <SocialDropdown header={header} />
              <span className="shrink-0 tabular-nums text-xs text-muted">{time}</span>
            </nav>
            <div className="hidden shrink-0 lg:flex">
              <LanguageSwitch locale={locale} setLocale={setLocale} />
            </div>
          </>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && isCompact ? (
          <MobileMenu
            header={header}
            pathname={pathname}
            time={time}
            onClose={() => setMenuOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function MobileMenuButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onClick}
      className="focus-ring flex h-9 w-9 cursor-pointer items-center justify-center rounded border border-border text-muted-light transition-colors hover:border-muted hover:text-foreground"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden>
        {open ? (
          <path strokeWidth="2" d="M6 6l12 12M18 6 6 18" />
        ) : (
          <>
            <path strokeWidth="2" d="M4 7h16" />
            <path strokeWidth="2" d="M4 12h16" />
            <path strokeWidth="2" d="M4 17h16" />
          </>
        )}
      </svg>
    </button>
  );
}

function MobileMenu({
  header,
  pathname,
  time,
  onClose,
}: {
  header: ResumeContent["header"];
  pathname: string;
  time: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      id="mobile-nav"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden border-t border-border bg-background lg:hidden"
    >
      <motion.div
        initial={{ y: -8 }}
        animate={{ y: 0 }}
        exit={{ y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="header-shell flex flex-col gap-1 py-3"
      >
        {header.nav.map((item, index) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + index * 0.04, duration: 0.22 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`focus-ring block rounded px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border border-accent/50 bg-accent-muted text-accent-bright"
                    : "text-muted-light hover:bg-surface-elevated hover:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.22 }}
          className="mt-2 border-t border-border/60 pt-3"
        >
          <p className="mb-2 px-3 text-xs text-muted">connect</p>
          <div className="grid grid-cols-1 gap-1">
            <SocialLink
              href={header.githubHref}
              label={header.githubLabel}
              icon="github"
              external
              onSelect={onClose}
            />
            <SocialLink
              href={header.telegramHref}
              label={header.telegramLabel}
              icon="telegram"
              external
              onSelect={onClose}
            />
            <SocialLink
              href={header.mailHref}
              label={header.mailLabel}
              icon="mail"
              onSelect={onClose}
            />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.2 }}
          className="px-3 pt-2 text-xs text-muted"
        >
          <span className="tabular-nums">{time}</span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function NavLinks({
  pathname,
  nav,
}: {
  pathname: string;
  nav: ResumeContent["header"]["nav"];
}) {
  return (
    <div className="scrollbar-none flex min-w-0 flex-1 flex-nowrap items-center justify-center gap-2 overflow-hidden">
      {nav.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`focus-ring shrink-0 rounded border px-3 py-1.5 text-sm transition-colors ${
              active
                ? "border-accent/50 bg-accent-muted text-accent-bright"
                : "border-transparent text-muted-light hover:border-border hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function LanguageSwitch({
  locale,
  setLocale,
}: {
  locale: string;
  setLocale: (locale: "ru" | "en") => void;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {(["ru", "en"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLocale(lang)}
          className={`focus-ring cursor-pointer rounded px-2 py-1 text-xs uppercase transition-colors ${
            locale === lang
              ? "text-prompt-user"
              : "text-muted hover:text-foreground"
          }`}
          aria-pressed={locale === lang}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}

function SocialDropdown({ header }: { header: ResumeContent["header"] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring flex cursor-pointer items-center gap-1.5 rounded border border-transparent px-2 py-1.5 text-sm text-foreground transition-colors hover:border-border hover:text-prompt-user"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
          <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-3 .7-3.6-1.3-3.6-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 1.7 2.5 1.2.1-.9.4-1.5.7-1.8-2.4-.3-4.9-1.2-4.9-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10.3 10.3 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.2-2.5 5.1-4.9 5.4.4.3.8 1 .8 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
        </svg>
        {header.githubLabel}
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 fill-none stroke-current opacity-50 transition-transform ${
            open ? "rotate-180 opacity-100" : ""
          }`}
          aria-hidden
        >
          <path strokeWidth="2" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-full z-[60] min-w-[9.5rem] pt-1 transition-opacity duration-150 ${
          open
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
        role="menu"
      >
        <div className="overflow-hidden rounded border border-border bg-surface-elevated py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
          <SocialLink
            href={header.githubHref}
            label={header.githubLabel}
            icon="github"
            external
            onSelect={() => setOpen(false)}
          />
          <SocialLink
            href={header.telegramHref}
            label={header.telegramLabel}
            icon="telegram"
            external
            onSelect={() => setOpen(false)}
          />
          <SocialLink
            href={header.mailHref}
            label={header.mailLabel}
            icon="mail"
            onSelect={() => setOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

function SocialLink({
  href,
  label,
  icon,
  external,
  onSelect,
}: {
  href: string;
  label: string;
  icon: "github" | "telegram" | "mail";
  external?: boolean;
  onSelect?: () => void;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      role="menuitem"
      onClick={onSelect}
      className="focus-ring flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-muted-light transition-colors hover:bg-surface hover:text-foreground"
    >
      <SocialIcon icon={icon} />
      {label}
    </a>
  );
}

function SocialIcon({ icon }: { icon: "github" | "telegram" | "mail" }) {
  const className = "h-3.5 w-3.5 shrink-0 text-muted-light";

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
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.2 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} aria-hidden>
      <path strokeWidth="2" d="M4 6h16v12H4z" />
      <path strokeWidth="2" d="m4 7 8 5 8-5" />
    </svg>
  );
}
