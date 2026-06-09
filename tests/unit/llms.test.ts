import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SITE } from "../../src/config";
import { LOCALES } from "../../src/i18n/index";
import { aboutUrl, archiveUrl, homeUrl } from "../../src/lib/urls";

const llms = readFileSync(path.resolve(import.meta.dirname, "../../public/llms.txt"), "utf8");
const absoluteUrls = llms.match(/https?:\/\/[^\s)]+/g) ?? [];

describe("public/llms.txt", () => {
  it("links every absolute URL to the canonical origin (SITE.url)", () => {
    expect(absoluteUrls.length).toBeGreaterThan(0);
    for (const url of absoluteUrls) {
      expect(url, `unexpected origin in ${url}`).toMatch(new RegExp(`^${SITE.url}(/|$)`));
    }
  });

  it("links home/archive/about for every configured locale via the route URL convention", () => {
    for (const locale of LOCALES) {
      expect(absoluteUrls).toContain(`${SITE.url}${homeUrl(locale)}`);
      expect(absoluteUrls).toContain(`${SITE.url}${archiveUrl(locale)}`);
      expect(absoluteUrls).toContain(`${SITE.url}${aboutUrl(locale)}`);
    }
  });

  it("links the build's feeds and sitemap at the canonical origin", () => {
    for (const file of ["feed.xml", "atom.xml", "feed.json", "sitemap.xml"]) {
      expect(absoluteUrls).toContain(`${SITE.url}/${file}`);
    }
  });

  it("mentions every configured locale code in the conventions", () => {
    for (const locale of LOCALES) {
      expect(llms).toContain(`\`${locale}\``);
    }
  });
});
