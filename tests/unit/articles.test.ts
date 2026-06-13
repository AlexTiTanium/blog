import { describe, expect, it } from "vitest";
import {
  byTag,
  PER_PAGE,
  pageWindow,
  paginate,
  postId,
  relatedArticles
} from "../../src/lib/articles";
import { makeArticle } from "./_factory";

/** Clone a factory article, overriding its computed.contentId (the only field postId reads). */
function withContentId(contentId: string) {
  const article = makeArticle();
  return { ...article, computed: { ...article.computed, contentId } };
}

/** Build `count` factory articles with distinct slugs. */
function makeArticles(count: number) {
  return Array.from({ length: count }, (_, index) => makeArticle({ slug: `a-${index}` }));
}

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

describe("paginate — extreme article counts", () => {
  it("keeps 5 articles on a single page (so pagination stays hidden)", () => {
    expect(paginate(makeArticles(5), 1).totalPages).toBe(1);
  });

  it("treats exactly PER_PAGE (10) articles as a single page", () => {
    expect(paginate(makeArticles(PER_PAGE), 1).totalPages).toBe(1);
  });

  it("spills to a second page at PER_PAGE + 1 (11)", () => {
    expect(paginate(makeArticles(PER_PAGE + 1), 1).totalPages).toBe(2);
  });

  it("paginates 100 articles into 10 full pages", () => {
    const result = paginate(makeArticles(100), 1);
    expect(result.totalArticles).toBe(100);
    expect(result.totalPages).toBe(10);
    expect(result.articles).toHaveLength(PER_PAGE);
  });
});

describe("pageWindow", () => {
  it("shows every page (no ellipsis) when the count is small", () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses the tail when the current page is near the start", () => {
    expect(pageWindow(1, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
  });

  it("collapses the head when the current page is near the end", () => {
    expect(pageWindow(10, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });

  it("collapses both sides when the current page is in the middle", () => {
    expect(pageWindow(5, 11)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 11]);
  });

  it("stays compact and anchored for very large counts (100-article worst case)", () => {
    const items = pageWindow(50, 100);
    expect(items[0]).toBe(1);
    expect(items.at(-1)).toBe(100);
    expect(items).toContain(50);
    expect(items.length).toBeLessThanOrEqual(9);
    expect(items.filter(item => item === "ellipsis")).toHaveLength(2);
  });

  it("honours a wider sibling window", () => {
    expect(pageWindow(6, 11, 2)).toEqual([1, "ellipsis", 4, 5, 6, 7, 8, "ellipsis", 11]);
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

  it("returns an empty list for an empty input", () => {
    expect(byTag([], "typescript")).toEqual([]);
  });
});

describe("relatedArticles", () => {
  it("ranks by shared-tag count, most overlap first", () => {
    const current = makeArticle({ slug: "cur", tags: ["ts", "tools"], date: "2026-01-10" });
    // Dates run OPPOSITE to tag overlap, proving the tag count — not recency — drives the order.
    const all = [
      makeArticle({ slug: "two", tags: ["ts", "tools"], date: "2026-01-01" }),
      makeArticle({ slug: "one", tags: ["ts"], date: "2026-01-02" }),
      makeArticle({ slug: "zero", tags: ["x"], date: "2026-01-03" }),
      current
    ];
    expect(relatedArticles(all, current).map(a => a.computed.slug)).toEqual(["two", "one", "zero"]);
  });

  it("breaks ties on recency (newer first)", () => {
    const current = makeArticle({ slug: "cur", tags: ["ts"] });
    const all = [
      makeArticle({ slug: "older", tags: ["ts"], date: "2026-01-01" }),
      makeArticle({ slug: "newer", tags: ["ts"], date: "2026-02-01" }),
      current
    ];
    expect(relatedArticles(all, current).map(a => a.computed.slug)).toEqual(["newer", "older"]);
  });

  it("excludes the current article", () => {
    const current = makeArticle({ slug: "cur", tags: ["ts"] });
    const all = [current, makeArticle({ slug: "other", tags: ["ts"] })];
    expect(relatedArticles(all, current).map(a => a.computed.slug)).toEqual(["other"]);
  });

  it("falls back to pure recency when the current article has no tags", () => {
    const current = makeArticle({ slug: "cur", tags: [] });
    const all = [
      makeArticle({ slug: "old", tags: ["a"], date: "2026-01-01" }),
      makeArticle({ slug: "mid", tags: ["b"], date: "2026-01-02" }),
      makeArticle({ slug: "new", tags: ["c"], date: "2026-01-03" }),
      current
    ];
    expect(relatedArticles(all, current).map(a => a.computed.slug)).toEqual(["new", "mid", "old"]);
  });

  it("keeps unrelated posts as a recency-ordered tail (related first, then fill)", () => {
    const current = makeArticle({ slug: "cur", tags: ["ts"], date: "2026-01-10" });
    const all = [
      makeArticle({ slug: "rel", tags: ["ts"], date: "2026-01-01" }), // shares 1 → first
      makeArticle({ slug: "fill-new", tags: ["x"], date: "2026-03-01" }), // 0 shared, newest fill
      makeArticle({ slug: "fill-old", tags: ["y"], date: "2026-02-01" }), // 0 shared, older fill
      current
    ];
    expect(relatedArticles(all, current).map(a => a.computed.slug)).toEqual([
      "rel",
      "fill-new",
      "fill-old"
    ]);
  });

  it("respects the limit", () => {
    const current = makeArticle({ slug: "cur", tags: ["pipeline"] });
    const all = [current, ...makeArticles(8)];
    expect(relatedArticles(all, current, 3)).toHaveLength(3);
    expect(relatedArticles(all, current)).toHaveLength(5);
  });

  it("returns an empty list when there are no other articles", () => {
    const current = makeArticle({ slug: "cur" });
    expect(relatedArticles([current], current)).toEqual([]);
    expect(relatedArticles([], current)).toEqual([]);
  });
});

describe("paginate beyond range", () => {
  const arts = Array.from({ length: 25 }, (_, index) => makeArticle({ slug: `a-${index}` }));

  it("yields no articles past the last page but keeps the totals", () => {
    const result = paginate(arts, 4);
    expect(result.articles).toEqual([]);
    expect(result.totalArticles).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(4);
  });
});

describe("postId", () => {
  it("counts back from the total, so the oldest post is post/001", () => {
    // contentId index is the date-descending rank: with 10 articles, the oldest (rank 9) is 001.
    expect(postId(withContentId("en:9:oldest"), 10)).toBe("post/001");
  });

  it("gives the newest post the highest number", () => {
    expect(postId(withContentId("en:0:newest"), 10)).toBe("post/010");
  });

  it("keeps an article's label stable when newer posts are added", () => {
    // Adding a post bumps both the article's rank and the total, so the label is unchanged.
    expect(postId(withContentId("en:4:some-slug"), 10)).toBe("post/006");
    expect(postId(withContentId("en:5:some-slug"), 11)).toBe("post/006");
  });

  it("does not truncate numbers wider than three digits", () => {
    expect(postId(withContentId("ru:0:big"), 1234)).toBe("post/1234");
  });

  it("falls back to the newest label when the index segment is missing", () => {
    // The factory default contentId is just the slug — no colon-delimited index.
    expect(postId(makeArticle(), 10)).toBe("post/010");
  });

  it("falls back to the newest label when the index segment is non-numeric", () => {
    expect(postId(withContentId("en:abc:slug"), 10)).toBe("post/010");
  });

  it("never drops below post/001 on inconsistent input", () => {
    expect(postId(withContentId("en:5:slug"), 3)).toBe("post/001");
  });
});
