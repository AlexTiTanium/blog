---
title: "Hello, Pipeline!"
date: "2026-01-15"
description: "A test article for the content pipeline, exercising code blocks in multiple languages and basic markdown features."
tags:
  - testing
  - pipeline
language: en
draft: false
---

Every blog needs a beginning, and every content pipeline needs its first test subject. This article exists to verify that our markdown processing works end-to-end: from raw frontmatter parsing through syntax highlighting to final HTML output.

Building a content pipeline is a lot like building plumbing. Nobody admires the pipes, but everyone notices when the water stops flowing. The same applies here -- if the pipeline works, readers see beautifully rendered articles. If it breaks, they see raw markdown and existential dread.

## Code Blocks

Let us start with a TypeScript function that processes an article:

```typescript
interface Article {
  title: string;
  date: string;
  tags: string[];
}

function processArticle(raw: string): Article {
  const frontmatter = parseFrontmatter(raw);
  const html = renderMarkdown(raw);

  return {
    title: frontmatter.title,
    date: frontmatter.date,
    tags: frontmatter.tags ?? [],
  };
}
```

And here is how you might run the pipeline from the command line:

```bash
# Build all articles
bun run build

# Watch for changes during development
bun run dev --watch

# Check for broken links
bun run check:links
```

Finally, a configuration example in JSON:

```json
{
  "pipeline": {
    "contentDir": "content/articles",
    "outputDir": "dist",
    "languages": ["en", "ru"],
    "features": {
      "syntaxHighlighting": true,
      "pullQuotes": true,
      "readingTime": true
    }
  }
}
```

## Why This Matters

The pipeline is the invisible backbone of the blog. Every article passes through it, so we test it thoroughly with articles like this one. If you are reading this rendered correctly, the pipeline works. If you are reading raw markdown, well, we have some debugging to do.

This article targets approximately three hundred words to give the reading time calculator something meaningful to work with. A one-paragraph article would calculate to zero minutes, which is technically accurate but philosophically unsatisfying.
