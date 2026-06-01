/**
 * Reusable pagination navigation component.
 * Renders prev/next links and numbered page links with terminal aesthetic.
 * Page 1 uses clean baseUrl (no /page/1/ suffix).
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

/** Build the URL for a given page number. */
function pageUrl(baseUrl: string, page: number): string {
  if (page === 1) return `${baseUrl}/`;
  return `${baseUrl}/page/${page}/`;
}

/** Render pagination controls with prev/next and numbered page links. */
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
