import { describe, expect, it } from "vitest";
import { SITE } from "../../src/config";
import { articleHead, pageHead, pageTitle } from "../../src/lib/head";
import { makeArticle } from "./_factory";

const ctx = { params: {}, locale: "en" };

describe("pageTitle", () => {
  it("returns the bare site name when no section or page is given", () => {
    expect(pageTitle()).toBe("Geek Life");
  });

  it("appends only the page number when a page but no section is given", () => {
    expect(pageTitle(undefined, 2)).toBe("Geek Life — Page 2");
  });

  it("appends only the section when a section but no page is given", () => {
    expect(pageTitle("Archive")).toBe("Geek Life — Archive");
  });

  it("appends both section and page when both are given", () => {
    expect(pageTitle("Archive", 3)).toBe("Geek Life — Archive Page 3");
  });
});

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

  it("links the single site-wide feed at /feed.xml (locale-agnostic)", () => {
    const en = pageHead(ctx, { title: "Home", description: "Welcome" });
    const ru = pageHead(
      { params: { lang: "ru" }, locale: "en" },
      { title: "Главная", description: "Добро пожаловать" }
    );
    expect(JSON.stringify(en.elements)).toContain('"/feed.xml"');
    expect(JSON.stringify(ru.elements)).toContain('"/feed.xml"');
    expect(JSON.stringify(ru.elements)).not.toContain("/ru/feed.xml");
  });

  it("points the WebSite JSON-LD url at the site origin (locale-agnostic)", () => {
    const serialized = JSON.stringify(
      pageHead(ctx, { title: "Home", description: "Welcome", isHome: true }).elements
    );
    expect(serialized).toContain(SITE.url);
    expect(serialized).not.toContain(`${SITE.url}/en/`);
    expect(serialized).not.toContain(`${SITE.url}/ru/`);
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
    expect(JSON.stringify(head.elements)).toContain(SITE.author);
  });
});
