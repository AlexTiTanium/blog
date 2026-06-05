import { describe, expect, it } from "vitest";
import { byTag, PER_PAGE, paginate } from "../../src/lib/articles";
import { makeArticle } from "./_factory";

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
