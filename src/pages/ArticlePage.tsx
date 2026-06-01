/**
 * @file ArticlePage — single article + recent sidebar (split-pane). Returns the page's INNER content
 * (SiteLayout owns the swap region).
 */
import type { Content } from "@moku-labs/web";
import type { VNode } from "preact";
import { ArticleLayout } from "../components/ArticleLayout";
import type { Locale } from "../i18n/index";

/**
 * Article page: the rendered article body plus the recent-articles sidebar.
 *
 * @param props - The article, recent articles, and active locale.
 * @returns The article page content.
 */
export function ArticlePage({
  article,
  recent,
  locale
}: {
  article: Content.Article;
  recent: Content.Article[];
  locale: string;
}): VNode {
  return <ArticleLayout article={article} locale={locale as Locale} recentArticles={recent} />;
}
