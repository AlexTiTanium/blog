/**
 * @file Content-derived test expectations over the FIXTURE corpus (`tests/fixtures/content`)
 * that the Playwright webServer builds into `dist-e2e/` (see scripts/e2e-server.ts). The
 * fixtures are a frozen article set, fully independent of the real `content/` — publishing a
 * real article never touches the e2e suite or its visual baselines. The fixtures deliberately
 * keep cases the live corpus may lack: >PAGE_SIZE articles (pagination), en-only articles
 * (locale-fallback notice), and code blocks (Shiki highlighting).
 *
 * Expectations are still DERIVED by scanning the fixture tree at test time, so editing the
 * fixture corpus is also edit-free for the specs. Frontmatter is parsed with a minimal line
 * scanner (title/date/tags are flat, quoted scalars and a simple list) rather than a YAML
 * dependency — deliberately independent of the framework's own gray-matter pipeline so these
 * expectations aren't derived from the code under test.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "../fixtures/content");

/**
 * Articles per listing page — the framework default (`@moku-labs/web` pages plugin); this app
 * does not override it. Pagination pages (`/page/N/`, `/archive/page/N/`) are only emitted when
 * the corpus outgrows a single page.
 */
export const PAGE_SIZE = 10;

/** One scanned article directory. */
export interface ContentArticle {
  /** Directory name == URL slug. */
  slug: string;
  /** Frontmatter `title` from `en.md`. */
  title: string;
  /** Frontmatter `date` (YYYY-MM-DD) from `en.md`. */
  date: string;
  /** Frontmatter `tags` from `en.md`. */
  tags: string[];
  /** Locale codes with a native translation file (`<locale>.md`). */
  locales: string[];
  /** Whether the English body contains a fenced code block (renders as `pre.shiki`). */
  hasCodeBlock: boolean;
}

/** Pull a quoted (or bare) scalar value for `key:` out of a frontmatter block. */
function scalar(frontmatter: string, key: string): string {
  const match = frontmatter.match(new RegExp(String.raw`^${key}:\s*"?([^"\n]*)"?\s*$`, "m"));
  return match?.[1]?.trim() ?? "";
}

/** Pull the `tags:` list items out of a frontmatter block (line scanner — no backtracking). */
function tagList(frontmatter: string): string[] {
  const lines = frontmatter.split("\n");
  const start = lines.findIndex(line => line === "tags:");
  if (start === -1) return [];

  const tags: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith("  - ")) break;
    tags.push(line.slice(4).trim());
  }
  return tags;
}

/** Scan one article directory into a {@link ContentArticle}. */
function scanArticle(slug: string): ContentArticle {
  const dir = path.join(CONTENT_DIR, slug);
  const locales = readdirSync(dir)
    .filter(file => file.endsWith(".md"))
    .map(file => file.replace(/\.md$/, ""));

  const en = readFileSync(path.join(dir, "en.md"), "utf8");
  const fmMatch = en.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = fmMatch?.[1] ?? "";
  const body = en.slice(fmMatch?.[0].length ?? 0);

  return {
    slug,
    title: scalar(frontmatter, "title"),
    date: scalar(frontmatter, "date"),
    tags: tagList(frontmatter),
    locales,
    hasCodeBlock: body.includes("```")
  };
}

/** All articles, date-descending (the order listings render in). */
export const ARTICLES: ContentArticle[] = readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => scanArticle(entry.name))
  .toSorted((a, b) => b.date.localeCompare(a.date));

/** All article slugs. */
export const SLUGS: string[] = ARTICLES.map(article => article.slug);

/** Unique tag set across the corpus (each gets a `/tags/<tag>/` page per locale). */
export const TAGS: string[] = [...new Set(ARTICLES.flatMap(article => article.tags))].toSorted();

/** Slugs with a native translation in the given locale. */
export function nativeSlugs(locale: string): string[] {
  return ARTICLES.filter(article => article.locales.includes(locale)).map(a => a.slug);
}

/** Number of listing pages for `total` items (≥1). */
export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

/** True when listings paginate (pagination component renders, `/page/N/` pages are emitted). */
export const PAGINATED: boolean = ARTICLES.length > PAGE_SIZE;

/**
 * The canonical article for deep per-article assertions (title, meta, OG, code blocks).
 * Prefer one with a fenced code block so the syntax-highlighting spec stays meaningful;
 * guaranteed translated everywhere so locale-prefixed deep links resolve natively.
 */
export const CANONICAL: ContentArticle =
  ARTICLES.find(article => article.hasCodeBlock && article.locales.includes("ru")) ??
  ARTICLES[0] ??
  (() => {
    throw new Error(`no articles found in ${CONTENT_DIR}`);
  })();

/** Escape a literal string for embedding in a RegExp. */
export function escapeRegExp(literal: string): string {
  return literal.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}
