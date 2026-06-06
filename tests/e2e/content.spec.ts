import { expect, test } from "@playwright/test";

// All 22 English article slugs (native translations).
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

// Every article is reachable under /ru/ too (native translations + English fallbacks).
const RU_ARTICLES = EN_ARTICLES;
// The 6 with a native Russian translation (the other 16 fall back to the English body).
const RU_NATIVE = [
  "bad-monday",
  "ball-factory",
  "descent-journeys-in-the-dark",
  "fun-da-vinci",
  "hello-pipeline",
  "stds"
];

test.describe("Content", () => {
  test("home page shows 10 article cards (first page)", async ({ page }) => {
    await page.goto("/en/");
    const cards = page.locator('[data-component="dashboard"] article:not([data-variant="stats"])');
    await expect(cards).toHaveCount(10);
  });

  test("home page shows stats card with total article count", async ({ page }) => {
    await page.goto("/en/");
    const statsCard = page.locator('[data-component="dashboard"] article[data-variant="stats"]');
    await expect(statsCard).toBeVisible();
    await expect(statsCard.locator("[data-value]").first()).toHaveText("22");
  });

  test("article has title, date, author, and body", async ({ page }) => {
    await page.goto("/en/hello-pipeline/");

    await expect(page.locator('[data-component="split-pane"] article > header h1')).toHaveText(
      "Hello, Pipeline!"
    );
    await expect(page.locator("[data-meta]")).toContainText("2026-01-15");
    await expect(page.locator("[data-meta]")).toContainText("Alex Kucherenko");
    await expect(page.locator("[data-content]")).toBeVisible();
  });

  test("article has syntax-highlighted code blocks", async ({ page }) => {
    await page.goto("/en/hello-pipeline/");
    const codeBlocks = page.locator("pre.shiki");
    expect(await codeBlocks.count()).toBeGreaterThan(0);
  });

  test("archive page lists articles", async ({ page }) => {
    await page.goto("/en/archive/");
    const entries = page.locator('[data-component="archive"] [data-entry]');
    expect(await entries.count()).toBeGreaterThan(0);
  });

  test("about page has content", async ({ page }) => {
    await page.goto("/en/about/");
    const text = await page.locator("body").textContent();
    expect((text ?? "").length).toBeGreaterThan(100);
  });

  test("all 22 English articles resolve (200)", async ({ page }) => {
    for (const slug of EN_ARTICLES) {
      const res = await page.goto(`/en/${slug}/`);
      expect(res?.status(), `EN ${slug}`).toBe(200);
    }
  });

  test("all 22 Russian articles resolve (200) — native + English fallback", async ({ page }) => {
    for (const slug of RU_ARTICLES) {
      const res = await page.goto(`/ru/${slug}/`);
      expect(res?.status(), `RU ${slug}`).toBe(200);
    }
  });

  test("fallback RU article shows the 'not translated' notice; native does not", async ({
    page
  }) => {
    // test-literary-elements has no RU translation -> English fallback + notice.
    await page.goto("/ru/test-literary-elements/");
    await expect(page.locator("[data-notice]")).toBeVisible();

    // hello-pipeline has a native RU translation -> no notice.
    await page.goto("/ru/hello-pipeline/");
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
  test("home page has pagination controls", async ({ page }) => {
    await page.goto("/en/");
    const pagination = page.locator('[data-component="pagination"]');
    await expect(pagination).toBeVisible();
    await expect(pagination.locator("[data-next]")).toBeVisible();
    await expect(pagination.locator("[data-prev]")).toHaveAttribute("data-hidden", "true");
  });

  test("pagination page 2 shows articles and has prev link", async ({ page }) => {
    await page.goto("/en/page/2/");
    const cards = page.locator('[data-component="dashboard"] article:not([data-variant="stats"])');
    expect(await cards.count()).toBeGreaterThan(0);
    const pagination = page.locator('[data-component="pagination"]');
    await expect(pagination.locator("[data-prev]")).toBeVisible();
  });

  test("archive page has pagination", async ({ page }) => {
    await page.goto("/en/archive/");
    await expect(page.locator('[data-component="pagination"]')).toBeVisible();
  });
});

test.describe("Structure", () => {
  test("header has navigation tabs", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator('[data-component="tab-nav"]')).toBeVisible();
    await expect(page.locator('[data-component="tab-nav"] > a')).toHaveCount(3);
  });

  test("footer is present", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator('[data-component="footer"]')).toBeVisible();
  });

  test("language switcher shows all supported locales", async ({ page }) => {
    await page.goto("/en/");
    const langItems = page.locator('[data-component="lang-switcher"] a');
    await expect(langItems).toHaveCount(4);
    await expect(langItems.nth(0)).toHaveText("EN");
    await expect(langItems.nth(1)).toHaveText("RU");
    await expect(langItems.nth(2)).toHaveText("UK");
    await expect(langItems.nth(3)).toHaveText("ES");
  });
});
