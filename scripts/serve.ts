/**
 * @file Bun static server for dist/: trailing-slash, dir-index, 404.html tree-climb, SPA fallback.
 */
const PORT = Number(process.env.PORT ?? 4173);

Bun.serve({
  port: PORT,
  // TODO(build phase D): serve from dist/ — normalize trailing slash → index.html; serve file if it
  //                      exists; else climb to the nearest 404.html (status 404); SPA fallback last.
  fetch(_req) {
    throw new Error("not implemented");
  }
});

console.log(`[serve] http://localhost:${PORT}`);
