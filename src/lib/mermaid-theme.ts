/**
 * @file Custom `warm-mermaid` theme — the diagram counterpart of `warm-syntax`
 * (shiki-theme.ts). Passed to `pluginConfigs.content` (`mermaid.mermaidConfig`) so the
 * build-time-rendered Mermaid SVGs are baked in the same warm palette the code blocks use,
 * instead of mermaid's stock themes. Like Shiki's inline token colors, these are fixed dark
 * values by design — code blocks and diagrams keep the IDE look in both color schemes.
 *
 * Color reference (same palette as shiki-theme.ts / DESIGN-GUIDE.md):
 *   node fill:    #231f1b  (stone-900 — elevated surface)
 *   node border:  #3d3530  (stone-800 — --border-default)
 *   text:         #d4c8b8  (stone-300 — body text)
 *   edges:        #968b80  (stone-500 — muted / punctuation)
 *   label bg:     #181412  (stone-975 — code background)
 */

/**
 * Mermaid configuration mapping the blog's warm palette onto the `base` theme variables.
 * Consumed by `src/app.ts` via `fileSystemContent({ mermaid: { mermaidConfig: warmMermaidTheme } })`.
 *
 * @example
 * ```ts
 * import { warmMermaidTheme } from "./lib/mermaid-theme";
 * fileSystemContent({ trustedContent: true, mermaid: { mermaidConfig: warmMermaidTheme } });
 * ```
 */
export const warmMermaidTheme: Record<string, unknown> = {
  theme: "base",
  themeVariables: {
    // Diagram-wide text + measurement font; matches --font-code so labels render in Fira Code.
    fontFamily: '"Fira Code", "IBM Plex Mono", monospace',
    fontSize: "13px",

    // Surfaces: node fill on the elevated stone, edge-label plates on the code background.
    background: "#181412",
    primaryColor: "#231f1b",
    primaryTextColor: "#d4c8b8",
    primaryBorderColor: "#3d3530",

    // Secondary/tertiary node kinds fall back to the same family so multi-shape
    // diagrams stay monochrome-warm rather than mermaid's default rainbow.
    secondaryColor: "#292420",
    secondaryTextColor: "#d4c8b8",
    secondaryBorderColor: "#3d3530",
    tertiaryColor: "#1c1917",
    tertiaryTextColor: "#d4c8b8",
    tertiaryBorderColor: "#3d3530",

    // Edges and their labels: muted like punctuation, never louder than the nodes.
    lineColor: "#968b80",
    textColor: "#d4c8b8"
  }
};
