/**
 * @file link-prefetch island — warms a page's persisted JSON BEFORE the click, so a data-path SPA
 * navigation already has its data and feels instant instead of "click → nothing → article". On
 * hover (`pointerover`, desktop) or first touch (`touchstart`, mobile) of an internal page link, it
 * pre-fetches that link's `/_data/.../index.json` — the SAME URL the framework's data reader fetches
 * ([[../routes]] → `ctx.require(contentPlugin)`) — into the HTTP cache, so the upcoming navigation
 * reuses it. Each target is warmed at most once. Mounts on the persistent `<body data-island=
 * "link-prefetch">` host (src/index.html) — its document-level listeners must outlive every nav.
 */
import { createIsland } from "@moku-labs/web/browser";

/**
 * Data-reader base — MUST mirror `pluginConfigs.data.baseUrl` in `src/spa.tsx`. Kept as a local
 * constant (the island context exposes no plugin API) so the prefetch URL matches the reader's.
 */
const DATA_BASE_URL = "/_data/";

/**
 * Build the persisted-JSON URL for a page path, mirroring the framework data plugin's `dataSuffix`
 * (drop the query + leading/trailing slashes, append `index.json`).
 *
 * @param pathname - The page path (e.g. `/en/hello/`).
 * @returns The data URL the framework will fetch (e.g. `/_data/en/hello/index.json`).
 * @example
 * dataUrlFor("/en/hello/"); // "/_data/en/hello/index.json"
 */
function dataUrlFor(pathname: string): string {
  // Mirror the framework data plugin's `dataSuffix`: strip leading/trailing slashes (no regex —
  // keeps it linear), then append `index.json`.
  let trimmed = pathname;
  while (trimmed.startsWith("/")) trimmed = trimmed.slice(1);
  while (trimmed.endsWith("/")) trimmed = trimmed.slice(0, -1);
  const suffix = trimmed.length > 0 ? `${trimmed}/index.json` : "index.json";
  return `${DATA_BASE_URL}${suffix}`;
}

/**
 * Resolve the page path to prefetch from a hovered/touched node, or `undefined` when it is not an
 * internal page link worth warming (no anchor, external origin, the current page, or a file asset).
 *
 * @param node - The event target the pointer/touch landed on.
 * @returns The internal page pathname to warm, or `undefined`.
 * @example
 * pagePathOf(event.target); // "/en/hello/" | undefined
 */
function pagePathOf(node: EventTarget | null): string | undefined {
  const anchor = (node as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!anchor) return undefined;
  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return undefined;
  }
  if (url.origin !== location.origin) return undefined; // external link
  if (url.pathname === location.pathname) return undefined; // already on this page
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return undefined; // a file asset, not a page route
  return url.pathname;
}

/** link-prefetch island: pre-downloads a hovered/touched page's JSON so its SPA nav feels instant. */
export const linkPrefetch = createIsland("link-prefetch", {
  /**
   * Attach document-level hover/touch listeners that warm each internal page's JSON once.
   *
   * @example
   * onMount();
   */
  onMount() {
    const warmed = new Set<string>();

    /**
     * Pre-download the page's JSON into the HTTP cache (idempotent per target).
     *
     * @param node - The event target the pointer/touch landed on.
     * @example
     * warm(event.target);
     */
    const warm = (node: EventTarget | null): void => {
      const pathname = pagePathOf(node);
      if (!pathname) return;
      const url = dataUrlFor(pathname);
      if (warmed.has(url)) return;
      warmed.add(url);
      // Reuse the framework's data-reader cache key: a plain GET fills the HTTP cache, so the
      // navigation's own `fetch` is served from it. A failed warm may retry on the next hover.
      fetch(url).catch(() => warmed.delete(url));
    };

    /**
     * Hover/touch handler — warms the link under the pointer.
     *
     * @param event - The `pointerover` / `touchstart` event.
     * @example
     * document.addEventListener("pointerover", onIntent, { passive: true });
     */
    const onIntent = (event: Event): void => {
      warm(event.target);
    };

    // `pointerover` bubbles (unlike `pointerenter`), so one document listener covers every link;
    // `touchstart` gives mobile a head start. Passive — we never call preventDefault.
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("touchstart", onIntent, { passive: true });
  }
});
