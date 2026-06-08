import type { Content } from "@moku-labs/web";
import { DEFAULT_LOCALE } from "../../src/i18n/index";

type ArticleOverrides = {
  slug?: string;
  title?: string;
  description?: string;
  date?: string;
  tags?: string[];
  author?: string;
  locale?: string;
  isFallback?: boolean;
};

/** Build a fully-typed Content.Article for unit tests (only the fields the lib reads matter). */
export function makeArticle(overrides: ArticleOverrides = {}): Content.Article {
  const slug = overrides.slug ?? "hello-pipeline";
  const locale = overrides.locale ?? "en";
  return {
    frontmatter: {
      title: overrides.title ?? "Hello, Pipeline!",
      date: overrides.date ?? "2026-01-15",
      description: overrides.description ?? "An intro to the pipeline.",
      tags: overrides.tags ?? ["pipeline"],
      language: locale,
      ...(overrides.author === undefined ? {} : { author: overrides.author })
    },
    computed: {
      slug,
      readingTime: 1,
      contentId: slug,
      status: "published",
      wordCount: 42
    },
    html: "<p>Body</p>",
    locale,
    isFallback: overrides.isFallback ?? false,
    // The default locale is served bare (matches the framework's article.url normalization).
    url: locale === DEFAULT_LOCALE ? `/${slug}/` : `/${locale}/${slug}/`
  };
}
