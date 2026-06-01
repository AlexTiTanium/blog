/**
 * @file lang-switcher island — repoints each locale link at the equivalent path in its locale after
 * SPA navigation (the header persists, so hrefs must be recomputed from the live URL). Mounts on
 * `[data-component="lang-switcher"]`.
 */
import type { Spa } from "@moku-labs/web";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n/index";

/**
 * Resolve the active locale from the first path segment (falls back to the default locale).
 *
 * @param path - The current `location.pathname`.
 * @returns The active locale code.
 * @example
 * localeFromPath("/ru/about/"); // "ru"
 */
function localeFromPath(path: string): Locale {
  const segment = path.split("/").find(Boolean) ?? "";
  return (LOCALES as readonly string[]).includes(segment) ? (segment as Locale) : DEFAULT_LOCALE;
}

/**
 * Swap the locale prefix of a path, preserving the rest.
 *
 * @param path - The current `location.pathname`.
 * @param target - The locale to switch to.
 * @returns The same path under the target locale.
 * @example
 * swapLocale("/en/archive/", "ru"); // "/ru/archive/"
 */
function swapLocale(path: string, target: Locale): string {
  const parts = path.split("/").filter(Boolean);
  const first = parts[0] ?? "";
  const rest = (LOCALES as readonly string[]).includes(first) ? parts.slice(1) : parts;
  return rest.length > 0 ? `/${target}/${rest.join("/")}/` : `/${target}/`;
}

/**
 * Re-sync each locale link's href + active state from the live URL.
 *
 * @param element - The mounted lang-switcher element.
 * @example
 * sync(document.querySelector('[data-component="lang-switcher"]'));
 */
function sync(element: Element): void {
  const path = globalThis.location.pathname;
  const current = localeFromPath(path);
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
