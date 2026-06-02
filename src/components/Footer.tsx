/**
 * @file IDE status-bar footer — the bottom bar matching a VS Code-style status bar.
 */
import { SITE } from "../config";

/**
 * Render the VS Code-style status-bar footer.
 *
 * @returns The footer chrome.
 */
export function Footer() {
  return (
    <footer data-component="footer">
      <div data-part="left">
        <span data-item>
          <span data-dot="green"></span>
          {SITE.name}
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
