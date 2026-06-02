import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("home page loads with correct title", async ({ page }) => {
    await page.goto("/en/");
    await expect(page).toHaveTitle(/Geek Life/);
  });

  test("all nav links work", async ({ page }) => {
    await page.goto("/en/");

    await page.click('a[href="/en/archive/"]');
    await expect(page).toHaveURL(/\/en\/archive\//);

    await page.click('a[href="/en/about/"]');
    await expect(page).toHaveURL(/\/en\/about\//);

    await page.click('a[href="/en/"]');
    await expect(page).toHaveURL(/\/en\//);
  });

  test("language switcher works", async ({ page }) => {
    await page.goto("/en/");
    await page.click('[data-component="lang-switcher"] a[href="/ru/"]');
    await expect(page).toHaveURL(/\/ru\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  });

  test("article links from home page work", async ({ page }) => {
    await page.goto("/en/");
    const firstArticleLink = page.locator('[data-component="dashboard"] h2 a').first();
    const href = await firstArticleLink.getAttribute("href");
    await firstArticleLink.click();
    await expect(page).toHaveURL(new RegExp(href ?? ""));
    await expect(page.locator('[data-component="split-pane"] article > header h1')).toBeVisible();
  });
});

test.describe("SPA Navigation", () => {
  test("preserves shell and swaps content on navigation", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator('[data-component="tab-nav"]')).toBeVisible();
    await expect(page.locator('[data-component="footer"]')).toBeVisible();

    await page.click('a[href="/en/archive/"]');
    await page.waitForURL(/\/en\/archive\//);

    await expect(page.locator('[data-component="tab-nav"]')).toBeVisible();
    await expect(page.locator('[data-component="footer"]')).toBeVisible();
    await expect(page.locator('[data-component="archive"]')).toBeVisible();
  });

  test("back button restores previous page", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator('[data-component="dashboard"]')).toBeVisible();

    await page.click('a[href="/en/archive/"]');
    await page.waitForURL(/\/en\/archive\//);
    await expect(page.locator('[data-component="archive"]')).toBeVisible();

    await page.goBack();
    await page.waitForURL(/\/en\/$/);
    await expect(page.locator('[data-component="dashboard"]')).toBeVisible();
  });

  test("forward button after back restores navigated page", async ({ page }) => {
    await page.goto("/en/");

    await page.click('a[href="/en/archive/"]');
    await page.waitForURL(/\/en\/archive\//);

    await page.goBack();
    await page.waitForURL(/\/en\/$/);

    await page.goForward();
    await page.waitForURL(/\/en\/archive\//);
    await expect(page.locator('[data-component="archive"]')).toBeVisible();
  });

  test("deep link loads article page directly", async ({ page }) => {
    await page.goto("/en/hello-pipeline/");
    await expect(page.locator('[data-component="split-pane"] article > header h1')).toHaveText(
      "Hello, Pipeline!"
    );
    await expect(page.locator('[data-component="tab-nav"]')).toBeVisible();
    await expect(page.locator('[data-component="footer"]')).toBeVisible();
  });

  test("deep link loads Russian archive page directly", async ({ page }) => {
    await page.goto("/ru/archive/");
    await expect(page).toHaveURL(/\/ru\/archive\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator('[data-component="archive"]')).toBeVisible();
  });

  test("language switch updates html lang attribute via SPA navigation", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.click('[data-component="lang-switcher"] a[href="/ru/"]');
    await page.waitForURL(/\/ru\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");

    await expect(page.locator('[data-component="dashboard"]')).toBeVisible();
  });

  test("SPA navigation through multiple pages in sequence", async ({ page }) => {
    await page.goto("/en/");

    await page.click('a[href="/en/archive/"]');
    await page.waitForURL(/\/en\/archive\//);
    await expect(page.locator('[data-component="archive"]')).toBeVisible();

    await page.click('a[href="/en/about/"]');
    await page.waitForURL(/\/en\/about\//);

    await page.click('a[href="/en/"]');
    await page.waitForURL(/\/en\/$/);
    await expect(page.locator('[data-component="dashboard"]')).toBeVisible();
  });

  test("tab-nav active state updates on SPA navigation", async ({ page }) => {
    await page.goto("/en/");
    const tabNav = page.locator('[data-component="tab-nav"]');

    await expect(tabNav.locator('a[href="/en/"][aria-current="page"]')).toBeVisible();

    await page.click('a[href="/en/archive/"]');
    await page.waitForURL(/\/en\/archive\//);

    await expect(tabNav.locator('a[href="/en/archive/"][aria-current="page"]')).toBeVisible();
  });
});

test.describe("SPA Navigation - Russian locale", () => {
  test("Russian home page loads correctly", async ({ page }) => {
    await page.goto("/ru/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator('[data-component="dashboard"]')).toBeVisible();
  });

  test("navigation through Russian pages works", async ({ page }) => {
    await page.goto("/ru/");

    await page.click('a[href="/ru/archive/"]');
    await page.waitForURL(/\/ru\/archive\//);
    await expect(page.locator('[data-component="archive"]')).toBeVisible();

    await page.click('a[href="/ru/about/"]');
    await page.waitForURL(/\/ru\/about\//);

    await page.click('a[href="/ru/"]');
    await page.waitForURL(/\/ru\/$/);
    await expect(page.locator('[data-component="dashboard"]')).toBeVisible();
  });

  test("Russian article deep link loads correctly", async ({ page }) => {
    await page.goto("/ru/hello-pipeline/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator('[data-component="split-pane"] article > header h1')).toBeVisible();
  });

  test("switch from Russian to English via lang switcher", async ({ page }) => {
    await page.goto("/ru/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");

    await page.click('[data-component="lang-switcher"] a[href="/en/"]');
    await page.waitForURL(/\/en\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
