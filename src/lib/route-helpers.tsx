/**
 * @file Route-table helper used by `src/routes.tsx` — the shared `.layout()`
 * wrapper. Browser-safe (no content import): it frames a page in chrome and reads only locale + meta.
 * The paged-listing param generator now lives in `./content` (it needs the content plugin).
 */
import type { ComponentChildren, VNode } from "preact";
import type { Locale } from "../i18n/index";
import { SiteLayout } from "../layouts/SiteLayout";

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
