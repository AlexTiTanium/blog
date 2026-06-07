import { expect, type Locator, type Page, test } from "@playwright/test";

// Language-selector behaviour across viewports.
//
// On phones (<=600px) the selector collapses to ONLY the current language; tapping it
// unfolds the others (pushing the nav tabs left), and picking one / tapping outside /
// Escape collapses it again. Above 600px (tablet + desktop) all four codes stay shown.
//
// The mobile asserts here fail against the pre-redesign code (all four codes render and
// overflow the narrow viewport) — that is the bug this suite pins. Visual baselines are
// golden files; regenerate with `bun run test:e2e:update` (macOS) /
// `bun run test:e2e:update:linux` (pinned Linux Docker).

/** Worst-case narrow phones — the selector must collapse and never overflow here. */
const PHONES = [
  { id: "iphone-se-1", width: 320, height: 568 }, // extreme: iPhone SE (1st gen)
  { id: "android-sm", width: 360, height: 640 }, // narrowest common Android
  { id: "iphone-se", width: 375, height: 667 } // iPhone SE (2nd/3rd gen)
] as const;

/** Wider screens that MUST keep showing all four language codes (the invariant). */
const WIDE = [
  { id: "tablet", width: 768, height: 1024 },
  { id: "desktop", width: 1280, height: 800 }
] as const;

// Freeze the clock so the title-bar dev-quote is deterministic (see baseline.spec.ts).
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-06-01T12:00:00Z"));
});

/** The language-switcher root. */
const switcher = (page: Page): Locator => page.locator('[data-component="lang-switcher"]');

/** Direct anchor children of the switcher (one per locale). */
const localeLinks = (page: Page): Locator => switcher(page).locator("> a");

/** The active-locale anchor (the collapsed "pill"). */
const currentLink = (page: Page): Locator => switcher(page).locator('a[aria-current="true"]');

/** Assert a locator's rendered box sits fully inside the viewport (no horizontal overflow). */
async function expectWithinViewport(page: Page, locator: Locator): Promise<void> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const width = page.viewportSize()?.width ?? 0;
  // 1px tolerance for sub-pixel rounding.
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
}

for (const phone of PHONES) {
  test.describe(`mobile ${phone.id} (${phone.width}x${phone.height})`, () => {
    test.use({ viewport: { width: phone.width, height: phone.height } });

    test("collapses to only the current language and does not overflow", async ({ page }) => {
      await page.goto("/");

      // Only the current locale shows; the other three are collapsed away.
      await expect(currentLink(page)).toBeVisible();
      await expect(currentLink(page)).toHaveText("EN");
      const others = switcher(page).locator('a:not([aria-current="true"])');
      await expect(others).toHaveCount(3);
      for (let i = 0; i < 3; i++) await expect(others.nth(i)).toBeHidden();

      // The selector stays fully on-screen — this is the bug guard.
      await expectWithinViewport(page, switcher(page));
    });

    test("tapping the pill expands all four options within the viewport", async ({ page }) => {
      await page.goto("/");
      await currentLink(page).click();

      await expect(switcher(page)).toHaveAttribute("data-expanded", "true");
      await expect(localeLinks(page)).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        await expect(localeLinks(page).nth(i)).toBeVisible();
        await expectWithinViewport(page, localeLinks(page).nth(i));
      }
    });

    test("picking a language navigates and collapses to the chosen one", async ({ page }) => {
      await page.goto("/");
      await currentLink(page).click();

      await localeLinks(page).filter({ hasText: "RU" }).click();
      await page.waitForURL(/\/ru\//);

      await expect(page.locator("html")).toHaveAttribute("lang", "ru");
      await expect(switcher(page)).not.toHaveAttribute("data-expanded", "true");
      await expect(currentLink(page)).toHaveText("RU");
      await expectWithinViewport(page, switcher(page));
    });

    test("expanding hides the nav tabs; tapping the nav area collapses", async ({ page }) => {
      await page.goto("/");
      await currentLink(page).click();
      await expect(switcher(page)).toHaveAttribute("data-expanded", "true");

      // The push design recedes the tabs while expanded — they are not interactive.
      await expect(page.locator('[data-component="tab-nav"] > a[href="/about/"]')).toBeHidden();

      // Tapping the (now-vacated) nav area collapses without navigating.
      await page.locator('[data-component="tab-nav"]').click({ position: { x: 6, y: 6 } });
      await expect(switcher(page)).not.toHaveAttribute("data-expanded", "true");
      await expect(page).toHaveURL(/\/$/);
    });

    test("clicking outside collapses without navigating", async ({ page }) => {
      await page.goto("/");
      await currentLink(page).click();
      await expect(switcher(page)).toHaveAttribute("data-expanded", "true");

      // The title bar is in-header but outside the switcher and is not a link.
      await page.click('[data-component="titlebar"]');
      await expect(switcher(page)).not.toHaveAttribute("data-expanded", "true");
      await expect(page).toHaveURL(/\/$/);
    });

    test("Escape collapses the selector", async ({ page }) => {
      await page.goto("/");
      await currentLink(page).click();
      await expect(switcher(page)).toHaveAttribute("data-expanded", "true");

      await page.keyboard.press("Escape");
      await expect(switcher(page)).not.toHaveAttribute("data-expanded", "true");
    });

    for (const locale of ["en", "ru"] as const) {
      test(`visual: collapsed + expanded header (${locale})`, async ({ page }) => {
        const header = page.locator("header[data-sticky]");
        // The default locale (en) is served at the bare path; ru stays prefixed.
        await page.goto(locale === "en" ? "/" : `/${locale}/`);

        await expect(header).toHaveScreenshot(`lang-${phone.id}-${locale}-collapsed.png`);

        await currentLink(page).click();
        await expect(switcher(page)).toHaveAttribute("data-expanded", "true");
        await expect(localeLinks(page).nth(3)).toBeVisible();
        await expect(header).toHaveScreenshot(`lang-${phone.id}-${locale}-expanded.png`);
      });
    }
  });
}

for (const screen of WIDE) {
  test.describe(`${screen.id} (${screen.width}x${screen.height}) keeps all four codes`, () => {
    test.use({ viewport: { width: screen.width, height: screen.height } });

    test("all four language links are visible and on-screen", async ({ page }) => {
      await page.goto("/");

      await expect(localeLinks(page)).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        await expect(localeLinks(page).nth(i)).toBeVisible();
        await expectWithinViewport(page, localeLinks(page).nth(i));
      }
      // The selector is never in the expanded/collapsed mobile state here.
      await expect(switcher(page)).not.toHaveAttribute("data-expanded", "true");
    });

    test("visual: header keeps the four-code row", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("header[data-sticky]")).toHaveScreenshot(
        `lang-${screen.id}-en.png`
      );
    });
  });
}
