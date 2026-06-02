/**
 * @file Typed route table — the single declaration of every page the blog generates and navigates.
 *
 * Each route composes the framework's fluent builder:
 * - `.generate()` — the param sets to statically build (params only; N×N-safe).
 * - `.load()` — server data, read ONLY from the memoized cache in `./lib/articles` (never re-parses
 *   markdown).
 * - `.parse()` — client trust boundary (required in `mode: "hybrid"`); validates the fetched per-page
 *   JSON before render, with the guards in `./lib/payloads`. A throw falls back to HTML navigation.
 * - `.render()` / `.head()` — the page component and its SEO head.
 * - `.layout()` — frames the page in the persistent {@link SiteLayout} chrome (SSG only; on client
 *   nav just the `main > section` swap region is replaced).
 *
 * The optional `{lang:?}` segment yields a bare default-locale path (`/`) plus explicit `/en/`, `/ru/`.
 */

import { defineRoutes, route } from "@moku-labs/web/browser";
import type { ComponentChildren, VNode } from "preact";
import { SITE } from "./config";
import type { Locale } from "./i18n/index";
import { SiteLayout } from "./layouts/SiteLayout";
import { allArticles, articleBySlug, byTag, paginate } from "./lib/articles";
import { articleHead, pageHead, pageTitle } from "./lib/head";
import { asArticleData, asPaginated, asTagData } from "./lib/payloads";
import { AboutPage } from "./pages/AboutPage";
import { ArchivePage } from "./pages/ArchivePage";
import { ArticlePage } from "./pages/ArticlePage";
import { HomePage } from "./pages/HomePage";
import { TagPage } from "./pages/TagPage";

/**
 * Shared `.layout()` wrapper — frames a route's rendered page in {@link SiteLayout}, reading the
 * active locale and the route's `.meta().activeTab` for the highlighted nav tab. Typed to the fields
 * it reads; the framework's full `LayoutContext` is assignable to it.
 *
 * @param ctx - Layout context (active locale + the route's `.meta()` bag).
 * @param children - The rendered page content (the `main > section` swap region's children).
 * @returns The page wrapped in site chrome.
 */
const layout = (
  ctx: { locale: string; meta: Record<string, unknown> },
  children: ComponentChildren
): VNode => (
  <SiteLayout
    locale={ctx.locale as Locale}
    activeTab={typeof ctx.meta.activeTab === "string" ? ctx.meta.activeTab : "none"}
  >
    {children}
  </SiteLayout>
);

/**
 * Param sets for the paged variant of a listing (pages 2..N for a locale; page 1 is the base route).
 * Shared by the home and archive paged routes so the pagination math lives in one place.
 *
 * @param locale - Locale to enumerate pages for.
 * @returns One `{ lang, page }` param set per page after the first.
 * @example
 * await pagedRouteParams("en"); // [{ lang: "en", page: "2" }, { lang: "en", page: "3" }]
 */
async function pagedRouteParams(locale: string): Promise<{ lang: string; page: string }[]> {
  const { totalPages } = paginate(await allArticles(locale), 1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    lang: locale,
    page: String(i + 2)
  }));
}

export const routes = defineRoutes({
  // ── Home ──────────────────────────────────────────────────────────────────
  // "/{lang:?}/" · e.g. "/", "/en/", "/ru/" — first page of articles + WebSite JSON-LD.
  home: route("/{lang:?}/")
    .layout(layout)
    .generate(locale => [{ lang: locale }])
    .load(async (_p, locale) => paginate(await allArticles(locale), 1))
    .parse(asPaginated)
    .render(ctx => <HomePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: pageTitle(), description: SITE.description, isHome: true }))
    .meta({ activeTab: "home" }),

  // "/{lang:?}/page/{page}/" · e.g. "/en/page/2/" — pages 2..N (page 1 is the home route).
  homePaged: route("/{lang:?}/page/{page}/")
    .layout(layout)
    .generate(pagedRouteParams)
    .load(async (p, locale) => paginate(await allArticles(locale), Number(p.page)))
    .parse(asPaginated)
    .render(ctx => <HomePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: pageTitle(undefined, ctx.data.page),
        description: SITE.description,
        path: `page/${ctx.data.page}/`
      })
    )
    .meta({ activeTab: "home" }),

  // ── Archive ───────────────────────────────────────────────────────────────
  // "/{lang:?}/archive/" · e.g. "/en/archive/" — month-grouped listing of all articles.
  archive: route("/{lang:?}/archive/")
    .layout(layout)
    .generate(locale => [{ lang: locale }])
    .load(async (_p, locale) => paginate(await allArticles(locale), 1))
    .parse(asPaginated)
    .render(ctx => <ArchivePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: pageTitle("Archive"),
        description: SITE.description,
        path: "archive/"
      })
    )
    .meta({ activeTab: "archive" }),

  // "/{lang:?}/archive/page/{page}/" · e.g. "/ru/archive/page/3/" — paged archive (pages 2..N).
  archivePaged: route("/{lang:?}/archive/page/{page}/")
    .layout(layout)
    .generate(pagedRouteParams)
    .load(async (p, locale) => paginate(await allArticles(locale), Number(p.page)))
    .parse(asPaginated)
    .render(ctx => <ArchivePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: pageTitle("Archive", ctx.data.page),
        description: SITE.description,
        path: `archive/page/${ctx.data.page}/`
      })
    )
    .meta({ activeTab: "archive" }),

  // ── Content (article + tag) ────────────────────────────────────────────────
  // "/{lang:?}/{slug}/" · e.g. "/en/hello-world/" — one page per article in EVERY locale (legacy
  // parity). Articles without a native translation fall back to the English body under the locale
  // slug, flagged `isFallback` so the page shows a "not yet translated" notice.
  article: route("/{lang:?}/{slug}/")
    .layout(layout)
    .generate(async locale => {
      const arts = await allArticles(locale);
      return arts.map(a => ({ lang: locale, slug: a.computed.slug }));
    })
    .load(async (p, locale) => ({
      article: await articleBySlug(p.slug, locale),
      recent: (await allArticles(locale)).slice(0, 5)
    }))
    .parse(asArticleData)
    .render(ctx => (
      <ArticlePage article={ctx.data.article} recent={ctx.data.recent} locale={ctx.locale} />
    ))
    .head(ctx => articleHead(ctx, ctx.data.article))
    .meta({ activeTab: "none" }),

  // "/{lang:?}/tags/{tag}/" · e.g. "/en/tags/typescript/" — articles sharing one tag.
  tag: route("/{lang:?}/tags/{tag}/")
    .layout(layout)
    .generate(async locale => {
      const tags = new Set((await allArticles(locale)).flatMap(a => a.frontmatter.tags));
      return [...tags].map(tag => ({ lang: locale, tag }));
    })
    .load(async (p, locale) => ({ tag: p.tag, articles: byTag(await allArticles(locale), p.tag) }))
    .parse(asTagData)
    .render(ctx => <TagPage tag={ctx.data.tag} articles={ctx.data.articles} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: `Tag: ${ctx.data.tag}`,
        description: `Articles tagged "${ctx.data.tag}"`,
        path: `tags/${ctx.data.tag}/`
      })
    )
    .meta({ activeTab: "none" }),

  // ── About ─────────────────────────────────────────────────────────────────
  // "/{lang:?}/about/" · e.g. "/en/about/" — static page. The about nav link is on every page, so in
  // hybrid mode the SPA prefetches its per-page JSON everywhere; the empty loader+parse emits
  // `_data/{lang}/about/index.json` so data-nav resolves cleanly instead of 404-ing.
  about: route("/{lang:?}/about/")
    .layout(layout)
    .generate(locale => [{ lang: locale }])
    .load(() => ({}))
    .parse(() => ({}))
    .render(ctx => <AboutPage locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: "About", description: "About the author", path: "about/" }))
    .meta({ activeTab: "about" })
});
