/**
 * @file Client trust-boundary guards for data-navigation payloads. In `router.mode: "hybrid"` the
 * SPA fetches each route's per-page JSON and hands it to the route's `.parse()` before render; these
 * guards validate that untrusted JSON has the shape the route expects (a throw makes the framework
 * fall back to a full HTML navigation). Kept out of the route table so `routes.tsx` reads as pure
 * routing.
 */
import type { Content } from "@moku-labs/web";
import type { Paginated } from "./articles";

/** A single article plus the recent-articles sidebar list (article route payload). */
export type ArticlePayload = {
  /** The resolved article. */
  article: Content.Article;
  /** Recent articles for the sidebar. */
  recent: Content.Article[];
};

/** A tag name plus the articles carrying it (tag route payload). */
export type TagPayload = {
  /** The tag name. */
  tag: string;
  /** Articles tagged with `tag`. */
  articles: Content.Article[];
};

/**
 * Type guard: narrow an unknown value to a non-null object (the common precondition for the guards).
 *
 * @param value - The untrusted value to test.
 * @returns Whether `value` is a non-null object.
 * @example
 * isObject({}); // true
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Guard a paginated payload (home + archive routes).
 *
 * @param raw - Untrusted fetched JSON.
 * @returns The validated {@link Paginated} payload.
 * @throws {Error} When `raw` is not a paginated payload.
 * @example
 * asPaginated(await res.json());
 */
export function asPaginated(raw: unknown): Paginated {
  if (!isObject(raw) || !Array.isArray(raw.articles)) {
    throw new Error("invalid paginated payload");
  }
  return raw as Paginated;
}

/**
 * Guard an article-page payload (article route).
 *
 * @param raw - Untrusted fetched JSON.
 * @returns The validated {@link ArticlePayload}.
 * @throws {Error} When `raw` is not an article payload.
 * @example
 * asArticleData(await res.json());
 */
export function asArticleData(raw: unknown): ArticlePayload {
  if (!isObject(raw) || !("article" in raw) || !Array.isArray(raw.recent)) {
    throw new Error("invalid article payload");
  }
  return raw as ArticlePayload;
}

/**
 * Guard a tag-page payload (tag route).
 *
 * @param raw - Untrusted fetched JSON.
 * @returns The validated {@link TagPayload}.
 * @throws {Error} When `raw` is not a tag payload.
 * @example
 * asTagData(await res.json());
 */
export function asTagData(raw: unknown): TagPayload {
  if (!isObject(raw) || typeof raw.tag !== "string" || !Array.isArray(raw.articles)) {
    throw new Error("invalid tag payload");
  }
  return raw as TagPayload;
}
