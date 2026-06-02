/**
 * @file Tag-filtered article listing — all articles carrying a tag, with date, title, and reading
 * time. Styled like ArchiveView but without month grouping or hash columns.
 */

import type { Content } from "@moku-labs/web";
import type { Locale } from "../i18n/index";
import { homeUrl } from "../lib/urls";

/** Props for {@link TagListView}. */
interface Props {
  /** The tag being listed. */
  tag: string;
  /** Articles carrying the tag. */
  articles: Content.Article[];
  /** Active locale (for the breadcrumb home link). */
  locale: Locale;
}

/**
 * Render a tag-filtered article listing with a breadcrumb and entry rows.
 *
 * @param props - The tag, its articles, and the active locale.
 * @returns The tag listing.
 */
export function TagListView({ tag, articles, locale }: Props) {
  return (
    <div data-component="tag-list">
      <header>
        <nav aria-label="breadcrumb">
          <a href={homeUrl(locale)}>blog</a>
          <span data-sep>/</span> tags <span data-sep>/</span> {tag}
        </nav>
        <h1>git tag -l "{tag}"</h1>
        <p data-subtitle>
          {articles.length} posts tagged "{tag}"
        </p>
      </header>

      {articles.map(article => (
        <a href={article.url} key={article.computed.slug} data-entry>
          <time>{article.frontmatter.date}</time>
          <span data-title>{article.frontmatter.title}</span>
          <span data-reading>{article.computed.readingTime} min</span>
        </a>
      ))}
    </div>
  );
}
