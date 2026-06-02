/**
 * @file Shared constants for the local dev/preview scripts (serve.ts + dev.ts), so the port and
 * output directory are declared once. Imported for values only — no side effects.
 */

/** Static-preview server port (overridable via the `PORT` env var). */
export const PREVIEW_PORT = Number(process.env.PORT ?? 4173);

/** Build output directory produced by the SSG and served in preview. */
export const DIST_DIR = "dist";
