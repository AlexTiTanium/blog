/**
 * @file Island registry — passed to pluginConfigs.spa.components.
 */
import { lazyEmbed } from "@moku-labs/web/browser";
import { dashboard } from "./dashboard";
import { gallery } from "./gallery";
import { langSwitcher } from "./lang-switcher";
import { lightbox } from "./lightbox";
import { linkPrefetch } from "./link-prefetch";
import { pageFx } from "./page-fx";
import { shareButtons } from "./share-buttons";
import { status } from "./status";
import { tabNav } from "./tab-nav";
import { titleBar } from "./title-bar";

/** All SPA islands registered for hydration — passed to `pluginConfigs.spa.components`. */
export const islands = [
  tabNav,
  langSwitcher,
  titleBar,
  lightbox,
  // Enhances `::gallery` blocks (paging + click-to-lightbox); opens the lightbox island's viewer.
  gallery,
  // Framework-provided: activates `::embed` facades (click → lazy iframe).
  lazyEmbed,
  shareButtons,
  pageFx,
  dashboard,
  status,
  // Warms a hovered/touched page's JSON before the click → data-path nav feels instant.
  linkPrefetch
];
