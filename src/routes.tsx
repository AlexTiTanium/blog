/**
 * @file Typed route table — params-only `.generate()` + content-cache `.load()` (N×N-safe) +
 * `.parse()` client trust-boundary (required in `mode: "hybrid"`) + `.layout()` page chrome.
 *
 * Every loader reads ONLY the memoized cache in `./lib/articles` (never re-parses markdown). The
 * optional `{lang:?}` segment yields a bare default-locale path (`/`) plus explicit `/en/`, `/ru/`.
 * Each data-navigable route declares `.parse(raw => data)`: the framework validates the fetched
 * per-page JSON → `ctx.data` on the client before render (a throw falls back to HTML-over-fetch).
 * `.layout()` frames every page in the persistent SiteLayout chrome (applied at SSG; on client nav
 * only `main > section` is swapped).
 *
 * Each route documents: the URL pattern, an example, and the per-handler work (generate → which
 * static pages; load → data fetched; parse → client JSON validation; render → component; head → SEO).
 */

import type { Content } from "@moku-labs/web";
import { defineRoutes, route } from "@moku-labs/web/browser";
import type { ComponentChildren, VNode } from "preact";
import { SITE } from "./config";
import type { Locale } from "./i18n/index";
import { SiteLayout } from "./layouts/SiteLayout";
import { allArticles, articleBySlug, byTag, type Paginated, paginate } from "./lib/articles";
import { articleHead, pageHead } from "./lib/head";
import { AboutPage } from "./pages/AboutPage";
import { ArchivePage } from "./pages/ArchivePage";
import { ArticlePage } from "./pages/ArticlePage";
import { HomePage } from "./pages/HomePage";
import { TagPage } from "./pages/TagPage";

/**
 * Shared `.layout()` wrapper — frames a route's rendered page in {@link SiteLayout}. Receives the
 * 0.4.1 layout context (render context + `meta`) and the page `children`; reads `meta.activeTab`
 * (set per route below) for the active nav tab. Typed to the fields it reads; the framework's full
 * `LayoutContext` is assignable to it.
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

/** Client trust-boundary guard for a paginated payload (home/archive). */
function asPaginated(raw: unknown): Paginated {
  if (
    typeof raw !== "object" ||
    raw === null ||
    !Array.isArray((raw as { articles?: unknown }).articles)
  ) {
    throw new Error("invalid paginated payload");
  }
  return raw as Paginated;
}

/** Client trust-boundary guard for the article-page payload. */
function asArticleData(raw: unknown): { article: Content.Article; recent: Content.Article[] } {
  if (
    typeof raw !== "object" ||
    raw === null ||
    !("article" in raw) ||
    !Array.isArray((raw as { recent?: unknown }).recent)
  ) {
    throw new Error("invalid article payload");
  }
  return raw as { article: Content.Article; recent: Content.Article[] };
}

/** Client trust-boundary guard for the tag-page payload. */
function asTagData(raw: unknown): { tag: string; articles: Content.Article[] } {
  if (
    typeof raw !== "object" ||
    raw === null ||
    typeof (raw as { tag?: unknown }).tag !== "string" ||
    !Array.isArray((raw as { articles?: unknown }).articles)
  ) {
    throw new Error("invalid tag payload");
  }
  return raw as { tag: string; articles: Content.Article[] };
}

export const routes = defineRoutes({
  // Home — pattern "/{lang:?}/"  ·  e.g. "/", "/en/", "/ru/"
  // generate: one page per locale. load: first page of articles. render: HomePage. head: WebSite JSON-LD.
  home: route("/{lang:?}/")
    .layout(layout)
    .generate(locale => [{ lang: locale }])
    .load(async (_p, locale) => paginate(await allArticles(locale), 1))
    .parse(asPaginated)
    .render(ctx => <HomePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: SITE.name, description: SITE.description, isHome: true }))
    .meta({ activeTab: "home" }),

  // Home paged — pattern "/{lang:?}/page/{page}/"  ·  e.g. "/en/page/2/"
  // generate: pages 2..N per locale (page 1 is the home route). load: requested slice.
  homePaged: route("/{lang:?}/page/{page}/")
    .layout(layout)
    .generate(async locale => {
      const total = paginate(await allArticles(locale), 1).totalPages;
      return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
        lang: locale,
        page: String(i + 2)
      }));
    })
    .load(async (p, locale) => paginate(await allArticles(locale), Number(p.page)))
    .parse(asPaginated)
    .render(ctx => <HomePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: `${SITE.name} — Page ${ctx.data.page}`,
        description: SITE.description,
        path: `page/${ctx.data.page}/`
      })
    )
    .meta({ activeTab: "home" }),

  // Archive — pattern "/{lang:?}/archive/"  ·  e.g. "/en/archive/"
  archive: route("/{lang:?}/archive/")
    .layout(layout)
    .generate(locale => [{ lang: locale }])
    .load(async (_p, locale) => paginate(await allArticles(locale), 1))
    .parse(asPaginated)
    .render(ctx => <ArchivePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: `${SITE.name} — Archive`,
        description: SITE.description,
        path: "archive/"
      })
    )
    .meta({ activeTab: "archive" }),

  // Archive paged — pattern "/{lang:?}/archive/page/{page}/"  ·  e.g. "/ru/archive/page/3/"
  archivePaged: route("/{lang:?}/archive/page/{page}/")
    .layout(layout)
    .generate(async locale => {
      const total = paginate(await allArticles(locale), 1).totalPages;
      return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
        lang: locale,
        page: String(i + 2)
      }));
    })
    .load(async (p, locale) => paginate(await allArticles(locale), Number(p.page)))
    .parse(asPaginated)
    .render(ctx => <ArchivePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: `${SITE.name} — Archive Page ${ctx.data.page}`,
        description: SITE.description,
        path: `archive/page/${ctx.data.page}/`
      })
    )
    .meta({ activeTab: "archive" }),

  // Article — pattern "/{lang:?}/{slug}/"  ·  e.g. "/en/hello-world/"
  // generate: one page per article in EVERY locale (22 en + 22 ru). Articles without a native
  // translation fall back to the English body under the locale slug, flagged `isFallback` so the
  // page shows a "not yet translated" notice — every article is reachable in both locales (legacy parity).
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

  // Tag — pattern "/{lang:?}/tags/{tag}/"  ·  e.g. "/en/tags/typescript/"
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

  // About — pattern "/{lang:?}/about/"  ·  e.g. "/en/about/"
  // generate: one page per locale. The page is static, but in hybrid mode the about nav link is on
  // EVERY page, so the SPA prefetches its per-page JSON everywhere — without a loader that's a 404 on
  // every page. An empty loader+parse emits `_data/{lang}/about/index.json` so data-nav resolves cleanly.
  about: route("/{lang:?}/about/")
    .layout(layout)
    .generate(locale => [{ lang: locale }])
    .load(() => ({}))
    .parse(() => ({}))
    .render(ctx => <AboutPage locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: "About", description: "About the author", path: "about/" }))
    .meta({ activeTab: "about" })
});
