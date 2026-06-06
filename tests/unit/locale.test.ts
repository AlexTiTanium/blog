import { describe, expect, it } from "vitest";
import { localeFromPath, swapLocale } from "../../src/lib/locale";

describe("localeFromPath", () => {
  it("resolves a known locale prefix from the first path segment", () => {
    expect(localeFromPath("/ru/archive/")).toBe("ru");
  });

  it("falls back to the default locale when the first segment is not a locale", () => {
    expect(localeFromPath("/about/")).toBe("en");
  });

  it("falls back to the default locale for the bare root path", () => {
    expect(localeFromPath("/")).toBe("en");
  });

  it("falls back to the default locale when the first segment is an unknown locale code", () => {
    expect(localeFromPath("/de/archive/")).toBe("en");
  });

  it("resolves the default locale prefix when present", () => {
    expect(localeFromPath("/en/")).toBe("en");
  });
});

describe("swapLocale", () => {
  it("swaps the locale prefix while preserving the route", () => {
    expect(swapLocale("/en/archive/", "ru")).toBe("/ru/archive/");
  });

  it("swaps a bare locale root path", () => {
    expect(swapLocale("/en/", "ru")).toBe("/ru/");
  });

  it("prefixes the target locale when the path has no locale prefix", () => {
    expect(swapLocale("/archive/", "ru")).toBe("/ru/archive/");
  });

  it("preserves a deep multi-segment route when swapping", () => {
    expect(swapLocale("/en/blog/hello-world/", "ru")).toBe("/ru/blog/hello-world/");
  });

  it("prefixes the target locale for the bare root path", () => {
    expect(swapLocale("/", "ru")).toBe("/ru/");
  });
});
