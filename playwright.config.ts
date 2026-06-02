import { defineConfig } from "@playwright/test";

/**
 * Playwright config for the blog's e2e + visual-regression suite.
 *
 * Visual baselines are golden files committed per-platform: Playwright appends the
 * OS suffix (`-darwin`, `-linux`) to every screenshot, so macOS (local dev) and the
 * pinned Linux Docker image (`mcr.microsoft.com/playwright:v1.58.2-noble`, used in
 * CI and `test:e2e:update:linux`) keep independent baseline sets. The determinism
 * knobs below (disabled animations, srgb color profile, no font hinting, reduced
 * motion, fixed device scale) keep those renders stable across runs.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  webServer: {
    command: "bun scripts/serve.ts",
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: "http://localhost:4173",
    deviceScaleFactor: 1,
    colorScheme: "light"
  },
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      maxDiffPixelRatio: 0.02
    }
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        contextOptions: { reducedMotion: "reduce" },
        launchOptions: {
          args: ["--font-render-hinting=none", "--force-color-profile=srgb"]
        }
      }
    }
  ]
});
