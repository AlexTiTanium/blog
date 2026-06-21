import { expect, test } from "@playwright/test";

/**
 * Guards the card-entrance retirement (src/islands/dashboard.ts): after the entrance
 * window the grid must carry [data-entered], which removes `animation` from the cards
 * (DashboardGrid.css) so browsers can never suspend/restart the one-shot card-enter
 * animation during scrolling — the rare "blank card for ~half a second" bug. Every card
 * must end fully visible (opacity 1), the animation's natural end state.
 */
test.describe("Dashboard entrance retirement", () => {
  test("grid is stamped data-entered and all cards end visible", async ({ page }) => {
    await page.goto("/");

    const grid = page.locator('[data-island="dashboard"]');
    await expect(grid).toHaveAttribute("data-entered", "");

    const opacities = await grid
      .locator("article")
      .evaluateAll(cards => cards.map(card => getComputedStyle(card).opacity));
    expect(opacities.length).toBeGreaterThan(0);
    for (const opacity of opacities) expect(opacity).toBe("1");
  });

  test("a freshly swapped-in grid is stamped again after SPA navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-island="dashboard"]')).toHaveAttribute("data-entered", "");

    await page.click('a[href="/archive/"]');
    await expect(page.locator('[data-island="archive"]')).toBeVisible();

    await page.click('[data-island="tab-nav"] a[href="/"]');
    await expect(page.locator('[data-island="dashboard"]')).toHaveAttribute("data-entered", "");
  });
});
