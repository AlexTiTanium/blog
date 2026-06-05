/**
 * @file Dev loop (`bun run dev`). Thin passthrough to the framework cli plugin: `app.cli.serve()`
 * builds once, serves the output dir, then watches the configured dirs (`content/`, `src/`) and
 * debounced-rebuilds on change with live reload. Watch + serve + rebuild logic all live in the
 * plugin (configured via `pluginConfigs.cli`) — this script just names the command.
 */
import { app } from "../src/app";

await app.cli.serve();
