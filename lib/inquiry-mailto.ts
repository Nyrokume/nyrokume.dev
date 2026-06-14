const INQUIRY_MAIL = "nyrokumework@gmail.com";

type InquiryMailtoPayload = {
  name: string;
  contact: string;
  message: string;
  locale: "ru" | "en";
};

export function buildInquiryMailto(payload: InquiryMailtoPayload): string {
  const subject =
    payload.locale === "en"
      ? "Inquiry from nyrokume.dev"
      : "Заявка с nyrokume.dev";

  const body = [
    payload.locale === "en" ? "Name" : "Имя",
    `: ${payload.name}`,
    "",
    payload.locale === "en" ? "Contact" : "Контакт",
    `: ${payload.contact}`,
    "",
    payload.locale === "en" ? "Task" : "Задача",
    ":",
    payload.message,
  ].join("\n");

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${INQUIRY_MAIL}?${params.toString()}`;
}
