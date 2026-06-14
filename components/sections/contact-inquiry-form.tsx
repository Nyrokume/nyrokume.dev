"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { TerminalReveal } from "@/components/ui/terminal-anim";
import { getInquiryApiUrl } from "@/lib/api-base-url";
import { collectInquiryClientMeta } from "@/lib/inquiry-client-meta";
import { buildInquiryMailto } from "@/lib/inquiry-mailto";
import type { ContactInquiryConfig } from "@/lib/types";
import {
  INQUIRY_LIMITS,
  validateInquiryFields,
  type InquiryValidationField,
} from "@/shared/inquiry-validation";

type ContactInquiryFormProps = {
  inquiry: ContactInquiryConfig;
  delay?: number;
};

function validationMessage(
  field: InquiryValidationField,
  inquiry: ContactInquiryConfig,
): string {
  switch (field) {
    case "name":
      return inquiry.nameInvalidLabel;
    case "contact":
      return inquiry.contactInvalidLabel;
    case "message":
      return inquiry.messageInvalidLabel;
  }
}

export function ContactInquiryForm({ inquiry, delay = 0 }: ContactInquiryFormProps) {
  const { locale } = useLocale();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailtoFallback, setMailtoFallback] = useState<string | null>(null);

  const trimmedValues = useMemo(
    () => ({
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim(),
    }),
    [name, contact, message],
  );

  const canSubmit =
    validateInquiryFields(trimmedValues) === null &&
    !loading &&
    Boolean(trimmedValues.name && trimmedValues.contact && trimmedValues.message);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setMailtoFallback(null);

    const invalidField = validateInquiryFields(trimmedValues);
    if (invalidField) {
      setError(validationMessage(invalidField, inquiry));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...trimmedValues,
        locale,
      };
      const mailto = buildInquiryMailto(payload);

      const response = await fetch(getInquiryApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          website,
          meta: collectInquiryClientMeta(),
        }),
      });

      let data: { ok?: boolean; error?: string };
      try {
        data = (await response.json()) as typeof data;
      } catch {
        throw new Error(inquiry.unavailableLabel);
      }

      if (!response.ok) {
        if (response.status === 503) {
          setMailtoFallback(mailto);
          throw new Error(inquiry.unavailableLabel);
        }

        const apiError = data.error ?? inquiry.errorLabel;
        if (apiError === "Invalid name format") {
          throw new Error(inquiry.nameInvalidLabel);
        }
        if (apiError === "Invalid contact format") {
          throw new Error(inquiry.contactInvalidLabel);
        }
        if (apiError === "Invalid message format") {
          throw new Error(inquiry.messageInvalidLabel);
        }

        throw new Error(apiError);
      }

      setSuccess(true);
      setName("");
      setContact("");
      setMessage("");
      setWebsite("");
    } catch (submitError) {
      const raw = submitError instanceof Error ? submitError.message : inquiry.errorLabel;
      const isNetwork =
        raw === "Failed to fetch" || raw.includes("NetworkError") || raw === inquiry.unavailableLabel;
      if (isNetwork && !mailtoFallback) {
        setMailtoFallback(buildInquiryMailto({ ...trimmedValues, locale }));
      }
      setError(raw === "Failed to fetch" ? inquiry.unavailableLabel : raw);
    } finally {
      setLoading(false);
    }
  }

  const inputClassName =
    "focus-ring w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-accent/50 disabled:opacity-60";

  return (
    <TerminalReveal delay={delay}>
      <article className="rounded-lg border border-border bg-surface-elevated p-4 sm:p-5">
        <div className="mb-4 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-terminal-success">
            [stdin]
          </p>
          <h3 className="text-base font-semibold text-foreground">{inquiry.title}</h3>
          <p className="text-sm text-muted">{inquiry.hint}</p>
        </div>

        <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="hidden" aria-hidden>
            <label htmlFor="inquiry-website">{inquiry.websiteLabel}</label>
            <input
              id="inquiry-website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="inquiry-name" className="mb-1.5 block text-xs text-muted">
              {inquiry.nameLabel}
            </label>
            <input
              id="inquiry-name"
              type="text"
              required
              minLength={INQUIRY_LIMITS.nameMin}
              maxLength={INQUIRY_LIMITS.nameMax}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={inquiry.namePlaceholder}
              disabled={loading}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="inquiry-contact" className="mb-1.5 block text-xs text-muted">
              {inquiry.contactLabel}
            </label>
            <input
              id="inquiry-contact"
              type="text"
              required
              maxLength={INQUIRY_LIMITS.contactMax}
              autoComplete="email"
              inputMode="email"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder={inquiry.contactPlaceholder}
              disabled={loading}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="inquiry-message" className="mb-1.5 block text-xs text-muted">
              {inquiry.messageLabel}
            </label>
            <textarea
              id="inquiry-message"
              required
              rows={4}
              minLength={INQUIRY_LIMITS.messageMin}
              maxLength={INQUIRY_LIMITS.messageMax}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={inquiry.messagePlaceholder}
              disabled={loading}
              className={`${inputClassName} min-h-[6.5rem] resize-y`}
            />
          </div>

          {success ? (
            <p className="rounded border border-terminal-success/40 bg-terminal-success/10 px-3 py-2 text-sm text-terminal-success">
              {inquiry.successLabel}
            </p>
          ) : null}

          {error ? (
            <div className="space-y-2">
              <p className="rounded border border-accent/40 bg-accent-muted px-3 py-2 text-sm text-accent-bright">
                {error}
              </p>
              {mailtoFallback ? (
                <a
                  href={mailtoFallback}
                  className="focus-ring inline-flex cursor-pointer rounded border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-accent/40 hover:text-prompt-user"
                >
                  {inquiry.fallbackMailLabel}
                </a>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="focus-ring w-full cursor-pointer rounded border border-accent/50 bg-accent-muted px-4 py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? inquiry.sendingLabel : inquiry.submitLabel}
          </button>
        </form>
      </article>
    </TerminalReveal>
  );
}
