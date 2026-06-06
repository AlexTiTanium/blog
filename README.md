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
| `bun run deploy` | Cloudflare Pages deploy via `app.cli.deploy()` (confirms on a TTY, auto-proceeds in CI) |

Use **bun** exclusively — never npm/yarn/pnpm.

## Layout

```
src/
  app.ts            SSG composition (Node plugins: content/build/deploy/data/cli) — drives the thin scripts/* via app.cli.*
  spa.tsx           Browser boot + client bundle entry (island hydration + intercepted nav)
  routes.tsx        Typed route table (generate / load / render / head / layout)
  config.ts         SITE identity (name, url, author, description, email, github) — single source of truth
  i18n/             Locales (en, ru), UI strings, and the i18n plugin config
  layouts/          SiteLayout — the persistent page chrome
  pages/            One inner-content component per route
  components/       Preact view components (SSG markup)
  islands/          Vanilla-TS islands hydrated after navigation (tab-nav, lang-switcher, …)
  lib/              Pure helpers: articles + content (ctx.require loaders), urls, head, locale, quotes, shiki-theme
  og/template.tsx   Open Graph card renderer (Satori)
  styles/           CSS entry (main.css) + tokens, components, and self-hosted @font-face
assets/fonts/       Vendored woff2 (IBM Plex Mono/Sans + Fira Code) — no font npm deps
content/            Markdown articles (per-locale)
scripts/            Thin `app.cli.*` entries: build / serve (dev watch) / preview (static) / deploy
tests/              unit + integration (vitest), e2e (playwright)
```

## Architecture notes

- **Three layers.** Layer 1 (`createCoreConfig`) and Layer 2 (`createCore` + plugins) live inside
  `@moku-labs/web`. This app is Layer 3: it calls `createApp` and supplies plugin config overrides.
- **Two entries, one route table.** `src/app.ts` (SSG) opts in the Node-only plugins; `src/spa.tsx`
  (browser) imports from `@moku-labs/web/browser` and omits them, so the client bundle tree-shakes out
  all node/native code. Both share `src/routes.tsx`. The
  [`bundle-safety`](tests/integration/bundle-safety.test.ts) test asserts the client bundle carries no
  `node:`/`satori`/`resvg`/`shiki`/`gray-matter`/`feed` references.
- **No app-global injection.** `routes.tsx` and the shared `lib/` helpers never import the concrete
  app. Loaders reach content the spec way — `ctx.require(contentPlugin)` (the browser-safe shell; the
  node `fileSystemContent` provider is composed only in `src/app.ts`) — and links come from the pure
  `createUrls(routes)` builder, so there are no `app.*` module globals to bind (required for browser
  bundle safety).
- **Content cache.** Route loaders read content via `ctx.require(contentPlugin)` in `src/lib/content.ts`;
  the content plugin memoizes `loadAll()` internally, so markdown is parsed once.
- **Head.** `build.injectAssets` injects the bundled `main.{css,js}` tags, so `src/lib/head.ts` owns
  SEO metadata only (feed link, JSON-LD, article OG tags); the `head` plugin auto-composes the base
  set (title/description/canonical/hreflang/OG/Twitter).
- **Fonts.** All three families are self-hosted from `assets/fonts/` via local `@font-face`
  (`src/styles/*.css`); the build inlines them as `data:` URLs into `main.css`.
- **UI chrome is intentionally English.** The IDE/terminal flavor (`build: passing`, `git log`,
  `<< prev`, dashboard metrics, …) is locale-invariant by design; only article content and the nav
  labels are translated via i18n.

## Deploy

`bun run deploy` runs `app.cli.deploy()` (the framework `cli` plugin): it deploys the built `dist/`
to Cloudflare Pages — prompting for a y/N confirmation on an interactive terminal, and auto-proceeding
in CI / non-TTY. The target lives in `pluginConfigs.deploy` (`target: "cloudflare-pages"`,
`productionBranch: "main"`). Nothing in CI invokes `bun run deploy`; it stays a manual command.
