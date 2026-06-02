/**
 * @file Cloudflare Pages deploy (`bun run deploy`, GATED). `init()` scaffolds wrangler.jsonc + the
 * CI workflow; the actual `run()` stays gated behind the `DEPLOY_ENABLED` env var until framework
 * Cloudflare support is finalized.
 */
import { app } from "../src/app";
import { createLogger } from "./_log";

const log = createLogger("deploy");

/** Env flag that must equal "true" to perform a real deploy (otherwise only scaffolding runs). */
const DEPLOY_ENABLED = process.env.DEPLOY_ENABLED === "true";

log.info("scaffolding wrangler.jsonc + CI workflow…");
await app.deploy.init({ ci: true });

if (DEPLOY_ENABLED) {
  log.info("deploying to Cloudflare Pages…");
  await app.deploy.run();
  log.success("deploy complete");
} else {
  log.warn("gated — set DEPLOY_ENABLED=true to deploy (pending framework CF support)");
}
