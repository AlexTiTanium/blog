/**
 * @file Dev loop (`bun run dev`). Thin passthrough to the framework cli plugin: `cli.serve()`
 * builds once, serves the output dir, then watches the configured dirs (`content/`, `src/`) and
 * debounced-rebuilds on change with live reload. Watch + serve + rebuild logic all live in the
 * plugin (configured via `pluginConfigs.cli`) — this script just names the command and its stage:
 * `"development"`, so draft articles (frontmatter `draft: true`) are previewable locally. Every
 * other entry uses the production `app` (stage `"production"`), which keeps drafts suppressed.
 */
import { makeApp } from "../src/app";

await makeApp("development").cli.serve();
