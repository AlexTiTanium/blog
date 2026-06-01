/**
 * IDE status bar footer component.
 * Renders the bottom bar matching VS Code-style status bar.
 */

/** Render the VS Code-style status bar footer. */
export function Footer() {
  return (
    <footer data-component="footer">
      <div data-part="left">
        <span data-item>
          <span data-dot="green"></span>
          Geek Life
        </span>
        <span data-item>main*</span>
      </div>
      <div data-part="right">
        <span data-item>UTF-8</span>
        <span data-item>Spaces: 2</span>
        <span data-item>TypeScript</span>
      </div>
    </footer>
  );
}
