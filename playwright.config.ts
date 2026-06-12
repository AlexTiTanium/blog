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
/**
 * Preview-server port. Honors the same `PORT` env var as `scripts/preview.ts` (the cli
 * plugin reads it too), so the suite can be pointed at a free port when 4173 is already
 * taken — e.g. by a preview server from another checkout serving a stale build, which
 * `reuseExistingServer` would otherwise happily test against.
 */
const port = Number(process.env.PORT ?? 4173);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  // The webServer builds and serves the FIXTURE corpus (tests/fixtures/content → dist-e2e),
  // not the real site: e2e expectations + visual baselines are frozen against it, so
  // publishing a real article never touches the suite. The real corpus is still guarded by
  // `bun run build` in CI + the integration content tests.
  webServer: {
    command: "bun scripts/e2e-server.ts",
    port,
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: `http://localhost:${port}`,
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
  // One project per browser engine. Playwright suffixes every snapshot with the
  // project name (e.g. `home-en-chromium-darwin.png`), so each engine keeps its own
  // golden set — cross-engine pixel rendering differs (fonts, sub-pixel, form
  // controls), so they cannot share baselines.
  //
  // Engine matrix by value:
  //   - chromium runs the FULL suite (functional logic is engine-agnostic, so one
  //     engine is sufficient for it; chromium also tracks Navigation-API URL changes,
  //     which WebKit's Playwright driver does not).
  //   - webkit + firefox run only the specs with genuine per-engine value: the visual
  //     baselines (rendering differs per engine) and the JS-boot guard (the URLPattern
  //     class of Safari/Firefox-only crashes). They are scoped via `testMatch`.
  // WebKit is Safari's engine — the one that catches Safari-only regressions the
  // Chromium-only matrix silently missed.
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
    },
    {
      name: "webkit",
      testMatch: /(baseline|no-js-errors)\.spec\.ts$/,
      use: {
        browserName: "webkit",
        contextOptions: { reducedMotion: "reduce" }
      }
    },
    {
      name: "firefox",
      testMatch: /(baseline|no-js-errors)\.spec\.ts$/,
      use: {
        browserName: "firefox",
        contextOptions: { reducedMotion: "reduce" }
      }
    }
  ]
});
