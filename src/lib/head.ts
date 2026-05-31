/**
 * @file SEO head builders + bundled-asset injection (0.3.0 doesn't auto-link assets).
 *
 * Build phase C implements these using the SEO primitives (meta/og/twitter/canonical/
 * hreflang/feedLink/buildArticleHead) and injects the /assets/main.{css,js} tags.
 */
import type { Content, Head } from "@moku-labs/web";

/**
 * Route context passed to the head builders (params + active locale).
 */
type HeadContext = {
  /** Matched route params. */
  params: Record<string, string>;
  /** Active locale code. */
  locale: string;
};

/**
 * Page-head options supplied by a route.
 */
type PageHeadOptions = {
  /** Page title (before titleTemplate). */
  title: string;
  /** Meta description. */
  description: string;
  /** Path suffix below the locale root (for canonical/og URLs). */
  path?: string;
  /** True for the home route (drives WebSite JSON-LD). */
  isHome?: boolean;
};

/**
 * Standard page head: canonical + hreflang(en/ru/x-default) + OG/Twitter + feed + assets.
 *
 * @param _ctx - Route context (params + locale).
 * @param _o - Page title/description/path (+ isHome for WebSite JSON-LD).
 * @throws {Error} Always — implemented during the build phase.
 * @example
 * pageHead(ctx, { title: "Home", description: "Welcome", isHome: true });
 */
export function pageHead(_ctx: HeadContext, _o: PageHeadOptions): Head.HeadConfig {
  throw new Error("not implemented");
}

/**
 * Article head via buildArticleHead + JSON-LD BlogPosting + assets.
 *
 * @param _ctx - Route context (params + locale).
 * @param _article - The resolved article.
 * @throws {Error} Always — implemented during the build phase.
 * @example
 * articleHead(ctx, article);
 */
export function articleHead(_ctx: HeadContext, _article: Content.Article): Head.HeadConfig {
  throw new Error("not implemented");
}
