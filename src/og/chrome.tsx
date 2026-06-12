/**
 * @file Shared OG-card chrome — the warm-syntax theme tokens plus the terminal-window bits (a
 * seedable left accent bar + the traffic-light titlebar dots) reused by BOTH the per-article card
 * (./template) and the site default card (./default-card), so the two stay visually consistent. Pure
 * Preact — Satori consumes the returned VNodes directly (every node with children sets `display:flex`).
 */
import type { VNode } from "preact";

/**
 * Warm Syntax theme tokens mirrored from `src/styles/tokens.css` + `hero.css` so the cards match the
 * live site: keyword=orange, function=amber, string=lime, comment=dim lime, and the traffic-light
 * dots (red=danger/rose, yellow=primary/amber, green=success/lime — see `TopBar.css [data-dot]`).
 */
export const OG_COLORS = {
  bg: "#1c1917", // --color-stone-950
  text: "#f5efe8", // --color-stone-100
  accent: "#f59e0b", // --accent-primary / hero "function" (amber-500)
  keyword: "#f97316", // --accent-secondary / hero "keyword" (orange-500)
  string: "#84cc16", // --accent-success / hero "string" (lime-500)
  comment: "rgba(132, 204, 22, 0.7)", // hero "comment" — dim lime
  muted: "#968b80", // --color-stone-500
  border: "#292524", // --color-stone-850-ish
  red: "#f43f5e", // --accent-danger (rose-500) — titlebar dot
  yellow: "#f59e0b", // --accent-primary (amber-500) — titlebar dot
  green: "#84cc16" // --accent-success (lime-500) — titlebar dot
} as const;

/**
 * The 7 left-border accent colors the dashboard cards cycle through (`DashboardGrid.css`
 * `article:nth-child(7n + …)`): primary/success/secondary/danger/function/type/soft. Used by
 * {@link pickAccent} so each OG card's left bar varies the same way the site cards do.
 */
export const OG_ACCENTS = [
  "#f59e0b", // --accent-primary (amber-500)
  "#84cc16", // --accent-success (lime-500)
  "#f97316", // --accent-secondary (orange-500)
  "#f43f5e", // --accent-danger (rose-500)
  "#fde68a", // --accent-function (amber-200)
  "#fdba74", // --accent-type (orange-200)
  "#fda4af" // --accent-soft (rose-200)
] as const;

/**
 * Pick one of {@link OG_ACCENTS} deterministically from a seed string (a cheap string hash), so a
 * given seed always maps to the same color — stable per article (seed by title) yet varied across
 * the set, mirroring the dashboard's cycling card accents.
 *
 * @param seed - The string to hash (e.g. an article title, or the rotating quote for the default card).
 * @returns A hex accent color from {@link OG_ACCENTS}.
 * @example
 * pickAccent("Bad Monday"); // e.g. "#f43f5e"
 */
export function pickAccent(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return OG_ACCENTS[hash % OG_ACCENTS.length] ?? OG_COLORS.accent;
}

/**
 * The full-height left accent bar — the `border-left: 3px solid var(--accent-…)` motif from our site
 * cards, scaled up (12px) for the OG canvas. Place as the first child of a `flex-row` card.
 *
 * @param color - The bar color (typically {@link pickAccent}).
 * @returns A Preact VNode for the accent bar.
 * @example
 * AccentBar("#f59e0b"); // <div style="width:12px;height:100%;background:#f59e0b">
 */
export function AccentBar(color: string): VNode {
  return <div style={{ display: "flex", width: "12px", height: "100%", backgroundColor: color }} />;
}

/**
 * The three traffic-light titlebar dots (red/yellow/green), nudged up 15px so they sit level with the
 * titlebar text rather than its baseline. Mirrors the site's `TopBar` window dots.
 *
 * @returns A Preact VNode wrapping the three dots.
 * @example
 * TrafficDots(); // <div>● ● ●</div>
 */
export function TrafficDots(): VNode {
  const dots = [OG_COLORS.red, OG_COLORS.yellow, OG_COLORS.green];
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: "-15px" }}>
      {dots.map((color, index) => (
        <div
          key={color}
          style={{
            display: "flex",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: color,
            marginLeft: index === 0 ? "0" : "14px"
          }}
        />
      ))}
    </div>
  );
}
