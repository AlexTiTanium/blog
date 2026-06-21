/**
 * @file Build-status indicators for the home page (build / posts count / last commit). The labels
 * are deliberately code/terminal-flavored English UI chrome (locale-invariant by design).
 *
 * "last commit" follows the design's git metaphor — posts ARE the commits (`post/NNN`) — so it
 * shows the newest article's age inside a `<time datetime>`. The SSG'd text is the age at BUILD;
 * the `status` island (src/islands/status.ts) recomputes it from the `datetime` attribute on
 * mount, so a statically served page shows the age as of the visit.
 */
import { relativeTimeFrom } from "../lib/relative-time";

/** Props for {@link StatusBar}. */
interface Props {
  /** Total article count shown in the "posts" indicator. */
  articleCount: number;
  /** Newest article's date (ISO, from frontmatter) — the "last commit" of the content repo. */
  latestPostDate?: string | undefined;
}

/**
 * Render the build-status indicators with the article count and latest-post age.
 *
 * @param props - The total article count + the newest article's date.
 * @returns The status-indicator row.
 */
export function StatusBar({ articleCount, latestPostDate }: Props) {
  return (
    <div data-island="status">
      <span data-item>
        <span data-dot="green"></span>
        build: passing
      </span>
      <span data-item>
        <span data-dot="amber"></span>
        posts: {articleCount}
      </span>
      <span data-item>
        <span data-dot="coral"></span>
        last commit:
        {/* The flex item strips the inter-node space — StatusBar.css restores it via margin. */}
        {latestPostDate === undefined ? (
          <span data-time>n/a</span>
        ) : (
          <time data-time dateTime={latestPostDate}>
            {relativeTimeFrom(latestPostDate, Date.now())}
          </time>
        )}
      </span>
    </div>
  );
}
