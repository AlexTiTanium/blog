/**
 * @file SiteLayout — shell wrapping every route (header, nav, footer). PORT in build phase C.
 */
import type { ComponentChildren, VNode } from "preact";

/**
 * Site shell layout. Receives the rendered page as children.
 *
 * @param _children - The rendered page content.
 * @throws {Error} Always — implemented during the build phase.
 */
export function SiteLayout(_children: ComponentChildren): VNode {
  throw new Error("not implemented");
}
