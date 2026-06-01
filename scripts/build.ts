/**
 * @file SSG build entry. `app.build.run()` produces the full static site: HTML + bundled assets
 * (injectAssets) + public/ passthrough (publicDir) + dist/404.html (notFound) + i18n bare-path
 * redirects (localeRedirects) + per-page _data JSON — all owned by the build plugin (0.4.0), so
 * this script only runs the build and asserts the 404 page exists (CF Pages needs it).
 */
import { existsSync } from "node:fs";
import { app } from "../src/app";

const result = await app.build.run();

if (!existsSync("dist/404.html")) {
  throw new Error("dist/404.html missing — set build.notFound; CF Pages would flip to SPA mode without it");
}

console.log(`[build] ${result.pageCount} pages in ${result.durationMs}ms → ${result.outDir}`);
