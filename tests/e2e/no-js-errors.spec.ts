import { expect, test } from "@playwright/test";

// Regression guard for client-bundle runtime crashes. The SSG HTML renders fine even when
// main.js throws on load (e.g. a Node-ism like `process.env` leaking into the browser bundle
// → "ReferenceError: process is not defined"), so the DOM-presence specs miss it entirely.
// This spec fails on any uncaught page error or console error, across every page type + locale.
const PAGES = [
  "/",
  "/ru/",
  "/hello-pipeline/",
  "/ru/hello-pipeline/",
  "/archive/",
  "/ru/archive/",
  "/about/",
  "/ru/about/",
  "/tags/testing/",
  "/ru/tags/testing/",
  "/page/2/"
];

for (const path of PAGES) {
  test(`loads without JS errors: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(`pageerror: ${error}`));
    page.on("console", message => {
      if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
    });

    await page.goto(path, { waitUntil: "load" });
    // Give the SPA's app.start() (route compile in onInit) a beat so any boot-time throw —
    // e.g. a missing browser global like URLPattern — surfaces on the listeners above.
    // `networkidle` is deliberately avoided: it never settles reliably under parallel load
    // against the single static preview server, and Playwright itself discourages it.
    await page.waitForTimeout(400);

    expect(errors, errors.join("\n")).toEqual([]);
  });
}

test.describe("SPA hydration is alive (client JS actually ran)", () => {
  test("internal nav swaps content without a full document reload", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    // Wait for the SPA kernel to boot before exercising client nav. It prepends
    // `<div data-progress>` to <body> on start, immediately before it attaches nav
    // interception — so its presence means clicks are now intercepted. Without this gate
    // the click can race ahead of hydration (notably the slightly slower WebKit boot) and
    // trigger a FULL navigation, which both clears the sentinel and tears down the context.
    await page.locator("[data-progress]").waitFor({ state: "attached" });

    // A full reload would clear this; SPA (intercepted) navigation preserves it.
    await page.evaluate(() => {
      (globalThis as unknown as { __spaSentinel?: boolean }).__spaSentinel = true;
    });

    // Dispatch the click via the DOM rather than page.click(): in WebKit, page.click()
    // hangs on "waiting for scheduled navigations to finish" because the SPA commits the
    // URL via the Navigation API, which Playwright's WebKit driver mistracks — even though
    // the click IS intercepted (no full reload; the sentinel below proves it).
    await page.locator('a[href="/archive/"]').dispatchEvent("click");
    // Assert on the in-page location, NOT page.url(): for the same WebKit/Navigation-API
    // reason, page.url()/waitForURL go stale even though the SPA navigated correctly.
    await page.waitForFunction(() => location.pathname === "/archive/");
    // In-page DOM poll instead of expect(locator).toBeVisible(): WebKit parks Playwright in
    // a perpetual "waiting for navigation to finish" state after a Navigation-API commit,
    // which hangs auto-waiting locator actions — but one-shot in-page evals run fine.
    await page.waitForFunction(() => Boolean(document.querySelector('[data-component="archive"]')));

    const survived = await page.evaluate(
      () => (globalThis as unknown as { __spaSentinel?: boolean }).__spaSentinel === true
    );
    expect(survived, "navigation triggered a full page reload — SPA JS did not hydrate").toBe(true);
  });
});
