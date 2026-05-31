# blog — Geek Life

A bilingual (en/ru) literary dev blog, built as a **Layer-3 consumer app** on
[`@moku-labs/web`](https://github.com/moku-labs/web). It imports `createApp`, configures the eight
framework plugins via `pluginConfigs`, and supplies routes, Preact pages/components, island
`ComponentDef`s, markdown content, styles, and build/serve/deploy scripts. It authors **no** custom
Moku plugins and never imports `@moku-labs/core`.

> **Status: migration in progress.** The skeleton (compiling stubs + wiring) is in place. Content,
> components, styles, scripts, and tests are ported in the build phases — see `.planning/app-spec.md`.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Build once, watch `content/` + `src/`, serve `dist/` |
| `bun run build` | SSG build → `dist/` (via `scripts/build.ts`) |
| `bun run preview` | Serve the built `dist/` (port 4173) |
| `bun run test` | Vitest unit + integration |
| `bun run test:e2e` | Playwright functional + visual |
| `bun run lint` / `bun run format` | Biome + ESLint |
| `bun run deploy` | Cloudflare Pages deploy (**gated** — set `DEPLOY_ENABLED=true`) |

## Architecture notes

- The 0.3.0 HTML document is framework-hardcoded and does not auto-link bundled assets, so
  `src/lib/head.ts#pageHead()` injects the `/assets/main.{css,js}` tags into every route head.
- `src/spa.tsx` is the browser boot (island hydration + intercepted navigation); `src/main.ts` is the
  one-line JS bundle entry; `src/styles/main.css` is the CSS entry.
- Route loaders read only the memoized cache in `src/lib/articles.ts` — they never re-parse markdown.

## Deploy

Deploy is gated until framework Cloudflare support is finalized. `scripts/deploy.ts` scaffolds
`wrangler.jsonc` via `app.deploy.init()`; the actual `app.deploy.run()` is guarded behind
`DEPLOY_ENABLED=true`.
