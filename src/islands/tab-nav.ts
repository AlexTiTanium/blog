/**
 * @file tab-nav island — keeps the persistent header nav in sync after SPA navigation. The header
 * is not re-rendered by the framework on nav, so this re-derives each tab's href, label, and
 * active state from the live `location.pathname`. Mounts on `[data-component="tab-nav"]`.
 */
import type { Spa } from "@moku-labs/web";
import { DEFAULT_LOCALE, LOCALES, type Locale, t } from "../i18n/index";

/** Terminal-style icon glyph per tab. */
const ICONS: Record<string, string> = { home: "~", archive: "[]", about: "@" };

/**
 * Resolve the active locale from the first path segment (falls back to the default locale).
 *
 * @param path - The current `location.pathname`.
 * @returns The active locale code.
 * @example
 * localeFromPath("/ru/archive/"); // "ru"
 */
function localeFromPath(path: string): Locale {
  const segment = path.split("/").find(Boolean) ?? "";
  return (LOCALES as readonly string[]).includes(segment) ? (segment as Locale) : DEFAULT_LOCALE;
}

/**
 * Determine which tab the current path activates.
 *
 * @param path - The current `location.pathname`.
 * @param locale - The active locale code.
 * @returns The active tab key ("home" | "archive" | "about" | "none").
 * @example
 * activeTab("/en/archive/", "en"); // "archive"
 */
function activeTab(path: string, locale: string): string {
  let rest = path;
  if (rest.startsWith(`/${locale}`)) rest = rest.slice(locale.length + 1);
  rest = rest.replace(/^\/+/, "");
  if (rest.startsWith("archive")) return "archive";
  if (rest.startsWith("about")) return "about";
  if (rest === "" || rest.startsWith("page/")) return "home";
  return "none";
}

/**
 * Re-sync the three direct tab links (href + label + active state) from the live URL.
 *
 * @param element - The mounted tab-nav element.
 * @example
 * sync(document.querySelector('[data-component="tab-nav"]'));
 */
function sync(element: Element): void {
  const path = globalThis.location.pathname;
  const locale = localeFromPath(path);
  const ui = t(locale);
  const active = activeTab(path, locale);
  const tabs = [
    { key: "home", label: ui.home, href: `/${locale}/` },
    { key: "archive", label: ui.archive, href: `/${locale}/archive/` },
    { key: "about", label: ui.about, href: `/${locale}/about/` }
  ];
  for (const [index, link] of [...element.querySelectorAll(":scope > a")].entries()) {
    const tab = tabs[index];
    if (!tab) continue;
    link.setAttribute("href", tab.href);
    link.innerHTML = `<span data-icon>${ICONS[tab.key] ?? ""}</span> ${tab.label}`;
    if (tab.key === active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

/** Tab-nav island: re-syncs nav links/active state on mount and after each navigation. */
export const tabNav: Spa.ComponentDef = {
  name: "tab-nav",
  hooks: {
    /**
     * Sync the nav to the initial URL on mount.
     *
     * @param context - The island lifecycle context.
     * @example
     * onMount(context);
     */
    onMount(context) {
      sync(context.el);
    },
    /**
     * Re-sync the nav after each SPA navigation.
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
