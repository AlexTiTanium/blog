/**
 * @file Pure relative-time formatter for the status bar's "last commit" indicator. Browser-safe
 * (shared by the SSG/SPA render and the `status` island). The terse terminal-flavored output
 * ("2h ago") is deliberately English UI chrome (locale-invariant by design) — not i18n material.
 */

/** Milliseconds per unit paired with its terminal-style suffix, largest unit first. */
const UNITS: readonly (readonly [ms: number, suffix: string])[] = [
  [365 * 24 * 60 * 60 * 1000, "y"],
  [30 * 24 * 60 * 60 * 1000, "mo"],
  [24 * 60 * 60 * 1000, "d"],
  [60 * 60 * 1000, "h"],
  [60 * 1000, "m"]
];

/**
 * Format how long ago an ISO-8601 instant was, terminal-style ("2h ago", "3d ago").
 *
 * Sub-minute distances AND future instants both yield `"just now"` — a "last commit" can only be
 * in the future through clock skew (or the e2e suite's frozen `page.clock`), and clamping keeps
 * the indicator truthful-looking instead of printing a negative age.
 *
 * @param iso - The past instant as an ISO-8601 string (e.g. a git committer date).
 * @param now - The current time in epoch milliseconds (`Date.now()`).
 * @returns The formatted distance, or `"n/a"` when `iso` does not parse.
 * @example
 * relativeTimeFrom("2026-06-11T10:00:00Z", Date.parse("2026-06-11T12:00:00Z")); // "2h ago"
 */
export function relativeTimeFrom(iso: string, now: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "n/a";

  const elapsed = now - then;
  for (const [ms, suffix] of UNITS) {
    if (elapsed >= ms) return `${Math.floor(elapsed / ms)}${suffix} ago`;
  }
  return "just now";
}
