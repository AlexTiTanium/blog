/** @file Site identity constants — the single source of truth shared by app.ts, spa.tsx, routes, head builders, and components. */

/** Site identity. This module is reached by the browser bundle, so it stays free of node globals. */
export const SITE = {
  /** Display name (also drives the `head` title template). */
  name: "Geek Life",
  /** Canonical origin. */
  url: "https://geeklife.in.ua",
  /** Default article author (frontmatter `author` overrides per-article). */
  author: "Oleksandr Kucherenko",
  /** Tagline used for the home hero and meta description. */
  description: "A literary, self-ironic dev blog",
  /** Contact email shown on the About page. */
  email: "kucherenko.email@gmail.com",
  /** GitHub handle shown on the About page. */
  github: "@AlexTiTanium"
} as const;
