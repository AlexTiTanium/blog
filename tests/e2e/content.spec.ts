import { expect, test } from "@playwright/test";
import { SITE } from "../../src/config";

// All 6 article slugs — every article carries native translations in every locale.
const EN_ARTICLES = [
  "bad-monday",
  "ball-factory",
  "descent-journeys-in-the-dark",
  "fun-da-vinci",
  "monaco-2026-drama",
  "stds"
];

// Every article is reachable under /ru/ too (all have native Russian translations).
const RU_ARTICLES = EN_ARTICLES;
const RU_NATIVE = EN_ARTICLES;

test.describe("Content", () => {
  test("home page shows all 6 article cards (single page)", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator('[data-component="dashboard"] article:not([data-variant="stats"])');
    await expect(cards).toHaveCount(6);
  });

  test("home page shows stats card with total article count", async ({ page }) => {
    await page.goto("/");
    const statsCard = page.locator('[data-component="dashboard"] article[data-variant="stats"]');
    await expect(statsCard).toBeVisible();
    await expect(statsCard.locator("[data-value]").first()).toHaveText("6");
  });

  test("article has title, date, author, and body", async ({ page }) => {
    await page.goto("/monaco-2026-drama/");

    await expect(page.locator('[data-component="split-pane"] article > header h1')).toHaveText(
      "Monaco 2026: One Overtake, All the Drama in the World"
    );
    await expect(page.locator("[data-meta]")).toContainText("2026-06-07");
    await expect(page.locator("[data-meta]")).toContainText(SITE.author);
    await expect(page.locator("[data-content]")).toBeVisible();
  });

  test("article has syntax-highlighted code blocks", async ({ page }) => {
    await page.goto("/monaco-2026-drama/");
    const codeBlocks = page.locator("pre.shiki");
    expect(await codeBlocks.count()).toBeGreaterThan(0);
  });

  test("archive page lists articles", async ({ page }) => {
    await page.goto("/archive/");
    const entries = page.locator('[data-component="archive"] [data-entry]');
    expect(await entries.count()).toBeGreaterThan(0);
  });

  test("about page has content", async ({ page }) => {
    await page.goto("/about/");
    const text = await page.locator("body").textContent();
    expect((text ?? "").length).toBeGreaterThan(100);
  });

  test("all 6 English articles resolve (200)", async ({ page }) => {
    for (const slug of EN_ARTICLES) {
      const res = await page.goto(`/${slug}/`);
      expect(res?.status(), `EN ${slug}`).toBe(200);
    }
  });

  test("all 6 Russian articles resolve (200)", async ({ page }) => {
    for (const slug of RU_ARTICLES) {
      const res = await page.goto(`/ru/${slug}/`);
      expect(res?.status(), `RU ${slug}`).toBe(200);
    }
  });

  test("native RU articles show no 'not translated' notice", async ({ page }) => {
    // Every article has a native RU translation, so the fallback notice never renders.
    // (The fallback path itself is framework behavior; no untranslated fixture remains.)
    await page.goto("/ru/monaco-2026-drama/");
    await expect(page.locator("[data-notice]")).toHaveCount(0);
  });

  test("native RU article slugs are a subset that resolve", async ({ page }) => {
    for (const slug of RU_NATIVE) {
      const res = await page.goto(`/ru/${slug}/`);
      expect(res?.status(), `RU native ${slug}`).toBe(200);
    }
  });
});

test.describe("Pagination", () => {
  // All 6 articles fit on one page (page size 10), so no pagination renders and
  // no /page/N/ routes are emitted.
  test("home page has no pagination controls (single page)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-component="pagination"]')).toHaveCount(0);
  });

  test("archive page has no pagination (single page)", async ({ page }) => {
    await page.goto("/archive/");
    await expect(page.locator('[data-component="pagination"]')).toHaveCount(0);
  });
});

test.describe("Structure", () => {
  test("header has navigation tabs", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-component="tab-nav"]')).toBeVisible();
    await expect(page.locator('[data-component="tab-nav"] > a')).toHaveCount(3);
  });

  test("footer is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-component="footer"]')).toBeVisible();
  });

  test("language switcher shows all supported locales", async ({ page }) => {
    await page.goto("/");
    const langItems = page.locator('[data-component="lang-switcher"] a');
    await expect(langItems).toHaveCount(4);
    await expect(langItems.nth(0)).toHaveText("EN");
    await expect(langItems.nth(1)).toHaveText("UK");
    await expect(langItems.nth(2)).toHaveText("RU");
    await expect(langItems.nth(3)).toHaveText("ES");
  });
});
