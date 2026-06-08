/**
 * @file Git-log style archive listing grouped by month — each article shows a pseudo-hash, date,
 * title, reading time, and tags, followed by pagination. The "git log" framing is English UI chrome.
 */

import type { Content } from "@moku-labs/web";
import type { Locale } from "../i18n/index";
import { homeUrl } from "../lib/urls";
import { GitTag } from "./GitTag";
import { Pagination } from "./Pagination";

/** Props for {@link ArchiveView}. */
interface Props {
  /** Articles on the current page. */
  articles: Content.Article[];
  /** Active locale (for the breadcrumb home link). */
  locale: Locale;
  /** Total article count across all pages (for the subtitle). */
  totalArticles?: number;
  /** 1-based current page (enables pagination when set with `totalPages`/`baseUrl`). */
  currentPage?: number;
  /** Total number of pages. */
  totalPages?: number;
  /** The listing's page-1 URL (with trailing slash), e.g. `/archive/` or `/ru/archive/`. */
  baseUrl?: string;
}

/**
 * Generate a short pseudo-hash from a slug string.
 * @param slug - Article slug to hash
 * @returns 7-character hex string
 */
function shortHash(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).slice(0, 7).padEnd(7, "0");
}

/**
 * Group articles by YYYY-MM, returning groups in order of appearance.
 * @param articles - Sorted article array to group
 * @returns Array of month groups with label and articles
 */
function groupByMonth(
  articles: Content.Article[]
): { label: string; articles: Content.Article[] }[] {
  const groups = new Map<string, { label: string; articles: Content.Article[] }>();

  // Bucket each article under its year-month key
  for (const article of articles) {
    // Derive the year-month key
    const date = new Date(`${article.frontmatter.date}T00:00:00`);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    // Create the month group on first sight
    const group = groups.get(key);
    const isFirstInMonth = group === undefined;
    if (isFirstInMonth) {
      const label = date.toLocaleDateString("en", { month: "long", year: "numeric" });
      groups.set(key, { label, articles: [article] });
      continue;
    }

    group.articles.push(article);
  }

  // Return month groups in first-seen order
  return [...groups.values()];
}

/** Render the git-log style archive listing grouped by month. */
export function ArchiveView({
  articles,
  locale,
  totalArticles,
  currentPage,
  totalPages,
  baseUrl
}: Props) {
  const groups = groupByMonth(articles);
  const postCount = totalArticles ?? articles.length;

  return (
    <div data-component="archive">
      <header>
        <nav aria-label="breadcrumb">
          <a href={homeUrl(locale)}>blog</a> <span data-sep>/</span> archive <span data-sep>/</span>{" "}
          all-posts.log
        </nav>
        <h1>git log --all --oneline</h1>
        <p data-subtitle>
          {postCount} posts {"·"} sorted by date {"·"} newest first
        </p>
      </header>

      {groups.map(group => (
        <section key={group.label}>
          <h2>
            <span data-icon>#</span>
            {group.label}
          </h2>

          {group.articles.map(article => (
            <div data-entry key={article.computed.slug}>
              {/* Article cells link to the post; `display:contents` keeps them flex items of the
                  row so the layout is unchanged, while letting the tags be their own links. */}
              <a href={article.url} data-entry-link>
                <span data-hash>{shortHash(article.computed.slug)}</span>
                <time>{article.frontmatter.date}</time>
                <span data-title>{article.frontmatter.title}</span>
                <span data-reading>{article.computed.readingTime} min</span>
              </a>
              <span data-tags>
                {article.frontmatter.tags.slice(0, 2).map(tag => (
                  <GitTag key={tag} tag={tag} locale={locale} />
                ))}
              </span>
            </div>
          ))}
        </section>
      ))}

      {currentPage != null && totalPages != null && baseUrl != null && (
        <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={baseUrl} />
      )}
    </div>
  );
}
