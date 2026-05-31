/**
 * @file i18n config — single source of truth for supported locales, default locale, locale names,
 * OG locale map, and translation assembly. Consumed by src/app.ts and src/spa/spa.tsx via
 * `i18nConfig`; individual constants are reused by islands and head builders in the build phase.
 */
import { en } from "./en";
import { ru } from "./ru";

/** Supported locale codes for the blog. */
export type Locale = "en" | "ru";

/** Flat translation map: dotted key → localized string. */
export type UIStrings = Record<string, string>;

/** Supported locales, in display order. */
export const LOCALES: readonly Locale[] = ["en", "ru"];

/** Default locale — drives bare-path output and fallback. */
export const DEFAULT_LOCALE: Locale = "en";

/** Human-readable locale names (for the language switcher). */
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", ru: "Russian" };

/** Open Graph locale codes per locale (`og:locale`). */
export const OG_LOCALE_MAP: Record<Locale, string> = { en: "en_US", ru: "ru_RU" };

/** Assembled i18n plugin config — passed to `pluginConfigs.i18n`. */
export const i18nConfig = {
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeNames: LOCALE_NAMES,
  ogLocaleMap: OG_LOCALE_MAP,
  translations: { en, ru }
};

/**
 * Resolve a translation key for a locale.
 *
 * @param _locale - Target locale code.
 * @param _key - Dotted translation key.
 * @throws {Error} Always — implemented during the build phase.
 * @example
 * t("en", "nav.home");
 */
export function t(_locale: Locale, _key: string): string {
  throw new Error("not implemented");
}
