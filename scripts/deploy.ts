/**
 * @file Cloudflare Pages deploy (`bun run deploy`). Thin passthrough to the framework cli plugin:
 * `app.cli.deploy()` deploys the built output dir to Cloudflare Pages — interactive runs confirm
 * first (y/N), CI / non-TTY runs proceed automatically — and prints the boxed deploy result. Deploy
 * orchestration lives in the plugin (configured via `pluginConfigs.deploy`) — this script just names
 * the command.
 */
import { app } from "../src/app";

await app.cli.deploy();
