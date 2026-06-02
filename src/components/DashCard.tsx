/**
 * Article preview card for the bento grid dashboard.
 * Renders a single article as a card with id, status, title, date, excerpt, and tags.
 */

import type { Content } from "@moku-labs/web";
import { postId } from "../lib/articles";
import { GitTag } from "./GitTag";

interface Props {
  article: Content.Article;
  locale: string;
}

/** Render a single article preview card in the dashboard grid. */
export function DashCard({ article, locale }: Props) {
  return (
    <article>
      <header>
        <span data-id>{postId(article)}</span>
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
