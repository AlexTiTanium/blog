/**
 * @file ArticlePage — single article + recent sidebar. PORT from legacy in build phase C.
 */
import type { Content } from "@moku-labs/web";
import type { VNode } from "preact";

/**
 * Article page: rendered article body plus recent-articles sidebar.
 *
 * @param _props - The article, recent articles, and active locale.
 * @throws {Error} Always — implemented during the build phase.
 */
export function ArticlePage(_props: {
  article: Content.Article;
  recent: Content.Article[];
  locale: string;
}): VNode {
  throw new Error("not implemented");
}
