/**
 * @file Dev loop (`bun run dev`): build once, serve dist/ in a child process, then watch content/ +
 * src/ and debounced-rebuild on change. `bun --watch` misses *.md, so we drive the SSG build
 * ourselves; the static server runs as a separate child (scripts/serve.ts) so a rebuild never
 * restarts it — the browser just reloads.
 */
import { watch } from "node:fs";
import { app } from "../src/app";
import { PREVIEW_PORT } from "./_config";
import { createLogger } from "./_log";

const log = createLogger("dev");

/** Debounce window that coalesces bursts of FS events into a single rebuild (ms). */
const REBUILD_DEBOUNCE_MS = 150;

log.info("initial build…");
const first = await app.build.run();
log.success(`built ${first.pageCount} pages in ${first.durationMs}ms`);

// Serve dist/ in a child process; it stays up across rebuilds.
const server = Bun.spawn(["bun", "scripts/serve.ts"], { stdout: "inherit", stderr: "inherit" });

let timer: ReturnType<typeof setTimeout> | null = null;
let building = false;

/** Debounced rebuild — coalesces bursts of FS events into a single `app.build.run()`. */
function scheduleRebuild(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    if (building) return;
    building = true;
    try {
      const result = await app.build.run();
      log.success(`rebuilt ${result.pageCount} pages in ${result.durationMs}ms`);
    } catch (error) {
      log.error("rebuild failed", error);
    } finally {
      building = false;
    }
  }, REBUILD_DEBOUNCE_MS);
}

watch("content", { recursive: true }, scheduleRebuild);
watch("src", { recursive: true }, scheduleRebuild);

/** Stop the preview server and exit cleanly on Ctrl-C / termination. */
function shutdown(): void {
  server.kill();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

log.info(`watching content/ and src/ — http://localhost:${PREVIEW_PORT}`);
