import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { SITE } from "../../src/config";
import { CANONICAL, escapeRegExp, TAGS } from "./_content";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "../../dist");

// The default locale (English) is served at BARE paths (no /en/ prefix). Non-default
// locales (/ru/, /uk/, /es/) stay prefixed. English is ALSO emitted under /en/ as a real
// alias page (HTTP 200, identical content, canonical pointing at the bare url) — it is NOT
// a redirect. There are ZERO meta-refresh pages in dist: every index.html is real content.
test.describe("Bare Path English", () => {
  test("root / serves real English home content (no redirect)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-island="dashboard"]')).toBeVisible();
  });

  test("/archive/ serves real English archive content", async ({ page }) => {
    await page.goto("/archive/");
    await expect(page.locator('[data-island="archive"]')).toBeVisible();
  });

  test("/about/ serves real English about content", async ({ page }) => {
    await page.goto("/about/");
    await expect(page).toHaveTitle(/About/);
  });

  test("bare tag page serves real English tag content", async ({ page }) => {
    await page.goto(`/tags/${TAGS[0]}/`);
    await expect(page.locator('[data-island="tab-nav"]')).toBeVisible();
  });

  test("bare article path serves real English article content", async ({ page }) => {
    await page.goto(`/${CANONICAL.slug}/`);
    await expect(page.locator('[data-island="split-pane"] article > header h1')).toBeVisible();
  });
});

test.describe("/en/ alias serves English directly (not a redirect)", () => {
  test("/en/ stays at /en/ and shows home content", async ({ page }) => {
    await page.goto("/en/");
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('[data-island="dashboard"]')).toBeVisible();
  });

  test("/en/<article>/ stays at /en/<article>/ with bare canonical", async ({ page }) => {
    await page.goto(`/en/${CANONICAL.slug}/`);
    await expect(page).toHaveURL(new RegExp(`/en/${escapeRegExp(CANONICAL.slug)}/$`));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${SITE.url}/${CANONICAL.slug}/`
    );
  });
});

test.describe("Non-default locale stays prefixed", () => {
  test("/ru/ stays at /ru/ and shows real content", async ({ page }) => {
    await page.goto("/ru/");
    await expect(page).toHaveURL(/\/ru\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator('[data-island="dashboard"]')).toBeVisible();
  });
});

test.describe("Disk content (no redirect pages)", () => {
  test("dist/index.html is real content, not a meta-refresh redirect", () => {
    const root = path.join(DIST, "index.html");
    expect(existsSync(root), "dist/index.html missing").toBe(true);

    const html = readFileSync(root, "utf8");
    expect(html).not.toContain('http-equiv="refresh"');
    expect(html).toContain('data-island="dashboard"');
  });

  test("dist/en/index.html exists (the English alias)", () => {
    expect(existsSync(path.join(DIST, "en/index.html")), "dist/en/index.html missing").toBe(true);
  });
});
