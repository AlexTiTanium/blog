/**
 * @file Island registry — passed to pluginConfigs.spa.components.
 */
import { langSwitcher } from "./lang-switcher";
import { lightbox } from "./lightbox";
import { shareButtons } from "./share-buttons";
import { tabNav } from "./tab-nav";
import { titleBar } from "./title-bar";

/** All SPA islands registered for hydration — passed to `pluginConfigs.spa.components`. */
export const islands = [tabNav, langSwitcher, titleBar, lightbox, shareButtons];
