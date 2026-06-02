import { describe, expect, it } from "vitest";
import { aboutUrl, archiveUrl, articleUrl, bindRouter, homeUrl, tagUrl } from "../../src/lib/urls";

describe("urls", () => {
  it("throws before bindRouter", () => {
    expect(() => homeUrl("en")).toThrow(/not bound/);
  });

  it("builds locale-aware urls via the bound router", () => {
    bindRouter({
      toUrl(name, params) {
        switch (name) {
          case "home": {
            return `/${params.lang}/`;
          }
          case "archive": {
            return `/${params.lang}/archive/`;
          }
          case "about": {
            return `/${params.lang}/about/`;
          }
          case "article": {
            return `/${params.lang}/${params.slug}/`;
          }
          case "tag": {
            return `/${params.lang}/tags/${params.tag}/`;
          }
          default: {
            return "/";
          }
        }
      }
    });

    expect(homeUrl("en")).toBe("/en/");
    expect(archiveUrl("ru")).toBe("/ru/archive/");
    expect(aboutUrl("en")).toBe("/en/about/");
    expect(articleUrl("en", "hello")).toBe("/en/hello/");
    expect(tagUrl("ru", "testing")).toBe("/ru/tags/testing/");
  });
});
