/**
 * @file SiteLayout — the persistent page chrome wrapped around every route by `.layout()`.
 *
 * 0.4.1 layout contract: `.layout((ctx, children) => VNode)` is applied at SSG render only; on
 * client SPA navigation the chrome persists and ONLY the inner swap region (`main > section`) is
 * re-rendered. So this component owns `<main>`, the sticky header (TopBar + TabNav), the `<section>`
 * swap region (its CHILDREN are what `.render()` produces and what the SPA swaps), and the Footer.
 * The locale-dependent header pieces are kept in sync after navigation by the tab-nav / lang-switcher
 * / title-bar islands (the header is not re-rendered by the framework).
 */
import type { ComponentChildren, VNode } from "preact";
import { Footer } from "../components/Footer";
import { TabNav } from "../components/TabNav";
import { TopBar } from "../components/TopBar";
import type { Locale } from "../i18n/index";
import { QUOTES } from "../lib/quotes";

/**
 * Site shell props.
 */
type SiteLayoutProps = {
  /** Active locale. */
  locale: Locale;
  /** Active nav tab ("home" | "archive" | "about" | "none"). */
  activeTab: string;
  /** The rendered page content (becomes the children of the `main > section` swap region). */
  children: ComponentChildren;
};

/**
 * Render the IDE-style site shell: sticky header (title bar + tab nav), the swap-region section
 * holding the page, and the status-bar footer.
 *
 * @param props - Active locale, active tab, and the page content.
 * @returns The full page chrome VNode.
 * @example
 * <SiteLayout locale="en" activeTab="home">{page}</SiteLayout>
 */
export function SiteLayout({ locale, activeTab, children }: SiteLayoutProps): VNode {
  return (
    <main data-island="page-fx">
      <header data-sticky>
        <TopBar quote={QUOTES[0] ?? ""} />
        <TabNav locale={locale} activeTab={activeTab} />
      </header>
      <section>{children}</section>
      <Footer />
    </main>
  );
}
