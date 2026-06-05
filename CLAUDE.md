# blog

A Moku Layer 3 consumer app built on the `@moku-labs/web` framework.

## Package Manager

Use `bun` exclusively — never npm, yarn, or pnpm.

## Scripts

- `bun run build` — Build with tsdown
- `bun run lint` — Biome check + ESLint
- `bun run lint:fix` — Auto-fix lint issues
- `bun run format` — Format with Biome
- `bun run test` — Run all tests (vitest)
- `bun run test:unit` — Unit tests only
- `bun run test:integration` — Integration tests only
- `bun run test:coverage` — Tests with coverage

## Code Style

- **Formatter:** Biome (2-space indent, double quotes, semicolons, no trailing commas)
- **Linter:** ESLint 9 flat config + Biome (eslint-config-biome must be LAST)
- **TypeScript:** Strict mode with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`
- **Imports:** Use `import type` enforced via `@typescript-eslint/consistent-type-imports`
- **JSDoc:** Required on all source exports with descriptions, params, returns, and examples

## Architecture

This is a **Layer 3 consumer app** in the three-layer Moku model:

1. Layer 1 (`createCoreConfig`) and Layer 2 (`createCore` + plugins) live inside the
   `@moku-labs/web` framework package.
2. This app is Layer 3: it imports `createApp` from `@moku-labs/web` and supplies
   plugin config overrides.

Entry points: `src/app.ts` calls `createApp({ ... })` for the SSG build and composes the `cli`
plugin, so the thin `scripts/{build,serve,preview,deploy}.ts` entries are one-liners that call
`app.cli.*`; `src/main.ts` → `src/spa/spa.tsx` is the browser bundle (imports from
`@moku-labs/web/browser` and omits the Node-only plugins). Both share `src/routes.tsx`. This app
does NOT define core config or plugins, and must NOT depend on `@moku-labs/core` directly — only on
the framework package.

## Conventions & invariants

- **Identity lives in `src/config.ts`.** `SITE` (name, url, author, description, email, github) is
  the single source of truth — never hardcode these elsewhere; source them from `SITE`.
- **UI chrome is intentionally English.** The IDE/terminal aesthetic (`build: passing`, `git log`,
  `<< prev`, dashboard metric labels, the tab glyphs `~`/`[]`/`@`, …) is locale-invariant by design.
  Do NOT move it into i18n or translate it. Only article content and the nav labels are localized
  (`src/i18n/`).
- **Rendered output is guarded by visual baselines.** Playwright golden screenshots exist for
  home/archive/about/article in en+ru (desktop+mobile). Refactors should be output-preserving; if a
  change intentionally alters rendering, regenerate baselines with `bun run test:e2e:update` and say
  so. A fast pre-check: `bun run build` then diff `dist/**/*.html` (ignoring the non-deterministic
  `build-id` meta) against a pre-change build.
- **Client bundle must stay node/native-free.** `routes.tsx` and the shared `lib/` helpers are in the
  browser graph, so they must not import the concrete SSG app or any Node-only plugin. Route loaders
  reach the content API the spec way — `ctx.require(contentPlugin)` (the browser-safe shell; the node
  `fileSystemContent` provider is composed only in `src/app.ts`) — and links come from the pure
  `createUrls(routes)` builder, so there are no `app.*` module globals to bind. The `bundle-safety`
  test enforces this.
- **Fonts are vendored** under `assets/fonts/` with local `@font-face` (`src/styles/*.css`) — no
  font npm dependencies.

## Testing

- Vitest with unit + integration projects
- App-level tests: `tests/unit/` and `tests/integration/`
- E2E: Playwright functional + visual baselines (`tests/e2e/`)
- 90% coverage threshold

## Moku Development Toolkit

This project uses the **moku** Claude Code plugin for development workflows.

### Commands (slash commands)

**Planning:**
- `/moku:plan [create|update|add|migrate|resume] [type] [args]` — gated workflow to plan a
  consumer app. For an app, output goes to `.planning/app-spec.md`.

**Building:**
- `/moku:build [app] [spec-or-name]` — Build from the app specification. Auto-detects what to
  build and resumes if partially built.

**Setup:**
- `/moku:init` — Initialize a new Moku project with full tooling (used to create this project).

### Skills (automatic context)

- **moku-core** — Architecture rules, factory chain, lifecycle, event system, context tiers.
  Relevant when reasoning about `createApp` and the three-layer model.
- **moku-plugin** — Plugin structure specification and complexity tiers (reference for the
  plugins provided by `@moku-labs/web`).

### Agents (validation)

- **moku-spec-validator** — Validates Moku Core specification compliance.
- **moku-plugin-spec-validator** — Validates plugin structure and tiers.
- **moku-jsdoc-validator** — Validates JSDoc completeness on exports.

### Typical Workflow (consumer app)

1. `/moku:plan create app "A personal blog"` — design the app composition.
2. `/moku:build app` — implement from the plan.
3. Validators run automatically.

## Specification

For questions about how things should be implemented, refer to the
[Moku Core specification](https://github.com/moku-labs/core/tree/main/specification).
