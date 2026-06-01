/**
 * Language switcher component.
 * Renders a horizontal scrollable row of locale links.
 * No JS needed -- pure <a> links to locale-prefixed URLs.
 */

import { LOCALE_NAMES, LOCALES, type Locale } from "../i18n/index";
import { homeUrl } from "../lib/urls";

interface Props {
  currentLocale: Locale;
  alternates?: Array<{ locale: string; href: string }>;
}

/** Render a horizontal row of locale links for language switching. */
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
