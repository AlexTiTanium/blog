import { describe, expect, it } from "vitest";
import { aboutUrl, archiveUrl, articleUrl, homeUrl, tagUrl } from "../../src/lib/urls";

describe("urls", () => {
  it("builds locale-aware urls from the route patterns (pure createUrls, no app)", () => {
    expect(homeUrl("en")).toBe("/en/");
    expect(archiveUrl("ru")).toBe("/ru/archive/");
    expect(aboutUrl("en")).toBe("/en/about/");
    expect(articleUrl("en", "hello")).toBe("/en/hello/");
    expect(tagUrl("ru", "testing")).toBe("/ru/tags/testing/");
  });
});
