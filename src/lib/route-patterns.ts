/**
 * @file Pattern-only route map for link building. `createUrls()` only needs each route's name +
 * pattern, so this declares them WITHOUT the layout/render/page wiring of `src/routes.tsx`. Keeping
 * it separate lets `./urls` build links without importing the page/layout components — which import
 * `./urls` back, and would otherwise form a module-initialization cycle (TDZ on `layout`).
 *
 * Names + patterns MUST mirror `src/routes.tsx` / `src/routes.build.tsx`.
 */
import { defineRoutes, route } from "@moku-labs/web/browser";

/** Pattern-only route map consumed by `createUrls()` in `./urls`. */
export const routePatterns = defineRoutes({
  home: route("/{lang:?}/"),
  homePaged: route("/{lang:?}/page/{page}/"),
  archive: route("/{lang:?}/archive/"),
  archivePaged: route("/{lang:?}/archive/page/{page}/"),
  article: route("/{lang:?}/{slug}/"),
  tag: route("/{lang:?}/tags/{tag}/"),
  about: route("/{lang:?}/about/")
});
