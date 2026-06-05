/**
 * @file Static preview server (`bun run preview`, and the Playwright `webServer`). Thin passthrough
 * to the framework cli plugin: `app.cli.preview()` serves the already-built output dir on the
 * configured port with Cloudflare-Pages-style clean-URL + nearest-404 resolution, and no watch/
 * rebuild (unlike `serve`). Serving logic lives in the plugin — this script just names the command.
 */
import { app } from "../src/app";

await app.cli.preview();
