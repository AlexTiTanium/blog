/**
 * @file Dev loop: build once, serve dist/, then watch content/ + src/ and debounced-rebuild on
 * change (`bun --watch` misses *.md, so we drive the SSG build ourselves). The static server runs
 * as a child process (scripts/serve.ts) so a rebuild never restarts it — the browser just reloads.
 */
import { watch } from "node:fs";
import { app } from "../src/app";

await app.build.run();

// Serve dist/ in a child process; it stays up across rebuilds.
const server = Bun.spawn(["bun", "scripts/serve.ts"], { stdout: "inherit", stderr: "inherit" });

let timer: ReturnType<typeof setTimeout> | null = null;
let building = false;

/** Debounced rebuild — coalesces bursts of FS events into a single `app.build.run()`. */
const rebuild = (): void => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    if (building) return;
    building = true;
    try {
      const result = await app.build.run();
      console.log(`[dev] rebuilt ${result.pageCount} pages in ${result.durationMs}ms`);
    } catch (error) {
      console.error("[dev] rebuild failed:", error);
    } finally {
      building = false;
    }
  }, 150);
};

watch("content", { recursive: true }, rebuild);
watch("src", { recursive: true }, rebuild);

const shutdown = (): void => {
  server.kill();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[dev] watching content/ and src/ — http://localhost:4173");
