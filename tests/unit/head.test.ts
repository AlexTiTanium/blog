import { describe, expect, it } from "vitest";
import { articleHead, pageHead } from "../../src/lib/head";
import { makeArticle } from "./_factory";

const ctx = { params: {}, locale: "en" };

describe("pageHead", () => {
  it("returns title + description with a feed-link element", () => {
    const head = pageHead(ctx, { title: "Home", description: "Welcome" });
    expect(head.title).toBe("Home");
    expect(head.description).toBe("Welcome");
    expect(head.elements?.length).toBe(1);
  });

  it("adds a WebSite JSON-LD on the home route", () => {
    const head = pageHead(ctx, { title: "Home", description: "Welcome", isHome: true });
    expect(head.elements?.length).toBe(2);
    expect(JSON.stringify(head.elements)).toContain("WebSite");
  });

  it("prefers the lang param over the active locale for the feed link", () => {
    const head = pageHead(
      { params: { lang: "ru" }, locale: "en" },
      { title: "Главная", description: "Добро пожаловать" }
    );
    expect(JSON.stringify(head.elements)).toContain("/ru/feed.xml");
  });
});

describe("articleHead", () => {
  it("sets a slug-named OG image plus BlogPosting metadata", () => {
    const article = makeArticle({
      slug: "hello-pipeline",
      title: "Hello, Pipeline!",
      author: "Alex Kucherenko"
    });
    const head = articleHead(ctx, article);

    expect(head.title).toBe("Hello, Pipeline!");
    expect(head.image).toBe("/og/hello-pipeline.png");
    expect(head.elements?.length).toBeGreaterThanOrEqual(3);

    const serialized = JSON.stringify(head.elements);
    expect(serialized).toContain("BlogPosting");
    expect(serialized).toContain("Alex Kucherenko");
  });

  it("falls back to the site author when frontmatter omits one", () => {
    const article = makeArticle({ slug: "no-author" });
    const head = articleHead(ctx, article);
    expect(JSON.stringify(head.elements)).toContain("Alex Kucherenko");
  });
});
