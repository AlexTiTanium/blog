/**
 * Tab navigation component.
 * Renders 3 navigation tabs (Home, Archive, About) and a language switcher.
 * Uses standard <a> links (each page is a separate HTML file).
 */

import { type Locale, t } from "../i18n/index";
import { aboutUrl, archiveUrl, homeUrl } from "../lib/urls";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface Props {
  locale: Locale;
  activeTab: string;
  alternates?: Array<{ locale: string; href: string }>;
}

/** Render the 3-tab navigation bar with active state and language switcher. */
export function TabNav({ locale, activeTab, alternates }: Props) {
  const ui = t(locale);

  return (
    <nav data-component="tab-nav">
      <a href={homeUrl(locale)} aria-current={activeTab === "home" ? "page" : undefined}>
        <span data-icon>~</span> {ui.home}
      </a>
      <a href={archiveUrl(locale)} aria-current={activeTab === "archive" ? "page" : undefined}>
        <span data-icon>[]</span> {ui.archive}
      </a>
      <a href={aboutUrl(locale)} aria-current={activeTab === "about" ? "page" : undefined}>
        <span data-icon>@</span> {ui.about}
      </a>
      <LanguageSwitcher currentLocale={locale} {...(alternates ? { alternates } : {})} />
    </nav>
  );
}
