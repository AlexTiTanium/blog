/**
 * @file title-bar island — picks a dev-humor quote on mount and re-picks after SPA navigation.
 * Mounts on `[data-island="titlebar"]` (the persistent header title bar).
 */
import { createIsland } from "@moku-labs/web/browser";
import { pickQuote } from "../lib/quotes";

/**
 * Set the title-bar quote element to the current hour's pick.
 *
 * @param element - The mounted title-bar element.
 * @example
 * setQuote(document.querySelector('[data-island="titlebar"]'));
 */
function setQuote(element: Element): void {
  const titleElement = element.querySelector("[data-title]");
  if (titleElement) titleElement.textContent = pickQuote();
}

/** Title-bar island: hourly-rotating quote, refreshed on mount and after each navigation. */
export const titleBar = createIsland("titlebar", {
  /**
   * Pick the initial quote when the bar mounts.
   *
   * @param context - The island lifecycle context.
   * @example
   * onMount(context);
   */
  onMount(context) {
    setQuote(context.el);
  },
  /**
   * Re-pick the quote after each SPA navigation.
   *
   * @param context - The island lifecycle context.
   * @example
   * onNavEnd(context);
   */
  onNavEnd(context) {
    setQuote(context.el);
  }
});
