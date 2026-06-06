import { describe, expect, it, vi } from "vitest";
import { allArticles, articleBySlug, pagedRouteParameters } from "../../src/lib/content";
import { makeArticle } from "./_factory";

type AllCtx = Parameters<typeof allArticles>[0];
type SlugCtx = Parameters<typeof articleBySlug>[0];
type PagedCtx = Parameters<typeof pagedRouteParameters>[0];

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

  it("pagedRouteParameters yields one {lang, page} per page after the first (pages 2..N)", async () => {
    // 25 articles @ PER_PAGE=10 -> 3 pages -> params for pages 2 and 3 only.
    const en = Array.from({ length: 25 }, (_, i) => makeArticle({ slug: `a${i}` }));
    const loadAll = vi.fn().mockResolvedValue(new Map([["en", en]]));
    const require = vi.fn(() => ({ loadAll }));
    const ctx = { locale: "en", require } as unknown as PagedCtx;

    expect(await pagedRouteParameters(ctx)).toEqual([
      { lang: "en", page: "2" },
      { lang: "en", page: "3" }
    ]);
  });

  it("pagedRouteParameters returns an empty array for a single-page locale (<= PER_PAGE articles)", async () => {
    // Exactly PER_PAGE=10 articles -> 1 page -> no paged params.
    const ru = Array.from({ length: 10 }, (_, i) => makeArticle({ slug: `r${i}`, locale: "ru" }));
    const loadAll = vi.fn().mockResolvedValue(new Map([["ru", ru]]));
    const require = vi.fn(() => ({ loadAll }));
    const ctx = { locale: "ru", require } as unknown as PagedCtx;

    expect(await pagedRouteParameters(ctx)).toEqual([]);
  });

  it("pagedRouteParameters returns an empty array for a locale with no articles", async () => {
    const loadAll = vi.fn().mockResolvedValue(new Map());
    const require = vi.fn(() => ({ loadAll }));
    const ctx = { locale: "de", require } as unknown as PagedCtx;

    expect(await pagedRouteParameters(ctx)).toEqual([]);
  });
});
