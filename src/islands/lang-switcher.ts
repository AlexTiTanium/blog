/**
 * @file lang-switcher island — two jobs. (1) After a client navigation, repoints each locale
 * link at the equivalent path in its locale and re-syncs `<html lang>` (the header persists across
 * SPA nav, so both must be recomputed from the live URL). (2) On phones (<=600px) it drives the
 * collapsed selector: the current-locale pill toggles `[data-expanded]` (CSS in LanguageSwitcher.css
 * reveals/hides the other codes and recedes the nav tabs), and a click outside / a tab / Escape /
 * a navigation collapses it again. Mounts on `[data-component="lang-switcher"]`.
 */
import { createComponent } from "@moku-labs/web/browser";
import { LOCALES, type Locale } from "../i18n/index";
import { localeFromPath, swapLocale } from "../lib/locale";

/** The mounted switcher element — held so the global (document/keydown) handlers can reach it. */
let switcherElement: Element | undefined;

/** The viewport below which the selector collapses (mirrors the `@media (max-width: 600px)` CSS). */
const MOBILE_QUERY = "(max-width: 600px)";

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

/**
 * Whether the viewport is in the collapsed-selector (phone) range.
 *
 * @returns `true` when the `(max-width: 600px)` media query matches.
 * @example
 * if (isMobile()) event.preventDefault();
 */
function isMobile(): boolean {
  return globalThis.matchMedia(MOBILE_QUERY).matches;
}

/**
 * Whether the switcher is currently expanded.
 *
 * @param element - The switcher element.
 * @returns `true` when `[data-expanded]` is set.
 * @example
 * if (isExpanded(el)) collapse();
 */
function isExpanded(element: Element): boolean {
  return (element as HTMLElement).dataset.expanded === "true";
}

/**
 * Set the expanded/collapsed state and keep the pill's `aria-expanded` in step.
 *
 * @param element - The switcher element.
 * @param expanded - The desired state.
 * @example
 * setExpanded(el, true);
 */
function setExpanded(element: Element, expanded: boolean): void {
  const htmlElement = element as HTMLElement;
  if (expanded) htmlElement.dataset.expanded = "true";
  else delete htmlElement.dataset.expanded;

  const pill = element.querySelector(':scope > a[aria-current="true"]');
  pill?.setAttribute("aria-expanded", String(expanded));
}

/**
 * Collapse the mounted switcher (no-op when nothing is mounted).
 *
 * @example
 * collapse();
 */
function collapse(): void {
  if (switcherElement) setExpanded(switcherElement, false);
}

/**
 * Toggle expand/collapse when the current-locale pill is tapped on a phone. Other locale links keep
 * their normal navigation, and on desktop/tablet every link navigates as usual.
 *
 * @param event - The click event from inside the switcher.
 * @example
 * switcher.addEventListener("click", onSwitcherClick);
 */
function onSwitcherClick(event: Event): void {
  if (!switcherElement || !isMobile()) return;

  // Only the active-locale pill toggles; other codes navigate to their locale.
  const pill = (event.target as Element).closest('a[aria-current="true"]');
  if (!pill || !switcherElement.contains(pill)) return;

  event.preventDefault();
  setExpanded(switcherElement, !isExpanded(switcherElement));
}

/**
 * Collapse when a click lands outside the switcher (including on a nav tab or page body).
 *
 * @param event - A document-level click event.
 * @example
 * document.addEventListener("click", onDocumentClick);
 */
function onDocumentClick(event: Event): void {
  if (!switcherElement || !isExpanded(switcherElement)) return;
  if (switcherElement.contains(event.target as Node)) return;
  collapse();
}

/**
 * Collapse the selector when Escape is pressed.
 *
 * @param event - A document-level keydown event.
 * @example
 * document.addEventListener("keydown", onKeydown);
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape" || !switcherElement || !isExpanded(switcherElement)) return;
  collapse();
}

/** Lang-switcher island: keeps locale links current + drives the collapsed mobile selector. */
export const langSwitcher = createComponent("lang-switcher", {
  /**
   * Sync the locale links to the initial URL and wire up the collapse/expand handlers.
   *
   * @param context - The island lifecycle context.
   * @example
   * onMount(context);
   */
  onMount(context) {
    switcherElement = context.el;
    sync(context.el);
    context.el.addEventListener("click", onSwitcherClick);
    globalThis.document.addEventListener("click", onDocumentClick);
    globalThis.document.addEventListener("keydown", onKeydown);
  },
  /**
   * Collapse to the chosen language and re-sync the locale links after each SPA navigation.
   *
   * @param context - The island lifecycle context.
   * @example
   * onNavEnd(context);
   */
  onNavEnd(context) {
    if (isExpanded(context.el)) setExpanded(context.el, false);
    sync(context.el);
  },
  /**
   * Tear down the collapse/expand handlers when the switcher is destroyed.
   *
   * @param context - The island lifecycle context.
   * @example
   * onDestroy(context);
   */
  onDestroy(context) {
    context.el.removeEventListener("click", onSwitcherClick);
    globalThis.document.removeEventListener("click", onDocumentClick);
    globalThis.document.removeEventListener("keydown", onKeydown);
    switcherElement = undefined;
  }
});
