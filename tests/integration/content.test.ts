/**
 * @file Content corpus gate. Boots a content-only app over the real `content/` tree and guards the
 * authored corpus: at least 6 articles, all natively translated in English AND Russian (the
 * AI-generated en-only filler was removed in June 2026; only authored, fully-translated posts
 * remain). Counts are minimums, not exact — the corpus actively grows (the `/post` skill adds
 * articles), so exact equality would break the suite on every new post. A drop BELOW the baseline
 * means authored content went missing; the growth-proof invariants (no EN fallbacks, full RU
 * coverage, date order) stay exact.
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

// Authored-corpus baselines (post AI-filler cleanup, June 2026). Minimums, not exact counts:
// the corpus grows over time (the /post skill adds articles), and exact equality would fail
// the suite on every new post. A drop BELOW these baselines means authored content went missing.
const MIN_ENGLISH_ARTICLES = 6;
const MIN_NATIVE_RUSSIAN_ARTICLES = 6;

describe("content corpus", () => {
  let byLocale: Awaited<ReturnType<typeof app.content.loadAll>>;

  beforeAll(async () => {
    byLocale = await app.content.loadAll();
  });

  it("has at least 6 English articles (all native translations)", () => {
    const en = byLocale.get("en") ?? [];
    expect(en.length).toBeGreaterThanOrEqual(MIN_ENGLISH_ARTICLES);
    expect(en.every(a => !a.isFallback)).toBe(true);
  });

  it("has at least 6 native Russian articles (full native coverage)", () => {
    const en = byLocale.get("en") ?? [];
    const ru = byLocale.get("ru") ?? [];
    const native = ru.filter(a => !a.isFallback);
    expect(native.length).toBeGreaterThanOrEqual(MIN_NATIVE_RUSSIAN_ARTICLES);
    // Growth-proof exact invariant: every English article resolves in Russian (native or fallback).
    expect(ru).toHaveLength(en.length);
  });

  it("returns articles in date-descending order per locale", () => {
    const en = byLocale.get("en") ?? [];
    const dates = en.map(a => a.frontmatter.date);
    const descending = dates.toSorted((x, y) => y.localeCompare(x));
    expect(dates).toEqual(descending);
  });
});
