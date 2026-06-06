/**
 * @file Cloudflare Pages deploy (`bun run deploy`). Thin passthrough to the framework cli plugin.
 * Guided by default — `bun run deploy` runs the interactive setup wizard (diagnose prerequisites,
 * offer to scaffold wrangler.jsonc + a placeholder .env, hard-gate, local test, deploy, offer CI) —
 * while `bun run deploy --cli` takes the direct, CI-safe path. Deploy orchestration lives in the
 * plugin (configured via `pluginConfigs.deploy`); this script just names the command + picks the mode.
 */
import { app } from "../src/app";

await app.cli.deploy({ guided: !process.argv.includes("--cli") });
