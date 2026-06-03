# blog — Geek Life

A bilingual (en/ru) literary dev blog, built as a **Layer-3 consumer app** on
[`@moku-labs/web`](https://github.com/moku-labs/web). It imports `createApp`, configures the
framework plugins via `pluginConfigs`, and supplies the routes, Preact pages/components, island
`ComponentDef`s, markdown content, styles, and build/serve/deploy scripts. It authors **no** custom
Moku plugins and never imports `@moku-labs/core`.

The site is statically generated (SSG) and progressively enhanced into an SPA: the persistent
IDE-style chrome stays mounted while only the `main > section` swap region re-renders on client
navigation, with a few small vanilla-TS islands keeping the header in sync.

## Quick start

```sh
bun install
bun run dev      # build once, watch content/ + src/, serve at http://localhost:4173
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Build once, watch `content/` + `src/`, serve `dist/` (rebuild on change) |
| `bun run build` | SSG build → `dist/` (`scripts/build.ts`) |
| `bun run preview` | Serve the built `dist/` (port 4173, Cloudflare-Pages-style clean URLs) |
| `bun run test` | Vitest unit + integration |
| `bun run test:e2e` | Playwright functional + visual baselines |
| `bun run test:e2e:update` | Regenerate visual baselines (macOS) |
| `bun run lint` / `bun run format` | Biome + ESLint / Biome format |
| `bun run deploy` | Cloudflare Pages deploy (**gated** — set `DEPLOY_ENABLED=true`) |

Use **bun** exclusively — never npm/yarn/pnpm.

## Layout

```
src/
  app.ts            SSG composition (Node plugins: content/build/deploy/data) — driven by scripts/build.ts
  spa/spa.tsx       Browser boot (island hydration + intercepted nav); src/main.ts is the bundle entry
  routes.tsx        Typed route table (generate / load / parse / render / head / layout)
  config.ts         SITE identity (name, url, author, description, email, github) — single source of truth
  i18n/             Locales (en, ru), UI strings, and the i18n plugin config
  layouts/          SiteLayout — the persistent page chrome
  pages/            One inner-content component per route
  components/       Preact view components (SSG markup)
  islands/          Vanilla-TS islands hydrated after navigation (tab-nav, lang-switcher, …)
  lib/              Pure helpers: articles (content cache), urls, head, payloads, locale, quotes, shiki-theme
  og/template.tsx   Open Graph card renderer (Satori)
  styles/           CSS entry (main.css) + tokens, components, and self-hosted @font-face
assets/fonts/       Vendored woff2 (IBM Plex Mono/Sans + Fira Code) — no font npm deps
content/            Markdown articles (per-locale)
scripts/            build / dev / serve / deploy (+ shared _log, _config helpers)
tests/              unit + integration (vitest), e2e (playwright)
```

## Architecture notes

- **Three layers.** Layer 1 (`createCoreConfig`) and Layer 2 (`createCore` + plugins) live inside
  `@moku-labs/web`. This app is Layer 3: it calls `createApp` and supplies plugin config overrides.
- **Two entries, one route table.** `src/app.ts` (SSG) opts in the Node-only plugins; `src/spa/spa.tsx`
  (browser) imports from `@moku-labs/web/browser` and omits them, so the client bundle tree-shakes out
  all node/native code. Both share `src/routes.tsx`. The
  [`bundle-safety`](tests/integration/bundle-safety.test.ts) test asserts the client bundle carries no
  `node:`/`satori`/`resvg`/`shiki`/`gray-matter`/`feed` references.
- **Cycle-break injection.** `routes.tsx` references loaders (`lib/articles`) and link builders
  (`lib/urls`) at module top level, but `app.content`/`app.router` only exist after `createApp`. The
  app injects them once after creation (`bindContent` / `bindRouter`), keeping `routes.tsx` and the
  shared helpers free of any concrete-app import (required for browser bundle safety).
- **Content cache.** Route loaders read only the memoized cache in `src/lib/articles.ts` — they never
  re-parse markdown.
- **Head.** `build.injectAssets` injects the bundled `main.{css,js}` tags, so `src/lib/head.ts` owns
  SEO metadata only (feed link, JSON-LD, article OG tags); the `head` plugin auto-composes the base
  set (title/description/canonical/hreflang/OG/Twitter).
- **Fonts.** All three families are self-hosted from `assets/fonts/` via local `@font-face`
  (`src/styles/*.css`); the build inlines them as `data:` URLs into `main.css`.
- **UI chrome is intentionally English.** The IDE/terminal flavor (`build: passing`, `git log`,
  `<< prev`, dashboard metrics, …) is locale-invariant by design; only article content and the nav
  labels are translated via i18n.

## Deploy

Gated until framework Cloudflare support is finalized. `scripts/deploy.ts` scaffolds `wrangler.jsonc`
via `app.deploy.init()`; the actual `app.deploy.run()` is guarded behind `DEPLOY_ENABLED=true`.
