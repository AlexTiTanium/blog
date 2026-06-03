/**
 * @file Route-table helpers used by `src/routes.tsx` — the shared `.layout()` wrapper and the
 * paged-listing param generator. Kept out of the route table so it reads as pure routing.
 */
import type { ComponentChildren, VNode } from "preact";
import type { Locale } from "../i18n/index";
import { SiteLayout } from "../layouts/SiteLayout";
import { allArticles, paginate } from "./articles";

/**
 * Shared `.layout()` wrapper — frames a route's rendered page in {@link SiteLayout}, reading the
 * active locale and the route's `.meta().activeTab` for the highlighted nav tab. Typed to the fields
 * it reads; the framework's full `LayoutContext` is assignable to it.
 *
 * @param ctx - Layout context (active locale + the route's `.meta()` bag).
 * @param children - The rendered page content (the `main > section` swap region's children).
 * @returns The page wrapped in site chrome.
 * @example
 * route("/").layout(layout);
 */
export const layout = (
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
export async function pagedRouteParams(locale: string): Promise<{ lang: string; page: string }[]> {
  const { totalPages } = paginate(await allArticles(locale), 1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    lang: locale,
    page: String(i + 2)
  }));
}
