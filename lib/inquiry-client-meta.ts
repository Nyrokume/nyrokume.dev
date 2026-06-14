import type { InquiryClientMeta } from "@/shared/telegram-inquiry";

export function collectInquiryClientMeta(): InquiryClientMeta {
  if (typeof window === "undefined") {
    return {};
  }

  return {
    language: navigator.language || undefined,
    browser: navigator.userAgent || undefined,
  };
}
