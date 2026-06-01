/**
 * Article sidebar panel with file info, tags, explorer, and recent posts.
 * Renders the right-hand pane of the split article view.
 */

import type { Content } from "@moku-labs/web";
import { type Locale, t } from "../i18n/index";
import { GitTag } from "./GitTag";

interface Props {
  article: Content.Article;
  locale: Locale;
  recentArticles: Content.Article[];
}

/** Render the article sidebar with file info, tags, explorer, and recent posts. */
export function MetaPanel({ article, locale, recentArticles }: Props) {
  const ui = t(locale);
  const explorerArticles = recentArticles.slice(0, 5);

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
            <dd>{article.frontmatter.author || "Alex Kucherenko"}</dd>
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
            <dd data-color="coral">a1b2c3d</dd>
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
        <ul>
          {explorerArticles.map(a => (
            <li key={a.computed.slug}>
              <a href={a.url}>{a.computed.slug}.md</a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>{ui.recentPosts}</h3>
        <ul data-recent>
          {recentArticles.slice(0, 5).map(a => (
            <li key={a.computed.slug}>
              <a href={a.url}>{a.frontmatter.title}</a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
