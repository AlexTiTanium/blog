/**
 * @file TagPage — articles filtered by a single tag. PORT from legacy in build phase C.
 */
import type { Content } from "@moku-labs/web";
import type { VNode } from "preact";

/**
 * Tag page: articles sharing one tag.
 *
 * @param _props - The tag, matching articles, and active locale.
 * @throws {Error} Always — implemented during the build phase.
 */
export function TagPage(_props: {
  tag: string;
  articles: Content.Article[];
  locale: string;
}): VNode {
  throw new Error("not implemented");
}
