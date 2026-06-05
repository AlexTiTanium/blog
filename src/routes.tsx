/**
 * @file Route SHELLS — the browser-safe route table (patterns + render/head/meta/layout, NO loaders).
 *
 * Imported by the browser (`src/spa/spa.tsx`) and the link builder (`src/lib/urls.ts`), so it must
 * stay free of the node-only content plugin: it declares NO `.load`/`.generate` and imports no
 * content. On a client DATA navigation the framework feeds the fetched per-page JSON in as `ctx.data`
 * (typed here via a cast to the route's data shape) and runs the SAME `render` the SSG build used.
 *
 * The SSG build registers the fuller table in `src/routes.build.tsx` (these shells + the loaders).
 * The optional `{lang:?}` segment yields a bare default-locale path (`/`) plus explicit `/en/`, `/ru/`.
 */
import { defineRoutes, route } from "@moku-labs/web/browser";
import { SITE } from "./config";
import type { ArticleData, Paginated, TagData } from "./lib/articles";
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
    .render(ctx => <HomePage page={ctx.data as Paginated} locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: pageTitle(), description: SITE.description, isHome: true }))
    .meta({ activeTab: "home" }),

  homePaged: route("/{lang:?}/page/{page}/")
    .layout(layout)
    .render(ctx => <HomePage page={ctx.data as Paginated} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: pageTitle(undefined, (ctx.data as Paginated).page),
        description: SITE.description,
        path: `page/${(ctx.data as Paginated).page}/`
      })
    )
    .meta({ activeTab: "home" }),

  // ── Archive ───────────────────────────────────────────────────────────────
  archive: route("/{lang:?}/archive/")
    .layout(layout)
    .render(ctx => <ArchivePage page={ctx.data as Paginated} locale={ctx.locale} />)
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
    .render(ctx => <ArchivePage page={ctx.data as Paginated} locale={ctx.locale} />)
    .head(ctx =>
      pageHead(ctx, {
        title: pageTitle("Archive", (ctx.data as Paginated).page),
        description: SITE.description,
        path: `archive/page/${(ctx.data as Paginated).page}/`
      })
    )
    .meta({ activeTab: "archive" }),

  // ── Content (article + tag) ────────────────────────────────────────────────
  article: route("/{lang:?}/{slug}/")
    .layout(layout)
    .render(ctx => {
      const data = ctx.data as ArticleData;
      return <ArticlePage article={data.article} recent={data.recent} locale={ctx.locale} />;
    })
    .head(ctx => articleHead(ctx, (ctx.data as ArticleData).article))
    .meta({ activeTab: "none" }),

  tag: route("/{lang:?}/tags/{tag}/")
    .layout(layout)
    .render(ctx => {
      const data = ctx.data as TagData;
      return <TagPage tag={data.tag} articles={data.articles} locale={ctx.locale} />;
    })
    .head(ctx =>
      pageHead(ctx, {
        title: `Tag: ${(ctx.data as TagData).tag}`,
        description: `Articles tagged "${(ctx.data as TagData).tag}"`,
        path: `tags/${(ctx.data as TagData).tag}/`
      })
    )
    .meta({ activeTab: "none" }),

  // ── About ─────────────────────────────────────────────────────────────────
  about: route("/{lang:?}/about/")
    .layout(layout)
    .render(ctx => <AboutPage locale={ctx.locale} />)
    .head(ctx => pageHead(ctx, { title: "About", description: "About the author", path: "about/" }))
    .meta({ activeTab: "about" })
});
