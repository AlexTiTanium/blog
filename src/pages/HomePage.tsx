/**
 * @file HomePage — hero + status bar + dashboard grid. PORT from legacy in build phase C.
 */
import type { VNode } from "preact";
import type { Paginated } from "../lib/articles";

/**
 * Home page: paginated article dashboard.
 *
 * @param _props - Paginated articles + active locale.
 * @throws {Error} Always — implemented during the build phase.
 */
export function HomePage(_props: { page: Paginated; locale: string }): VNode {
  throw new Error("not implemented");
}
