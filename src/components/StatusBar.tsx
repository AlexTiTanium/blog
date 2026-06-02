/**
 * @file Build-status indicators for the home page (build / posts count / last commit). The labels
 * are deliberately code/terminal-flavored English UI chrome (locale-invariant by design).
 */

/** Props for {@link StatusBar}. */
interface Props {
  /** Total article count shown in the "posts" indicator. */
  articleCount: number;
}

/**
 * Render the build-status indicators with the article count.
 *
 * @param props - The total article count.
 * @returns The status-indicator row.
 */
export function StatusBar({ articleCount }: Props) {
  return (
    <div data-component="status">
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
        last commit: 2h ago
      </span>
    </div>
  );
}
