/**
 * @file Internal-link helpers. Thin wrappers over the pure `urls` builder co-located with the route
 * table (`src/routes`), so pure SSG/SPA components build canonical hrefs without an `app` reference.
 * Importing the already-built `urls` (rather than building it here) keeps these helpers out of a
 * module-initialization cycle with the route table's page/layout imports.
 */
import { urls } from "../routes";

/**
 * URL of the home page for a locale.
 *
 * @param locale - Locale code.
 * @returns Home URL.
 * @example
 * homeUrl("en"); // "/en/"
 */
export function homeUrl(locale: string): string {
  return urls.toUrl("home", { lang: locale });
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
  return urls.toUrl("archive", { lang: locale });
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
  return urls.toUrl("about", { lang: locale });
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
  return urls.toUrl("article", { lang: locale, slug });
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
  return urls.toUrl("tag", { lang: locale, tag });
}
