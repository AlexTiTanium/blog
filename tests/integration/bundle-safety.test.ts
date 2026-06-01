/**
 * @file Client-bundle browser-safety gate (blog-owned acceptance test for proposal item #1).
 *
 * `@moku-labs/web` ships a single `.` entry; its Node-only plugin code (content/build/deploy) and
 * the lazy native OG deps (satori, `@resvg/resvg-js`) live in the same module graph as `createApp`.
 * They are reachable only through dead `await import()` branches the SPA never calls, so the
 * client bundle is browser-safe to EXECUTE once those Node-only deps are marked external. This
 * test proves the SPA entry (src/main.ts → src/spa/spa.tsx) bundles for `--target browser` and
 * carries no statically-executed `node:*` import. (On 0.3.0 this build failed outright on resvg's
 * native .node — the regression this gate guards.)
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

/** Framework Node-only deps that must never execute in the browser (externalized at bundle time). */
const NODE_ONLY_EXTERNALS = [
  "@resvg/resvg-js",
  "satori",
  "gray-matter",
  "@shikijs/rehype",
  "feed",
  "rehype-sanitize",
  "rehype-stringify",
  "rehype-raw",
  "unified",
  "remark-directive",
  "remark-frontmatter",
  "remark-gfm",
  "remark-parse",
  "remark-rehype",
  "unist-util-visit",
  "hast-util-sanitize",
  "reading-time"
];

const workdir = mkdtempSync(path.join(tmpdir(), "blog-bundle-"));
afterAll(() => rmSync(workdir, { recursive: true, force: true }));

describe("client bundle browser-safety", () => {
  it("bundles the SPA entry for the browser with no executing node:* import", () => {
    const outfile = path.join(workdir, "spa.js");
    const externalArgs = NODE_ONLY_EXTERNALS.flatMap(dep => ["--external", dep]);

    // Throws (failing the test) if bun exits non-zero — that IS the "browser build succeeds" assertion.
    execFileSync(
      // eslint-disable-next-line sonarjs/no-os-command-from-path -- fixed `bun build` invocation in a test, no user input
      "bun",
      ["build", "src/main.ts", "--target", "browser", "--outfile", outfile, ...externalArgs],
      { stdio: "pipe" }
    );

    const code = readFileSync(outfile, "utf8");
    // Externalized Node-only deps survive only as dead `await import()` branches; nothing
    // statically pulls a node:* builtin into the executed graph.
    expect(code).not.toMatch(/(?:require\(|from\s*)["']node:/);
  }, 60_000);
});
