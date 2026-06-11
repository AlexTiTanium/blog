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

/**
 * Source-repository links surfaced as the footer's GitHub chips: this blog's source
 * plus the two Moku packages it is built on.
 */
export const REPOS = {
  /** This blog's source. */
  blog: "https://github.com/AlexTiTanium/blog",
  /** The `@moku-labs/web` framework (Layers 1+2). */
  web: "https://github.com/moku-labs/web",
  /** The Moku Core micro-kernel. */
  core: "https://github.com/moku-labs/core"
} as const;
