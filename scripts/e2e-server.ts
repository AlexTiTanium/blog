/**
 * @file Playwright webServer entry: builds the FIXTURE corpus (`tests/fixtures/content` — a
 * frozen article set, independent of the real `content/`) into `dist-e2e/`, then serves it.
 * Because the corpus is frozen, e2e expectations and visual baselines never change when real
 * articles are published — and the fixtures deliberately keep cases the live corpus may lack
 * (>PAGE_SIZE articles for pagination, untranslated articles for the locale-fallback notice).
 */
import { makeApp } from "../src/app";

const app = makeApp("production", { contentDir: "tests/fixtures/content", outDir: "dist-e2e" });

await app.cli.build();
await app.cli.preview();
