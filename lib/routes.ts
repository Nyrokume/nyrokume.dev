export const routes = {
  home: "/",
  about: "/about",
  skills: "/skills",
  projects: "/projects",
  contact: "/contact",
} as const;

export type SiteRoute = (typeof routes)[keyof typeof routes];
