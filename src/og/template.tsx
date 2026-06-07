/**
 * @file Per-article OG card renderer — returns a Preact VNode consumed by `build.ogImage.render`
 * (@moku-labs/web casts the VNode to Satori's input at its single render boundary). A terminal window
 * in the Dev Dashboard Warm Syntax theme sharing the chrome (left accent bar + traffic-light dots)
 * with the site default card (./default-card, ./chrome): a `● published` status + dots titlebar, the
 * article title, and a date + tags footer. Fonts (IBM Plex Mono latin+cyrillic 400/700) are loaded
 * once per build from `build.ogImage.fonts`. Satori requires `display:flex` on every node with children.
 */
import type { Build } from "@moku-labs/web";
import { AccentBar, OG_COLORS, pickAccent, TrafficDots } from "./chrome";

/** Maximum number of tags shown in the OG card footer (extras are dropped to keep one line). */
const OG_MAX_TAGS = 4;

/** Maximum description length on the card before it is truncated with an ellipsis (keeps ~2 lines). */
const OG_MAX_DESCRIPTION = 120;

/**
 * Truncate a description to {@link OG_MAX_DESCRIPTION} chars, appending an ellipsis when cut, so a long
 * summary stays to ~2 lines on the card.
 *
 * @param text - The article description.
 * @returns The original text, or a trimmed prefix + "…" when it exceeds the limit.
 */
function shorten(text: string): string {
  if (text.length <= OG_MAX_DESCRIPTION) return text;
  return `${text.slice(0, OG_MAX_DESCRIPTION - 1).trimEnd()}…`;
}

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
 * Render the OG card for one article: a `● published` + dots titlebar, the article title, and a
 * date + tags footer, framed by the shared left accent bar.
 *
 * @param input - Rich OG input (title/description/date/tags/author/locale/siteName/size).
 * @returns A Preact VNode describing the card (1200×630 by default).
 * @example
 * OgTemplate({ title: "Hi", description: "", date: "2026-01-01", tags: ["x"], locale: "en", siteName: "Geek Life", size: { width: 1200, height: 630 } });
 */
export function OgTemplate(input: Build.RichOgInput) {
  const tagLine = input.tags.slice(0, OG_MAX_TAGS).join(" · ");
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
      {AccentBar(pickAccent(input.title))}

      {/* Content column */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "56px 60px" }}>
        {/* Terminal titlebar: "● published" status (left) + traffic-light dots (right) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: OG_COLORS.green
              }}
            />
            <span
              style={{
                display: "flex",
                marginLeft: "14px",
                fontSize: "24px",
                color: OG_COLORS.muted,
                letterSpacing: "0.05em"
              }}
            >
              published
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

        {/* Middle: article title + short description, vertically centered */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            marginTop: "20px"
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "48px",
              fontWeight: 700,
              color: OG_COLORS.text,
              lineHeight: 1.3
            }}
          >
            {input.title}
          </div>
          {input.description ? (
            <div
              style={{
                display: "flex",
                marginTop: "22px",
                maxWidth: "980px",
                fontSize: "24px",
                color: OG_COLORS.muted,
                lineHeight: 1.4
              }}
            >
              {shorten(input.description)}
            </div>
          ) : null}
        </div>

        {/* Bottom: date + tags in muted color */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "20px",
            color: OG_COLORS.muted
          }}
        >
          <span style={{ display: "flex" }}>{formatDate(input.date, input.locale)}</span>
          {tagLine ? (
            <span style={{ display: "flex", color: OG_COLORS.border, marginLeft: "16px" }}>|</span>
          ) : null}
          {tagLine ? <span style={{ display: "flex", marginLeft: "16px" }}>{tagLine}</span> : null}
        </div>
      </div>
    </div>
  );
}
