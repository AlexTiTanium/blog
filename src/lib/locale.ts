/**
 * @file Locale ↔ path helpers shared by the persistent-header islands (tab-nav, lang-switcher).
 * The SPA swaps only `main > section`, so after a client navigation these islands re-derive locale
 * state from the live `location.pathname` rather than from re-rendered markup.
 */
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n/index";

/**
 * Type guard: whether a path segment is one of the supported locale codes.
 *
 * @param segment - A path segment (e.g. the first segment of a pathname).
 * @returns Whether `segment` is a supported {@link Locale}.
 * @example
 * isLocale("ru"); // true
 */
function isLocale(segment: string): segment is Locale {
  return (LOCALES as readonly string[]).includes(segment);
}

/**
 * Resolve the active locale from a path's first segment (falls back to the default locale).
 *
 * @param path - A `location.pathname` (e.g. "/ru/archive/").
 * @returns The active locale code.
 * @example
 * localeFromPath("/ru/archive/"); // "ru"
 * localeFromPath("/about/"); // "en" (default)
 */
export function localeFromPath(path: string): Locale {
  const segment = path.split("/").find(Boolean) ?? "";
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
}

/**
 * Swap the locale prefix of a path, preserving the rest of the route. The default locale is
 * served bare, so switching TO it drops the prefix; any other locale gets `/{locale}` prefixed.
 *
 * @param path - A `location.pathname` (e.g. "/ru/archive/" or bare "/archive/").
 * @param target - The locale to switch to.
 * @returns The same route under the target locale (bare for the default locale).
 * @example
 * swapLocale("/ru/archive/", "en"); // "/archive/" (default → bare)
 * swapLocale("/archive/", "ru"); // "/ru/archive/"
 * swapLocale("/ru/", "en"); // "/"
 */
export function swapLocale(path: string, target: Locale): string {
  const parts = path.split("/").filter(Boolean);
  const rest = parts.length > 0 && isLocale(parts[0] ?? "") ? parts.slice(1) : parts;
  const prefix = target === DEFAULT_LOCALE ? "" : `/${target}`;
  return rest.length > 0 ? `${prefix}/${rest.join("/")}/` : `${prefix}/`;
}
