/**
 * @file Article preview card for the bento-grid dashboard — id, status, title, date, excerpt, tags.
 * Styling is intentionally provided by the parent dashboard grid scope
 * (`@scope ([data-component="dashboard"])` in DashboardGrid.css), which styles its card children as
 * descendants — card layout is inseparable from the grid (grid-area, accent borders, stagger), so
 * DashCard has no separate stylesheet by design.
 */

import type { Content } from "@moku-labs/web";
import { postId } from "../lib/articles";
import { GitTag } from "./GitTag";

/** Props for {@link DashCard}. */
interface Props {
  /** The article to preview. */
  article: Content.Article;
  /** Active locale (for tag links). */
  locale: string;
  /** Total article count for the locale (anchors the post/NNN label to the oldest post). */
  total: number;
}

/**
 * Render a single article preview card in the dashboard grid.
 *
 * @param props - The article, active locale, and locale article total.
 * @returns The article card.
 */
export function DashCard({ article, locale, total }: Props) {
  return (
    <article>
      <header>
        <span data-id>{postId(article, total)}</span>
        <span data-status>
          <span data-dot></span>
          {article.computed.status}
        </span>
      </header>
      <h2>
        <a href={article.url}>{article.frontmatter.title}</a>
      </h2>
      <time>
        {article.frontmatter.date} {"·"} {article.computed.readingTime} min read
      </time>
      <p>{article.frontmatter.description}</p>
      <div data-tags>
        {article.frontmatter.tags.map(tag => (
          <GitTag key={tag} tag={tag} locale={locale} />
        ))}
      </div>
    </article>
  );
}
