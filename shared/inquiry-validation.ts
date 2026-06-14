export type InquiryFieldValues = {
  name: string;
  contact: string;
  message: string;
};

export type InquiryValidationField = "name" | "contact" | "message";

export const INQUIRY_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  contactMax: 120,
  messageMin: 10,
  messageMax: 2000,
} as const;

const URL_IN_TEXT = /https?:\/\/|www\./i;
const UNSAFE_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F<>{}]/;

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const TELEGRAM_USERNAME = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

const TELEGRAM_URL =
  /^(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([a-zA-Z][a-zA-Z0-9_]{4,31})\/?$/i;

export function normalizeInquiryContact(raw: string): string {
  const value = raw.trim();
  const urlMatch = value.match(TELEGRAM_URL);

  if (urlMatch) {
    return `@${urlMatch[1]}`;
  }

  if (value.startsWith("@")) {
    return value;
  }

  if (TELEGRAM_USERNAME.test(value)) {
    return `@${value}`;
  }

  return value;
}

export function isValidInquiryName(name: string): boolean {
  const value = name.trim();

  if (value.length < INQUIRY_LIMITS.nameMin || value.length > INQUIRY_LIMITS.nameMax) {
    return false;
  }

  if (URL_IN_TEXT.test(value) || UNSAFE_CHARS.test(value) || value.includes("@")) {
    return false;
  }

  if (!/\p{L}/u.test(value)) {
    return false;
  }

  return /^[\p{L}\p{M}\p{N}\s'.-]+$/u.test(value);
}

export function isValidInquiryContact(contact: string): boolean {
  const value = contact.trim();

  if (!value || value.length > INQUIRY_LIMITS.contactMax) {
    return false;
  }

  if (UNSAFE_CHARS.test(value)) {
    return false;
  }

  const normalized = normalizeInquiryContact(value);

  if (normalized.startsWith("@")) {
    return TELEGRAM_USERNAME.test(normalized.slice(1));
  }

  return EMAIL_PATTERN.test(value);
}

export function isValidInquiryMessage(message: string): boolean {
  const value = message.trim();

  if (
    value.length < INQUIRY_LIMITS.messageMin ||
    value.length > INQUIRY_LIMITS.messageMax
  ) {
    return false;
  }

  return !UNSAFE_CHARS.test(value);
}

export function validateInquiryFields(
  values: InquiryFieldValues,
): InquiryValidationField | null {
  if (!isValidInquiryName(values.name)) return "name";
  if (!isValidInquiryContact(values.contact)) return "contact";
  if (!isValidInquiryMessage(values.message)) return "message";
  return null;
}

export function formatInquiryContactForStorage(contact: string): string {
  const value = contact.trim();
  const normalized = normalizeInquiryContact(value);
  return normalized.startsWith("@") ? normalized : value.toLowerCase();
}
