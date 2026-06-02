import { describe, expect, it } from "vitest";
import type { UIStrings } from "../../src/i18n/index";
import {
  DEFAULT_LOCALE,
  i18nConfig,
  LOCALE_NAMES,
  LOCALES,
  OG_LOCALE_MAP,
  t
} from "../../src/i18n/index";

const KEYS: (keyof UIStrings)[] = [
  "home",
  "archive",
  "about",
  "readMore",
  "minRead",
  "noTranslation",
  "publishedLabel",
  "draftLabel",
  "tags",
  "recentPosts",
  "fileInfo",
  "tagPageTitle"
];

describe("i18n", () => {
  it("declares en and ru locales with en as default", () => {
    expect(LOCALES).toEqual(["en", "ru"]);
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("maps locale display names and og:locale codes", () => {
    expect(LOCALE_NAMES).toEqual({ en: "English", ru: "Russian" });
    expect(OG_LOCALE_MAP).toEqual({ en: "en_US", ru: "ru_RU" });
  });

  it("resolves a complete UI-string set per locale", () => {
    for (const locale of LOCALES) {
      const strings = t(locale);
      for (const key of KEYS) {
        expect(typeof strings[key], `${locale}.${key}`).toBe("string");
        expect(strings[key].length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("assembles the i18n plugin config", () => {
    expect(i18nConfig.locales).toEqual(["en", "ru"]);
    expect(i18nConfig.defaultLocale).toBe("en");
    expect(Object.keys(i18nConfig.translations)).toEqual(["en", "ru"]);
  });
});
