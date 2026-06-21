/**
 * @file IDE title-bar — the top bar with a dev-humor quote and window control dots.
 */

/** Props for {@link TopBar}. */
interface Props {
  /** The quote shown in the title bar (rotated client-side by the title-bar island). */
  quote: string;
}

/**
 * Render the IDE title bar with a quote and window control dots.
 *
 * @param props - The quote to display.
 * @returns The title-bar chrome.
 */
export function TopBar({ quote }: Props) {
  return (
    <div data-island="titlebar">
      <span data-title>{quote}</span>
      <div data-dots>
        <span data-dot="red"></span>
        <span data-dot="yellow"></span>
        <span data-dot="green"></span>
      </div>
    </div>
  );
}
