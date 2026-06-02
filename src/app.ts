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
import { bindRouter } from "./lib/urls";
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
        // Satori-supported woff subsets (latin + cyrillic, 400/700) so EN + RU OG titles render —
        // mirrors the legacy fontDir coverage. All share family "IBM Plex Mono"; Satori falls
        // through entries to find glyph coverage per weight.
        fonts: [
          {
            name: "IBM Plex Mono",
            path: "assets/fonts/og/ibm-plex-mono-latin-400-normal.woff",
            weight: 400
          },
          {
            name: "IBM Plex Mono",
            path: "assets/fonts/og/ibm-plex-mono-latin-700-normal.woff",
            weight: 700
          },
          {
            name: "IBM Plex Mono",
            path: "assets/fonts/og/ibm-plex-mono-cyrillic-400-normal.woff",
            weight: 400
          },
          {
            name: "IBM Plex Mono",
            path: "assets/fonts/og/ibm-plex-mono-cyrillic-700-normal.woff",
            weight: 700
          }
        ]
      }
    },
    spa: { components: islands, viewTransitions: true, progressBar: true },
    data: { outputDir: "_data", baseUrl: "/_data/" },
    deploy: { target: "cloudflare-pages", outDir: "dist", productionBranch: "main", ci: true }
  }
});

// Break the createApp ↔ routes cycles: give loaders the cached content API and components the
// router URL builder (both are referenced by routes/components imported above createApp).
bindContent(app.content);
bindRouter(app.router);
