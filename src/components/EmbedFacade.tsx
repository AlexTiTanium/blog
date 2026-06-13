/**
 * @file `::embed` facade — the static, click-to-activate placeholder rendered in
 * place of an embedded iframe until the reader clicks. Passed to the content
 * plugin as `embed.facade` (src/app.ts); the `@moku-labs/web` framework owns the
 * surrounding `<figure class="lazy-embed">` (island hooks + reserved-box sizing)
 * and SSR-renders this inner content to static markup at build time — it never
 * hydrates, so it stays presentational. The `lazyEmbed` island swaps the whole
 * facade for the real iframe on a click anywhere inside it.
 *
 * Terminal aesthetic, locale-invariant by design (the `$ run` / `[click to
 * load]` chrome is part of the IDE look, not translated content). Styles live in
 * EmbedFacade.css, scoped to the article body.
 */
import type { EmbedFacadeProps } from "@moku-labs/web";

/**
 * Decorative play glyph shown in the facade's launch ring.
 *
 * @returns The inline play-triangle SVG (decorative; the label carries meaning).
 */
function PlayGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d="M4.5 2.5v11l9-5.5z" />
    </svg>
  );
}

/**
 * Render the embed facade's inner content: a launch button with a play ring, the
 * embed title, and a terminal-style command + hint.
 *
 * @param props - The embed facade props (the title is shown; `attributes` carries any extra options).
 * @returns The facade launch button.
 */
export function EmbedFacade({ title }: EmbedFacadeProps) {
  return (
    <button type="button" data-launch aria-label={`Load embed: ${title}`}>
      <span data-ring aria-hidden="true">
        <PlayGlyph />
      </span>
      <span data-label>{title}</span>
      <span data-cmd aria-hidden="true">
        $ run --interactive
      </span>
      <span data-hint aria-hidden="true">
        [click to load]
      </span>
    </button>
  );
}
