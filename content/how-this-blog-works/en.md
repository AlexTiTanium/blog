---
title: "Take Three: How This Blog Actually Works"
date: "2026-06-14"
description: "My third blog. Maybe fourth — I lost count. Before it came a WordPress that broke itself and a Next.js that never clicked. This one I finally built on my own framework, and here's how it works under the hood."
tags:
  - moku
  - programming
  - typescript
language: en
draft: false
---

The work is done. Let's call this the official relaunch of the blog — the one you're reading right now. It took far longer than I'd have liked. But it proved the thing I needed it to prove: Moku Core actually works. I built Moku Web on top of it, and this blog on top of that, with exactly the API and the attention to detail I like.

Are there bugs? Undeniably. But I'm fine with where they sit. Sometimes you just have to stop and tell yourself: good enough.

## The Two Blogs I Buried

First there was WordPress. I hated it from start to finish. Bots came at it around the clock trying to break in, though honestly they needn't have bothered: it broke itself just fine. The database went down for reasons I never did pin down. Had it not kept falling over, I'm fairly sure it would have turned into a virus hub: holes on top of holes, patch constantly or pay for it. And all that joy ran me seven dollars a month. Short version: I'm happy it's gone.

Then came a run at Next.js. I didn't write that one myself — I asked my brother and his girlfriend. A school project for them, a blog for me. The result was meh. I just didn't like how Next does routing, or how big and ungainly the whole thing is. [The repo's still around](https://github.com/AlexTiTanium/geek-life), gathering dust since late 2023.

And yet the direction was exactly right: static generation, articles in Markdown, components in React. MDX, if we're being precise. It was just miserable to actually build. Server components were their own saga; the thing still dragged all of React onto the client, and a heap of code with it. But that was the moment I first saw my own architecture clearly. The idea of the ideal blog that eventually turned into this one.

## First the Engine, Then the Blog

I've [written about Moku Core](/birth-of-moku-core/) already: a month spent not over code but over the kernel's spec. That post ended on a glum note — no second layer yet, no third, all of it pure theory, and me just hoping they'd show up.

They showed up. Moku Web is the second layer, the framework. The blog is the third, the app itself. The three-storey tower from that post is fully built now, and you're reading its top floor.

The entire blog is a single `createApp` call. No globals stashed in corners: you register plugins, hand them config, and that's the end of it.

```typescript
// src/app.ts — the whole blog is one createApp() call.
const app = createApp({
  plugins: [contentPlugin, buildPlugin, deployPlugin, dataPlugin, cliPlugin],
  config: { mode: "hybrid", stage: "production" },
  pluginConfigs: {
    site: SITE,            // name, url, author — one source of truth
    i18n: i18nConfig,      // en · uk · ru · es
    content: {
      providers: [
        fileSystemContent({
          contentDir: "./content",
          shikiTheme: warmSyntaxTheme,                  // code blocks
          mermaid: { mermaidConfig: warmMermaidTheme }, // ```mermaid fences
          embed: { facade: EmbedFacade },               // ::embed{...}
          gallery: { component: Gallery }               // ::gallery{...}
        })
      ]
    },
    router: { routes },
    deploy: { target: "cloudflare-pages" }
  }
});
```

One file, and you can see what the blog is made of.

## Where Everything Lives

The rest of the project is just as flat. No magic folders, no hidden wiring — you open a directory and it does what it says on the door:

```text
blog/
  src/
    app.ts        # Node-side composition — the createApp() from above
    spa.tsx       # browser entry — same routes, none of the Node plugins
    routes.tsx    # THE route table — one source of truth (next section)
    config.ts     # SITE identity: name, url, author
    i18n/         # en · uk · ru · es — UI strings + locale config
    pages/        # one Preact page per route (home, article, archive…)
    components/   # SSR'd UI: nav, gallery, the embed facade
    islands/      # the tiny client scripts, hydrated on demand
    lib/          # pure helpers: articles, head, urls, dates
    styles/       # CSS: tokens, fonts, article typography
    og/           # build-time OG-image cards (Satori)
  content/        # the articles — one folder per post (see above)
  public/         # served as-is: fonts, _headers, favicons
  scripts/        # one-liners: build / serve / preview / deploy
  tests/          # unit · integration · e2e (the paranoia, below)
```

Two files carry the weight: `app.ts`, the one you just saw, and `routes.tsx` — which is the part I actually care about.

## The Router Is the Heart of It

If the blog has a heart, it's `routes.tsx`. One table, and three different things read from it: the static build (which pages to generate), the in-browser navigation (what to render on a click), and the link builder (every `href` on the site). Define a page once, in one place, and all three agree forever.

A route is a little chain of declarations:

```typescript
// src/routes.tsx — define a page once; the build, the SPA, and every link obey it.
article: route("/{lang:?}/{slug}/")          // {lang:?}: bare "/slug/" for en, "/ru/slug/" for the rest
  .generate(async ctx =>                       // which static pages to emit at build time
    (await allArticles(ctx)).map(a => ({ lang: ctx.locale, slug: a.computed.slug }))
  )
  .load(async ctx => {                         // fetch the data — runs at build, persisted as JSON
    const article = await articleBySlug(ctx);
    const all = await allArticles(ctx);
    return { article, related: relatedArticles(all, article, 5) };
  })
  .render(ctx => <ArticlePage article={ctx.data.article} related={ctx.data.related} />)
  .head(ctx => articleHead(ctx, ctx.data.article))   // <title>, OG, canonical, hreflang
```

`.generate` says which pages to stamp out — one per article, per locale. `.load` fetches the data. `.render` is the Preact component. `.head` is the SEO. That's the whole contract.

Here's the trick that turns it into a single-page app without me writing any of the plumbing. At build time `.load` runs, and its result is baked into the HTML *and* dropped next door as `_data/<lang>/<slug>/index.json`. Click a link and the browser doesn't reload — it fetches that little JSON file and runs the same `.render`. One piece of code, two moments: the build on my machine, the click in your tab.

And because the links come out of the same table, they can't rot:

```typescript
// links come from the SAME table — a typed builder, so a link can't drift from a route:
urls.toUrl("article", { lang: "en", slug: "spark" }); // "/spark/"     — en is bare
urls.toUrl("article", { lang: "ru", slug: "spark" }); // "/ru/spark/"
```

I never type a URL by hand. I ask the table for one, and the day I rename a route, every link moves with it. That's why the router sits in the middle and everything else hangs off it.

## A Post Is Just a Folder

To write a post I don't open an admin panel (hi, WordPress). I make a `content/<slug>/` folder and drop one file per language into it:

```text
content/how-this-blog-works/
  en.md
  uk.md
  ru.md
  es.md
  images/   # images, if you need them
```

Up top, each file has frontmatter — plain YAML:

```yaml
---
title: "Take Three: How This Blog Actually Works"
date: "2026-06-14"
description: "One hook of a sentence — it doubles as the OG card and the archive teaser."
tags:
  - moku
  - programming
language: en
draft: false
---
```

`draft: false` and the post ships to production. Set it to `true` and it's visible only locally, while you're still writing. No Publish button, no database. Git is my CMS.

## The Parts I Actually Wanted

This is the part I built the thing for. You like technical details? I do.

**Syntax highlighting.** Every code block in this post is coloured by [Shiki](https://shiki.style), at build time, not in the browser. The theme is warm, tuned to the blog; the actual token colours live in inline styles.

**Diagrams.** Drop a ` ```mermaid ` block and the build turns it into a static SVG. Right below this paragraph is a live one, the very feature I'm describing. It's the path text takes before it becomes a website:

```mermaid
graph LR
  md["content/*.md<br>en · uk · ru · es"]
  build["@moku-labs/web<br>Shiki · Mermaid · ::embed · ::gallery"]
  out["dist/ · static HTML<br>+ tiny islands"]
  cf["Cloudflare Pages<br>$0 / month"]
  md -->|bun run build| build --> out -->|git push| cf

  classDef src fill:#231f1b,stroke:#f97316,color:#fdba74
  classDef mid fill:#231f1b,stroke:#f59e0b,color:#fde68a
  classDef ship fill:#231f1b,stroke:#84cc16,color:#d9f99d
  class md src
  class build,out mid
  class cf ship
```

I draw the same diagrams in the posts on [Moku Core](/birth-of-moku-core/) and [Spark](/spark/).

**Galleries.** `::gallery{src="./images/board/"}` turns a folder of images into a gallery with a lightbox. That's how I showed off board-game boxes in [the best board games](/best-board-games/) and in [Descent](/descent-journeys-in-the-dark/).

**Embeds.** `::embed{src="…" title="…"}` is a lazy iframe: nothing loads until you click. In the [Screw Master](/screw-master/) post you can play the game I made right inside the article.

All of these are directives — a single line of Markdown each.

## Four Kinds of Paranoia

I don't trust myself, and I trust the AI that wrote half of this even less. So there are several layers of tests:

- **Unit tests** for pure logic: pagination, date formatting, link building. Fast, no browser.
- **Integration tests** build the real content, every article in full, and check that nothing fell off. Including the rendering of those mermaid diagrams.
- **E2E on [Playwright](https://playwright.dev)** run the live, built site across three engines: Chromium, WebKit, and Firefox. Because Safari has broken on me on its own before, and I've learned.
- **Visual baselines**: golden screenshots of the home page, the archive, an article. If code shifts the layout, the screenshot won't match and the test fails.

One subtlety: e2e runs against a frozen set of fixtures, not the live articles. So I can publish whatever I want to `content/` and the tests don't flinch. A new post needs zero changes to the tests.

## Hosting for the Price of Nothing

And now the money. Remember the seven dollars a month for WordPress? Here it's zero.

The blog is just a pile of static files. I run `git push`, CI runs the lint and the tests, and if everything's green it ships itself to [Cloudflare Pages](https://pages.cloudflare.com). Static files on the free tier cost nothing a month. No server to patch, and update, and bring the database back up every week. The page arrives as finished HTML; the interactivity comes in as tiny islands (small JS scripts that hook onto the content, or just run on the client).

From seven dollars a month to nothing. I didn't get rich, but it's nice to save.

---

So that's the beginning. Or the end, depending which way you look at it. The blog I rewrote three times (maybe four — I lost count) finally stands on the foundation I wanted from the start.

And I've got a new toy now, plus one more hobby: [Spark](/spark/), a game engine in Rust I've already started writing about. So the story doesn't end. It just moves to a different repository.
