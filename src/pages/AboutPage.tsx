/**
 * @file AboutPage — static README-style author profile. Returns the page's INNER content (SiteLayout
 * owns the swap region).
 */
import type { VNode } from "preact";
import { AboutView } from "../components/AboutView";
import type { Locale } from "../i18n/index";

/**
 * About page: the author profile.
 *
 * @param props - Active locale.
 * @returns The about page content.
 */
export function AboutPage({ locale }: { locale: string }): VNode {
  return <AboutView locale={locale as Locale} />;
}
