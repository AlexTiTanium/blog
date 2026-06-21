/**
 * @file Header tab navigation — Home / Archive / About plus the language switcher, as standard `<a>`
 * links. The terminal glyphs are kept in sync after client navigation by the tab-nav island.
 */

import { type Locale, t } from "../i18n/index";
import { aboutUrl, archiveUrl, homeUrl } from "../lib/urls";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Props for {@link TabNav}. */
interface Props {
  /** Active locale (drives labels + link locales). */
  locale: Locale;
  /** Active tab key ("home" | "archive" | "about" | "none"). */
  activeTab: string;
  /** Optional per-locale link overrides forwarded to the language switcher. */
  alternates?: Array<{ locale: string; href: string }>;
}

/**
 * Render the 3-tab navigation bar with active state and the language switcher.
 *
 * @param props - Active locale, active tab, and optional locale-link overrides.
 * @returns The header navigation.
 */
export function TabNav({ locale, activeTab, alternates }: Props) {
  const ui = t(locale);

  return (
    <nav data-island="tab-nav">
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
