/**
 * @file lang-switcher island — after a client navigation, repoints each locale link at the
 * equivalent path in its locale and re-syncs `<html lang>` (the header persists across SPA nav, so
 * both must be recomputed from the live URL). Mounts on `[data-component="lang-switcher"]`.
 */
import type { Spa } from "@moku-labs/web";
import { LOCALES, type Locale } from "../i18n/index";
import { localeFromPath, swapLocale } from "../lib/locale";

/**
 * Re-sync each locale link's href + active state, and the document language, from the live URL.
 *
 * @param element - The mounted lang-switcher element.
 * @example
 * sync(document.querySelector('[data-component="lang-switcher"]'));
 */
function sync(element: Element): void {
  const path = globalThis.location.pathname;
  const current = localeFromPath(path);

  // The SPA swaps only `main > section`, so `<html lang>` (persistent chrome) would otherwise keep
  // the initial locale across a client-side switch. Re-sync it here (mount + every onNavEnd).
  globalThis.document.documentElement.setAttribute("lang", current);

  for (const link of element.querySelectorAll(":scope > a")) {
    const locale = link.textContent?.trim().toLowerCase() ?? "";
    if (!(LOCALES as readonly string[]).includes(locale)) continue;
    link.setAttribute("href", swapLocale(path, locale as Locale));
    if (locale === current) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
}

/** Lang-switcher island: keeps locale links pointed at the current path on mount + each navigation. */
export const langSwitcher: Spa.ComponentDef = {
  name: "lang-switcher",
  hooks: {
    /**
     * Sync the locale links to the initial URL on mount.
     *
     * @param context - The island lifecycle context.
     * @example
     * onMount(context);
     */
    onMount(context) {
      sync(context.el);
    },
    /**
     * Re-sync the locale links after each SPA navigation.
     *
     * @param context - The island lifecycle context.
     * @example
     * onNavEnd(context);
     */
    onNavEnd(context) {
      sync(context.el);
    }
  }
};
