/**
 * @file SEO head builders. 0.4.1 changes vs the legacy app:
 *
 * 1. `build.injectAssets` injects the bundled `main.{css,js}` tags — so these builders own SEO
 *    metadata ONLY (no assets array).
 * 2. The `head` plugin AUTO-composes the base SEO set from the returned `title`/`description` +
 *    route: `<title>`, meta description, `og:title/description/url`, `twitter:card/title/description`,
 *    `canonical`, `hreflang` (every locale + `x-default`), and `og:locale`. It also emits
 *    `og:image`/`twitter:image` from `HeadConfig.image`. So these builders only add the EXTRAS the
 *    framework does not: the RSS feed link, JSON-LD, and the article-specific OG tags
 *    (`og:type`, `article:*`) via `buildArticleHead`.
 */

import type { Content, Head } from "@moku-labs/web";
import { buildArticleHead, feedLink, jsonLd } from "@moku-labs/web";
import { SITE } from "../config";

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
  /** Path suffix below the locale root (unused for canonical — the framework derives it). */
  path?: string;
  /** True for the home route (drives WebSite JSON-LD). */
  isHome?: boolean;
};

/**
 * Resolve the effective locale for a route (explicit `lang` param wins over the active locale).
 *
 * @param ctx - Route context (params + locale).
 * @returns The effective locale code.
 * @example
 * localeOf({ params: { lang: "ru" }, locale: "en" }); // "ru"
 */
function localeOf(ctx: HeadContext): string {
  return ctx.params.lang ?? ctx.locale;
}

/**
 * Standard page head: title + description, plus the RSS feed link and (on the home route) a
 * WebSite JSON-LD. The framework adds canonical/hreflang/OG/Twitter from the title/description.
 *
 * @param ctx - Route context (params + locale).
 * @param o - Page title/description (+ isHome for WebSite JSON-LD).
 * @returns The head config for the route.
 * @example
 * pageHead(ctx, { title: "Home", description: "Welcome", isHome: true });
 */
export function pageHead(ctx: HeadContext, o: PageHeadOptions): Head.HeadConfig {
  const locale = localeOf(ctx);
  const elements: Head.HeadConfig["elements"] = [
    feedLink(`${SITE.name} RSS`, `/${locale}/feed.xml`)
  ];

  if (o.isHome) {
    elements.push(
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: `${SITE.url}/${locale}/`,
        inLanguage: locale
      })
    );
  }

  return { title: o.title, description: o.description, elements };
}

/**
 * Article head: title + description + OG image, the article-specific OG tags + Article JSON-LD via
 * `buildArticleHead`, an additional BlogPosting JSON-LD, and the RSS feed link. The framework adds
 * canonical/hreflang/OG/Twitter (incl. `og:image` from `image`) from the title/description.
 *
 * @param ctx - Route context (params + locale).
 * @param article - The resolved article.
 * @returns The head config for the article route.
 * @example
 * articleHead(ctx, article);
 */
export function articleHead(ctx: HeadContext, article: Content.Article): Head.HeadConfig {
  const locale = localeOf(ctx);
  const { frontmatter, computed, url } = article;
  const canonicalUrl = `${SITE.url}${url}`;
  const ogImage = `/og/${computed.contentId}.png`;
  const author = frontmatter.author ?? SITE.author;

  const elements: Head.HeadConfig["elements"] = [
    ...buildArticleHead(
      {
        title: frontmatter.title,
        description: frontmatter.description,
        author,
        published: frontmatter.date,
        tags: frontmatter.tags
      },
      canonicalUrl
    ),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: frontmatter.title,
      description: frontmatter.description,
      image: `${SITE.url}${ogImage}`,
      datePublished: `${frontmatter.date}T00:00:00+00:00`,
      author: { "@type": "Person", name: author, url: SITE.url },
      url: canonicalUrl,
      inLanguage: locale,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl }
    }),
    feedLink(`${SITE.name} RSS`, `/${locale}/feed.xml`)
  ];

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    image: ogImage,
    elements
  };
}
