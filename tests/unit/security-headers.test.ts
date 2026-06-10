/**
 * @file Security-headers deploy gate. Cloudflare Pages reads `_headers` from the deploy output
 * root; the framework's `public` build step copies `public/` into `dist/` verbatim (same path
 * `llms.txt` takes). This gate pins the source file: it must exist, parse as the Cloudflare
 * `_headers` format (unindented `/path` rules, indented `Name: value` lines), keep the
 * conservative site-wide security headers on `/*`, and stay within Cloudflare's documented
 * limits (100 rules, 2000 chars per line). Content-Security-Policy is deliberately absent —
 * the SPA bootstraps via inline scripts, so CSP needs dedicated authoring (tracked follow-up).
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Headers every response must carry, with their exact pinned values. */
const REQUIRED_SITE_WIDE = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
} as const;

/** Cloudflare Pages `_headers` limits (developers.cloudflare.com/pages/configuration/headers/). */
const MAX_RULES = 100;
const MAX_LINE_LENGTH = 2000;

const source = readFileSync("public/_headers", "utf8");
const lines = source.split("\n").filter(line => line.trim() !== "");

/** Parse the `_headers` text into a map of url-pattern → { headerName → value }. */
function parseHeadersFile(): Map<string, Record<string, string>> {
  const rules = new Map<string, Record<string, string>>();
  let current: Record<string, string> | undefined;

  for (const line of lines) {
    const isPathRule = !line.startsWith(" ") && !line.startsWith("\t");

    if (isPathRule) {
      current = {};
      rules.set(line.trim(), current);
      continue;
    }

    expect(current, `header line before any path rule: "${line}"`).toBeDefined();
    const separator = line.indexOf(":");
    expect(separator, `malformed header line: "${line}"`).toBeGreaterThan(0);
    if (current) current[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  return rules;
}

describe("security headers (_headers deploy gate)", () => {
  const rules = parseHeadersFile();

  it("declares every rule as an absolute path and stays within Cloudflare limits", () => {
    expect(rules.size).toBeGreaterThan(0);
    expect(rules.size).toBeLessThanOrEqual(MAX_RULES);
    for (const pattern of rules.keys()) expect(pattern).toMatch(/^\//);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(MAX_LINE_LENGTH);
  });

  it("pins the conservative site-wide security headers on /*", () => {
    expect(rules.get("/*")).toEqual(REQUIRED_SITE_WIDE);
  });

  it("does NOT ship a Content-Security-Policy (needs dedicated authoring for the inline-script SPA)", () => {
    for (const headers of rules.values()) {
      expect(Object.keys(headers)).not.toContain("Content-Security-Policy");
    }
  });
});
