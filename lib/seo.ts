import type { Metadata } from "next";
import { routes } from "@/lib/routes";

export const SITE_NAME = "nyrokume.dev";
export const SITE_HANDLE = "Nyrokume";
export const SITE_GITHUB = "https://github.com/Nyrokume";
export const SITE_TELEGRAM = "https://t.me/nyrokume";
export const SITE_EMAIL = "nyrokumework@gmail.com";

const DEFAULT_KEYWORDS = [
  "nyrokume.dev",
  "Nyrokume",
  "веб-разработчик",
  "web developer",
  "frontend",
  "backend",
  "React",
  "TypeScript",
  "Next.js",
  "portfolio",
  "resume",
  "terminal portfolio",
];

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.GITHUB_PAGES === "true") {
    const repo = process.env.GITHUB_PAGES_REPO ?? "nyrokume.dev";
    return `https://nyrokume.github.io/${repo}`;
  }

  return "https://nyrokume.github.io/nyrokume.dev";
}

export function normalizePath(path: string): string {
  const value = path.startsWith("/") ? path : `/${path}`;

  if (process.env.GITHUB_PAGES === "true") {
    if (value === "/") return "/";
    return value.endsWith("/") ? value : `${value}/`;
  }

  if (value === "/") return "/";
  return value.replace(/\/$/, "") || "/";
}

export function absoluteUrl(path: string): string {
  return new URL(normalizePath(path), `${getSiteUrl()}/`).toString();
}

type PageSeo = {
  title: string;
  description: string;
};

export const PAGE_SEO: Record<keyof typeof routes, PageSeo> = {
  home: {
    title: "nyrokume.dev — веб-разработчик",
    description:
      "Портфолио nyrokume.dev: сайты и веб-приложения, бэкенд, AI. Terminal-style resume — React, TypeScript, Node.js.",
  },
  about: {
    title: "about — nyrokume.dev",
    description:
      "О создателе nyrokume.dev: фронт, бэкенд, десктоп и AI в проектах — когда это реально помогает.",
  },
  skills: {
    title: "skills — nyrokume.dev",
    description:
      "Навыки nyrokume.dev: React, TypeScript, Node.js, Python, Go, SQL и инструменты разработки.",
  },
  projects: {
    title: "projects — nyrokume.dev",
    description:
      "Проекты nyrokume.dev: AI-чат ./chat.sh и другие работы веб-разработчика.",
  },
  contact: {
    title: "contact — nyrokume.dev",
    description:
      "Связаться с nyrokume.dev: GitHub, Telegram, email — открыт к предложениям.",
  },
};

export function buildPageMetadata(
  page: keyof typeof routes,
  overrides: Partial<PageSeo> = {},
): Metadata {
  const seo = { ...PAGE_SEO[page], ...overrides };
  const path = routes[page];
  const url = absoluteUrl(path);

  return {
    title: seo.title,
    description: seo.description,
    keywords: DEFAULT_KEYWORDS,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: SITE_NAME,
      locale: "ru_RU",
      alternateLocale: ["en_US"],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: seo.title,
      description: seo.description,
      creator: `@${SITE_HANDLE.toLowerCase()}`,
    },
  };
}

export function buildRootMetadata(): Metadata {
  const home = buildPageMetadata("home");

  return {
    metadataBase: new URL(`${getSiteUrl()}/`),
    applicationName: SITE_NAME,
    authors: [{ name: SITE_HANDLE, url: SITE_GITHUB }],
    creator: SITE_HANDLE,
    publisher: SITE_NAME,
    category: "technology",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...home,
    title: PAGE_SEO.home.title,
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
      shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
    },
  };
}

export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    email: SITE_EMAIL,
    sameAs: [SITE_GITHUB, SITE_TELEGRAM],
    jobTitle: "Web Developer",
    knowsAbout: ["Web Development", "React", "TypeScript", "Node.js", "Python"],
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: PAGE_SEO.home.description,
    inLanguage: ["ru", "en"],
    author: {
      "@type": "Person",
      name: SITE_HANDLE,
      url: SITE_GITHUB,
    },
  };
}

export const SITEMAP_PATHS = Object.values(routes);
