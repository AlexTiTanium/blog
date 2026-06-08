import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "../../dist");

// ---------------------------------------------------------------
// Output shape — i18n URL scheme: the DEFAULT locale (en) is served at BARE paths
// (no /en/ prefix). English is ALSO emitted under /en/ as a real alias (identical content,
// canonical pointing at the bare url). Non-default locales (ru, uk, es) stay prefixed.
//
//   Per locale (45 pages):
//     index + about + archive + 2 archive-pages + 2 home-pages + 23 articles + 15 tags = 45
//
//   Five page sets: bare-en + en-alias + ru + uk + es = 45 × 5 = 225 pages.
// ---------------------------------------------------------------

const ARTICLES = [
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
  "monaco-2026-drama",
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

const TAGS = [
  "ball-factory",
  "board-games",
  "descent",
  "devlife",
  "formula1",
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
    `${prefix}archive/page/2/index.html`,
    `${prefix}archive/page/3/index.html`,
    `${prefix}page/2/index.html`,
    `${prefix}page/3/index.html`,
    ...ARTICLES.map(slug => `${prefix}${slug}/index.html`),
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

test.describe("Build Validation", () => {
  test("emits exactly 225 pages", () => {
    // 45 pages × 5 sets (bare-en + en-alias + ru + uk + es).
    expect(EXPECTED_PAGES).toHaveLength(225);
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

  test("emits one OG image per article (slug-named)", () => {
    for (const slug of ARTICLES) {
      const og = path.join(DIST, "og", `${slug}.png`);
      expect(existsSync(og), `Missing OG image: og/${slug}.png`).toBe(true);
    }
    // 23 articles -> 23 OG images.
    expect(ARTICLES).toHaveLength(23);
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
  test("/ stays at / with real home content (not a paginated page)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);

    const dashboard = page.locator('[data-component="dashboard"]');
    await expect(dashboard).toBeVisible();

    // Page 1: "next" is visible; "prev" exists but is hidden.
    const pagination = page.locator('[data-component="pagination"]');
    await expect(pagination.locator("[data-next]:not([data-hidden])")).toBeVisible();
    await expect(pagination.locator("[data-prev][data-hidden]")).toBeAttached();
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

  test("paginated pages have distinct content from page 1", async ({ page }) => {
    await page.goto("/");
    const page1Cards = await page
      .locator('[data-component="dashboard"] article:not([data-variant="stats"]) header')
      .allTextContents();

    await page.goto("/page/2/");
    const page2Cards = await page
      .locator('[data-component="dashboard"] article:not([data-variant="stats"]) header')
      .allTextContents();

    const overlap = page1Cards.filter(title => page2Cards.includes(title));
    expect(overlap).toHaveLength(0);
  });
});
