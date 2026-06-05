/**
 * @file TagPage — articles filtered by a single tag. Returns the page's INNER content (SiteLayout
 * owns the swap region).
 */
import type { VNode } from "preact";
import { TagListView } from "../components/TagListView";
import type { Locale } from "../i18n/index";
import type { TagData } from "../lib/articles";

/**
 * Tag page: the articles that share one tag.
 *
 * @param props - The tag-route page data ({@link TagData}) plus the active locale.
 * @returns The tag page content.
 */
export function TagPage({ tag, articles, locale }: TagData & { locale: string }): VNode {
  return <TagListView tag={tag} articles={articles} locale={locale as Locale} />;
}
