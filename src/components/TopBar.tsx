/**
 * IDE title bar component.
 * Renders the top bar with a quote and window control dots.
 */

interface Props {
  quote: string;
}

/** Render the IDE title bar with a quote and window control dots. */
export function TopBar({ quote }: Props) {
  return (
    <div data-component="titlebar">
      <span data-title>{quote}</span>
      <div data-dots>
        <span data-dot="red"></span>
        <span data-dot="yellow"></span>
        <span data-dot="green"></span>
      </div>
    </div>
  );
}
