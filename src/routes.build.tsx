/**
 * @file Route table for the SSG BUILD (Node-only) — the shells + the data loaders.
 *
 * Identical render/head/meta/layout to `src/routes.tsx`, plus `.generate()`/`.load()` that read
 * content via `src/lib/content` (which resolves the node-only content plugin through
 * `ctx.require(contentPlugin)`). Imported ONLY by `src/app.ts`; the browser never sees it, so the
 * content plugin stays out of the client bundle. Because `.load()` types the data, `ctx.data` is
 * fully typed in `.render()`/`.head()` here (no casts) — this is the type-checked source of truth.
 */
import { defineRoutes, route } from "@moku-labs/web";
import { SITE } from "./config";
import { byTag, paginate } from "./lib/articles";
import { allArticles, articleBySlug, pagedRouteParameters } from "./lib/content";
import { articleHead, pageHead, pageTitle } from "./lib/head";
import { layout } from "./lib/route-helpers";
import { AboutPage } from "./pages/AboutPage";
import { ArchivePage } from "./pages/ArchivePage";
import { ArticlePage } from "./pages/ArticlePage";
import { HomePage } from "./pages/HomePage";
import { TagPage } from "./pages/TagPage";

export const routes = defineRoutes({
  // ── Home ──────────────────────────────────────────────────────────────────
  home: route("/{lang:?}/")
    .layout(layout)
    .generate(ctx => [{ lang: ctx.locale }])
    .load(async ctx => paginate(await allArticles(ctx), 1))
    .render(ctx => <HomePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: pageTitle(), description: SITE.description, isHome: true }))
    .meta({ activeTab: "home" }),

  homePaged: route("/{lang:?}/page/{page}/")
    .layout(layout)
    .generate(pagedRouteParameters)
    .load(async ctx => paginate(await allArticles(ctx), Number(ctx.params.page)))
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
  archive: route("/{lang:?}/archive/")
    .layout(layout)
    .generate(ctx => [{ lang: ctx.locale }])
    .load(async ctx => paginate(await allArticles(ctx), 1))
    .render(ctx => <ArchivePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: pageTitle("Archive"),
        description: SITE.description,
        path: "archive/"
      })
    )
    .meta({ activeTab: "archive" }),

  archivePaged: route("/{lang:?}/archive/page/{page}/")
    .layout(layout)
    .generate(pagedRouteParameters)
    .load(async ctx => paginate(await allArticles(ctx), Number(ctx.params.page)))
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
  article: route("/{lang:?}/{slug}/")
    .layout(layout)
    .generate(async ctx =>
      (await allArticles(ctx)).map(a => ({ lang: ctx.locale, slug: a.computed.slug }))
    )
    .load(async ctx => ({
      article: await articleBySlug(ctx),
      recent: (await allArticles(ctx)).slice(0, 5)
    }))
    .render(ctx => (
      <ArticlePage article={ctx.data.article} recent={ctx.data.recent} locale={ctx.locale} />
    ))
    .head(ctx => articleHead(ctx, ctx.data.article))
    .meta({ activeTab: "none" }),

  tag: route("/{lang:?}/tags/{tag}/")
    .layout(layout)
    .generate(async ctx => {
      const tags = new Set((await allArticles(ctx)).flatMap(a => a.frontmatter.tags));
      return [...tags].map(tag => ({ lang: ctx.locale, tag }));
    })
    .load(async ctx => ({
      tag: ctx.params.tag,
      articles: byTag(await allArticles(ctx), ctx.params.tag)
    }))
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
  // Empty loader emits `_data/{lang}/about/index.json` so hybrid data-nav resolves cleanly.
  about: route("/{lang:?}/about/")
    .layout(layout)
    .generate(ctx => [{ lang: ctx.locale }])
    .load(() => ({}))
    .render(ctx => <AboutPage locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: "About", description: "About the author", path: "about/" }))
    .meta({ activeTab: "about" })
});
