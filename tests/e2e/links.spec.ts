import { expect, type Page, test } from "@playwright/test";

// End-to-end link + navigation integrity, in BOTH modes:
//   - direct load (full HTML request per URL, incl. the SPA's _data prefetches), and
//   - SPA client navigation (intercepted link clicks).
// Catches dead links (404 HTML), missing per-page data JSON (the `_data/.../index.json` 404 that
// fires on every page because the about/nav links are prefetched), broken assets, and JS errors.

const ORIGIN = "http://localhost:4173";

// Representative set: every page TYPE × both locales (full 70-page sweep is unnecessary —
// each type shares a template/route).
const PAGES = [
  "/en/",
  "/ru/",
  "/en/page/2/",
  "/ru/page/2/",
  "/en/archive/",
  "/ru/archive/",
  "/en/archive/page/2/",
  "/en/about/",
  "/ru/about/",
  "/en/hello-pipeline/",
  "/ru/hello-pipeline/",
  "/en/tags/testing/",
  "/ru/tags/testing/"
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
  for (const start of ["/en/", "/ru/", "/en/archive/", "/en/about/", "/en/hello-pipeline/"]) {
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
  test("nav tabs + article + pagination + lang switch all swap without errors", async ({
    page
  }) => {
    const failures = watchFailures(page);
    await page.goto("/en/");

    // Home -> Archive -> About -> Home (nav tabs)
    for (const href of ["/en/archive/", "/en/about/", "/en/"]) {
      await page.click(`[data-component="tab-nav"] a[href="${href}"]`);
      await page.waitForURL(url => new URL(url).pathname === href);
      await page.waitForLoadState("networkidle");
    }

    // Open the first article from the dashboard
    const firstArticle = page.locator('[data-component="dashboard"] h2 a').first();
    await firstArticle.click();
    await expect(page.locator('[data-component="split-pane"] article > header h1')).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Back home, then page 2 via pagination
    await page.click('[data-component="tab-nav"] a[href="/en/"]');
    await page.waitForURL(/\/en\/$/);
    await page.click('[data-component="pagination"] [data-next]:not([data-hidden])');
    await page.waitForURL(/\/en\/page\/2\//);
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
    // swap region (Preact vdom desynced from the DOM). Walk the home pagination and
    // assert cards render on EACH page, then round-trip the about locale.
    await page.goto("/en/");
    await expect(
      page.locator('[data-component="dashboard"] article:not([data-variant="stats"])')
    ).toHaveCount(10);

    await page.click('[data-component="pagination"] [data-next]:not([data-hidden])');
    await page.waitForURL(/\/en\/page\/2\//);
    await expect(
      page.locator('[data-component="dashboard"] article:not([data-variant="stats"])')
    ).toHaveCount(10);

    await page.click('[data-component="pagination"] [data-next]:not([data-hidden])');
    await page.waitForURL(/\/en\/page\/3\//);
    // page 3 (2 articles) — must NOT be empty.
    await expect(
      page.locator('[data-component="dashboard"] article:not([data-variant="stats"])')
    ).toHaveCount(2);

    // About locale round-trip (en -> ru -> en) — content must persist each time.
    await page.goto("/en/about/");
    await page.click('[data-component="lang-switcher"] a[href^="/ru/"]');
    await page.waitForURL(/\/ru\/about\//);
    await expect(page.locator('[data-component="about"]')).toBeVisible();
    await page.click('[data-component="lang-switcher"] a[href^="/en/"]');
    await page.waitForURL(/\/en\/about\//);
    await expect(page.locator('[data-component="about"]')).toBeVisible();
  });
});
