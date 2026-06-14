"use client";

import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";

export function SiteFooter() {
  const { content } = useLocale();
  const { footer } = content;

  return (
    <footer className="page-shell border-t border-border/60 pb-10 pt-8">
      <div className="flex flex-col gap-1.5">
        <Link
          href="/"
          className="focus-ring w-fit text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-accent-bright"
        >
          {footer.site}
        </Link>
        <p className="text-xs leading-relaxed text-muted">{footer.copyright}</p>
      </div>
    </footer>
  );
}
