/**
 * @file i18n config — single source of truth for supported locales, default locale, locale names,
 * OG locale map, and translation assembly. Consumed by src/app.ts and src/spa.tsx via
 * `i18nConfig`; individual constants are reused by islands and head builders in the build phase.
 */
import { en } from "./en";
import { es } from "./es";
import { ru } from "./ru";
import { uk } from "./uk";

/** Supported locale codes for the blog. */
export type Locale = "en" | "ru" | "uk" | "es";

/**
 * UI chrome strings (typed keys for autocomplete + compile-time checking). A `type` alias (not an
 * `interface`) so it keeps an implicit string index signature → assignable to the framework's
 * `pluginConfigs.i18n.translations` (`Record<string, Record<string, string>>`).
 */
export type UIStrings = {
  home: string;
  archive: string;
  about: string;
  readMore: string;
  minRead: string;
  noTranslation: string;
  publishedLabel: string;
  draftLabel: string;
  tags: string;
  recentPosts: string;
  fileInfo: string;
  tagPageTitle: string;
};

/** Supported locales, in display order. */
export const LOCALES: readonly Locale[] = ["en", "uk", "ru", "es"];

/** Default locale — drives bare-path output and fallback. */
export const DEFAULT_LOCALE: Locale = "en";

/** Human-readable locale names (for the language switcher). */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  uk: "Ukrainian",
  ru: "Russian",
  es: "Spanish"
};

/** Open Graph locale codes per locale (`og:locale`). */
export const OG_LOCALE_MAP: Record<Locale, string> = {
  en: "en_US",
  uk: "uk_UA",
  ru: "ru_RU",
  es: "es_ES"
};

/** Assembled i18n plugin config — passed to `pluginConfigs.i18n`. */
export const i18nConfig = {
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeNames: LOCALE_NAMES,
  ogLocaleMap: OG_LOCALE_MAP,
  translations: { en, uk, ru, es }
};

/** All UI-string sets keyed by locale. */
const strings: Record<Locale, UIStrings> = { en, uk, ru, es };

/**
 * Resolve the full UI-string set for a locale (components read `t(locale).home`, etc.).
 *
 * @param locale - Target locale code.
 * @returns The locale's {@link UIStrings}.
 * @example
 * t("ru").archive; // "Архив"
 */
export function t(locale: Locale): UIStrings {
  return strings[locale];
}
