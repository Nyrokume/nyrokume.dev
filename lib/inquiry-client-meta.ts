import type { InquiryClientMeta } from "@/shared/telegram-inquiry";

export function collectInquiryClientMeta(): InquiryClientMeta {
  if (typeof window === "undefined") {
    return {};
  }

  const { navigator, screen, location, document } = window;

  return {
    page: location.href,
    referrer: document.referrer || undefined,
    language: navigator.language || undefined,
    languages: navigator.languages?.length
      ? navigator.languages.slice(0, 5).join(", ")
      : undefined,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
    screen: `${screen.width}x${screen.height}@${window.devicePixelRatio}x`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    platform: navigator.platform || undefined,
    userAgent: navigator.userAgent || undefined,
  };
}
