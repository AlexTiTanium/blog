/**
 * @file Social share buttons for article pages. Pure SSG markup — no inline script; the
 * copy-to-clipboard button is wired by the share-buttons vanilla-TS island.
 */

/** Props for {@link ShareButtons}. */
interface Props {
  /** Canonical article URL to share / copy. */
  url: string;
  /** Article title (used as the share text). */
  title: string;
}

/**
 * Render the social share bar for an article.
 *
 * @param props - The article URL and title.
 * @returns The share-button group.
 */
export function ShareButtons({ url, title }: Props) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div data-island="share">
      <span data-label>Share:</span>

      <a
        href={`https://twitter.com/share?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        data-share
        aria-label="Share on Twitter"
      >
        X
      </a>

      <a
        href={`https://www.linkedin.com/shareArticle?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        data-share
        aria-label="Share on LinkedIn"
      >
        LinkedIn
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        data-share
        aria-label="Share on Facebook"
      >
        Facebook
      </a>

      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        data-share
        aria-label="Share on Telegram"
      >
        Telegram
      </a>

      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        data-share
        aria-label="Share on WhatsApp"
      >
        WhatsApp
      </a>

      <a
        href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        data-share
        aria-label="Share on Reddit"
      >
        Reddit
      </a>

      <button type="button" data-share="copy" data-copy-url={url} aria-label="Copy link">
        Copy
      </button>
    </div>
  );
}
