import { describe, expect, it } from "vitest";
import { aboutUrl, archiveUrl, articleUrl, homeUrl, tagUrl } from "../../src/lib/urls";

describe("urls", () => {
  it("serves the default locale (en) at BARE paths", () => {
    expect(homeUrl("en")).toBe("/");
    expect(archiveUrl("en")).toBe("/archive/");
    expect(aboutUrl("en")).toBe("/about/");
    expect(articleUrl("en", "hello")).toBe("/hello/");
    expect(tagUrl("en", "testing")).toBe("/tags/testing/");
  });

  it("keeps non-default locales prefixed", () => {
    expect(homeUrl("ru")).toBe("/ru/");
    expect(archiveUrl("ru")).toBe("/ru/archive/");
    expect(aboutUrl("uk")).toBe("/uk/about/");
    expect(articleUrl("ru", "hello")).toBe("/ru/hello/");
    expect(tagUrl("es", "testing")).toBe("/es/tags/testing/");
  });
});
