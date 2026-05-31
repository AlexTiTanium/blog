/**
 * @file lightbox island — image lightbox overlay. Hook ported in build phase C.
 */
import type { Spa } from "@moku-labs/web";

/** Lightbox island: PORT mount/destroy hooks that wire article image click → overlay. */
export const lightbox: Spa.ComponentDef = {
  name: "lightbox",
  hooks: {}
};
