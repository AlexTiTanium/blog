/**
 * @file Article sidebar (right pane of the split view) — file info, tags, explorer, and recent
 * posts. The "Explorer"/file-info labels and mock commit hash are deliberately English IDE chrome.
 */

import type { Content } from "@moku-labs/web";
import { SITE } from "../config";
import { type Locale, t } from "../i18n/index";
import { GitTag } from "./GitTag";

/** How many articles the explorer and recent-posts lists show. */
const SIDEBAR_LIST_LIMIT = 5;

/** Placeholder commit hash for the IDE-style file-info panel (decorative, not a real commit). */
const MOCK_COMMIT_HASH = "a1b2c3d";

/** Props for {@link MetaPanel}. */
interface Props {
  /** The article whose metadata is shown. */
  article: Content.Article;
  /** Active locale (for section labels + tag links). */
  locale: Locale;
  /** Newest articles (current excluded) for the "Recent Posts" list. */
  recentArticles: Content.Article[];
  /** Tag-related articles for the "Explorer" what-to-read-next list. */
  relatedArticles: Content.Article[];
}

/**
 * Render the article sidebar with file info, tags, explorer, and recent posts. The Explorer lists
 * tag-related posts ("what to read next"); Recent Posts lists the newest posts — two distinct lists.
 *
 * @param props - The article, active locale, and the related + recent article lists.
 * @returns The sidebar panel.
 */
export function MetaPanel({ article, locale, recentArticles, relatedArticles }: Props) {
  const ui = t(locale);
  const explorerList = relatedArticles.slice(0, SIDEBAR_LIST_LIMIT);
  const recentList = recentArticles.slice(0, SIDEBAR_LIST_LIMIT);

  return (
    <aside data-component="meta-panel">
      <section>
        <h3>{ui.fileInfo}</h3>
        <dl>
          <div>
            <dt>Status</dt>
            <dd data-color="green">{article.computed.status}</dd>
          </div>
          <div>
            <dt>Author</dt>
            <dd>{article.frontmatter.author || SITE.author}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{article.frontmatter.date}</dd>
          </div>
          <div>
            <dt>Reading</dt>
            <dd data-color="amber">{article.computed.readingTime} min</dd>
          </div>
          <div>
            <dt>Commit</dt>
            <dd data-color="coral">{MOCK_COMMIT_HASH}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3>{ui.tags}</h3>
        <div data-tags>
          {article.frontmatter.tags.map(tag => (
            <GitTag key={tag} tag={tag} locale={locale} />
          ))}
        </div>
      </section>

      <section>
        <h3>Explorer</h3>
        <ul data-explorer>
          {explorerList.map(a => (
            <li key={a.computed.slug}>
              <a href={a.url}>{a.computed.slug}.md</a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>{ui.recentPosts}</h3>
        <ul data-recent>
          {recentList.map(a => (
            <li key={a.computed.slug}>
              <a href={a.url}>{a.frontmatter.title}</a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
