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
  icon: "github" | "mail" | "copy";
  primary?: boolean;
  copyValue?: string;
};

export type SkillCategory = {
  id: string;
  label: string;
  items: string[];
};

export type ProjectAction = "link" | "chat";

export type ProjectItem = {
  id: string;
  slug: string;
  sideLabel: string;
  sideHint: string;
  description: string;
  status: "active" | "wip";
  tags: string[];
  action: ProjectAction;
  actionLabel: string;
  href?: string;
};

export type ContactCard = {
  id: string;
  icon: "github" | "handle" | "telegram" | "mail";
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
    echoCommand: string;
    echoOutput: string;
    exitLine: string;
  };
};
