/**
 * @file OG card renderer — returns a Preact VNode consumed by `build.ogImage.render`
 * (@moku-labs/web@0.4.1 casts the VNode to Satori's input at its single render boundary).
 *
 * Ports the legacy rich card (blog name + title + date + tags) in the Dev Dashboard Warm
 * Syntax theme. Satori requires an explicit `display: "flex"` on every node that has
 * children, so each wrapper sets it. Fonts (IBM Plex Mono latin+cyrillic 400/700) are loaded
 * once per build from `build.ogImage.fonts`.
 */
import type { Build } from "@moku-labs/web";

/** Dev Dashboard Warm Syntax theme tokens (match the legacy OG card). */
const COLORS = {
  bg: "#1c1917",
  text: "#f5efe8",
  accent: "#f59e0b",
  muted: "#8a7e72",
  border: "#292524"
} as const;

/**
 * Format an ISO publication date for the card footer, localized to the active locale.
 * Falls back to the raw string if the date cannot be parsed.
 *
 * @param iso - ISO date string from article frontmatter.
 * @param locale - Active locale (e.g. "en", "ru").
 * @returns A human-readable date (e.g. "January 15, 2026") or the raw input on failure.
 */
function formatDate(iso: string, locale: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(
    parsed
  );
}

/**
 * Render the OG card for one article.
 *
 * @param input - Rich OG input (title/description/date/tags/author/locale/siteName/size).
 * @returns A Preact VNode describing the card (1200×630 by default).
 * @example
 * OgTemplate({ title: "Hi", description: "", date: "2026-01-01", tags: ["x"], locale: "en", siteName: "Geek Life", size: { width: 1200, height: 630 } });
 */
export function OgTemplate(input: Build.RichOgInput) {
  const tagLine = input.tags.slice(0, 4).join(" · ");
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
      {/* Top: blog name in amber */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "24px",
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
      {/* Middle: article title */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          fontSize: "48px",
          fontWeight: 700,
          color: COLORS.text,
          lineHeight: 1.3,
          marginTop: "20px"
        }}
      >
        {input.title}
      </div>
      {/* Bottom: date + tags in muted color */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: "20px",
          color: COLORS.muted
        }}
      >
        <span style={{ display: "flex" }}>{formatDate(input.date, input.locale)}</span>
        {tagLine ? <span style={{ display: "flex", color: COLORS.border }}>|</span> : null}
        {tagLine ? <span style={{ display: "flex" }}>{tagLine}</span> : null}
      </div>
    </div>
  );
}
