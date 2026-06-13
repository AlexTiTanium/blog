/**
 * @file Pure article helpers + page-data types. NO content-plugin import → browser-safe: shared by
 * components, pages, the route shells (`src/routes.tsx`), AND the node loaders alike. Content access
 * (which needs the node-only content plugin) lives in `./content`, imported by `src/routes.tsx`.
 */
import type { Content } from "@moku-labs/web";

/** Articles per archive/home page. */
export const PER_PAGE = 10;

/**
 * Per-locale paginated slice of articles.
 */
export type Paginated = {
  /** Articles on the current page. */
  articles: Content.Article[];
  /** Total article count across all pages. */
  totalArticles: number;
  /** 1-based current page number. */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Newest article's date across ALL pages (input is date-descending), or `undefined` when empty. */
  latest: string | undefined;
};

/** Article-route page data: the resolved article plus the two sidebar lists. */
export type ArticleData = {
  /** The resolved article. */
  article: Content.Article;
  /** Newest articles (current excluded) for the "Recent Posts" list. */
  recent: Content.Article[];
  /** Tag-related articles for the "Explorer" / what-to-read-next list. */
  related: Content.Article[];
};

/** Tag-route page data: a tag name plus the articles carrying it. */
export type TagData = {
  /** The tag name. */
  tag: string;
  /** Articles tagged with `tag`. */
  articles: Content.Article[];
};

/**
 * Paginate a locale's articles into a 1-based page slice.
 *
 * @param arts - Articles to paginate.
 * @param page - 1-based page number.
 * @param per - Articles per page.
 * @returns The page slice plus total counts.
 * @example
 * const firstPage = paginate(posts, 1);
 */
export function paginate(arts: Content.Article[], page: number, per = PER_PAGE): Paginated {
  const totalArticles = arts.length;
  const totalPages = Math.max(1, Math.ceil(totalArticles / per));
  const start = (page - 1) * per;
  return {
    articles: arts.slice(start, start + per),
    totalArticles,
    page,
    totalPages,
    latest: arts[0]?.frontmatter.date
  };
}

/**
 * Inclusive integer range `[start, end]` (empty when `end < start`).
 *
 * @param start - First value.
 * @param end - Last value (inclusive).
 * @returns The ascending list of integers.
 * @example
 * range(2, 5); // [2, 3, 4, 5]
 */
function range(start: number, end: number): number[] {
  // A negative length is clamped to 0 by Array.from, so `end < start` yields an empty list.
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Build the windowed page list for the pagination UI: always the first and last page, the current
 * page with `siblings` neighbours on each side, and an `"ellipsis"` marker wherever a run of pages
 * is collapsed. Ranges short enough to show in full (≤ `siblings * 2 + 5`) get every page, no ellipsis.
 *
 * @param current - 1-based current page.
 * @param total - Total number of pages.
 * @param siblings - Pages shown on each side of the current page (default 1).
 * @returns Ordered page numbers interleaved with `"ellipsis"` markers.
 * @example
 * pageWindow(5, 11); // [1, "ellipsis", 4, 5, 6, "ellipsis", 11]
 * pageWindow(1, 3); // [1, 2, 3]
 */
export function pageWindow(current: number, total: number, siblings = 1): (number | "ellipsis")[] {
  // first + last + current + 2·siblings + 2 ellipsis slots; at/under this, show every page.
  const maxSlots = siblings * 2 + 5;
  if (total <= maxSlots) return range(1, total);

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  // Near the start: 1 2 … last
  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, siblings * 2 + 3), "ellipsis", total];
  }

  // Near the end: 1 … (final run)
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, "ellipsis", ...range(total - (siblings * 2 + 2), total)];
  }

  // Middle: 1 … left..right … last
  return [1, "ellipsis", ...range(left, right), "ellipsis", total];
}

/**
 * Filter articles by tag.
 *
 * @param arts - Articles to filter.
 * @param tag - Tag to match.
 * @returns Articles whose frontmatter includes the tag.
 * @example
 * const tagged = byTag(posts, "typescript");
 */
export function byTag(arts: Content.Article[], tag: string): Content.Article[] {
  return arts.filter(a => a.frontmatter.tags.includes(tag));
}

/**
 * Rank articles by relevance to `current` for the "what to read next" sidebar: most shared tags
 * first, newer date breaking ties. The current article is excluded (matched by slug). Articles that
 * share no tag fall to the tail ordered by recency, so the result is "related first, then filled
 * with recent" — never empty while other articles exist.
 *
 * @param all - All articles for the locale, date-descending (the content pipeline's order).
 * @param current - The article being read; excluded from the result.
 * @param limit - Maximum number of articles to return.
 * @returns Up to `limit` articles, most-related first.
 * @example
 * const suggestions = relatedArticles(posts, currentPost, 5);
 */
export function relatedArticles(
  all: Content.Article[],
  current: Content.Article,
  limit = 5
): Content.Article[] {
  const currentTags = new Set(current.frontmatter.tags);
  // Score each other article by how many of `current`'s tags it shares, then rank: most shared
  // first, newer date breaking ties (so tagless / 0-share posts fill the tail by recency).
  return all
    .filter(a => a.computed.slug !== current.computed.slug)
    .map(a => ({
      article: a,
      shared: a.frontmatter.tags.filter(tag => currentTags.has(tag)).length
    }))
    .toSorted(
      (x, y) =>
        y.shared - x.shared || y.article.frontmatter.date.localeCompare(x.article.frontmatter.date)
    )
    .slice(0, limit)
    .map(ranked => ranked.article);
}

/**
 * Sequential card label ("post/NNN", 1-based, zero-padded to 3 digits) for an article. The oldest
 * post is "post/001" and each new post takes the next number, so existing labels never shift.
 * Derived from the date-descending rank the content pipeline encodes in `contentId`
 * (`${locale}:${index}:${slug}`) counted back from `total`, so it stays stable across pages.
 *
 * @param article - The article to label.
 * @param total - Total article count for the locale.
 * @returns The `post/NNN` id (e.g. "post/001").
 * @example
 * postId(oldestArticle, 23); // "post/001"
 * postId(newestArticle, 23); // "post/023"
 */
export function postId(article: Content.Article, total: number): string {
  const index = Number.parseInt(article.computed.contentId.split(":")[1] ?? "", 10);
  const rank = Number.isNaN(index) ? 0 : index;
  return `post/${String(Math.max(total - rank, 1)).padStart(3, "0")}`;
}
