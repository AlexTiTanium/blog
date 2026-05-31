/**
 * @file Cloudflare Pages deploy (GATED). init() scaffolds wrangler.jsonc + workflow; run() stays
 * gated behind DEPLOY_ENABLED until framework Cloudflare support is finalized.
 */
import { app } from "../src/app";

await app.deploy.init({ ci: true });

if (process.env.DEPLOY_ENABLED === "true") {
  await app.deploy.run();
} else {
  console.info("[deploy] gated — set DEPLOY_ENABLED=true to deploy (pending framework CF support).");
}
