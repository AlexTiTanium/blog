/**
 * @file lang-switcher island — after a client navigation, repoints each locale link at the
 * equivalent path in its locale and re-syncs `<html lang>` (the header persists across SPA nav, so
 * both must be recomputed from the live URL). Mounts on `[data-component="lang-switcher"]`.
 */
import { createComponent } from "@moku-labs/web/browser";
import { LOCALES, type Locale } from "../i18n/index";
import { localeFromPath, swapLocale } from "../lib/locale";

/**
 * Read the locale a switcher anchor stands for, from its visible label (e.g. "EN" -> "en").
 *
 * @param link - A `:scope > a` child of the lang-switcher element.
 * @returns The matched {@link Locale}, or `undefined` when the label is not a supported locale.
 * @example
 * linkLocale(anchor); // "ru" | undefined
 */
function linkLocale(link: Element): Locale | undefined {
  const label = link.textContent?.trim().toLowerCase() ?? "";
  return (LOCALES as readonly string[]).includes(label) ? (label as Locale) : undefined;
}

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

  // Re-sync <html lang> from the live URL (persistent chrome the SPA never re-renders).
  globalThis.document.documentElement.setAttribute("lang", current);

  // Repoint each locale link at the equivalent path in its locale + mark the active one.
  for (const link of element.querySelectorAll(":scope > a")) {
    const locale = linkLocale(link);
    if (!locale) continue;
    link.setAttribute("href", swapLocale(path, locale));
    if (locale === current) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
}

/** Lang-switcher island: keeps locale links pointed at the current path on mount + each navigation. */
export const langSwitcher = createComponent("lang-switcher", {
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
});
