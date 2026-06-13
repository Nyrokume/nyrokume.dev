import resumeEn from "@/content/resume.en.json";
import resumeRu from "@/content/resume.ru.json";
import type { Locale, ResumeContent } from "@/lib/types";

const contentMap: Record<Locale, ResumeContent> = {
  ru: resumeRu as ResumeContent,
  en: resumeEn as ResumeContent,
};

export function getContent(locale: Locale): ResumeContent {
  return contentMap[locale];
}

export const LOCALE_STORAGE_KEY = "nyrokume-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ru" || value === "en";
}
