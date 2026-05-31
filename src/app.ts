/**
 * @file SSG composition (Node side). Configures all 8 framework plugins and binds the
 * content cache so route loaders never re-parse markdown. Driven by scripts/build.ts.
 */
import { createApp } from "@moku-labs/web";
import { SITE } from "./config";
import { i18nConfig } from "./i18n/index";
import { islands } from "./islands";
import { bindContent } from "./lib/articles";
import { routes } from "./routes";

export const app = createApp({
  config: { mode: "production" },
  pluginConfigs: {
    site: SITE,
    i18n: i18nConfig,
    content: { contentDir: "./content" },
    router: { routes, mode: "hybrid" },
    head: { titleTemplate: "%s — Geek Life", twitterCard: "summary_large_image" },
    build: {
      outDir: "dist",
      feeds: true,
      sitemap: true,
      images: true,
      ogImage: { fontDir: "assets/fonts/og", template: "./src/og/template.tsx" }
    },
    spa: { components: islands, viewTransitions: true, progressBar: true },
    deploy: { target: "cloudflare-pages", outDir: "dist", productionBranch: "main", ci: true }
  }
});

// Break the createApp ↔ routes loader cycle and give loaders the cached content API.
bindContent(app.content);
