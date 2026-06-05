import { describe, expect, it, vi } from "vitest";
import { allArticles, articleBySlug } from "../../src/lib/content";
import { makeArticle } from "./_factory";

type AllCtx = Parameters<typeof allArticles>[0];
type SlugCtx = Parameters<typeof articleBySlug>[0];

describe("content loaders", () => {
  it("allArticles returns the ctx locale slice via ctx.require(contentPlugin).loadAll()", async () => {
    const en = [makeArticle({ slug: "a" }), makeArticle({ slug: "b" })];
    const ru = [makeArticle({ slug: "a", locale: "ru" })];
    const loadAll = vi.fn().mockResolvedValue(
      new Map([
        ["en", en],
        ["ru", ru]
      ])
    );
    const require = vi.fn(() => ({ loadAll }));
    const mk = (locale: string) => ({ locale, require }) as unknown as AllCtx;

    expect(await allArticles(mk("en"))).toHaveLength(2);
    expect(await allArticles(mk("ru"))).toHaveLength(1);
    expect(await allArticles(mk("de"))).toEqual([]);
  });

  it("articleBySlug delegates to content.load(slug, locale)", async () => {
    const article = makeArticle({ slug: "hello" });
    const load = vi.fn().mockResolvedValue(article);
    const require = vi.fn(() => ({ load }));
    const ctx = { locale: "en", params: { slug: "hello" }, require } as unknown as SlugCtx;

    expect(await articleBySlug(ctx)).toBe(article);
    expect(load).toHaveBeenCalledWith("hello", "en");
  });
});
