/**
 * @file dashboard island — retires the one-shot card entrance once it has played.
 * Mounts on `[data-island="dashboard"]` (the bento grid, re-mounted per navigation).
 *
 * The cards enter via the CSS `card-enter` animation (staggered, `fill: both`). Left in
 * place, that animation is a latent bug: browsers suspend CSS animations of offscreen
 * elements (WebKit) or defer their compositor start times (Chromium), and when that
 * bookkeeping resumes mid-scroll a card can be thrown back into the animation's
 * backwards-fill phase — `opacity: 0`, a blank grid slot for up to ~1.4s before it fades
 * back in. So once the entrance window has passed, this island stamps `data-entered` on
 * the grid and DashboardGrid.css drops `animation` from the cards entirely: cancelling a
 * finished fill-mode animation is visually a no-op (the natural style is already the end
 * state), and a still-suspended offscreen card snaps to its natural visible state.
 */
import { createIsland } from "@moku-labs/web/browser";

/**
 * How long after mount the entrance is considered settled. The slowest card finishes at
 * `10 × --stagger-delay (80ms) + --duration-enter (600ms)` = 1400ms (see tokens.css);
 * 200ms of headroom absorbs paint/hydration jitter.
 */
const ENTRANCE_SETTLE_MS = 1600;

/** Pending settle timer per mounted grid (cleared if the grid unmounts mid-entrance). */
const settleTimers = new WeakMap<Element, ReturnType<typeof setTimeout>>();

/**
 * Mark the grid's entrance as played so the card animation can be removed.
 *
 * @param element - The mounted dashboard grid element.
 * @example
 * markEntered(document.querySelector('[data-island="dashboard"]'));
 */
function markEntered(element: HTMLElement): void {
  element.dataset["entered"] = "";
}

/** Dashboard island: stamps `data-entered` after the card entrance window. */
export const dashboard = createIsland("dashboard", {
  /**
   * Schedule the entrance retirement when the grid mounts.
   *
   * @param context - The island lifecycle context (`el` is the grid).
   * @example
   * onMount(context);
   */
  onMount(context) {
    if (!(context.el instanceof HTMLElement)) return;
    const grid = context.el;
    const timer = setTimeout(() => markEntered(grid), ENTRANCE_SETTLE_MS);
    settleTimers.set(grid, timer);
  },
  /**
   * Cancel a pending settle timer if the grid is swapped out mid-entrance.
   *
   * @param context - The island lifecycle context (`el` is the grid).
   * @example
   * onUnMount(context);
   */
  onUnMount(context) {
    const timer = settleTimers.get(context.el);
    if (timer !== undefined) clearTimeout(timer);
    settleTimers.delete(context.el);
  }
});
