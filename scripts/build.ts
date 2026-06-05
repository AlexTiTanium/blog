/**
 * @file SSG build entry (`bun run build`). Thin passthrough to the framework cli plugin:
 * `app.cli.build()` runs the full static build (HTML + bundled assets + public/ passthrough +
 * 404.html + i18n bare-path redirects + per-page _data JSON), asserts the configured 404 page exists
 * at the output root (CF Pages would otherwise flip to SPA mode), and prints the boxed build summary.
 * All build orchestration + reporting live in the plugin — this script just names the command.
 */
import { app } from "../src/app";

await app.cli.build();
