import { expect, test } from "@playwright/test";
import { EMBEDDED, escapeRegExp } from "./_content";

// `::embed{src title}` — the content pipeline emits a static click-to-activate facade
// (no iframe, so none of the target's network/JS cost, until the reader clicks); the
// framework's `lazyEmbed` island (pluginConfigs.spa.components) swaps it for the real
// `<iframe loading="lazy">` on click. Expectations are DERIVED from the fixture corpus
// (see _content.ts): the embed src is a root-relative, fixture-served URL, so these
// tests never touch the network.
const slug = EMBEDDED?.slug ?? "";
const src = EMBEDDED?.embed?.src ?? "";
const title = EMBEDDED?.embed?.title ?? "";

// The facade figure inside the article body.
const FACADE = '[data-content] figure[data-component="lazy-embed"]';

test.describe("Lazy embed (::embed directive)", () => {
  test.skip(!EMBEDDED, "no article with an ::embed directive in the fixture corpus");

  test("facade renders statically with no iframe before activation", async ({ page }) => {
    await page.goto(`/${slug}/`);

    const facade = page.locator(FACADE);
    await expect(facade).toBeVisible();
    await expect(facade).toHaveClass("lazy-embed");
    await expect(facade).toHaveAttribute("data-embed-src", src);
    await expect(facade).toHaveAttribute("data-embed-title", title);
    await expect(facade.locator("button.lazy-embed-button")).toBeVisible();
    // The whole point of the facade: zero iframes until the reader opts in.
    await expect(facade.locator("iframe")).toHaveCount(0);
  });

  test("clicking the facade swaps it for the lazy iframe", async ({ page }) => {
    await page.goto(`/${slug}/`);

    const facade = page.locator(FACADE);
    await facade.locator("button.lazy-embed-button").click();

    const iframe = facade.locator("iframe.lazy-embed-frame");
    await expect(iframe).toHaveAttribute("src", src);
    await expect(iframe).toHaveAttribute("loading", "lazy");
    await expect(iframe).toHaveAttribute("title", title);
    // The figure flags the activated state (consumer CSS hook) and the button is gone.
    await expect(facade).toHaveAttribute("data-embed-active", "");
    await expect(facade.locator("button")).toHaveCount(0);
    // The fixture-served src actually resolves — the embedded document renders.
    await expect(page.frameLocator("iframe.lazy-embed-frame").locator("body")).toBeVisible();
  });

  test("island re-mounts after SPA navigation away and back", async ({ page }) => {
    await page.goto(`/${slug}/`);

    // Activate first, so coming back proves the swap delivered a FRESH facade.
    await page.locator(`${FACADE} button.lazy-embed-button`).click();
    await expect(page.locator(`${FACADE} iframe`)).toBeVisible();

    await page.click('a[href="/archive/"]');
    await page.waitForURL(/\/archive\//);
    await expect(page.locator('[data-component="archive"]')).toBeVisible();

    // Back is an SPA traversal: the framework re-fetches and swaps the article content
    // (independent of which paginated listing carries this article's link).
    await page.goBack();
    await page.waitForURL(new RegExp(`/${escapeRegExp(slug)}/`));

    // The swap delivered the server-rendered facade again — the click-time iframe is gone.
    const facade = page.locator(FACADE);
    await expect(facade).toBeVisible();
    await expect(facade.locator("iframe")).toHaveCount(0);

    // The click handler works only if the island re-mounted on the swapped-in content.
    await facade.locator("button.lazy-embed-button").click();
    await expect(facade.locator("iframe.lazy-embed-frame")).toBeVisible();
  });
});
