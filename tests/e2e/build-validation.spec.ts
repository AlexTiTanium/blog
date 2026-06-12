import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { ARTICLES, pageCount, SLUGS, TAGS } from "./_content";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "../../dist");

// ---------------------------------------------------------------
// Output shape — i18n URL scheme: the DEFAULT locale (en) is served at BARE paths
// (no /en/ prefix). English is ALSO emitted under /en/ as a real alias (identical content,
// canonical pointing at the bare url). Non-default locales (ru, uk, es) stay prefixed.
//
//   Per locale: index + about + archive + one page per article + one page per tag
//   + /page/N/ and /archive/page/N/ overflow pages when the corpus outgrows PAGE_SIZE.
//
//   Five page sets: bare-en + en-alias + ru + uk + es.
//
// The article/tag lists are DERIVED from content/ (see _content.ts), so adding an
// article never requires editing this spec.
// ---------------------------------------------------------------

/** `/page/2/..N/` suffixes under `base` when listings overflow a single page. */
function overflowPages(base: string): string[] {
  const pages = pageCount(ARTICLES.length);
  return Array.from({ length: pages - 1 }, (_, i) => `${base}page/${i + 2}/index.html`);
}

/**
 * Build the full page list for one locale's URL prefix.
 * `prefix` is "" for the bare default locale (en), "en/" for the English alias, and
 * "ru/"/"uk/"/"es/" for the non-default locales.
 */
function localePages(prefix: string): string[] {
  return [
    `${prefix}index.html`,
    `${prefix}about/index.html`,
    `${prefix}archive/index.html`,
    ...overflowPages(prefix),
    ...overflowPages(`${prefix}archive/`),
    ...SLUGS.map(slug => `${prefix}${slug}/index.html`),
    ...TAGS.map(tag => `${prefix}tags/${tag}/index.html`)
  ];
}

const EXPECTED_PAGES = [
  ...localePages(""), // bare en (default locale)
  ...localePages("en/"), // en alias
  ...localePages("ru/"),
  ...localePages("uk/"),
  ...localePages("es/")
];

/** Strip the non-deterministic build-id meta so two byte-different builds compare equal. */
function stripBuildId(html: string): string {
  return html.replaceAll(/<meta name="build-id" content="[^"]*">/g, "");
}

/** Every `**\/index.html` actually present in dist, as locale-prefixed relative paths. */
function distPages(): string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "index.html") found.push(path.relative(DIST, full));
    }
  };
  walk(DIST);
  return found;
}

test.describe("Build Validation", () => {
  test("dist page set EXACTLY matches the content-derived expectation", () => {
    // Set equality both ways: a missing page means content was dropped; an extra page
    // means the build emits routes the content tree doesn't explain.
    const actual = distPages().toSorted();
    expect(actual).toEqual(EXPECTED_PAGES.toSorted());
  });

  test("all expected HTML pages exist after build", () => {
    for (const page of EXPECTED_PAGES) {
      const fullPath = path.join(DIST, page);
      expect(existsSync(fullPath), `Missing: ${page}`).toBe(true);
    }
  });

  test("all HTML pages are non-empty", () => {
    for (const page of EXPECTED_PAGES) {
      const stat = statSync(path.join(DIST, page));
      expect(stat.size, `Empty file: ${page}`).toBeGreaterThan(0);
    }
  });

  test("emits a single sitemap.xml (not a sitemap index)", () => {
    expect(existsSync(path.join(DIST, "sitemap.xml")), "sitemap.xml missing").toBe(true);
    expect(
      existsSync(path.join(DIST, "sitemap-index.xml")),
      "emits a single sitemap, not an index"
    ).toBe(false);
    expect(existsSync(path.join(DIST, "sitemap-en.xml"))).toBe(false);
    expect(existsSync(path.join(DIST, "sitemap-ru.xml"))).toBe(false);
  });

  test("emits RSS, Atom and JSON feeds at the root", () => {
    expect(existsSync(path.join(DIST, "feed.xml")), "RSS feed missing").toBe(true);
    expect(existsSync(path.join(DIST, "atom.xml")), "Atom feed missing").toBe(true);
    expect(existsSync(path.join(DIST, "feed.json")), "JSON feed missing").toBe(true);
  });

  test("emits a 404.html", () => {
    expect(existsSync(path.join(DIST, "404.html"))).toBe(true);
  });

  test("emits exactly one OG image per article (slug-named)", () => {
    const emitted = readdirSync(path.join(DIST, "og"))
      .filter(file => file.endsWith(".png"))
      .toSorted();
    expect(emitted).toEqual(SLUGS.map(slug => `${slug}.png`).toSorted());
  });
});

// ---------------------------------------------------------------
// Disk content — bare default-locale pages are REAL content (no meta-refresh redirects),
// and the /en/ alias is byte-identical to the bare page (modulo the build-id meta).
// ---------------------------------------------------------------

test.describe("Bare default-locale content on disk", () => {
  test("dist/index.html is real content (not a meta-refresh redirect)", () => {
    const root = path.join(DIST, "index.html");
    expect(existsSync(root)).toBe(true);

    const html = readFileSync(root, "utf8");
    expect(html).not.toContain('http-equiv="refresh"');
    expect(html).toContain('data-component="dashboard"');
  });

  test("dist/index.html and dist/en/index.html are identical (modulo build-id)", () => {
    const bare = readFileSync(path.join(DIST, "index.html"), "utf8");
    const alias = readFileSync(path.join(DIST, "en/index.html"), "utf8");
    expect(stripBuildId(alias)).toBe(stripBuildId(bare));
  });
});

// ---------------------------------------------------------------
// Root Path Content: served pages resolve to real content.
// ---------------------------------------------------------------

test.describe("Root Path Content", () => {
  test("/ stays at / with real home content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);

    const dashboard = page.locator('[data-component="dashboard"]');
    await expect(dashboard).toBeVisible();
  });

  test("/ content matches /en/ alias content", async ({ page }) => {
    await page.goto("/");
    const rootTitle = await page.title();
    const rootFirstCard = await page
      .locator('[data-component="dashboard"] article:not([data-variant="stats"]) header')
      .first()
      .textContent();

    await page.goto("/en/");
    const enTitle = await page.title();
    const enFirstCard = await page
      .locator('[data-component="dashboard"] article:not([data-variant="stats"]) header')
      .first()
      .textContent();

    expect(rootTitle).toBe(enTitle);
    expect(rootFirstCard).toBe(enFirstCard);
  });

  test("each root path serves unique content (no cross-page contamination)", async ({ page }) => {
    await page.goto("/");
    const homeTitle = await page.title();

    await page.goto("/archive/");
    const archiveTitle = await page.title();

    await page.goto("/about/");
    const aboutTitle = await page.title();

    expect(homeTitle).not.toBe(archiveTitle);
    expect(homeTitle).not.toBe(aboutTitle);
    expect(archiveTitle).not.toBe(aboutTitle);
  });
});
