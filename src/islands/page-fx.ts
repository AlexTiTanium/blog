/**
 * @file page-fx island — gives the swapped page content a subtle "arrive" motion after each SPA
 * navigation. View transitions are OFF (instant swap), so this is a plain Web Animations API
 * tween on the new `main > section` — NOT a View Transition. That matters: there is no snapshot,
 * so none of the scroll-before-snapshot flash, and the persistent sticky header is never touched.
 * Mounts on `<main data-island="page-fx">` (persistent — outside the swap region — so its
 * `onNavEnd` fires after every navigation).
 */
import { createIsland } from "@moku-labs/web/browser";

/** Fade + slight upward rise for the incoming content. */
const ENTER_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateY(6px)" },
  { opacity: 1, transform: "translateY(0)" }
];

/** Timing for the content-arrive motion (--ease-out-expo). */
const ENTER_TIMING: KeyframeAnimationOptions = {
  duration: 220,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)"
};

/**
 * Whether the user has asked to minimise motion.
 *
 * @returns `true` when `(prefers-reduced-motion: reduce)` matches.
 * @example
 * if (prefersReducedMotion()) return;
 */
function prefersReducedMotion(): boolean {
  return globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Replay the content-arrive animation on the live swap region (`main > section`).
 *
 * @param main - The mounted `<main>` element.
 * @example
 * animateContentIn(document.querySelector("main"));
 */
function animateContentIn(main: Element): void {
  if (prefersReducedMotion()) return;
  const section = main.querySelector(":scope > section");
  section?.animate(ENTER_KEYFRAMES, ENTER_TIMING);
}

/** page-fx island: replays a subtle content-arrive animation after each navigation. */
export const pageFx = createIsland("page-fx", {
  /**
   * Animate the freshly-swapped content in after each SPA navigation.
   *
   * @param context - The island lifecycle context (`el` is the `<main>` element).
   * @example
   * onNavEnd(context);
   */
  onNavEnd(context) {
    animateContentIn(context.el);
  }
});
