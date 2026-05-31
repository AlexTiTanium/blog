/**
 * @file tab-nav island — re-syncs nav links after SPA navigation. Hook ported in build phase C.
 */
import type { Spa } from "@moku-labs/web";

/** Tab-nav island: PORT onNavEnd to re-query [data-component="tab-nav"] and copy href/text/aria-current. */
export const tabNav: Spa.ComponentDef = {
  name: "tab-nav",
  hooks: {}
};
