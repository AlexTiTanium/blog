/**
 * @file TagPage — articles filtered by a single tag. Returns the page's INNER content (SiteLayout
 * owns the swap region).
 */
import type { Content } from "@moku-labs/web";
import type { VNode } from "preact";
import { TagListView } from "../components/TagListView";
import type { Locale } from "../i18n/index";

/**
 * Tag page: the articles that share one tag.
 *
 * @param props - The tag, matching articles, and active locale.
 * @returns The tag page content.
 */
export function TagPage({
  tag,
  articles,
  locale
}: {
  tag: string;
  articles: Content.Article[];
  locale: string;
}): VNode {
  return <TagListView tag={tag} articles={articles} locale={locale as Locale} />;
}
