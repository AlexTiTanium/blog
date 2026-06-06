/**
 * @file tab-nav island — keeps the persistent header nav in sync after SPA navigation. The header
 * is not re-rendered by the framework on nav, so this re-derives each tab's href, label, and active
 * state from the live `location.pathname`. Mounts on `[data-component="tab-nav"]`.
 */
import { createComponent } from "@moku-labs/web/browser";
import { t } from "../i18n/index";
import { localeFromPath } from "../lib/locale";

/** Terminal-style icon glyph per tab (mirrors the SSG `TabNav` component). */
const ICONS: Record<string, string> = { home: "~", archive: "[]", about: "@" };

/**
 * Strip the leading `/<locale>` prefix and any leading slashes to get the route-relative path.
 *
 * @param path - The current `location.pathname`.
 * @param locale - The active locale code.
 * @returns The path with the locale prefix and leading slashes removed.
 * @example
 * pathAfterLocale("/en/archive/", "en"); // "archive/"
 */
function pathAfterLocale(path: string, locale: string): string {
  const withoutLocale = path.startsWith(`/${locale}`) ? path.slice(locale.length + 1) : path;
  return withoutLocale.replace(/^\/+/, "");
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
  // Strip the locale prefix to get the route-relative path
  const rest = pathAfterLocale(path, locale);

  // Classify the route-relative path into a tab key
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
  // Derive locale, UI strings, and which tab the live URL activates
  const path = globalThis.location.pathname;
  const locale = localeFromPath(path);
  const ui = t(locale);
  const active = activeTab(path, locale);

  // Describe the three tabs (key + localized label + locale-scoped href)
  const tabs = [
    { key: "home", label: ui.home, href: `/${locale}/` },
    { key: "archive", label: ui.archive, href: `/${locale}/archive/` },
    { key: "about", label: ui.about, href: `/${locale}/about/` }
  ];

  // Re-point each direct tab anchor and mark the active one
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
export const tabNav = createComponent("tab-nav", {
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
});
