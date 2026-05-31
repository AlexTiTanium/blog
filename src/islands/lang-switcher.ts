/**
 * @file lang-switcher island — swaps locale on the current path. Hook ported in build phase C.
 */
import type { Spa } from "@moku-labs/web";

/** Lang-switcher island: PORT click handling to navigate to the same path in the other locale. */
export const langSwitcher: Spa.ComponentDef = {
  name: "lang-switcher",
  hooks: {}
};
