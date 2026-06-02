/** @file Site identity constants — the single source of truth shared by app.ts, spa.tsx, routes, head builders, and components. */

/**
 * Site identity. `url` carries a deploy-time origin override read ONLY on the Node/SSG side:
 * this module is also reached by the browser bundle (spa.tsx → routes/head/components), where
 * `process` does not exist, so an unguarded `process.env` would throw `ReferenceError: process is
 * not defined` at module load and kill hydration. The inline `typeof process` guard short-circuits
 * before touching `process`, keeping the expression browser-safe; it falls back to the canonical
 * production origin when `SITE_URL` is unset.
 */
export const SITE = {
  /** Display name (also drives the `head` title template). */
  name: "Geek Life",
  /** Canonical origin — overridable at build via `SITE_URL`, else the production origin. */
  url:
    (typeof process === "undefined" ? undefined : process.env.SITE_URL) ?? "https://geeklife.dev",
  /** Default article author (frontmatter `author` overrides per-article). */
  author: "Alex Kucherenko",
  /** Tagline used for the home hero and meta description. */
  description: "A literary, self-ironic dev blog",
  /** Contact email shown on the About page. */
  email: "hello@geeklife.dev",
  /** GitHub handle shown on the About page. */
  github: "@alexkucherenko"
} as const;
