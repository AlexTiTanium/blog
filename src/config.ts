/** @file Site identity constants — shared by app.ts, spa.tsx, routes.ts. */

/**
 * Deploy-time origin override, read ONLY on the Node/SSG side. `config.ts` is reached by the
 * browser bundle (spa.tsx → routes/head), where `process` does not exist — an unguarded
 * `process.env` reference throws `ReferenceError: process is not defined` at module load and
 * kills hydration. The `typeof` guard is browser-safe (it short-circuits before touching `process`).
 */
const envSiteUrl = typeof process === "undefined" ? undefined : process.env.SITE_URL;

export const SITE = {
  name: "Geek Life",
  url: envSiteUrl ?? "https://geeklife.dev",
  author: "Alex Kucherenko",
  description: "A literary, self-ironic dev blog"
} as const;
