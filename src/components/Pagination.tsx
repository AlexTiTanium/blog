/**
 * @file Reusable pagination — prev/next links plus a windowed set of numbered page links (with
 * `…` ellipses for collapsed runs, so a large page count stays compact). Page 1 uses the clean
 * `baseUrl` (no `/page/1/` suffix). The `< prev` / `next >` glyphs are deliberately code-flavored
 * English UI chrome.
 */

import { pageWindow } from "../lib/articles";

/** Props for {@link Pagination}. */
interface PaginationProps {
  /** 1-based current page. */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** The listing's page-1 URL (with trailing slash), e.g. `/`, `/ru/`, or `/archive/`. */
  baseUrl: string;
}

/**
 * Build the URL for a given page number: page 1 is the listing's `baseUrl`; later pages append
 * `page/N/`. `baseUrl` already carries its trailing slash, so the helpers (`homeUrl`/`archiveUrl`)
 * feed straight in — no string surgery, and the default locale stays bare automatically.
 *
 * @param baseUrl - The listing's page-1 URL (with trailing slash).
 * @param page - 1-based page number.
 * @returns The page URL.
 * @example
 * pageUrl("/archive/", 2); // "/archive/page/2/"
 * pageUrl("/", 2); // "/page/2/"
 */
function pageUrl(baseUrl: string, page: number): string {
  if (page === 1) return baseUrl;
  return `${baseUrl}page/${page}/`;
}

/**
 * Render pagination controls with prev/next and numbered page links.
 *
 * @param props - Current page, total pages, and the listing base URL.
 * @returns The pagination nav, or `null` when there is only one page.
 */
export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = pageWindow(currentPage, totalPages);

  return (
    <nav data-island="pagination" aria-label="Pagination">
      <a
        data-prev
        href={currentPage > 1 ? pageUrl(baseUrl, currentPage - 1) : undefined}
        aria-disabled={currentPage <= 1 ? true : undefined}
        data-hidden={currentPage <= 1 ? true : undefined}
        aria-label="Previous page"
      >
        {"< prev"}
      </a>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} data-ellipsis aria-hidden="true">
            …
          </span>
        ) : (
          <a
            key={item}
            data-page
            href={pageUrl(baseUrl, item)}
            {...(item === currentPage ? { "aria-current": "page", "data-active": true } : {})}
          >
            {item}
          </a>
        )
      )}

      <a
        data-next
        href={currentPage < totalPages ? pageUrl(baseUrl, currentPage + 1) : undefined}
        aria-disabled={currentPage >= totalPages ? true : undefined}
        data-hidden={currentPage >= totalPages ? true : undefined}
        aria-label="Next page"
      >
        {"next >"}
      </a>
    </nav>
  );
}
