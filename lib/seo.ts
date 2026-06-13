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
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "Python",
  "Go",
  "PostgreSQL",
  "Docker",
  "portfolio",
  "resume",
  "terminal portfolio",
  "AI integrations",
];

/** GitHub Pages project-site prefix, e.g. `/nyrokume.dev`. Empty locally. */
export function getBasePath(): string {
  if (process.env.GITHUB_PAGES === "true") {
    const repo = process.env.GITHUB_PAGES_REPO ?? "nyrokume.dev";
    return `/${repo}`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const pathname = new URL(siteUrl).pathname.replace(/\/$/, "");
      if (pathname && pathname !== "/") {
        return pathname;
      }
    } catch {
      // ignore invalid URL
    }
  }

  return "";
}

export function getSiteUrl(): string {
  if (process.env.GITHUB_PAGES === "true") {
    const repo = process.env.GITHUB_PAGES_REPO ?? "nyrokume.dev";
    return `https://nyrokume.github.io/${repo}`;
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  return "http://localhost:3000";
}

/** Root-relative asset path with optional GitHub Pages basePath. */
export function assetPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBasePath()}${normalized}`;
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
  const base = getSiteUrl().replace(/\/$/, "");
  const normalized = normalizePath(path);

  if (normalized === "/") {
    return `${base}/`;
  }

  return `${base}${normalized}`;
}

type PageSeo = {
  title: string;
  description: string;
};

export const PAGE_SEO: Record<keyof typeof routes, PageSeo> = {
  home: {
    title: "nyrokume.dev — веб-разработчик",
    description:
      "Портфолио Nyrokume: сайты и веб-приложения, React, Next.js, backend, AI-интеграции. Terminal-style resume.",
  },
  about: {
    title: "about — nyrokume.dev",
    description:
      "О Nyrokume: фронтенд, бэкенд, интеграции, десктоп и AI — подход и стек автора nyrokume.dev.",
  },
  skills: {
    title: "skills — nyrokume.dev",
    description:
      "49 навыков Nyrokume: frontend, backend, API, frameworks, tools — полный стек на nyrokume.dev/skills.",
  },
  projects: {
    title: "projects — nyrokume.dev",
    description:
      "Проекты nyrokume.dev: AI-ассистент ./chat.sh — ответы о сайте и авторе.",
  },
  contact: {
    title: "contact — nyrokume.dev",
    description:
      "Связаться с Nyrokume: GitHub, Telegram, email — открыт к предложениям.",
  },
};

function buildSocialImages(title: string) {
  const url = absoluteUrl("/icon.svg");

  return {
    openGraph: {
      images: [{ url, width: 32, height: 32, alt: title, type: "image/svg+xml" }],
    },
    twitter: {
      images: [url],
    },
  };
}

export function buildPageMetadata(
  page: keyof typeof routes,
  overrides: Partial<PageSeo> = {},
): Metadata {
  const seo = { ...PAGE_SEO[page], ...overrides };
  const path = routes[page];
  const url = absoluteUrl(path);
  const social = buildSocialImages(seo.title);

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
      ...social.openGraph,
    },
    twitter: {
      card: "summary",
      title: seo.title,
      description: seo.description,
      creator: `@${SITE_HANDLE.toLowerCase()}`,
      ...social.twitter,
    },
  };
}

export function buildRootMetadata(): Metadata {
  const home = buildPageMetadata("home");
  const iconPath = assetPath("/icon.svg");
  const appleIconPath = assetPath("/apple-icon.svg");

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
      icon: [{ url: iconPath, type: "image/svg+xml", sizes: "any" }],
      apple: [{ url: appleIconPath, type: "image/svg+xml", sizes: "180x180" }],
      shortcut: [{ url: iconPath, type: "image/svg+xml" }],
    },
  };
}

export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_HANDLE,
    alternateName: SITE_NAME,
    url: absoluteUrl("/"),
    email: SITE_EMAIL,
    sameAs: [SITE_GITHUB, SITE_TELEGRAM],
    jobTitle: "Web Developer",
    knowsAbout: [
      "Web Development",
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Python",
      "Go",
      "Docker",
      "AI integrations",
    ],
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
