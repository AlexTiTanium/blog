/**
 * @file Typed route table — params-only `.generate()` + content-cache `.load()` (N×N-safe).
 *
 * Every loader reads ONLY the memoized cache in `./lib/articles` (never re-parses markdown). The
 * optional `{lang:?}` segment yields a bare default-locale path (`/`) plus explicit `/en/`, `/ru/`.
 * Each route below documents: the URL pattern it matches, an example, and the per-handler work
 * (generate → which static pages; load → data fetched; render → component; head → SEO/meta).
 */
import { defineRoutes, route } from "@moku-labs/web";
import { SITE } from "./config";
import { SiteLayout } from "./layouts/SiteLayout";
import { allArticles, articleBySlug, byTag, paginate } from "./lib/articles";
import { articleHead, pageHead } from "./lib/head";
import { AboutPage } from "./pages/AboutPage";
import { ArchivePage } from "./pages/ArchivePage";
import { ArticlePage } from "./pages/ArticlePage";
import { HomePage } from "./pages/HomePage";
import { TagPage } from "./pages/TagPage";

export const routes = defineRoutes({
  // Home — pattern "/{lang:?}/"  ·  e.g. "/", "/en/", "/ru/"
  // generate: one page per locale. load: first page of articles (paginate, page 1).
  // render: HomePage dashboard. head: site title + WebSite JSON-LD (isHome).
  home: route("/{lang:?}/")
    .layout(SiteLayout)
    .generate(locale => [{ lang: locale }])
    .load(async (_p, locale) => paginate(await allArticles(locale), 1))
    .render(ctx => <HomePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: SITE.name, description: SITE.description, isHome: true }))
    .meta({ activeTab: "home" }),

  // Home paged — pattern "/{lang:?}/page/{page}/"  ·  e.g. "/en/page/2/"
  // generate: pages 2..N per locale (page 1 is the home route, so it is skipped).
  // load: the requested page slice. render: HomePage. head: "… — Page N".
  homePaged: route("/{lang:?}/page/{page}/")
    .layout(SiteLayout)
    .generate(async locale => {
      const total = paginate(await allArticles(locale), 1).totalPages;
      return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
        lang: locale,
        page: String(i + 2)
      }));
    })
    .load(async (p, locale) => paginate(await allArticles(locale), Number(p.page)))
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
  // Same data as home (first page) but rendered under the Archive tab.
  archive: route("/{lang:?}/archive/")
    .layout(SiteLayout)
    .generate(locale => [{ lang: locale }])
    .load(async (_p, locale) => paginate(await allArticles(locale), 1))
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
  // generate: pages 2..N per locale. load: the requested page slice. render: ArchivePage.
  archivePaged: route("/{lang:?}/archive/page/{page}/")
    .layout(SiteLayout)
    .generate(async locale => {
      const total = paginate(await allArticles(locale), 1).totalPages;
      return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
        lang: locale,
        page: String(i + 2)
      }));
    })
    .load(async (p, locale) => paginate(await allArticles(locale), Number(p.page)))
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
  // generate: one page per REAL article (isFallback === false) → 22 en, 6 ru (no fallback dupes).
  // load: the article + the 5 most-recent articles for the sidebar. head: articleHead (BlogPosting).
  article: route("/{lang:?}/{slug}/")
    .layout(SiteLayout)
    .generate(async locale => {
      const arts = await allArticles(locale);
      return arts.filter(a => !a.isFallback).map(a => ({ lang: locale, slug: a.computed.slug }));
    })
    .load(async (p, locale) => ({
      article: await articleBySlug(p.slug, locale),
      recent: (await allArticles(locale)).slice(0, 5)
    }))
    .render(ctx => (
      <ArticlePage article={ctx.data.article} recent={ctx.data.recent} locale={ctx.locale} />
    ))
    .head(ctx => articleHead(ctx, ctx.data.article))
    .meta({ activeTab: "none" }),

  // Tag — pattern "/{lang:?}/tags/{tag}/"  ·  e.g. "/en/tags/typescript/"
  // generate: one page per unique tag across the locale. load: tag + articles filtered by that tag.
  tag: route("/{lang:?}/tags/{tag}/")
    .layout(SiteLayout)
    .generate(async locale => {
      const tags = new Set((await allArticles(locale)).flatMap(a => a.frontmatter.tags));
      return [...tags].map(tag => ({ lang: locale, tag }));
    })
    .load(async (p, locale) => ({ tag: p.tag, articles: byTag(await allArticles(locale), p.tag) }))
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
  // generate: one page per locale. No loader (static content). render: AboutPage.
  about: route("/{lang:?}/about/")
    .layout(SiteLayout)
    .generate(locale => [{ lang: locale }])
    .render(ctx => <AboutPage locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: "About", description: "About the author", path: "about/" }))
    .meta({ activeTab: "about" })
});
