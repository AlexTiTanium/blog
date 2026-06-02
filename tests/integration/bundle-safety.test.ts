/**
 * @file Client-bundle browser-safety gate.
 *
 * The SPA composes the app from `@moku-labs/web/browser` — the framework's dedicated browser-safe
 * entry (added in 0.5.0) whose static import graph provably contains ZERO node/native code. So the
 * client bundle (`src/main.ts` → `src/spa/spa.tsx` → `@moku-labs/web/browser`) builds for
 * `--target browser` with NO externals and carries no `node:*` builtin and no native OG deps
 * (`@resvg/resvg-js`, `satori`) or Node-only content libs (`shiki`, `gray-matter`, `feed`).
 *
 * This replaces the previous gate, which had to externalize ~17 node-only deps to bundle the single
 * `.` entry. Building with zero externals is the assertion that the browser entry is genuinely clean.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

/** Markers that must NEVER appear in the client bundle (node builtins + node-only/native libs). */
const FORBIDDEN = [
  /(?:require\(|from\s*)["']node:/, // any node:* builtin import
  /@resvg\/resvg-js/,
  /resvgjs/,
  /["']satori["']/,
  /["']shiki["']/,
  /gray-matter/,
  /["']feed["']/
];

const workdir = mkdtempSync(path.join(tmpdir(), "blog-bundle-"));
afterAll(() => rmSync(workdir, { recursive: true, force: true }));

describe("client bundle browser-safety", () => {
  it("bundles the SPA entry for the browser with NO externals and no node/native code", () => {
    const outfile = path.join(workdir, "spa.js");

    // Throws (failing the test) if bun exits non-zero — that IS the "browser build succeeds with no
    // externals" assertion. The native `@resvg/resvg-js` .node would hard-fail a non-clean graph.
    execFileSync(
      // eslint-disable-next-line sonarjs/no-os-command-from-path -- fixed `bun build` invocation in a test, no user input
      "bun",
      ["build", "src/main.ts", "--target", "browser", "--outfile", outfile],
      { stdio: "pipe" }
    );

    const code = readFileSync(outfile, "utf8");
    for (const pattern of FORBIDDEN) {
      expect(code).not.toMatch(pattern);
    }
  }, 60_000);
});
