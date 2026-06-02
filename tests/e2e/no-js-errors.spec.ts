import { expect, test } from "@playwright/test";

// Regression guard for client-bundle runtime crashes. The SSG HTML renders fine even when
// main.js throws on load (e.g. a Node-ism like `process.env` leaking into the browser bundle
// → "ReferenceError: process is not defined"), so the DOM-presence specs miss it entirely.
// This spec fails on any uncaught page error or console error, across every page type + locale.
const PAGES = [
  "/en/",
  "/ru/",
  "/en/hello-pipeline/",
  "/ru/hello-pipeline/",
  "/en/archive/",
  "/ru/archive/",
  "/en/about/",
  "/ru/about/",
  "/en/tags/testing/",
  "/ru/tags/testing/",
  "/en/page/2/"
];

for (const path of PAGES) {
  test(`loads without JS errors: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(`pageerror: ${error}`));
    page.on("console", message => {
      if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
    });

    await page.goto(path);
    await page.waitForLoadState("networkidle");

    expect(errors, errors.join("\n")).toEqual([]);
  });
}

test.describe("SPA hydration is alive (client JS actually ran)", () => {
  test("internal nav swaps content without a full document reload", async ({ page }) => {
    await page.goto("/en/");
    // A full reload would clear this; SPA (intercepted) navigation preserves it.
    await page.evaluate(() => {
      (globalThis as unknown as { __spaSentinel?: boolean }).__spaSentinel = true;
    });

    await page.click('a[href="/en/archive/"]');
    await page.waitForURL(/\/en\/archive\//);
    await expect(page.locator('[data-component="archive"]')).toBeVisible();

    const survived = await page.evaluate(
      () => (globalThis as unknown as { __spaSentinel?: boolean }).__spaSentinel === true
    );
    expect(survived, "navigation triggered a full page reload — SPA JS did not hydrate").toBe(true);
  });
});
