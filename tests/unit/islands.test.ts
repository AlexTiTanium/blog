// @vitest-environment happy-dom
/**
 * @file Unit tests for blog islands via `@moku-labs/web/testing` — the cross-island `api` seam
 * (gallery → lightbox through `ctx.island`, no module import) plus DOM-only islands that were
 * previously only reachable through Playwright E2E.
 */

import { mountIsland } from "@moku-labs/web/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dashboard } from "../../src/islands/dashboard";
import { gallery } from "../../src/islands/gallery";
import { tabNav } from "../../src/islands/tab-nav";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  globalThis.history.pushState({}, "", "/");
});

describe("tab-nav island", () => {
  const THREE_TABS = "<a></a><a></a><a></a>";

  it("marks the active tab from the URL on mount and re-syncs on navEnd", () => {
    globalThis.history.pushState({}, "", "/archive/");
    const handle = mountIsland(tabNav, { html: THREE_TABS, persistent: true });

    const tabs = handle.el.querySelectorAll("a");
    expect(tabs[1]?.getAttribute("aria-current")).toBe("page"); // archive (2nd tab) active
    expect(tabs[0]?.getAttribute("aria-current")).toBeNull();

    globalThis.history.pushState({}, "", "/");
    handle.navEnd();
    expect(tabs[0]?.getAttribute("aria-current")).toBe("page"); // home active now
    expect(tabs[1]?.getAttribute("aria-current")).toBeNull();
  });
});

describe("dashboard island", () => {
  it("stamps data-entered after the entrance window, and cancels the timer on unmount", () => {
    vi.useFakeTimers();
    try {
      const handle = mountIsland(dashboard, { html: "<div></div>" });
      expect(handle.el.dataset.entered).toBeUndefined();
      vi.advanceTimersByTime(1600);
      expect(handle.el.dataset.entered).toBe("");

      // A fresh instance unmounted before the window must not stamp.
      const pending = mountIsland(dashboard, { html: "<div></div>" });
      pending.unmount();
      vi.advanceTimersByTime(2000);
      expect(pending.el.dataset.entered).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("gallery island — cross-island api", () => {
  const GALLERY_HTML =
    "<div data-gallery-track>" +
    '<img data-gallery-slide src="a.jpg" alt="A" /><img data-gallery-slide src="b.jpg" alt="B" />' +
    "</div>" +
    '<button data-gallery-nav="prev"></button><button data-gallery-nav="next"></button>';

  it("opens the lightbox island's viewer via ctx.island on a slide click", () => {
    const open = vi.fn();
    const handle = mountIsland(gallery, {
      html: GALLERY_HTML,
      islands: { lightbox: { open } }
    });

    const slides = handle.el.querySelectorAll<HTMLElement>("[data-gallery-slide]");
    slides[1]?.dispatchEvent(new Event("click", { bubbles: true }));

    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0]?.[1]).toBe(1); // opened paged to the clicked slide (index 1)
    const slidesArg = open.mock.calls[0]?.[0] as Array<{ alt: string }>;
    expect(slidesArg.map(s => s.alt)).toEqual(["A", "B"]);
  });

  it("no-ops gracefully when no lightbox provider is registered", () => {
    const handle = mountIsland(gallery, { html: GALLERY_HTML });
    const slide = handle.el.querySelector<HTMLElement>("[data-gallery-slide]");
    // ctx.island("lightbox") → undefined → optional-chained no-op (no throw).
    expect(() => slide?.dispatchEvent(new Event("click", { bubbles: true }))).not.toThrow();
  });
});
