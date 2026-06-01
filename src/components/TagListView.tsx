/**
 * Tag-filtered article listing.
 * Renders all articles matching a specific tag with date, title, and reading time.
 * Styled like ArchiveView but without month grouping or hash columns.
 */

import type { Content } from "@moku-labs/web";
import type { Locale } from "../i18n/index";
import { homeUrl } from "../lib/urls";

interface Props {
  tag: string;
  articles: Content.Article[];
  locale: string;
}

/** Render a tag-filtered article listing with breadcrumb and entry rows. */
export function TagListView({ tag, articles, locale }: Props) {
  return (
    <div data-component="tag-list">
      <header>
        <nav aria-label="breadcrumb">
          <a href={homeUrl(locale as Locale)}>blog</a>
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
