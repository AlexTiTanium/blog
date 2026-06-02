/**
 * @file Bun static server for dist/ — used for local preview (`bun run preview`) and as the
 * Playwright `webServer` in Phase E. Resolves clean URLs the way Cloudflare Pages does:
 * trailing-slash → directory `index.html`, extensionless path → `<path>/index.html`, then a
 * miss climbs to the nearest `404.html` (status 404) so the SSG not-found page is served.
 */
import { existsSync, statSync } from "node:fs";
import { join, normalize, sep } from "node:path";

const DIST = "dist";
const PORT = Number(process.env.PORT ?? 4173);

/**
 * Resolve a request pathname to a real file in dist/, mirroring Cloudflare Pages clean URLs.
 *
 * @param pathname - The decoded request pathname (always starts with "/").
 * @returns The on-disk file path, or null when nothing matches.
 */
function resolveFile(pathname: string): string | null {
  // Strip leading "../" segments after normalize to block path traversal outside dist/.
  const clean = normalize(pathname).replace(/^(\.\.(?:[/\\]|$))+/, "");
  const base = join(DIST, clean);
  const candidates = pathname.endsWith("/") ? [join(base, "index.html")] : [base, join(base, "index.html")];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
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
  const clean = normalize(pathname).replace(/^(\.\.(?:[/\\]|$))+/, "");
  const segments = join(DIST, clean).split(sep).filter(Boolean);
  for (let depth = segments.length; depth >= 1; depth--) {
    const candidate = join(segments.slice(0, depth).join(sep), "404.html");
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  const root = join(DIST, "404.html");
  return existsSync(root) ? root : null;
}

Bun.serve({
  port: PORT,
  fetch(req) {
    const pathname = decodeURIComponent(new URL(req.url).pathname);
    const file = resolveFile(pathname);
    if (file) return new Response(Bun.file(file));
    const notFound = nearest404(pathname);
    if (notFound) return new Response(Bun.file(notFound), { status: 404 });
    return new Response("Not Found", { status: 404 });
  }
});

console.log(`[serve] http://localhost:${PORT}`);
