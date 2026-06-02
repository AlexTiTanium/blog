/**
 * @file Content-cache accessor. ONE memoized loadAll() → loaders never re-parse markdown (N×N guard).
 */
import type { Content } from "@moku-labs/web";

/**
 * Structural subset of the content plugin API used by the loaders.
 */
type ContentApi = {
  /**
   * Load every article across all active locales.
   *
   * @returns Locale-keyed map of date-descending articles.
   */
  loadAll(): Promise<Map<string, Content.Article[]>>;
  /**
   * Resolve a single article for a locale.
   *
   * @param slug - Article directory name.
   * @param locale - Requested locale code.
   * @returns The resolved article.
   */
  load(slug: string, locale: string): Promise<Content.Article>;
};

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

let api: ContentApi | undefined;
let cache: Map<string, Content.Article[]> | undefined;

/**
 * Wire the content-plugin API after createApp (called once in src/app.ts).
 *
 * @param content - The app's content plugin API (`app.content`).
 * @example
 * bindContent(app.content);
 */
export function bindContent(content: ContentApi): void {
  api = content;
}

/**
 * All articles for a locale, from a single memoized loadAll().
 *
 * @param locale - Locale code.
 * @returns Date-descending articles for the locale (empty if none).
 * @throws {Error} When the content API has not been bound.
 * @example
 * const posts = await allArticles("en");
 */
export async function allArticles(locale: string): Promise<Content.Article[]> {
  if (!api) throw new Error("content not bound — call bindContent(app.content) first");
  cache ??= await api.loadAll();
  return cache.get(locale) ?? [];
}

/**
 * Resolve a single article (the content plugin caches internally).
 *
 * @param slug - Article slug.
 * @param locale - Locale code.
 * @returns The resolved article.
 * @throws {Error} When the content API has not been bound.
 * @example
 * const post = await articleBySlug("hello", "en");
 */
export async function articleBySlug(slug: string, locale: string): Promise<Content.Article> {
  if (!api) throw new Error("content not bound — call bindContent(app.content) first");
  return api.load(slug, locale);
}

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
