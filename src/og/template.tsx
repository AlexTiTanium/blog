/**
 * @file OG card renderer — returns a Preact VNode consumed by `build.ogImage.render`
 * (@moku-labs/web@0.4.0 casts the VNode to Satori's input at its single render boundary).
 *
 * This is a minimal title-only stub; the build phase (OG port) replaces it with the full
 * legacy rich-card layout (blog name + title + date + tags, warm Dev-Dashboard theme).
 */
import type { Build } from "@moku-labs/web";

/**
 * Render the OG card for one article.
 *
 * @param input - Rich OG input (title/description/date/tags/author/locale/siteName/size).
 * @returns A Preact VNode describing the card.
 * @example
 * OgTemplate({ title: "Hi", description: "", date: "2026-01-01", tags: [], locale: "en", siteName: "Geek Life", size: { width: 1200, height: 630 } });
 */
export function OgTemplate(input: Build.RichOgInput) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", color: "#f5efe8" }}>
      {input.title}
    </div>
  );
}
