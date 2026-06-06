/**
 * @file Client/SPA boot — THE client bundle entry. Composes the browser-scoped app (island
 * hydration + intercepted navigation) and starts the kernel. `build.clientEntry` in src/app.ts
 * points the bundle phase straight at this file.
 *
 * Browser-safety: createApp's defaults (site/i18n/router/head/spa) are isomorphic; only dataPlugin
 * is opted in here for JSON DATA navigation. The Node-only plugins (content/build/deploy) are NOT
 * added, so the bundler tree-shakes them — and the native @resvg/satori graph — out. The
 * bundle-safety integration gate asserts the emitted bundle is free of
 * node:/satori/resvg/shiki/gray-matter/feed references.
 */
import { createApp, dataPlugin } from "@moku-labs/web/browser";
import { SITE } from "./config";
import { i18nConfig } from "./i18n/index";
import { islands } from "./islands";
import { routes } from "./routes";

const app = createApp({
  plugins: [dataPlugin],
  config: { mode: "hybrid" },
  pluginConfigs: {
    site: SITE,
    i18n: i18nConfig,
    router: { routes },
    head: { titleTemplate: `%s — ${SITE.name}` },
    spa: { components: islands, viewTransitions: true, progressBar: true },
    data: { baseUrl: "/_data/" }
  }
});

// Boots kernel: nav interception + scan [data-component] + hydrate.
// Errors surfaced, not swallowed (spec/11 §1.13).
app.start().catch(err => console.error("[blog] SPA boot failed", err));
