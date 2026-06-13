/**
 * @file SSG composition (Node side). Opts in the Node-only plugins (build/deploy/data/cli) on top of
 * `@moku-labs/web`'s browser-safe defaults (site/i18n/router/head/spa/content shell), and composes
 * the node `fileSystemContent` provider so route loaders read Markdown via `ctx.require(contentPlugin)`.
 * Driven by the thin `scripts/{build,serve,preview,deploy}.ts` entries via `app.cli.*`. The browser
 * entry (src/spa.tsx) omits the Node-only plugins + the provider, so the client bundle stays free
 * of node/native code.
 *
 * Stage: `makeApp(stage)` parameterizes the framework's `config.stage` (the framework default is
 * `"production"`, which hides drafts). Each entry names its own stage — `scripts/serve.ts` builds
 * the dev-loop app with `"development"` so drafts are previewable locally, while the exported
 * production `app` (build/preview/deploy + CI) keeps drafts suppressed.
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
import { EmbedFacade } from "./components/EmbedFacade";
import { Gallery } from "./components/Gallery";
import { SITE } from "./config";
import { i18nConfig } from "./i18n/index";
import { islands } from "./islands";
import { warmMermaidTheme } from "./lib/mermaid-theme";
import { warmSyntaxTheme } from "./lib/shiki-theme";
import { OgDefaultCard } from "./og/default-card";
import { OgTemplate } from "./og/template";
import { routes } from "./routes";

/** Deployment stage — mirrors the framework's non-exported `Stage` union (drafts surface outside `"production"`). */
type Stage = "production" | "development" | "test";

/**
 * Filesystem overrides for {@link makeApp} — where Markdown is read from and where the build
 * (and the cli serve/preview loop) writes. Defaults compose the REAL site; the e2e suite passes
 * the frozen fixture corpus + a separate output dir (`scripts/e2e-server.ts`) so tests never
 * depend on the live articles.
 */
export interface AppIO {
  /** Markdown content root. Default `"./content"` — the real authored corpus. */
  contentDir?: string;
  /** Build/serve/preview output dir. Default `"dist"` — the deployed artifact. */
  outDir?: string;
}

/**
 * Compose the full Node-side app for the given deployment stage. The framework defaults
 * `config.stage` to `"production"` (drafts hidden); the dev loop passes `"development"`
 * so drafts are previewable locally.
 *
 * @param stage - Deployment stage threaded into the framework's `config.stage`.
 * @param io - Optional content/output dir overrides (see {@link AppIO}) — used by the e2e
 *   fixture build. Deploy intentionally ignores them: only the real `dist` ever ships.
 * @param io.contentDir - Markdown content root (default `"./content"`).
 * @param io.outDir - Build/serve/preview output dir (default `"dist"`).
 * @returns The composed app (same wiring at every stage — only draft visibility and IO differ).
 * @example
 * await makeApp("development").cli.serve();
 * @example
 * // e2e fixture build: frozen corpus, separate output dir
 * makeApp("production", { contentDir: "tests/fixtures/content", outDir: "dist-e2e" });
 */
export const makeApp = (stage: Stage, { contentDir = "./content", outDir = "dist" }: AppIO = {}) =>
  createApp({
    plugins: [contentPlugin, buildPlugin, deployPlugin, dataPlugin, cliPlugin],
    config: { mode: "hybrid", stage },
    pluginConfigs: {
      site: SITE,
      i18n: i18nConfig,
      content: {
        // `trustedContent: true` — the content dir is fully author-controlled, in-repo Markdown
        // (the documented case for this flag; true for both `./content` and the e2e fixture
        // corpus). Since web 1.7.0 the default sanitize pass strips `style` attributes, which
        // would discard Shiki's inline token colors (src/styles/code.css states syntax colors
        // come from those inline styles) on pages, `_data` payloads, and feed items.
        providers: [
          fileSystemContent({
            contentDir,
            shikiTheme: warmSyntaxTheme,
            trustedContent: true,
            // Build-time ```mermaid fences → static inline SVG (requires trustedContent; the
            // renderer is lazy-loaded, so content without diagrams pays nothing). Themed at
            // blog level like code blocks: warm-mermaid mirrors warm-syntax (src/lib/).
            mermaid: { mermaidConfig: warmMermaidTheme },
            // `::embed{src title}` → static click-to-activate facade (requires trustedContent;
            // no iframe — and none of the target's cost — until the reader clicks). The
            // facade inner content is our own Preact component (src/components/EmbedFacade,
            // styled in EmbedFacade.css); the activation island is `lazyEmbed` (src/islands).
            embed: { facade: EmbedFacade },
            // `::gallery{src="./images/<folder>/" caption="…"}` → the folder's images, SSR'd via
            // our `Gallery` component (src/components/Gallery) into a `[data-component="gallery"]`
            // block, enhanced by the `gallery` island. Styled in Gallery.css. Requires
            // trustedContent (raw component markup the sanitize pass would strip).
            gallery: { component: Gallery }
          })
        ]
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
        outDir,
        feeds: true,
        sitemap: true,
        images: true,
        injectAssets: true,
        publicDir: "public",
        // Custom 404 — `path` to a complete, app-owned page emitted as dist/404.html. Bundle
        // filenames embed a content hash (since web 1.8.0), so the page can't hardcode the
        // stylesheet — it carries `<!--moku:assets:css-->` (CSS-only on purpose: the 404 page
        // ships no JS), substituted at build time. See src/404.html.
        notFound: { path: "src/404.html" },
        // Cache protection (the framework default, stated for visibility): dist/_headers gets a
        // per-file `immutable, max-age=1y` rule for every fingerprinted bundle and a catch-all
        // `max-age=0, must-revalidate` rule for everything else (pages, content images, feeds,
        // _data) — Cloudflare/browsers can never serve a stale file, and unchanged files still
        // answer 304 from their ETag. Our public/_headers security rules are appended after.
        cacheHeaders: true,
        // No redirect pages: the default locale (English) is served at bare paths directly (and also
        // at /en/ as a content-identical alias), so there is nothing to redirect.
        localeRedirects: false,
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
      // viewTransitions:false → instant content swap (no View Transition, so no scroll-before-
      // snapshot flash). Motion, if any, comes from a CSS animation on the incoming content.
      spa: { components: islands, viewTransitions: false, progressBar: true },
      data: { outputDir: "_data", baseUrl: "/_data/" },
      deploy: { target: "cloudflare-pages", outDir: "dist", productionBranch: "main", ci: true },
      // serve/preview act on the same output dir as build (stated explicitly so the linkage is
      // visible, not coincidental) — deploy stays pinned to the real "dist" below. port 4173 =
      // the Playwright webServer port; honor a PORT override. The remaining cli defaults already
      // match the old hand-rolled scripts: watchDirs ["content","src"], debounceMs 150,
      // notFoundFile "404.html", liveReload.
      cli: { outDir, port: Number(process.env.PORT ?? 4173) },
      // Wire the Node env providers so `ctx.env.require(...)` (used by deploy to read
      // CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID) returns real values — process.env
      // first so CI-injected secrets win, .env (gitignored) is the local fallback.
      // `env` is a core plugin: @moku-labs/core's createApp `pluginConfigs` type omits
      // core-plugin keys, though the runtime merges them (see core's initCorePlugins).
      // @ts-expect-error -- core-plugin config key intentionally absent from createApp's type; runtime-supported
      env: { providers: [processEnv(), dotenv(".env")] }
    }
  });

/** The production app — every entry except the dev loop (`scripts/serve.ts` uses `makeApp("development")`). */
export const app = makeApp("production");
