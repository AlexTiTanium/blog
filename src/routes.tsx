/**
 * @file The blog's SINGLE route table — used by the SSG build, the SPA, and link building.
 *
 * One source of truth. Loaders read content via `src/lib/content` (which resolves the content
 * plugin with `ctx.require(contentPlugin)`); `contentPlugin` is the browser-safe SHELL (the node
 * Markdown source is the `fileSystemContent` provider composed in `src/app.ts`), so this module
 * imports zero node code and ships to the client cleanly. Loaders run BUILD-ONLY; on a client DATA
 * navigation the framework feeds the persisted JSON in as `ctx.data` and runs the same `render`.
 *
 * Links: `urls` (a pure `createUrls(routes)` builder) is exported here and wrapped by
 * `src/lib/urls`; co-locating it with `routes` keeps the link builder free of an import cycle.
 * The optional `{lang:?}` segment yields a bare default-locale path (`/`) plus explicit per-locale
 * paths (`/en/`, `/ru/`, `/uk/`, `/es/`).
 */
import { createUrls, defineRoutes, route } from "@moku-labs/web/browser";
import { SITE } from "./config";
import { DEFAULT_LOCALE } from "./i18n/index";
import { byTag, paginate, relatedArticles } from "./lib/articles";
import { allArticles, articleBySlug, pagedRouteParameters } from "./lib/content";
import { articleHead, pageHead, pageStrings, pageTitle } from "./lib/head";
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
    .head(ctx =>
      pageHead(ctx, { title: pageTitle(ctx), description: SITE.description, isHome: true })
    )
    .meta({ activeTab: "home" }),

  homePaged: route("/{lang:?}/page/{page}/")
    .layout(layout)
    .generate(pagedRouteParameters)
    .load(async ctx => paginate(await allArticles(ctx), Number(ctx.params.page)))
    .render(ctx => <HomePage page={ctx.data} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: pageTitle(ctx, "posts", ctx.data.page),
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
        title: pageTitle(ctx, "archive"),
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
        title: pageTitle(ctx, "archive", ctx.data.page),
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
    .load(async ctx => {
      const all = await allArticles(ctx);
      const article = await articleBySlug(ctx);
      const others = all.filter(a => a.computed.slug !== article.computed.slug);
      return { article, recent: others.slice(0, 5), related: relatedArticles(all, article, 5) };
    })
    .render(ctx => (
      <ArticlePage
        article={ctx.data.article}
        recent={ctx.data.recent}
        related={ctx.data.related}
        locale={ctx.locale}
      />
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
        title: `${pageStrings(ctx).tagPageTitle}: ${ctx.data.tag}`,
        description: `${pageStrings(ctx).taggedDescription} "${ctx.data.tag}"`,
        path: `tags/${ctx.data.tag}/`
      })
    )
    .meta({ activeTab: "none" }),

  // ── About ─────────────────────────────────────────────────────────────────
  // No `.load()` — a static page. `build` still emits an empty `{}` sidecar at
  // `_data/{lang}/about/index.json`, so hybrid data-nav to /about/ resolves cleanly.
  about: route("/{lang:?}/about/")
    .layout(layout)
    .generate(ctx => [{ lang: ctx.locale }])
    .render(ctx => <AboutPage locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: pageTitle(ctx, "about"),
        description: pageStrings(ctx).aboutDescription,
        path: "about/"
      })
    )
    .meta({ activeTab: "about" })
});

/**
 * Pure name→URL builder over {@link routes} (no running app/router needed). Co-located with the
 * route table so the link builder shares its one source of truth without an import cycle; wrapped by
 * the per-route helpers in `src/lib/urls`. Also usable directly from islands.
 *
 * The default locale is passed so this pure builder serves it at BARE paths — the same as the
 * runtime `router.toUrl` (which reads it from the i18n plugin) — so links never diverge.
 */
export const urls = createUrls(routes, DEFAULT_LOCALE);
