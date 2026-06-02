/**
 * @file Language switcher — a horizontal row of locale links. Pure SSG markup (no JS); the
 * lang-switcher island repoints the hrefs to the equivalent path after client navigation.
 */

import { LOCALE_NAMES, LOCALES, type Locale } from "../i18n/index";
import { homeUrl } from "../lib/urls";

/** Props for {@link LanguageSwitcher}. */
interface Props {
  /** The currently active locale (highlighted via `aria-current`). */
  currentLocale: Locale;
  /** Optional per-locale link overrides (the equivalent path in each locale). */
  alternates?: Array<{ locale: string; href: string }>;
}

/**
 * Render a horizontal row of locale links for language switching.
 *
 * @param props - Active locale and optional per-locale link overrides.
 * @returns The locale-link row.
 */
export function LanguageSwitcher({ currentLocale, alternates }: Props) {
  return (
    <div data-component="lang-switcher">
      {LOCALES.map(loc => {
        const alt = alternates?.find(a => a.locale === loc);
        const href = alt?.href ?? homeUrl(loc);
        return (
          <a
            key={loc}
            href={href}
            aria-current={loc === currentLocale ? "true" : undefined}
            title={LOCALE_NAMES[loc]}
          >
            {loc.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}
