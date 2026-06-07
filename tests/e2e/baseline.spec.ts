import { expect, test } from "@playwright/test";

// Golden-file visual baselines. Playwright auto-suffixes snapshot names with the
// platform (e.g. `-darwin`, `-linux`), so macOS and the pinned Linux Docker image
// each keep their own baseline set. Regenerate with:
//   bun run test:e2e:update          (macOS)
//   bun run test:e2e:update:linux    (pinned Linux Docker)

// Freeze the clock so the title-bar dev-quote (pickQuote(), seeded by date+hour) is
// deterministic. Otherwise a longer quote wraps on the 375px mobile viewport and adds
// ~21px to every page, making the baselines drift hour-to-hour.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-06-01T12:00:00Z"));
});

const pages = [
  { name: "home-en", path: "/" },
  { name: "home-ru", path: "/ru/" },
  { name: "article-en-hello-pipeline", path: "/hello-pipeline/" },
  { name: "article-ru-hello-pipeline", path: "/ru/hello-pipeline/" },
  { name: "article-en-bad-monday", path: "/bad-monday/" },
  { name: "article-ru-bad-monday", path: "/ru/bad-monday/" },
  { name: "archive-en", path: "/archive/" },
  { name: "archive-ru", path: "/ru/archive/" },
  { name: "about-en", path: "/about/" },
  { name: "about-ru", path: "/ru/about/" }
];

for (const { name, path } of pages) {
  test(`baseline: ${name}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02
    });
  });
}

test.describe("mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const { name, path } of pages) {
    test(`baseline: ${name}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveScreenshot(`${name}-mobile.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02
      });
    });
  }
});
