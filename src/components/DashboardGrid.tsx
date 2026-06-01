/**
 * Bento grid container for the home page dashboard.
 * Renders article preview cards, a stats summary card, and pagination controls.
 */

import type { Content } from "@moku-labs/web";
import { DashCard } from "./DashCard";
import { Pagination } from "./Pagination";

interface Props {
  articles: Content.Article[];
  locale: string;
  totalArticles?: number;
  currentPage?: number;
  totalPages?: number;
  baseUrl?: string;
}

/** Render the bento grid with article cards, stats summary, and pagination. */
export function DashboardGrid({
  articles,
  locale,
  totalArticles,
  currentPage,
  totalPages,
  baseUrl
}: Props) {
  const postCount = totalArticles ?? articles.length;
  const totalReadingTime = articles.reduce((sum, a) => sum + a.computed.readingTime, 0);
  const uniqueTags = new Set(articles.flatMap(a => a.frontmatter.tags)).size;

  return (
    <div data-component="dashboard" data-cards={articles.length}>
      {articles.map(article => (
        <DashCard key={article.computed.slug} article={article} locale={locale} />
      ))}

      <article data-variant="stats">
        <header>
          <span data-id>stats/overview</span>
          <span data-status>
            <span data-dot></span>
            live
          </span>
        </header>
        <div data-metrics>
          <div data-metric>
            <span data-value>{postCount}</span>
            <span data-label>Posts</span>
          </div>
          <div data-metric>
            <span data-value>{totalReadingTime}</span>
            <span data-label>Min Read</span>
          </div>
          <div data-metric>
            <span data-value>{uniqueTags}</span>
            <span data-label>Tags</span>
          </div>
          <div data-metric>
            <span data-value>1</span>
            <span data-label>Author</span>
          </div>
        </div>
      </article>

      {currentPage != null && totalPages != null && baseUrl != null && (
        <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={baseUrl} />
      )}
    </div>
  );
}
