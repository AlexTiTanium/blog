/**
 * @file ArticlePage — single article + recent sidebar (split-pane). Returns the page's INNER content
 * (SiteLayout owns the swap region).
 */
import type { VNode } from "preact";
import { ArticleLayout } from "../components/ArticleLayout";
import type { Locale } from "../i18n/index";
import type { ArticleData } from "../lib/articles";

/**
 * Article page: the rendered article body plus the recent-articles sidebar.
 *
 * @param props - The article-route page data ({@link ArticleData}) plus the active locale.
 * @returns The article page content.
 */
export function ArticlePage({
  article,
  recent,
  related,
  locale
}: ArticleData & { locale: string }): VNode {
  return (
    <ArticleLayout
      article={article}
      locale={locale as Locale}
      recentArticles={recent}
      relatedArticles={related}
    />
  );
}
