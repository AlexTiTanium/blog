/**
 * @file Dev-humor quote rotation for the title bar. Deterministic selection seeded by date + hour,
 * so the same quote shows on every page within a given hour. Called client-side by the title-bar
 * island on mount and after SPA navigation.
 */

/** The pool of developer-humor quotes shown in the title bar. */
export const QUOTES: readonly string[] = [
  "// TODO: write actual code",
  "git push --force (and pray)",
  "it works on my machine",
  "404: motivation not found",
  "sudo make me a sandwich",
  "my code works. I have no idea why.",
  "LGTM (didn't read the diff)",
  "rm -rf node_modules && npm i // the universal fix"
];

/**
 * Select a quote deterministically from the date + hour (YYYYMMDDHH seed modulo pool length), so
 * the same quote is returned for every call within a given hour.
 *
 * @returns A developer-humor quote string.
 * @example
 * pickQuote(); // e.g. "it works on my machine"
 */
export function pickQuote(): string {
  const now = new Date();
  const seed =
    now.getFullYear() * 1_000_000 +
    (now.getMonth() + 1) * 10_000 +
    now.getDate() * 100 +
    now.getHours();
  return QUOTES[seed % QUOTES.length] ?? "// TODO: write actual code";
}
