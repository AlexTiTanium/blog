/**
 * @file Content migration gate (Phase B). Boots a content-only app over the real `content/` tree and
 * asserts the migrated corpus: 22 English articles (all native) and exactly 6 native Russian articles
 * (the other 16 resolve via locale fallback → `isFallback: true`). Also checks date-descending order.
 *
 * Uses only `contentPlugin` on the isomorphic defaults — no `buildPlugin`, so the OG `fontDir`
 * validation (a Phase D concern) doesn't run here.
 */
import { contentPlugin, createApp, fileSystemContent } from "@moku-labs/web";
import { beforeAll, describe, expect, it } from "vitest";
import { SITE } from "../../src/config";
import { i18nConfig } from "../../src/i18n/index";
import { routes } from "../../src/routes";

const app = createApp({
  plugins: [contentPlugin],
  pluginConfigs: {
    site: SITE,
    i18n: i18nConfig,
    router: { routes },
    content: { providers: [fileSystemContent({ contentDir: "./content" })] }
  }
});

describe("content migration (Phase B)", () => {
  let byLocale: Awaited<ReturnType<typeof app.content.loadAll>>;

  beforeAll(async () => {
    byLocale = await app.content.loadAll();
  });

  it("has 22 English articles (all native translations)", () => {
    const en = byLocale.get("en") ?? [];
    expect(en).toHaveLength(22);
    expect(en.every(a => !a.isFallback)).toBe(true);
  });

  it("has exactly 6 native Russian articles (rest fall back to English)", () => {
    const ru = byLocale.get("ru") ?? [];
    const native = ru.filter(a => !a.isFallback);
    expect(native).toHaveLength(6);
  });

  it("returns articles in date-descending order per locale", () => {
    const en = byLocale.get("en") ?? [];
    const dates = en.map(a => a.frontmatter.date);
    const descending = dates.toSorted((x, y) => y.localeCompare(x));
    expect(dates).toEqual(descending);
  });
});
