/**
 * @file Island registry — passed to pluginConfigs.spa.components.
 */
import type { Spa } from "@moku-labs/web";
import { langSwitcher } from "./lang-switcher";
import { lightbox } from "./lightbox";
import { shareButtons } from "./share-buttons";
import { tabNav } from "./tab-nav";
import { titleBar } from "./title-bar";

/** All SPA islands registered for hydration. */
export const islands: Spa.ComponentDef[] = [tabNav, langSwitcher, titleBar, lightbox, shareButtons];
