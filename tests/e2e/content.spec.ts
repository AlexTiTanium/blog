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

// Only these 6 have native Russian translations (rest fall back to EN, no /ru/ page).
const RU_ARTICLES = [
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

  test("all 6 native Russian articles resolve (200)", async ({ page }) => {
    for (const slug of RU_ARTICLES) {
      const res = await page.goto(`/ru/${slug}/`);
      expect(res?.status(), `RU ${slug}`).toBe(200);
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

  test("language switcher shows EN and RU", async ({ page }) => {
    await page.goto("/en/");
    const langItems = page.locator('[data-component="lang-switcher"] a');
    await expect(langItems).toHaveCount(2);
    await expect(langItems.nth(0)).toHaveText("EN");
    await expect(langItems.nth(1)).toHaveText("RU");
  });
});
