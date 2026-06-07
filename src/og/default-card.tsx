/**
 * @file Site-level OG card template — the DEFAULT Open Graph image for every route that does not
 * supply its own (home, archive, about, tags, paged listings) and for the bare-domain redirect.
 * Passed to `build.ogImage.defaultCard` in `src/app.ts`; the framework renders it ONCE per build to
 * `dist/og-default.png` (same Satori → resvg pipeline + fonts as the per-article `OgTemplate`), so the
 * app ships NO renderer of its own. Reproduces the home hero (`const GeekLife = {}` + tagline) in the
 * Dev Dashboard Warm Syntax theme — identity comes from the framework-supplied `siteName`/`description`
 * (sourced from the `site` plugin), never hardcoded. Pure Preact — Satori consumes the VNode directly.
 */
import type { Build } from "@moku-labs/web";

/**
 * Warm Syntax theme tokens mirrored from `src/styles/tokens.css` + `hero.css` so the card matches the
 * live home hero: keyword=orange, function=amber, string=lime, comment=dim lime.
 */
const COLORS = {
  bg: "#1c1917", // --color-stone-950
  accent: "#f59e0b", // --accent-primary / hero "function" (amber-500)
  keyword: "#f97316", // --accent-secondary / hero "keyword" (orange-500)
  string: "#84cc16", // --accent-success / hero "string" (lime-500)
  comment: "rgba(132, 204, 22, 0.7)", // hero "comment" — dim lime
  muted: "#8a7e72", // --color-stone-500
  border: "#292524"
} as const;

/**
 * Render the site-default OG card (1200×630) — the home-hero code motif with the site name and
 * tagline taken from the framework-supplied {@link Build.RichOgInput}.
 *
 * @param input - The rich OG input; `siteName` + `description` carry the site identity.
 * @returns A Preact VNode describing the card, consumed by Satori.
 * @example
 * OgDefaultCard(input); // <div>…</div>
 */
export function OgDefaultCard(input: Build.RichOgInput) {
  // Home-hero identifier: the site name with whitespace stripped (e.g. "Geek Life" → "GeekLife").
  const identifier = input.siteName.replace(/\s+/g, "");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.bg,
        padding: "60px",
        fontFamily: "IBM Plex Mono"
      }}
    >
      {/* Top: blog name in amber — mirrors the article card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "28px",
          color: COLORS.accent,
          letterSpacing: "0.05em"
        }}
      >
        {`// ${input.siteName}`}
      </div>
      {/* Decorative border line */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "2px",
          backgroundColor: COLORS.border,
          marginTop: "24px"
        }}
      />
      {/* Middle: the home-hero code motif `const GeekLife = {}` */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          fontSize: "72px",
          fontWeight: 700
        }}
      >
        <span style={{ display: "flex", color: COLORS.keyword }}>const</span>
        <span style={{ display: "flex", color: COLORS.accent, marginLeft: "24px" }}>
          {identifier}
        </span>
        <span style={{ display: "flex", color: COLORS.muted, marginLeft: "24px" }}>=</span>
        <span style={{ display: "flex", color: COLORS.string, marginLeft: "24px" }}>{"{}"}</span>
      </div>
      {/* Bottom: tagline as a code comment */}
      <div
        style={{ display: "flex", alignItems: "center", fontSize: "26px", color: COLORS.comment }}
      >
        {`// ${input.description}`}
      </div>
    </div>
  );
}
