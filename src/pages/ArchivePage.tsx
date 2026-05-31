/**
 * @file ArchivePage — full paginated article archive. PORT from legacy in build phase C.
 */
import type { VNode } from "preact";
import type { Paginated } from "../lib/articles";

/**
 * Archive page: paginated list of all articles.
 *
 * @param _props - Paginated articles + active locale.
 * @throws {Error} Always — implemented during the build phase.
 */
export function ArchivePage(_props: { page: Paginated; locale: string }): VNode {
  throw new Error("not implemented");
}
