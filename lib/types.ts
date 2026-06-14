export type AboutBlock = {
  title: string;
  items: string[];
};

export type ChatModelOption = {
  id: string;
  label: string;
  recommended?: boolean;
};

export type ChatProviderOption = {
  id: "gemini" | "groq" | "openrouter";
  label: string;
  defaultModel: string;
  models: ChatModelOption[];
};

export type ChatConfig = {
  windowTitle: string;
  meta: string;
  command: string;
  bootLine: string;
  welcome: string;
  placeholder: string;
  inputLabel: string;
  sendLabel: string;
  sendingLabel: string;
  thinking: string;
  hint: string;
  error: string;
  unavailable: string;
  providerLabel: string;
  modelLabel: string;
  defaultProvider: string;
  /** Optional — built from lib/chat-catalog.ts when omitted */
  providers?: ChatProviderOption[];
};

export type Locale = "ru" | "en";

export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export type HeroStat = {
  label: string;
  value: string;
  highlight?: boolean;
  href?: string;
};

export type HeroAction = {
  id: string;
  label: string;
  href?: string;
  icon: "github" | "mail" | "telegram" | "chat";
  primary?: boolean;
  behavior?: "openChat";
};

export type SkillGroup = {
  label: string;
  hint?: string;
  items: string[];
};

export type SkillCategory = {
  id: string;
  label: string;
  hint?: string;
  items?: string[];
  groups?: SkillGroup[];
};

export type ProjectAction = "link" | "chat";

export type ProjectStatus = "active" | "wip" | "done";

export type ProjectMediaItem = {
  src: string;
  alt: string;
  type?: "image" | "video";
  /** Poster for video previews */
  poster?: string;
};

export type ProjectShowcase = {
  /** Display name, e.g. OnePanel */
  title: string;
  /** Category line, e.g. Панели · Заказ · 2024 */
  meta: string;
  preview: ProjectMediaItem[];
  highlight?: {
    text: string;
  };
  technologies?: string[];
};

export type ProjectItem = {
  id: string;
  slug: string;
  sideLabel: string;
  sideHint: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  action: ProjectAction;
  actionLabel: string;
  href?: string;
  /** Rich card with gallery — use for shipped portfolio projects */
  showcase?: ProjectShowcase;
};

export type ContactInquiryConfig = {
  title: string;
  hint: string;
  nameLabel: string;
  namePlaceholder: string;
  contactLabel: string;
  contactPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  websiteLabel: string;
  submitLabel: string;
  sendingLabel: string;
  successLabel: string;
  errorLabel: string;
  unavailableLabel: string;
  fallbackMailLabel: string;
  nameInvalidLabel: string;
  contactInvalidLabel: string;
  messageInvalidLabel: string;
  formHint: string;
};

export type ContactCard = {
  id: string;
  icon: "github" | "handle" | "telegram" | "mail" | "vk" | "discord";
  label: string;
  value: string;
  href?: string;
  copy?: boolean;
};

export type ResumeContent = {
  meta: {
    title: string;
    description: string;
  };
  header: {
    site: string;
    nav: NavItem[];
    online: string;
    githubLabel: string;
    githubHref: string;
    telegramLabel: string;
    telegramHref: string;
    mailLabel: string;
    mailHref: string;
  };
  hero: {
    windowTitle: string;
    availableBadge: string;
    bootLine: string;
    command: string;
    heading: string;
    tagline: string;
    stats: HeroStat[];
    actions: HeroAction[];
  };
  about: {
    windowTitle: string;
    meta: string;
    command: string;
    sections: AboutBlock[];
  };
  skills: {
    windowTitle: string;
    meta: string;
    command: string;
    categories: SkillCategory[];
    footerComment: string;
  };
  projects: {
    windowTitle: string;
    meta: string;
    command: string;
    footerComment: string;
    footerHref: string;
    chatCloseLabel: string;
    backToListLabel: string;
    highlightLabel: string;
    technologiesLabel: string;
    statusLabels: Record<ProjectItem["status"], string>;
    items: ProjectItem[];
    chat: ChatConfig;
  };
  contact: {
    windowTitle: string;
    meta: string;
    command: string;
    handshakeLine: string;
    cards: ContactCard[];
    inquiry: ContactInquiryConfig;
    echoCommand: string;
    echoOutput: string;
    exitLine: string;
  };
  footer: {
    site: string;
    copyright: string;
  };
};
