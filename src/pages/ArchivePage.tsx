/**
 * @file ArchivePage — git-log style paginated archive. Returns the page's INNER content (SiteLayout
 * owns the swap region).
 */
import type { VNode } from "preact";
import { ArchiveView } from "../components/ArchiveView";
import type { Locale } from "../i18n/index";
import type { Paginated } from "../lib/articles";
import { archiveUrl } from "../lib/urls";

/**
 * Archive page: paginated, month-grouped list of all articles.
 *
 * @param props - Paginated articles + active locale.
 * @returns The archive page content.
 */
export function ArchivePage({ page, locale }: { page: Paginated; locale: string }): VNode {
  return (
    <ArchiveView
      articles={page.articles}
      locale={locale as Locale}
      totalArticles={page.totalArticles}
      currentPage={page.page}
      totalPages={page.totalPages}
      baseUrl={archiveUrl(locale)}
    />
  );
}
