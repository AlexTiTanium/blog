/**
 * @file HomePage — hero + status bar + dashboard grid. Returns the page's INNER content (the
 * `.layout()` SiteLayout owns the `<main>` / `<section>` swap region around it).
 */
import type { VNode } from "preact";
import { DashboardGrid } from "../components/DashboardGrid";
import { StatusBar } from "../components/StatusBar";
import type { Paginated } from "../lib/articles";

/**
 * Home page: hero header, build-status bar, and the paginated article dashboard.
 *
 * @param props - Paginated articles + active locale.
 * @returns The home page content.
 */
export function HomePage({ page, locale }: { page: Paginated; locale: string }): VNode {
  return (
    <>
      <header data-hero>
        <h1 data-title>
          <span data-syntax="keyword">const</span> <span data-syntax="function">GeekLife</span> ={" "}
          <span data-syntax="string">{"{}"}</span>
        </h1>
        <p data-tagline>
          <span data-syntax="comment">{"// A literary, self-ironic dev blog"}</span>
          <span data-cursor>|</span>
        </p>
      </header>

      <StatusBar articleCount={page.totalArticles} />
      <DashboardGrid
        articles={page.articles}
        locale={locale}
        totalArticles={page.totalArticles}
        currentPage={page.page}
        totalPages={page.totalPages}
        baseUrl={`/${locale}`}
      />
    </>
  );
}
