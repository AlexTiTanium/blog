/**
 * @file Bun static server for dist/ (`bun run preview`, and the Playwright `webServer`). Resolves
 * clean URLs the way Cloudflare Pages does: a trailing slash → directory `index.html`, a path with
 * no file extension → `<path>/index.html`; a miss climbs to the nearest `404.html` (status 404) so
 * the SSG not-found page is served.
 */
import { statSync } from "node:fs";
import { join, normalize, sep } from "node:path";
import { DIST_DIR, PREVIEW_PORT } from "./_config";
import { createLogger } from "./_log";

const log = createLogger("serve");

/** Strip leading `../` segments (after normalize) so a request can't escape DIST_DIR. */
function safePath(pathname: string): string {
  return normalize(pathname).replace(/^(\.\.(?:[/\\]|$))+/, "");
}

/**
 * Whether `path` is an existing regular file. A single stat (no exists+stat race) that swallows the
 * ENOENT thrown when the file is missing/removed.
 *
 * @param path - Candidate on-disk path.
 * @returns Whether it resolves to a file.
 * @example
 * isFile("dist/en/index.html"); // true
 */
function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/**
 * Resolve a request pathname to a real file in dist/, mirroring Cloudflare Pages clean URLs.
 *
 * @param pathname - The decoded request pathname (always starts with "/").
 * @returns The on-disk file path, or null when nothing matches.
 */
function resolveFile(pathname: string): string | null {
  const base = join(DIST_DIR, safePath(pathname));
  const candidates = pathname.endsWith("/")
    ? [join(base, "index.html")]
    : [base, join(base, "index.html")];
  for (const candidate of candidates) {
    if (isFile(candidate)) return candidate;
  }
  return null;
}

/**
 * Climb from the requested directory toward dist/ root, returning the nearest 404.html.
 *
 * @param pathname - The decoded request pathname.
 * @returns The nearest 404.html path, or null if none exists.
 */
function nearest404(pathname: string): string | null {
  const segments = join(DIST_DIR, safePath(pathname)).split(sep).filter(Boolean);
  for (let depth = segments.length; depth >= 1; depth--) {
    const candidate = join(segments.slice(0, depth).join(sep), "404.html");
    if (isFile(candidate)) return candidate;
  }
  const root = join(DIST_DIR, "404.html");
  return isFile(root) ? root : null;
}

Bun.serve({
  port: PREVIEW_PORT,
  fetch(req) {
    const pathname = decodeURIComponent(new URL(req.url).pathname);
    const file = resolveFile(pathname);
    if (file) return new Response(Bun.file(file));
    const notFound = nearest404(pathname);
    if (notFound) return new Response(Bun.file(notFound), { status: 404 });
    // Defensive: in practice build.ts guarantees dist/404.html, so this is rarely reached.
    return new Response("Not Found", { status: 404 });
  }
});

log.info(`serving ${DIST_DIR}/ — http://localhost:${PREVIEW_PORT}`);
