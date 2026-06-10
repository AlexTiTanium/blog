/**
 * @file Deploy-config consistency gate.
 *
 * CI deploys publish via cloudflare/wrangler-action with an explicit `wranglerVersion`, while local
 * deploys (`bun run deploy`) run the `wrangler` devDependency pinned in package.json (the version
 * wrangler.jsonc's schema references). The two MUST stay in lockstep — otherwise CI publishes with
 * a different wrangler than the one exercised locally. This guard pins the workflow to package.json.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("deploy workflow wrangler version", () => {
  it("matches the wrangler devDependency pin in package.json", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      devDependencies: Record<string, string>;
    };
    const pinned = pkg.devDependencies.wrangler;
    expect(pinned).toMatch(/^\d+\.\d+\.\d+$/); // exact pin, no range

    const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
    const wranglerVersion = workflow.match(/wranglerVersion:\s*"([^"]+)"/)?.[1];

    expect(wranglerVersion).toBe(pinned);
  });
});
