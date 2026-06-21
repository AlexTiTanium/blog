import { expect, test } from "@playwright/test";
import { SITE } from "../../src/config";
import { LOCALES } from "../../src/i18n/index";
import { ARTICLES, CANONICAL, nativeSlugs, PAGE_SIZE, PAGINATED, SLUGS } from "./_content";

// All expectations are DERIVED from content/ (see _content.ts) — adding an article
// never requires editing this spec.
const EN_ARTICLES = SLUGS;
// Every article is reachable under /ru/ too (native translation or English fallback).
const RU_ARTICLES = EN_ARTICLES;
const RU_NATIVE = nativeSlugs("ru");

test.describe("Content", () => {
  test("home page shows the first page of article cards", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator('[data-island="dashboard"] article:not([data-variant="stats"])');
    await expect(cards).toHaveCount(Math.min(ARTICLES.length, PAGE_SIZE));
  });

  test("home page shows stats card with total article count", async ({ page }) => {
    await page.goto("/");
    const statsCard = page.locator('[data-island="dashboard"] article[data-variant="stats"]');
    await expect(statsCard).toBeVisible();
    await expect(statsCard.locator("[data-value]").first()).toHaveText(String(ARTICLES.length));
  });

  test("article has title, date, author, and body", async ({ page }) => {
    await page.goto(`/${CANONICAL.slug}/`);

    await expect(page.locator('[data-island="split-pane"] article > header h1')).toHaveText(
      CANONICAL.title
    );
    await expect(page.locator("[data-meta]")).toContainText(CANONICAL.date);
    await expect(page.locator("[data-meta]")).toContainText(SITE.author);
    await expect(page.locator("[data-content]")).toBeVisible();
  });

  test("article has syntax-highlighted code blocks", async ({ page }) => {
    test.skip(!CANONICAL.hasCodeBlock, "no article with a fenced code block in the corpus");
    await page.goto(`/${CANONICAL.slug}/`);
    const codeBlocks = page.locator("pre.shiki");
    expect(await codeBlocks.count()).toBeGreaterThan(0);
  });

  test("archive page lists articles", async ({ page }) => {
    await page.goto("/archive/");
    const entries = page.locator('[data-island="archive"] [data-entry]');
    expect(await entries.count()).toBeGreaterThan(0);
  });

  test("about page has content", async ({ page }) => {
    await page.goto("/about/");
    const text = await page.locator("body").textContent();
    expect((text ?? "").length).toBeGreaterThan(100);
  });

  test("all English articles resolve (200)", async ({ page }) => {
    for (const slug of EN_ARTICLES) {
      const res = await page.goto(`/${slug}/`);
      expect(res?.status(), `EN ${slug}`).toBe(200);
    }
  });

  test("all Russian articles resolve (200)", async ({ page }) => {
    for (const slug of RU_ARTICLES) {
      const res = await page.goto(`/ru/${slug}/`);
      expect(res?.status(), `RU ${slug}`).toBe(200);
    }
  });

  test("'not translated' notice renders ONLY on RU fallback articles", async ({ page }) => {
    // A native RU translation never shows the notice.
    await page.goto(`/ru/${CANONICAL.slug}/`);
    await expect(page.locator("[data-notice]")).toHaveCount(0);

    // If the corpus ever carries an untranslated article again, its RU page must show it.
    const fallback = SLUGS.find(slug => !RU_NATIVE.includes(slug));
    if (fallback) {
      await page.goto(`/ru/${fallback}/`);
      await expect(page.locator("[data-notice]")).toBeVisible();
    }
  });

  test("native RU article slugs are a subset that resolve", async ({ page }) => {
    for (const slug of RU_NATIVE) {
      const res = await page.goto(`/ru/${slug}/`);
      expect(res?.status(), `RU native ${slug}`).toBe(200);
    }
  });
});

test.describe("Pagination", () => {
  // Pagination only exists when the corpus outgrows one page (PAGE_SIZE articles) —
  // both branches are asserted so the suite adapts as the corpus grows.
  test("home pagination matches corpus size", async ({ page }) => {
    await page.goto("/");
    const pagination = page.locator('[data-island="pagination"]');
    if (PAGINATED) {
      await expect(pagination).toBeVisible();
      await expect(pagination.locator("[data-next]")).toBeVisible();
      await expect(pagination.locator("[data-prev]")).toHaveAttribute("data-hidden", "true");
    } else {
      await expect(pagination).toHaveCount(0);
    }
  });

  test("page 2 exists exactly when the corpus overflows", async ({ page }) => {
    const res = await page.goto("/page/2/");
    if (PAGINATED) {
      expect(res?.status()).toBe(200);
      const cards = page.locator('[data-island="dashboard"] article:not([data-variant="stats"])');
      expect(await cards.count()).toBeGreaterThan(0);
    } else {
      expect(res?.status()).toBe(404);
    }
  });

  test("archive pagination matches corpus size", async ({ page }) => {
    await page.goto("/archive/");
    const pagination = page.locator('[data-island="pagination"]');
    await (PAGINATED ? expect(pagination).toBeVisible() : expect(pagination).toHaveCount(0));
  });
});

test.describe("Structure", () => {
  test("header has navigation tabs", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-island="tab-nav"]')).toBeVisible();
    await expect(page.locator('[data-island="tab-nav"] > a')).toHaveCount(3);
  });

  test("footer is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-island="footer"]')).toBeVisible();
  });

  test("language switcher shows all supported locales", async ({ page }) => {
    await page.goto("/");
    const langItems = page.locator('[data-island="lang-switcher"] a');
    await expect(langItems).toHaveCount(LOCALES.length);
    for (const [index, locale] of LOCALES.entries()) {
      await expect(langItems.nth(index)).toHaveText(locale.toUpperCase());
    }
  });
});
