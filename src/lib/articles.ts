/**
 * @file Pure article helpers + page-data types. NO content-plugin import → browser-safe: shared by
 * components, pages, the route shells (`src/routes.tsx`), AND the node loaders alike. Content access
 * (which needs the node-only content plugin) lives in `./content`, imported only by `src/routes.build`.
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
};

/** Article-route page data: the resolved article plus the recent-articles sidebar list. */
export type ArticleData = {
  /** The resolved article. */
  article: Content.Article;
  /** Recent articles for the sidebar. */
  recent: Content.Article[];
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
  return { articles: arts.slice(start, start + per), totalArticles, page, totalPages };
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
 * Sequential card label ("post/NNN", 1-based, zero-padded to 3 digits) for an article, mirroring
 * the legacy blog's post id. Derived from the date-descending rank the content pipeline encodes in
 * `contentId` (`${locale}:${index}:${slug}`), so it stays stable and continues across pages.
 *
 * @param article - The article to label.
 * @returns The `post/NNN` id (e.g. "post/001").
 * @example
 * postId(article); // "post/001"
 */
export function postId(article: Content.Article): string {
  const index = Number.parseInt(article.computed.contentId.split(":")[1] ?? "", 10);
  return `post/${String((Number.isNaN(index) ? 0 : index) + 1).padStart(3, "0")}`;
}
