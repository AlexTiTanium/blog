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
import { buildArticleHead, feedLink, jsonLd } from "@moku-labs/web/browser";
import { SITE } from "../config";
import { DEFAULT_LOCALE, LOCALES, type Locale, t, type UIStrings } from "../i18n/index";

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
 * Resolve the UI-string set for a route's EFFECTIVE locale (explicit `lang` param wins over the
 * active locale; unknown codes fall back to the default locale). Head copy — titles and meta
 * descriptions — is localized like the nav labels, unlike the in-page IDE chrome which stays
 * English by design.
 *
 * @param ctx - Route context (params + locale).
 * @returns The locale's {@link UIStrings}.
 * @example
 * pageStrings({ params: { lang: "ru" }, locale: "en" }).posts; // "Посты"
 */
export function pageStrings(ctx: HeadContext): UIStrings {
  const locale = localeOf(ctx);
  const isKnown = (LOCALES as readonly string[]).includes(locale);
  return t(isKnown ? (locale as Locale) : DEFAULT_LOCALE);
}

/**
 * Compose a LOCALIZED listing-route document title TAIL from an optional section and an optional
 * 1-based page number — the single source for the listing-route titles so they stay consistent.
 * The site name is NOT included: the head plugin's `titleTemplate` (`"%s — Geek Life"`, set in
 * `src/app.ts`/`src/spa.tsx`) appends it to every title, so including it here would double it
 * (`<title>Geek Life — Archive — Geek Life</title>`).
 *
 * @param ctx - Route context (params + locale) — picks the localized labels.
 * @param section - Section string key ("posts" for the paged home); omit for the home listing.
 * @param page - 1-based page number; omit for the first page.
 * @returns The title tail (empty for the home listing — {@link pageHead} then pins the bare site name).
 * @example
 * pageTitle(ctx); // ""
 * pageTitle(ctx, "posts", 2); // "Posts Page 2" (ru: "Посты Страница 2")
 * pageTitle(ctx, "archive"); // "Archive" (ru: "Архив")
 * pageTitle(ctx, "archive", 3); // "Archive Page 3"
 */
export function pageTitle(
  ctx: HeadContext,
  section?: "posts" | "archive" | "about",
  page?: number
): string {
  const ui = pageStrings(ctx);
  const sectionLabel = section === undefined ? undefined : ui[section];
  const pageLabel = page === undefined ? undefined : `${ui.page} ${page}`;
  return [sectionLabel, pageLabel].filter(Boolean).join(" ");
}

/**
 * Page-head options supplied by a route.
 */
type PageHeadOptions = {
  /** Page title tail (before titleTemplate); empty = home listing → bare site name. */
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
 * WebSite JSON-LD. The framework adds canonical/hreflang/OG/Twitter from the title/description
 * and appends the site name to the title via `titleTemplate`; an EMPTY title yields the bare
 * site name (the home listing).
 *
 * @param ctx - Route context (params + locale).
 * @param o - Page title/description (+ isHome for WebSite JSON-LD).
 * @returns The head config for the route.
 * @example
 * pageHead(ctx, { title: pageTitle(), description: "Welcome", isHome: true });
 */
export function pageHead(ctx: HeadContext, o: PageHeadOptions): Head.HeadConfig {
  const locale = localeOf(ctx);
  // One site-wide feed at the root (the framework emits a single default-locale feed).
  const elements: Head.HeadConfig["elements"] = [feedLink(`${SITE.name} RSS`, "/feed.xml")];

  // An empty title = the home listing → the BARE site name. The framework applies `titleTemplate`
  // to EVERY title — including its own `site.name()` fallback — so without this override home
  // would render "Geek Life — Geek Life". Route-supplied elements win the head plugin's keyed
  // last-wins de-dupe, so pinning the `title` element bypasses the template; the plain `title`
  // field below still feeds `og:title`/`twitter:title` and the SPA's client-nav `document.title`.
  const title = o.title === "" ? SITE.name : o.title;
  if (o.title === "") elements.push({ tag: "title", children: SITE.name, key: "title" });

  if (o.isHome) {
    elements.push(
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url,
        inLanguage: locale
      })
    );
  }

  return { title, description: o.description, elements };
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
  // `computed.slug` (the article directory name), NOT `computed.contentId`: the framework's
  // og-image writer names the emitted PNGs by slug. Pre-1.7.0 the two happened to coincide on
  // article routes because `load()` bypassed the `loadAll()` cache; since web 1.7.0 `load()` is
  // cache-first, so `contentId` carries the post-sort `locale:ordinal:slug` id — using it here
  // would point og:image at a file that does not exist.
  const ogImage = `/og/${computed.slug}.png`;
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
    feedLink(`${SITE.name} RSS`, "/feed.xml")
  ];

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    image: ogImage,
    elements
  };
}
