import { describe, expect, it, vi } from "vitest";
import {
  allArticles,
  articleBySlug,
  bindContent,
  byTag,
  PER_PAGE,
  paginate
} from "../../src/lib/articles";
import { makeArticle } from "./_factory";

type ContentApiArg = Parameters<typeof bindContent>[0];

describe("paginate", () => {
  const arts = Array.from({ length: 25 }, (_, index) => makeArticle({ slug: `a-${index}` }));

  it("defaults to 10 articles per page", () => {
    expect(PER_PAGE).toBe(10);
  });

  it("slices the first page and reports totals", () => {
    const result = paginate(arts, 1);
    expect(result.articles).toHaveLength(10);
    expect(result.articles[0]?.computed.slug).toBe("a-0");
    expect(result.totalArticles).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(1);
  });

  it("slices a middle page", () => {
    const result = paginate(arts, 2);
    expect(result.articles[0]?.computed.slug).toBe("a-10");
    expect(result.articles).toHaveLength(10);
  });

  it("returns a short final page", () => {
    const result = paginate(arts, 3);
    expect(result.articles).toHaveLength(5);
  });

  it("reports at least one page for an empty list", () => {
    const result = paginate([], 1);
    expect(result.articles).toEqual([]);
    expect(result.totalArticles).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it("honours a custom page size", () => {
    const result = paginate(arts, 1, 5);
    expect(result.articles).toHaveLength(5);
    expect(result.totalPages).toBe(5);
  });
});

describe("byTag", () => {
  const arts = [
    makeArticle({ slug: "a", tags: ["typescript", "tools"] }),
    makeArticle({ slug: "b", tags: ["life"] }),
    makeArticle({ slug: "c", tags: ["typescript"] })
  ];

  it("keeps only articles carrying the tag", () => {
    expect(byTag(arts, "typescript").map(a => a.computed.slug)).toEqual(["a", "c"]);
  });

  it("returns an empty list when no article matches", () => {
    expect(byTag(arts, "missing")).toEqual([]);
  });
});

describe("content binding", () => {
  it("allArticles rejects before bindContent", async () => {
    await expect(allArticles("en")).rejects.toThrow(/not bound/);
  });

  it("articleBySlug rejects before bindContent", async () => {
    await expect(articleBySlug("hello", "en")).rejects.toThrow(/not bound/);
  });

  it("allArticles returns a locale slice and memoizes loadAll", async () => {
    const en = [makeArticle({ slug: "a" }), makeArticle({ slug: "b" })];
    const ru = [makeArticle({ slug: "a", locale: "ru" })];
    const loadAll = vi.fn().mockResolvedValue(
      new Map([
        ["en", en],
        ["ru", ru]
      ])
    );
    const load = vi.fn();
    bindContent({ loadAll, load } as unknown as ContentApiArg);

    expect(await allArticles("en")).toHaveLength(2);
    expect(await allArticles("ru")).toHaveLength(1);
    expect(await allArticles("de")).toEqual([]);
    expect(loadAll).toHaveBeenCalledTimes(1);
  });

  it("articleBySlug delegates to content.load", async () => {
    const article = makeArticle({ slug: "hello" });
    const load = vi.fn().mockResolvedValue(article);
    const loadAll = vi.fn().mockResolvedValue(new Map());
    bindContent({ loadAll, load } as unknown as ContentApiArg);

    expect(await articleBySlug("hello", "en")).toBe(article);
    expect(load).toHaveBeenCalledWith("hello", "en");
  });
});
