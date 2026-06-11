import { describe, expect, it } from "vitest";
import { SITE } from "../../src/config";
import { articleHead, pageHead, pageStrings, pageTitle } from "../../src/lib/head";
import { makeArticle } from "./_factory";

const ctx = { params: {}, locale: "en" };
const ruCtx = { params: { lang: "ru" }, locale: "en" };

// The framework's `titleTemplate` ("%s — Geek Life") appends the site name to EVERY route title,
// so the builders must never include it themselves — that doubled it ("Geek Life — Geek Life").
describe("pageTitle", () => {
  it("returns an empty tail when no section or page is given (home listing)", () => {
    expect(pageTitle(ctx)).toBe("");
  });

  it("returns section + page for the paged home", () => {
    expect(pageTitle(ctx, "posts", 2)).toBe("Posts Page 2");
  });

  it("returns only the section when a section but no page is given", () => {
    expect(pageTitle(ctx, "archive")).toBe("Archive");
  });

  it("returns both section and page when both are given", () => {
    expect(pageTitle(ctx, "archive", 3)).toBe("Archive Page 3");
  });

  it("localizes the section and the page word (lang param wins over active locale)", () => {
    expect(pageTitle(ruCtx, "posts", 2)).toBe("Посты Страница 2");
    expect(pageTitle(ruCtx, "archive", 3)).toBe("Архив Страница 3");
    expect(pageTitle(ruCtx, "about")).toBe("Об авторе");
  });

  it("never includes the site name (titleTemplate appends it)", () => {
    expect(pageTitle(ctx, "archive", 3)).not.toContain(SITE.name);
    expect(pageTitle(ruCtx, "posts", 2)).not.toContain(SITE.name);
  });
});

describe("pageStrings", () => {
  it("resolves the effective locale's strings (lang param wins)", () => {
    expect(pageStrings(ruCtx).tagPageTitle).toBe("Тег");
    expect(pageStrings(ctx).tagPageTitle).toBe("Tag");
  });

  it("falls back to the default locale for an unknown code", () => {
    expect(pageStrings({ params: { lang: "xx" }, locale: "en" }).posts).toBe("Posts");
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

  it("maps an empty title (home listing) to the bare site name", () => {
    const head = pageHead(ctx, { title: pageTitle(ctx), description: "Welcome", isHome: true });
    expect(head.title).toBe(SITE.name);
  });

  it("pins a keyed title element for an empty title so titleTemplate cannot double the site name", () => {
    const head = pageHead(ctx, { title: "", description: "Welcome" });
    expect(head.elements).toContainEqual({ tag: "title", children: SITE.name, key: "title" });
  });

  it("does NOT pin a title override for a non-empty title (titleTemplate applies)", () => {
    const head = pageHead(ctx, { title: "Archive", description: "Welcome" });
    expect(head.elements?.some(e => e.tag === "title")).toBe(false);
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
