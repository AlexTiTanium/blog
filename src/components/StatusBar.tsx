/**
 * Build status indicators component.
 * Renders status dots on the home page (build, posts count, last commit).
 */

interface Props {
  articleCount: number;
}

/** Render build status indicators with article count. */
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
