/**
 * @file SSG composition (Node side). Opts in the Node-only plugins (build/deploy/data/cli) on top of
 * `@moku-labs/web`'s browser-safe defaults (site/i18n/router/head/spa/content shell), and composes
 * the node `fileSystemContent` provider so route loaders read Markdown via `ctx.require(contentPlugin)`.
 * Driven by the thin `scripts/{build,serve,preview,deploy}.ts` entries via `app.cli.*`. The browser
 * entry (src/spa.tsx) omits the Node-only plugins + the provider, so the client bundle stays free
 * of node/native code.
 */
import {
  buildPlugin,
  cliPlugin,
  contentPlugin,
  createApp,
  dataPlugin,
  deployPlugin,
  dotenv,
  fileSystemContent,
  processEnv
} from "@moku-labs/web";
import { SITE } from "./config";
import { i18nConfig } from "./i18n/index";
import { islands } from "./islands";
import { warmSyntaxTheme } from "./lib/shiki-theme";
import { OgDefaultCard } from "./og/default-card";
import { OgTemplate } from "./og/template";
import { routes } from "./routes";

export const app = createApp({
  plugins: [contentPlugin, buildPlugin, deployPlugin, dataPlugin, cliPlugin],
  config: { mode: "hybrid" },
  pluginConfigs: {
    site: SITE,
    i18n: i18nConfig,
    content: {
      providers: [fileSystemContent({ contentDir: "./content", shikiTheme: warmSyntaxTheme })]
    },
    router: { routes },
    // `defaultOgImage` is the site-wide `og:image`/`twitter:image` fallback for every route that does
    // NOT set its own (home, archive, about, tags, paged listings, + the bare-domain redirect via
    // `head.siteHead`) — articles still win with their per-article card. The card itself is generated
    // by `build.ogImage.defaultCard` below (framework-rendered to `/og-default.png`). The framework
    // absolutizes this relative path against `SITE.url`.
    head: {
      titleTemplate: `%s — ${SITE.name}`,
      twitterCard: "summary_large_image",
      defaultOgImage: "/og-default.png"
    },
    build: {
      outDir: "dist",
      feeds: true,
      sitemap: true,
      images: true,
      injectAssets: true,
      publicDir: "public",
      // Custom 404 — `path` to a complete, app-owned page emitted verbatim as dist/404.html
      // (links /assets/main.css itself, since the 404 page gets no asset injection). See src/404.html.
      notFound: { path: "src/404.html" },
      localeRedirects: true,
      clientEntry: "src/spa.tsx",
      // App-owned document shell — src/index.html controls the scaffold the
      // framework would otherwise hardcode (charset, viewport, <html lang>, plus
      // anything global: theme-color, preconnect, favicon, CSP meta, …). Edit that
      // file directly. It MUST keep the four build-substituted placeholders:
      //   <!--moku:lang-->   page locale for <html lang> (en/ru/uk/es)
      //   <!--moku:head-->   composed <head> (title/OG/canonical/hreflang/JSON-LD/…)
      //   <!--moku:assets--> bundled <link>/<script> tags
      //   <!--moku:body-->   server-rendered page body
      template: "src/index.html",
      ogImage: {
        fontDir: "assets/fonts/og",
        render: OgTemplate,
        // Render our branded site card (the home-hero `const GeekLife = {}` motif) to `/og-default.png`
        // — the `head.defaultOgImage` fallback for every non-article page — reusing the fonts below.
        // We pass only the template VNode; the framework renders it (same Satori pipeline as `render`),
        // so the app ships no renderer of its own.
        defaultCard: OgDefaultCard,
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
    deploy: { target: "cloudflare-pages", outDir: "dist", productionBranch: "main", ci: true },
    // serve/preview/deploy all act on the same "dist" output as build + deploy (stated explicitly so
    // the linkage is visible, not coincidental). port 4173 = the Playwright webServer port; honor a
    // PORT override. The remaining cli defaults already match the old hand-rolled scripts: watchDirs
    // ["content","src"], debounceMs 150, notFoundFile "404.html", liveReload.
    cli: { outDir: "dist", port: Number(process.env.PORT ?? 4173) },
    // Wire the Node env providers so `ctx.env.require(...)` (used by deploy to read
    // CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID) returns real values — process.env
    // first so CI-injected secrets win, .env (gitignored) is the local fallback.
    // `env` is a core plugin: @moku-labs/core's createApp `pluginConfigs` type omits
    // core-plugin keys, though the runtime merges them (see core's initCorePlugins).
    // @ts-expect-error -- core-plugin config key intentionally absent from createApp's type; runtime-supported
    env: { providers: [processEnv(), dotenv(".env")] }
  }
});
