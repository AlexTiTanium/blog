/**
 * Social share buttons for article pages.
 * Pure SSG render -- no inline script. Copy-to-clipboard behavior is handled
 * by the ShareButtons vanilla TS island via the component lifecycle system.
 */

interface Props {
  url: string;
  title: string;
}

/** Render social share buttons for the given article URL and title. */
export function ShareButtons({ url, title }: Props) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div data-component="share">
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
