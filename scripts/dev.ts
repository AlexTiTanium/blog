/**
 * @file Dev loop: build once, watch content/ + src/ → rebuild, serve dist/ (bun --watch misses *.md).
 */
import { watch } from "node:fs";
import { app } from "../src/app";

await app.build.run();

const rebuild = (): void => {
  // TODO(build phase D): debounced app.build.run() on change; spawn scripts/serve.ts.
};

watch("content", { recursive: true }, rebuild);
watch("src", { recursive: true }, rebuild);

console.log("[dev] watching content/ and src/ — http://localhost:4173");
