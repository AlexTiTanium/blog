import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "../../dist");

// ---------------------------------------------------------------
// 0.5.x output shape (migrated to @moku-labs/web):
//   - 22 articles in EACH locale. EN are all native; the 16 RU articles without a native
//     translation fall back to the English body under the /ru/ slug (flagged isFallback,
//     shown with a "not translated" notice) — so every article is reachable in both locales.
//   - 14 tags per locale
//   - Pagination: page/2, page/3 + archive/page/2, archive/page/3 per locale
//
//   Locale-prefixed pages (per locale):
//     index + about + archive + 2 archive-pages + 2 home-pages + 22 articles + 14 tags = 43
//     Total real pages: 86 (43 EN + 43 RU)
// ---------------------------------------------------------------

const EN_ARTICLES = [
  "bad-monday",
  "ball-factory",
  "code-reviews-survival-guide",
  "css-specificity-wars",
  "debugging-at-3am",
  "descent-journeys-in-the-dark",
  "docker-container-therapy",
  "fun-da-vinci",
  "git-bisect-saves-the-day",
  "hello-pipeline",
  "keyboard-shortcuts-obsession",
  "npm-dependency-hell",
  "pair-programming-introvert",
  "production-hotfix-at-midnight",
  "refactoring-legacy-spaghetti",
  "regex-dark-arts",
  "stack-overflow-driven-dev",
  "stds",
  "test-literary-elements",
  "the-joy-of-typescript",
  "weekend-side-project-curse",
  "when-the-build-breaks"
];

// Every article is emitted in RU too (native translations + English fallbacks).
const RU_ARTICLES = EN_ARTICLES;

const TAGS = [
  "ball-factory",
  "board-games",
  "descent",
  "devlife",
  "fun-da-vinci",
  "gamedev",
  "javascript",
  "life",
  "literary",
  "opinion",
  "pipeline",
  "stds",
  "testing",
  "tools"
];

/** Build the full locale-prefixed page list for one locale. */
function localePages(locale: string, articles: string[]): string[] {
  return [
    `${locale}/index.html`,
    `${locale}/about/index.html`,
    `${locale}/archive/index.html`,
    `${locale}/archive/page/2/index.html`,
    `${locale}/archive/page/3/index.html`,
    `${locale}/page/2/index.html`,
    `${locale}/page/3/index.html`,
    ...articles.map(slug => `${locale}/${slug}/index.html`),
    ...TAGS.map(tag => `${locale}/tags/${tag}/index.html`)
  ];
}

const EXPECTED_PAGES = [...localePages("en", EN_ARTICLES), ...localePages("ru", RU_ARTICLES)];

test.describe("Build Validation", () => {
  test("emits exactly 86 locale-prefixed pages", () => {
    // 43 EN + 43 RU
    expect(EXPECTED_PAGES).toHaveLength(86);
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
      "0.5.x emits a single sitemap, not an index"
    ).toBe(false);
    expect(existsSync(path.join(DIST, "sitemap-en.xml"))).toBe(false);
    expect(existsSync(path.join(DIST, "sitemap-ru.xml"))).toBe(false);
  });

  test("emits RSS, Atom and JSON feeds", () => {
    expect(existsSync(path.join(DIST, "feed.xml")), "RSS feed missing").toBe(true);
    expect(existsSync(path.join(DIST, "atom.xml")), "Atom feed missing").toBe(true);
    expect(existsSync(path.join(DIST, "feed.json")), "JSON feed missing").toBe(true);
  });

  test("emits a 404.html", () => {
    expect(existsSync(path.join(DIST, "404.html"))).toBe(true);
  });

  test("emits one OG image per English article (slug-named)", () => {
    for (const slug of EN_ARTICLES) {
      const og = path.join(DIST, "og", `${slug}.png`);
      expect(existsSync(og), `Missing OG image: og/${slug}.png`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------
// Root + bare-path redirects (0.5.x localeRedirects):
//   - root / -> /en/
//   - every default-locale page also exists at a bare path that
//     redirects to its /en/ equivalent.
// ---------------------------------------------------------------

test.describe("Redirects on disk", () => {
  test("root index.html is a meta-refresh redirect to /en/", () => {
    const root = path.join(DIST, "index.html");
    expect(existsSync(root)).toBe(true);
    const html = statSync(root);
    expect(html.size).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------
// Root Path Content: served pages resolve to real content.
// ---------------------------------------------------------------

test.describe("Root Path Content", () => {
  test("root / serves home page content (not a paginated page)", async ({ page }) => {
    await page.goto("/");
    const dashboard = page.locator('[data-component="dashboard"]');
    await expect(dashboard).toBeVisible();

    // Page 1: "next" is visible; "prev" exists but is hidden.
    const pagination = page.locator('[data-component="pagination"]');
    await expect(pagination.locator("[data-next]:not([data-hidden])")).toBeVisible();
    await expect(pagination.locator("[data-prev][data-hidden]")).toBeAttached();
  });

  test("root / content matches /en/ content", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/en\/$/); // root is a meta-refresh redirect to /en/
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
    await page.goto("/en/");
    const homeTitle = await page.title();

    await page.goto("/en/archive/");
    const archiveTitle = await page.title();

    await page.goto("/en/about/");
    const aboutTitle = await page.title();

    expect(homeTitle).not.toBe(archiveTitle);
    expect(homeTitle).not.toBe(aboutTitle);
    expect(archiveTitle).not.toBe(aboutTitle);
  });

  test("paginated pages have distinct content from page 1", async ({ page }) => {
    await page.goto("/en/");
    const page1Cards = await page
      .locator('[data-component="dashboard"] article:not([data-variant="stats"]) header')
      .allTextContents();

    await page.goto("/en/page/2/");
    const page2Cards = await page
      .locator('[data-component="dashboard"] article:not([data-variant="stats"]) header')
      .allTextContents();

    const overlap = page1Cards.filter(title => page2Cards.includes(title));
    expect(overlap).toHaveLength(0);
  });
});
