import { expect, type Page, test } from "@playwright/test";

// End-to-end link + navigation integrity, in BOTH modes:
//   - direct load (full HTML request per URL, incl. the SPA's _data prefetches), and
//   - SPA client navigation (intercepted link clicks).
// Catches dead links (404 HTML), missing per-page data JSON (the `_data/.../index.json` 404 that
// fires on every page because the about/nav links are prefetched), broken assets, and JS errors.

const ORIGIN = "http://localhost:4173";

// Representative set: every page TYPE × both locales (a full all-page sweep is unnecessary —
// each type shares a template/route).
const PAGES = [
  "/",
  "/ru/",
  "/archive/",
  "/ru/archive/",
  "/about/",
  "/ru/about/",
  "/monaco-2026-drama/",
  "/ru/monaco-2026-drama/",
  "/tags/formula1/",
  "/ru/tags/formula1/"
];

/** Attach listeners that record any same-origin >=400 response, page error, or console error. */
function watchFailures(page: Page): string[] {
  const failures: string[] = [];
  page.on("response", response => {
    const url = new URL(response.url());
    if (url.origin === ORIGIN && response.status() >= 400) {
      failures.push(`${response.status()} ${url.pathname}`);
    }
  });
  page.on("requestfailed", request => {
    const url = new URL(request.url());
    if (url.origin === ORIGIN) failures.push(`requestfailed ${url.pathname}`);
  });
  page.on("pageerror", error => failures.push(`pageerror: ${error}`));
  page.on("console", message => {
    if (message.type() === "error") failures.push(`console.error: ${message.text()}`);
  });
  return failures;
}

test.describe("direct load — no failed requests, no JS errors", () => {
  for (const path of PAGES) {
    test(`loads cleanly: ${path}`, async ({ page }) => {
      const failures = watchFailures(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(failures, failures.join("\n")).toEqual([]);
    });
  }
});

test("link integrity — every internal link resolves (no dead links)", async ({ page, request }) => {
  // Crawl one page of each type and collect every internal href, then verify each resolves (<400).
  const internal = new Set<string>();
  for (const start of ["/", "/ru/", "/archive/", "/about/", "/monaco-2026-drama/"]) {
    await page.goto(start);
    const hrefs = await page.$$eval("a[href]", anchors =>
      anchors.map(a => a.getAttribute("href") ?? "")
    );
    for (const href of hrefs) {
      // same-origin, root-relative paths only (skip mailto:, external, hashes, protocol-relative)
      if (href.startsWith("/") && !href.startsWith("//")) internal.add(href);
    }
  }

  expect(internal.size, "expected to discover internal links").toBeGreaterThan(20);

  const broken: string[] = [];
  for (const href of internal) {
    const response = await request.get(href);
    if (response.status() >= 400) broken.push(`${href} -> ${response.status()}`);
  }
  expect(broken, broken.join("\n")).toEqual([]);
});

test.describe("SPA client navigation — no failed requests through a click path", () => {
  test("nav tabs + article + lang switch all swap without errors", async ({ page }) => {
    const failures = watchFailures(page);
    await page.goto("/");

    // Home -> Archive -> About -> Home (nav tabs)
    for (const href of ["/archive/", "/about/", "/"]) {
      await page.click(`[data-component="tab-nav"] a[href="${href}"]`);
      await page.waitForURL(url => new URL(url).pathname === href);
      await page.waitForLoadState("networkidle");
    }

    // Open the first article from the dashboard
    const firstArticle = page.locator('[data-component="dashboard"] h2 a').first();
    await firstArticle.click();
    await expect(page.locator('[data-component="split-pane"] article > header h1')).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Back home
    await page.click('[data-component="tab-nav"] a[href="/"]');
    await page.waitForURL(/\/$/);
    await page.waitForLoadState("networkidle");

    // Language switch (en -> ru) via the lang switcher
    await page.click('[data-component="lang-switcher"] a[href^="/ru/"]');
    await page.waitForURL(/\/ru\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await page.waitForLoadState("networkidle");

    expect(failures, failures.join("\n")).toEqual([]);
  });

  test("CONSECUTIVE same-route navs keep content (no blank swap region)", async ({ page }) => {
    // Regression: two client navs in a row into the same route used to render an empty
    // swap region (Preact vdom desynced from the DOM). Hop article -> article (same route
    // twice in a row) and assert the body renders on EACH page, then round-trip the
    // about locale.
    await page.goto("/");
    await expect(
      page.locator('[data-component="dashboard"] article:not([data-variant="stats"])')
    ).toHaveCount(6);

    // First nav into the article route.
    await page.click('[data-component="dashboard"] h2 a[href="/monaco-2026-drama/"]');
    await page.waitForURL(/\/monaco-2026-drama\//);
    await expect(page.locator("[data-content]")).toBeVisible();

    // Second, CONSECUTIVE nav into the same article route — must NOT be empty.
    // (The article page links /bad-monday/ twice — recent-posts pane + prev/next — so
    // take the first match instead of a strict single-element click.)
    await page.locator('a[href="/bad-monday/"]').first().click();
    await page.waitForURL(/\/bad-monday\//);
    await expect(page.locator("[data-content]")).toBeVisible();

    // About locale round-trip (en -> ru -> en) — content must persist each time.
    await page.goto("/about/");
    await page.click('[data-component="lang-switcher"] a[href^="/ru/"]');
    await page.waitForURL(/\/ru\/about\//);
    await expect(page.locator('[data-component="about"]')).toBeVisible();
    // Back to English: on /ru/about/ the EN link is the bare /about/.
    await page.click('[data-component="lang-switcher"] a[href="/about/"]');
    await page.waitForURL(url => new URL(url).pathname === "/about/");
    await expect(page.locator('[data-component="about"]')).toBeVisible();
  });
});
