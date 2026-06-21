/**
 * @file IDE status-bar footer — the bottom bar matching a VS Code-style status bar.
 */
import { REPOS, SITE } from "../config";

/**
 * Render the GitHub mark (octocat) icon used inside the footer's source-repo chips.
 *
 * @returns The inline SVG icon (decorative; the chip label carries the meaning).
 */
function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/**
 * Render the VS Code-style status-bar footer.
 *
 * The right side links the source repos as GitHub chips. Labels with a `data-long`/
 * `data-short` pair swap to the short form on narrow viewports (CSS-driven).
 *
 * @returns The footer chrome.
 */
export function Footer() {
  return (
    <footer data-island="footer">
      <div data-part="left">
        <span data-item>
          <span data-dot="green"></span>
          {SITE.name}
        </span>
        <span data-item="branch">main*</span>
      </div>
      <div data-part="right">
        <a data-chip href={REPOS.blog} target="_blank" rel="noopener noreferrer">
          <GitHubMark />
          blog
        </a>
        <a data-chip href={REPOS.web} target="_blank" rel="noopener noreferrer">
          <GitHubMark />
          <span data-long>moku/web</span>
          <span data-short>web</span>
        </a>
        <a data-chip href={REPOS.core} target="_blank" rel="noopener noreferrer">
          <GitHubMark />
          <span data-long>moku/core</span>
          <span data-short>core</span>
        </a>
      </div>
    </footer>
  );
}
