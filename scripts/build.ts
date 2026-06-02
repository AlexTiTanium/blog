/**
 * @file SSG build entry (`bun run build`). `app.build.run()` produces the full static site: HTML +
 * bundled assets (injectAssets) + public/ passthrough (publicDir) + dist/404.html (notFound) + i18n
 * bare-path redirects (localeRedirects) + per-page _data JSON — all owned by the build plugin. So
 * this script only drives the build, asserts the 404 page exists (CF Pages needs it), and reports.
 */
import { existsSync } from "node:fs";
import { app } from "../src/app";
import { createLogger } from "./_log";

const log = createLogger("build");

/** CF Pages flips a project to SPA mode when there is no top-level 404, so the build must emit one. */
const NOT_FOUND_PAGE = "dist/404.html";

try {
  log.info("generating static site…");
  const result = await app.build.run();

  if (!existsSync(NOT_FOUND_PAGE)) {
    log.error(`${NOT_FOUND_PAGE} missing — set build.notFound (CF Pages would otherwise flip to SPA mode)`);
    process.exit(1);
  }

  log.success(`${result.pageCount} pages in ${result.durationMs}ms → ${result.outDir}/`);
} catch (error) {
  log.error("build failed", error);
  process.exit(1);
}
