/**
 * @file Internal-link helper. Wraps the router's `toUrl(name, params)` so pure SSG/SPA components
 * can build canonical hrefs without an `app` reference. The router is bound once after createApp
 * (src/app.ts for the SSG build, src/spa/spa.tsx for the browser) via {@link bindRouter} — the same
 * cycle-break pattern as `bindContent` in `./articles`. Using the router (not hand-built templates)
 * guarantees nav links match the generated page paths and the i18n bare-path redirects.
 */

/**
 * Minimal structural slice of the router API used to build links (`app.router`).
 */
type RouterUrlApi = {
  /**
   * Build a route's URL from its name and params.
   *
   * @param routeName - Route key from the route table (e.g. "home", "article").
   * @param params - Path params (e.g. `{ lang, slug }`).
   * @returns The resolved URL path.
   */
  toUrl(routeName: string, params: Record<string, string>): string;
};

let router: RouterUrlApi | undefined;

/**
 * Wire the router API after createApp (called once per entry: src/app.ts + src/spa/spa.tsx).
 *
 * @param api - The app's router plugin API (`app.router`).
 * @example
 * bindRouter(app.router);
 */
export function bindRouter(api: RouterUrlApi): void {
  router = api;
}

/**
 * Resolve a route URL by name + params via the bound router.
 *
 * @param name - Route key.
 * @param params - Path params.
 * @returns The resolved URL path.
 * @throws {Error} When the router has not been bound yet.
 * @example
 * toUrl("home", { lang: "en" }); // "/en/"
 */
function toUrl(name: string, params: Record<string, string>): string {
  if (!router) throw new Error("router not bound — call bindRouter(app.router) first");
  return router.toUrl(name, params);
}

/**
 * URL of the home page for a locale.
 *
 * @param locale - Locale code.
 * @returns Home URL.
 * @example
 * homeUrl("en"); // "/en/"
 */
export function homeUrl(locale: string): string {
  return toUrl("home", { lang: locale });
}

/**
 * URL of the archive page for a locale.
 *
 * @param locale - Locale code.
 * @returns Archive URL.
 * @example
 * archiveUrl("en"); // "/en/archive/"
 */
export function archiveUrl(locale: string): string {
  return toUrl("archive", { lang: locale });
}

/**
 * URL of the about page for a locale.
 *
 * @param locale - Locale code.
 * @returns About URL.
 * @example
 * aboutUrl("en"); // "/en/about/"
 */
export function aboutUrl(locale: string): string {
  return toUrl("about", { lang: locale });
}

/**
 * URL of a single article for a locale.
 *
 * @param locale - Locale code.
 * @param slug - Article slug.
 * @returns Article URL.
 * @example
 * articleUrl("en", "hello"); // "/en/hello/"
 */
export function articleUrl(locale: string, slug: string): string {
  return toUrl("article", { lang: locale, slug });
}

/**
 * URL of a tag-filtered listing for a locale.
 *
 * @param locale - Locale code.
 * @param tag - Tag name.
 * @returns Tag URL.
 * @example
 * tagUrl("en", "typescript"); // "/en/tags/typescript/"
 */
export function tagUrl(locale: string, tag: string): string {
  return toUrl("tag", { lang: locale, tag });
}
