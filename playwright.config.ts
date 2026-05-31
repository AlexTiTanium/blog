import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "bun scripts/serve.ts",
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  use: { baseURL: "http://localhost:4173" },
  expect: { toHaveScreenshot: { animations: "disabled" } },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: { args: ["--font-render-hinting=none", "--force-color-profile=srgb"] }
      }
    }
  ]
});
