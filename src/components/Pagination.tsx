/**
 * @file Reusable pagination — prev/next links plus numbered page links in the terminal aesthetic.
 * Page 1 uses the clean `baseUrl` (no `/page/1/` suffix). The `<< prev` / `next >>` glyphs are
 * deliberately code-flavored English UI chrome.
 */

/** Props for {@link Pagination}. */
interface PaginationProps {
  /** 1-based current page. */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Listing base URL without a trailing slash (e.g. `/en` or `/en/archive`). */
  baseUrl: string;
}

/**
 * Build the URL for a given page number (page 1 = the clean base, others get `/page/N/`).
 *
 * @param baseUrl - Listing base URL without a trailing slash.
 * @param page - 1-based page number.
 * @returns The page URL.
 * @example
 * pageUrl("/en/archive", 2); // "/en/archive/page/2/"
 */
function pageUrl(baseUrl: string, page: number): string {
  if (page === 1) return `${baseUrl}/`;
  return `${baseUrl}/page/${page}/`;
}

/**
 * Render pagination controls with prev/next and numbered page links.
 *
 * @param props - Current page, total pages, and the listing base URL.
 * @returns The pagination nav, or `null` when there is only one page.
 */
export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav data-component="pagination" aria-label="Pagination">
      {/* biome-ignore lint/a11y/useAnchorContent: aria-label provides the accessible name; conditional aria-hidden is intentional for disabled state */}
      <a
        data-prev
        href={currentPage > 1 ? pageUrl(baseUrl, currentPage - 1) : undefined}
        aria-hidden={currentPage <= 1 ? true : undefined}
        data-hidden={currentPage <= 1 ? true : undefined}
        aria-label="Previous page"
      >
        {"<< prev"}
      </a>

      {pages.map(page => (
        <a
          key={page}
          data-page
          href={pageUrl(baseUrl, page)}
          {...(page === currentPage ? { "aria-current": "page", "data-active": true } : {})}
        >
          {page}
        </a>
      ))}

      {/* biome-ignore lint/a11y/useAnchorContent: aria-label provides the accessible name; conditional aria-hidden is intentional for disabled state */}
      <a
        data-next
        href={currentPage < totalPages ? pageUrl(baseUrl, currentPage + 1) : undefined}
        aria-hidden={currentPage >= totalPages ? true : undefined}
        data-hidden={currentPage >= totalPages ? true : undefined}
        aria-label="Next page"
      >
        {"next >>"}
      </a>
    </nav>
  );
}
