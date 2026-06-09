/**
 * @file Draft visibility gate (stage wiring). Proves `makeApp` threads the deployment stage into
 * the framework config: the dev-loop app (`makeApp("development")`, the one `scripts/serve.ts`
 * boots) surfaces draft articles so they are previewable locally, while the exported production
 * `app` (build/preview/deploy entries) keeps the SAME draft invisible — `loadAll` omits it and
 * `load` throws the not-found error (drafts indistinguishable from missing articles).
 *
 * A throwaway draft fixture is written under `content/` for the duration of the suite. Drafts are
 * invisible to every production-stage consumer by definition, so the probe cannot leak into other
 * suites' article counts (e.g. the migration gate in content.test.ts).
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app, makeApp } from "../../src/app";

const SLUG = "draft-stage-probe";
const FIXTURE_DIR = path.join("content", SLUG);

const DRAFT_ARTICLE = `---
title: "Draft stage probe"
date: "2026-01-01"
description: "Throwaway draft fixture for the stage-wiring integration gate."
tags:
  - test
language: en
draft: true
---

This draft exists only while tests/integration/drafts-stage.test.ts runs.
`;

describe("draft visibility is driven by the app stage", () => {
  beforeAll(async () => {
    await mkdir(FIXTURE_DIR, { recursive: true });
    await writeFile(path.join(FIXTURE_DIR, "en.md"), DRAFT_ARTICLE);
  });

  afterAll(async () => {
    await rm(FIXTURE_DIR, { recursive: true, force: true });
  });

  it('the dev-loop app — makeApp("development") — surfaces the draft', async () => {
    const dev = makeApp("development");

    const byLocale = await dev.content.loadAll();
    const en = byLocale.get("en") ?? [];
    const probe = en.find(article => article.computed.slug === SLUG);
    expect(probe?.computed.status).toBe("draft");

    const loaded = await dev.content.load(SLUG, "en");
    expect(loaded.frontmatter.draft).toBe(true);
  });

  it("the production app hides the same draft (loadAll omits it; load throws not-found)", async () => {
    const byLocale = await app.content.loadAll();
    const en = byLocale.get("en") ?? [];
    expect(en.some(article => article.computed.slug === SLUG)).toBe(false);

    await expect(app.content.load(SLUG, "en")).rejects.toThrow(
      `[web] content article "${SLUG}" not found for locale "en".`
    );
  });
});
