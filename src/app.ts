/**
 * @file SSG composition (Node side). Opts in the Node-only plugins (content/build/deploy/data)
 * on top of `@moku-labs/web`'s browser-safe defaults (site/i18n/router/head/spa), and binds the
 * content cache so route loaders never re-parse markdown. Driven by scripts/build.ts via
 * app.build.run(). The browser entry (src/spa/spa.tsx) omits these Node-only plugins so the
 * client bundle tree-shakes them out (package sideEffects:false).
 */
import { buildPlugin, contentPlugin, createApp, dataPlugin, deployPlugin } from "@moku-labs/web";
import { SITE } from "./config";
import { i18nConfig } from "./i18n/index";
import { islands } from "./islands";
import { bindContent } from "./lib/articles";
import { OgTemplate } from "./og/template";
import { routes } from "./routes";

export const app = createApp({
  plugins: [contentPlugin, buildPlugin, deployPlugin, dataPlugin],
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
      injectAssets: true,
      publicDir: "public",
      notFound: true,
      localeRedirects: true,
      clientEntry: "src/main.ts",
      ogImage: {
        fontDir: "assets/fonts/og",
        render: OgTemplate,
        fonts: [{ name: "IBM Plex Mono", path: "assets/fonts/og/mono-700.ttf", weight: 700 }]
      }
    },
    spa: { components: islands, viewTransitions: true, progressBar: true },
    data: { outputDir: "_data", baseUrl: "/_data/" },
    deploy: { target: "cloudflare-pages", outDir: "dist", productionBranch: "main", ci: true }
  }
});

// Break the createApp ↔ routes loader cycle and give loaders the cached content API.
bindContent(app.content);
