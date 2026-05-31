/**
 * @file SSG build: app.build.run() → dist/, then 404, bare-path redirects, asset/font/public copy.
 */
import { existsSync } from "node:fs";
import { app } from "../src/app";

const result = await app.build.run();

// TODO(build phase D): write dist/404.html; emit default-locale bare-path redirect files;
//                      copy assets/fonts + public/ → dist.
if (!existsSync("dist/404.html")) {
  throw new Error("dist/404.html missing — CF Pages would flip to SPA mode");
}

console.log(`[build] ${result.pageCount} pages in ${result.durationMs}ms → ${result.outDir}`);
