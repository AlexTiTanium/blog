/**
 * Full article view with split-pane layout.
 * Left pane: article header, body HTML, and tags.
 * Right pane: MetaPanel sidebar.
 */

import type { Content } from "@moku-labs/web";
import { SITE } from "../config";
import { type Locale, t } from "../i18n/index";
import { archiveUrl, articleUrl, homeUrl } from "../lib/urls";
import { GitTag } from "./GitTag";
import { MetaPanel } from "./MetaPanel";
import { ShareButtons } from "./ShareButtons";

interface Props {
  article: Content.Article;
  locale: Locale;
  recentArticles: Content.Article[];
}

/** Render the split-pane article view with content and sidebar. */
export function ArticleLayout({ article, locale, recentArticles }: Props) {
  const year = article.frontmatter.date.split("-")[0];
  const author = article.frontmatter.author || "Alex Kucherenko";

  return (
    <div data-component="split-pane">
      <main>
        <article>
          <header>
            <nav aria-label="breadcrumb">
              <a href={homeUrl(locale)}>blog</a> <span data-sep>/</span>{" "}
              <a href={archiveUrl(locale)}>posts</a> <span data-sep>/</span> {year}{" "}
              <span data-sep>/</span> {article.computed.slug}.md
            </nav>
            <h1>{article.frontmatter.title}</h1>
            <div data-meta>
              {article.frontmatter.date} <span data-sep>|</span> {author} <span data-sep>|</span>{" "}
              {article.computed.readingTime} min read
            </div>
          </header>

          {article.isFallback && (
            <div data-notice role="note">
              {t(locale).noTranslation}
            </div>
          )}

          <div
            data-content
            data-component="lightbox"
            dangerouslySetInnerHTML={{ __html: article.html }}
          />

          <div data-tags>
            {article.frontmatter.tags.map(tag => (
              <GitTag key={tag} tag={tag} locale={locale} />
            ))}
          </div>

          <ShareButtons
            url={`${SITE.url}${articleUrl(locale, article.computed.slug)}`}
            title={article.frontmatter.title}
          />
        </article>
      </main>

      <MetaPanel article={article} locale={locale} recentArticles={recentArticles} />
    </div>
  );
}
