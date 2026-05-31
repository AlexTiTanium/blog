/**
 * @file Client/SPA boot. Composes the browser-scoped app (island hydration + intercepted
 * navigation) and starts the kernel.
 *
 * Browser-scoped app: only browser-relevant plugins configured (router mode "spa").
 * SPIKE (build phase A): verify Bun.build tree-shakes Node-only plugins (content/build/deploy →
 * satori, @resvg/resvg-js, shiki) out of THIS bundle. If not, fall back to a browser-only barrel
 * or the framework `@moku-labs/web/client` export.
 */
import { createApp } from "@moku-labs/web";
import { SITE } from "../config";
import { i18nConfig } from "../i18n/index";
import { islands } from "../islands";
import { routes } from "../routes";

const app = createApp({
  config: { mode: "production" },
  pluginConfigs: {
    site: SITE,
    i18n: i18nConfig,
    router: { routes, mode: "spa" },
    head: { titleTemplate: "%s — Geek Life" },
    spa: { components: islands, viewTransitions: true, progressBar: true }
  }
});

// Boots kernel: nav interception + scan [data-component] + hydrate.
// Errors surfaced, not swallowed (spec/11 §1.13).
app.start().catch(err => console.error("[blog] SPA boot failed", err));
