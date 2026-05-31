/** @file Site identity constants — shared by app.ts, spa.tsx, routes.ts. */
export const SITE = {
  name: "Geek Life",
  url: process.env.SITE_URL ?? "https://geeklife.dev",
  author: "Alex Kucherenko",
  description: "A literary, self-ironic dev blog"
} as const;
