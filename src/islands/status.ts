/**
 * @file status island — recomputes the status bar's "last commit" relative age on mount. Mounts on
 * `[data-island="status"]` (home page, inside the swap region — so it re-mounts per navigation).
 * The SSG'd text is the age at BUILD time; this island re-derives it from the `<time datetime>`
 * attribute so a statically served page shows the age as of the visit, not as of the deploy.
 */
import { createIsland } from "@moku-labs/web/browser";
import { relativeTimeFrom } from "../lib/relative-time";

/**
 * Rewrite the "last commit" `<time>` text from its `datetime` attribute.
 *
 * @param element - The mounted status-bar element.
 * @example
 * refreshLastCommit(document.querySelector('[data-island="status"]'));
 */
function refreshLastCommit(element: Element): void {
  const time = element.querySelector("time[datetime]");
  const iso = time?.getAttribute("datetime");
  if (time && iso !== null && iso !== undefined) {
    time.textContent = relativeTimeFrom(iso, Date.now());
  }
}

/** Status island: refreshes the "last commit" age whenever the status bar mounts. */
export const status = createIsland("status", {
  /**
   * Recompute the relative age when the status bar mounts (initial load or SPA navigation).
   *
   * @param context - The island lifecycle context (`el` is the status-bar element).
   * @example
   * onMount(context);
   */
  onMount(context) {
    refreshLastCommit(context.el);
  }
});
