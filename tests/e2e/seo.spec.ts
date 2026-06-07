import { expect, test } from "@playwright/test";
import { SITE } from "../../src/config";

// Identity is sourced from SITE (single source of truth) so these assertions
// track config.ts rather than hardcoding the host/author.
const SITE_HOST = new URL(SITE.url).host;

test.describe("SEO & Metadata", () => {
  test("home page has canonical and hreflang tags", async ({ page }) => {
    await page.goto("/");
    const canonical = page.locator('link[rel="canonical"]');
    // Bare (default-locale) home canonical is the origin, no trailing slash.
    await expect(canonical).toHaveAttribute("href", SITE.url);

    // The default-locale hreflang (en) points at the bare url, so a /en/ regex no longer
    // matches — assert it exists exactly once instead. ru stays prefixed.
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="ru"]')).toHaveAttribute("href", /\/ru\//);
  });

  test("article page has OG tags and JSON-LD", async ({ page }) => {
    await page.goto("/hello-pipeline/");

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Hello, Pipeline!/
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\.png$/);

    // Articles emit two ld+json blocks (Article via buildArticleHead + BlogPosting); check both.
    const ldBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const ldJoined = ldBlocks.join("\n");
    expect(ldJoined).toContain("BlogPosting");
    expect(ldJoined).toContain(SITE.author);
  });

  test("article page has description meta tag", async ({ page }) => {
    await page.goto("/hello-pipeline/");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
  });

  test("OG image url is slug-named and matches an emitted PNG", async ({ page }) => {
    await page.goto("/hello-pipeline/");
    const content = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(content).toMatch(/\/og\/hello-pipeline\.png$/);
  });

  test("RSS feed link exists", async ({ page }) => {
    await page.goto("/");
    // Feeds live at the root now (locale-agnostic): the RSS link is /feed.xml.
    await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
      "href",
      "/feed.xml"
    );
  });

  test("ru pages have lang=ru", async ({ page }) => {
    await page.goto("/ru/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  });
});

const ALL_PAGES = [
  { name: "home-en", path: "/", isArticle: false },
  { name: "home-ru", path: "/ru/", isArticle: false },
  { name: "archive-en", path: "/archive/", isArticle: false },
  { name: "archive-ru", path: "/ru/archive/", isArticle: false },
  { name: "about-en", path: "/about/", isArticle: false },
  { name: "about-ru", path: "/ru/about/", isArticle: false },
  { name: "article-en", path: "/hello-pipeline/", isArticle: true },
  { name: "article-ru", path: "/ru/hello-pipeline/", isArticle: true }
];

test.describe("SEO: All pages", () => {
  for (const { name, path } of ALL_PAGES) {
    test(`${name}: has canonical tag with site domain`, async ({ page }) => {
      await page.goto(path);
      const href = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(href).toContain(SITE_HOST);
    });

    test(`${name}: has hreflang tags for en and ru`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[hreflang="ru"]')).toHaveCount(1);
    });

    test(`${name}: has meta description`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    });

    test(`${name}: has OG title`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
    });

    // NOTE: 0.5.x only emits og:type on article routes (via buildArticleHead). Listing
    // pages (home/archive/about) carry no og:type — see Phase E report's open enhancements.
  }
});

test.describe("SEO: Article-specific tags", () => {
  const ARTICLE_PAGES = ALL_PAGES.filter(p => p.isArticle);

  for (const { name, path } of ARTICLE_PAGES) {
    test(`${name}: has JSON-LD with BlogPosting`, async ({ page }) => {
      await page.goto(path);
      const ldBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(ldBlocks.join("\n")).toContain("BlogPosting");
    });

    test(`${name}: has og:type=article`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    });

    test(`${name}: has article:published_time`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
        "content",
        /\d{4}-\d{2}-\d{2}/
      );
    });

    test(`${name}: has OG image`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\.png$/);
    });
  }
});
