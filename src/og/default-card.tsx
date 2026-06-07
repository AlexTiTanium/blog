/**
 * @file Site-level OG card template — the DEFAULT Open Graph image for every route that does not
 * supply its own (home, archive, about, tags, paged listings) and for the bare-domain redirect.
 * Passed to `build.ogImage.defaultCard` in `src/app.ts`; the framework renders it ONCE per build to
 * `dist/og-default.png` (same Satori → resvg pipeline + fonts as the per-article `OgTemplate`), so the
 * app ships NO renderer of its own. A mini terminal window (shared chrome in ./chrome): a left accent
 * bar + a `$ <quote>` titlebar (the rotating dev quote, exactly like the live site's title bar) +
 * traffic-light dots, the home-hero `const GeekLife = {}` motif, and the tagline. The quote rotates
 * build-to-build via {@link pickQuote} (same pool as the title bar) and also seeds the accent color.
 * Identity comes from the framework-supplied `siteName`/`description`, never hardcoded.
 */
import type { Build } from "@moku-labs/web";
import { pickQuote } from "../lib/quotes";
import { AccentBar, OG_COLORS, pickAccent, TrafficDots } from "./chrome";

/**
 * Render the site-default OG card (1200×630): a terminal window with a left accent bar, a `$ <quote>`
 * titlebar + traffic-light dots, the home-hero code motif, and the tagline. Identity (`siteName`,
 * `description`) comes from the framework-supplied {@link Build.RichOgInput}; the quote rotates per
 * build via {@link pickQuote} (the same pool the title bar shows) and seeds the accent color.
 *
 * @param input - The rich OG input; `siteName` + `description` carry the site identity.
 * @returns A Preact VNode describing the card, consumed by Satori.
 * @example
 * OgDefaultCard(input); // <div>…</div>
 */
export function OgDefaultCard(input: Build.RichOgInput) {
  // Home-hero identifier: the site name with whitespace stripped (e.g. "Geek Life" → "GeekLife").
  const identifier = input.siteName.replace(/\s+/g, "");
  const quote = pickQuote();
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: OG_COLORS.bg,
        fontFamily: "IBM Plex Mono"
      }}
    >
      {AccentBar(pickAccent(quote))}

      {/* Content column */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "56px 60px" }}>
        {/* Terminal titlebar: the rotating dev quote (like the live title bar) + traffic-light dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "24px" }}>
            <span style={{ display: "flex", color: OG_COLORS.string }}>$</span>
            <span style={{ display: "flex", color: OG_COLORS.muted, marginLeft: "14px" }}>
              {quote}
            </span>
          </div>
          {TrafficDots()}
        </div>

        {/* Decorative border line */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "2px",
            backgroundColor: OG_COLORS.border,
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
          <span style={{ display: "flex", color: OG_COLORS.keyword }}>const</span>
          <span style={{ display: "flex", color: OG_COLORS.accent, marginLeft: "24px" }}>
            {identifier}
          </span>
          <span style={{ display: "flex", color: OG_COLORS.muted, marginLeft: "24px" }}>=</span>
          <span style={{ display: "flex", color: OG_COLORS.string, marginLeft: "24px" }}>
            {"{}"}
          </span>
        </div>

        {/* Tagline as a code comment */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "26px",
            color: OG_COLORS.comment
          }}
        >
          {`// ${input.description}`}
        </div>
      </div>
    </div>
  );
}
