/**
 * @file CI/deploy workflow gate invariants.
 *
 * Two regressions this guards against (found by the 2026-06-09 audit):
 *
 * 1. The e2e suite silently dying in CI. ci.yml must run `playwright test` against the
 *    built site, excluding ONLY the visual snapshot specs — every committed baseline is
 *    `*-darwin`, so snapshot specs cannot pass on a linux runner until linux baselines
 *    land. The exclusion filter is derived here from the specs themselves (a spec is
 *    "visual" iff it calls `toHaveScreenshot`), so adding a new functional spec keeps it
 *    in CI automatically, and adding a new visual spec fails this test until the ci.yml
 *    filter is updated (or linux baselines are committed and the filter is removed).
 *
 * 2. Ungated production deploys. deploy.yml must NOT ship on a bare `push` racing CI on
 *    the same event — it must trigger via `workflow_run` on the CI workflow, deploy only
 *    on a green conclusion, and check out the exact sha CI validated.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ciYml = readFileSync(".github/workflows/ci.yml", "utf8");
const deployYml = readFileSync(".github/workflows/deploy.yml", "utf8");

const E2E_DIR = "tests/e2e";
const specFiles = readdirSync(E2E_DIR).filter(file => file.endsWith(".spec.ts"));

/** A spec is visual iff it asserts screenshots — those need per-OS committed baselines. */
const isVisualSpec = (file: string): boolean =>
  readFileSync(path.join(E2E_DIR, file), "utf8").includes("toHaveScreenshot");

/** The `--grep-invert` pattern ci.yml passes to `playwright test`, if any. */
const grepInvertPattern = (): string | undefined =>
  ciYml.match(/playwright test --grep-invert "([^"]+)"/)?.[1];

/** Trimmed lines of a workflow file — for line-anchored checks without regexes. */
const trimmedLines = (yml: string): string[] => yml.split("\n").map(line => line.trim());

describe("ci.yml e2e job", () => {
  it("runs the e2e suite (playwright test) with a visual-spec exclusion filter", () => {
    expect(grepInvertPattern()).toBeDefined();
  });

  it("builds the site and installs browsers before running playwright", () => {
    const buildAt = ciYml.indexOf("bun run build");
    const installAt = ciYml.indexOf("playwright install");
    const testAt = ciYml.indexOf("playwright test");

    expect(buildAt).toBeGreaterThan(-1);
    expect(installAt).toBeGreaterThan(buildAt);
    expect(testAt).toBeGreaterThan(installAt);
  });

  it("excludes exactly the snapshot-bearing specs — no more, no less", () => {
    const invert = new RegExp(grepInvertPattern() ?? "(?!)");

    // Playwright's grep matches the joined title path, which includes the spec's file
    // path — so testing the filter against each filename mirrors runtime behavior.
    for (const file of specFiles) {
      expect(invert.test(file), `${file} CI exclusion`).toBe(isVisualSpec(file));
    }
  });

  it("still has visual specs to exclude (drop the filter once linux baselines land)", () => {
    // If this starts failing because linux baselines were committed and the visual
    // specs now run in CI, delete the `--grep-invert` filter and this whole guard pair.
    expect(specFiles.some(file => isVisualSpec(file))).toBe(true);
  });
});

describe("deploy.yml gating", () => {
  it("does not deploy on a bare push event", () => {
    expect(trimmedLines(deployYml)).not.toContain("push:");
  });

  it("triggers via workflow_run on the CI workflow's completion", () => {
    const ciName = trimmedLines(ciYml)
      .find(line => line.startsWith("name: "))
      ?.slice("name: ".length);

    expect(ciName).toBeDefined();
    expect(trimmedLines(deployYml)).toContain("workflow_run:");
    expect(deployYml).toContain(`workflows: [${ciName}]`);
    expect(trimmedLines(deployYml)).toContain("types: [completed]");
    expect(trimmedLines(deployYml)).toContain("branches: [main]");
  });

  it("only deploys when CI concluded successfully (manual dispatch exempt)", () => {
    expect(deployYml).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(deployYml).toContain("github.event_name == 'workflow_dispatch'");
  });

  it("checks out the exact sha CI validated", () => {
    expect(deployYml).toMatch(
      /ref: \$\{\{ github\.event\.workflow_run\.head_sha \|\| github\.sha \}\}/
    );
  });

  it("deploys to the production branch (detached-HEAD checkout would silently ship a preview)", () => {
    // The SHA-pinned checkout leaves git detached, so wrangler infers branch "head"
    // and Cloudflare files the deploy as a preview. `--branch main` forces promotion.
    expect(deployYml).toContain("pages deploy dist --project-name geek-life --branch main");
  });
});
