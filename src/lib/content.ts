/**
 * @file Content access for route loaders (NODE-only). `allArticles`/`articleBySlug` take the
 * loader/generate `ctx` and resolve the content plugin spec-exactly via `ctx.require(contentPlugin)`
 * — so the route table never imports the node-only content plugin directly. Imported ONLY by
 * `src/routes.build.tsx` (the SSG route table); never by `src/routes.tsx` (the browser shells) or
 * any browser module, keeping the client bundle free of node/native code.
 */

import type { Content, Router } from "@moku-labs/web";
import { contentPlugin } from "@moku-labs/web";
import { paginate } from "./articles";

/** Minimal loader/generate context surface these helpers read: active locale + the spec `require`. */
type LoaderContext = Pick<Router.GenerateContext, "locale" | "require">;

/**
 * All articles for the ctx's locale, via `ctx.require(contentPlugin).loadAll()` (the content plugin
 * memoizes the parse internally). Pass the loader/generate `ctx` straight through.
 *
 * @param ctx - Loader/generate context (active locale + `require`).
 * @returns Date-descending articles for the locale (empty if none).
 * @example
 * route("/{lang:?}/").load(async (ctx) => paginate(await allArticles(ctx), 1));
 */
export async function allArticles(ctx: LoaderContext): Promise<Content.Article[]> {
  const byLocale = await ctx.require(contentPlugin).loadAll();
  return byLocale.get(ctx.locale) ?? [];
}

/**
 * Resolve a single article for the ctx's locale by `params.slug`, via `ctx.require(contentPlugin)`.
 *
 * @param ctx - Loader context (active locale + `require` + `params.slug`).
 * @returns The resolved article.
 * @example
 * route("/{lang:?}/{slug}/").load((ctx) => articleBySlug(ctx));
 */
export async function articleBySlug(
  ctx: LoaderContext & { readonly params: { readonly slug: string } }
): Promise<Content.Article> {
  return ctx.require(contentPlugin).load(ctx.params.slug, ctx.locale);
}

/**
 * Param sets for the paged variant of a listing (pages 2..N for a locale; page 1 is the base route).
 * Shared by the home and archive paged routes so the pagination math lives in one place.
 *
 * @param ctx - Generate context (active locale + `require`).
 * @returns One `{ lang, page }` param set per page after the first.
 * @example
 * route("/{lang:?}/page/{page}/").generate(pagedRouteParameters);
 */
export async function pagedRouteParameters(
  ctx: LoaderContext
): Promise<{ lang: string; page: string }[]> {
  const { totalPages } = paginate(await allArticles(ctx), 1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    lang: ctx.locale,
    page: String(index + 2)
  }));
}
