import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "../../dist");

test.describe("Bare Path Redirects", () => {
  test("root / redirects to /en/ and shows home content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('[data-component="dashboard"]')).toBeVisible();
  });

  test("/archive/ redirects to /en/archive/ and shows archive content", async ({ page }) => {
    await page.goto("/archive/");
    await expect(page).toHaveURL(/\/en\/archive\//);
    await expect(page.locator('[data-component="archive"]')).toBeVisible();
  });

  test("/about/ redirects to /en/about/ and shows about content", async ({ page }) => {
    await page.goto("/about/");
    await expect(page).toHaveURL(/\/en\/about\//);
    await expect(page).toHaveTitle(/About/);
  });

  test("/page/2/ redirects to /en/page/2/ and shows page 2 content", async ({ page }) => {
    await page.goto("/page/2/");
    await expect(page).toHaveURL(/\/en\/page\/2\//);
    await expect(page.locator('[data-component="dashboard"]')).toBeVisible();
    await expect(page.locator("[data-prev]:not([data-hidden])")).toBeVisible();
  });

  test("/tags/testing/ redirects to /en/tags/testing/", async ({ page }) => {
    await page.goto("/tags/testing/");
    await expect(page).toHaveURL(/\/en\/tags\/testing\//);
  });

  test("/archive/page/2/ redirects to /en/archive/page/2/", async ({ page }) => {
    await page.goto("/archive/page/2/");
    await expect(page).toHaveURL(/\/en\/archive\/page\/2\//);
  });

  test("bare path redirect files exist on disk with correct content", () => {
    const redirectPaths = [
      "index.html",
      "archive/index.html",
      "about/index.html",
      "page/2/index.html",
      "tags/testing/index.html"
    ];

    for (const relPath of redirectPaths) {
      const fullPath = path.join(DIST, relPath);
      expect(existsSync(fullPath), `Missing redirect file: ${relPath}`).toBe(true);
    }

    // Root redirect points at the default locale home.
    const rootRedirect = readFileSync(path.join(DIST, "index.html"), "utf8");
    expect(rootRedirect).toContain('http-equiv="refresh"');
    expect(rootRedirect).toContain("/en/");

    // Bare archive redirect points at its /en/ equivalent.
    const archiveRedirect = readFileSync(path.join(DIST, "archive/index.html"), "utf8");
    expect(archiveRedirect).toContain('http-equiv="refresh"');
    expect(archiveRedirect).toContain("/en/archive/");
  });
});
