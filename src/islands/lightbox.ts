/**
 * @file lightbox — a fullscreen `<dialog>` image viewer with a pager. Exposes {@link openLightbox}
 * `(slides, index)` as the public entry: the `gallery` island (islands/gallery.ts) calls it with a
 * gallery's full slide set; the `lightbox` island here calls it with a single-entry list for a
 * lone article image. Controls: side `<`/`>` arrows (pointer devices) and keyboard arrows — ←/→
 * page, ↑ magnifies while held (springs back on release), ↓ closes. On touch: drag-to-swipe with
 * live follow, drag down closes, drag up previews an elastic zoom that springs back. Paging is a
 * single continuous push — two image buffers slide together, the old frame out and the new one in.
 * Escape, the round `×` button, or a tap off the controls also close. A horizontal trackpad wheel
 * is swallowed so it can't trigger browser back/forward. Neighbor slides are preloaded; a viewport
 * change (phone rotate) re-snaps to a clean state. Styles in styles/lightbox.css.
 */
import { createComponent } from "@moku-labs/web/browser";

/** One fullscreen slide: image URL + alt (galleries pass resolved slides; a lone image passes one). */
export type LightboxSlide = { src: string; alt: string };

/**
 * The lightbox island's public api — resolved by sibling islands via
 * `ctx.component<LightboxApi>("lightbox")` (the cross-island seam; replaces importing
 * `openLightbox` directly). The `gallery` island calls `open(slides, index)` on a slide click.
 */
export type LightboxApi = { open: (slides: LightboxSlide[], index: number) => void };

/**
 * Force a synchronous reflow so a just-set transform applies before transitions re-enable.
 *
 * @param element - The element to flush layout for.
 * @example
 * forceReflow(view);
 */
function forceReflow(element: HTMLElement): void {
  element.getBoundingClientRect();
}

/** How far (px) a horizontal drag must travel to page to the next slide. */
const SWIPE_PAGE_THRESHOLD = 70;

/** How far (px) a downward drag must travel to close the lightbox. */
const SWIPE_CLOSE_THRESHOLD = 90;

/** Drag distance (px) past which the trailing click must not close the dialog. */
const DRAG_CLICK_SUPPRESS = 10;

/** Duration (ms) of the closing fade — matches the CSS transition. */
const CLOSE_FADE_MS = 220;

/** Duration (ms) of the paging push — matches the CSS transform transition. */
const PAGE_PUSH_MS = 320;

/** Largest extra scale an upward drag previews before springing back (no permanent zoom). */
const PULL_UP_MAX_GROW = 0.5;

/** Scale the held ↑ arrow magnifies the image to (springs back on release). */
const HOLD_ZOOM_SCALE = 2;

/** The dialog and its chrome, built once by {@link buildUi}. */
type LightboxUi = {
  /** The fullscreen `<dialog>`. */
  dialog: HTMLDialogElement;
  /** Drag/tap surface holding the image buffers. */
  body: HTMLDivElement;
  /** Double-buffered stage images (one visible, one standby for the push). */
  views: [HTMLImageElement, HTMLImageElement];
  /** The `2/3` position badge. */
  counter: HTMLSpanElement;
  /** Left arrow (pointer devices). */
  previous: HTMLButtonElement;
  /** Right arrow (pointer devices). */
  next: HTMLButtonElement;
};

let ui: LightboxUi | undefined;

/** The currently visible image buffer. */
let active: HTMLImageElement | undefined;

/** Finalizer for an in-flight paging push (runs early if a new page starts mid-animation). */
let settlePush: (() => void) | undefined;

/** Pager state while the lightbox is open (undefined when closed). */
let pager: { slides: LightboxSlide[]; index: number } | undefined;

/** Active drag state while a pointer is down on the dialog body. */
let drag: { x: number; y: number; axis: "x" | "y" | undefined } | undefined;

/** True right after a drag — suppresses the trailing click so it cannot close the dialog. */
let dragConsumedClick = false;

/** True while the closing fade plays, so a second close request is ignored. */
let closing = false;

/** Pending `dialog.close()` timer for the closing fade — cancelled if the lightbox reopens first. */
let closeTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Build a round lightbox control button.
 *
 * @param glyph - Visible glyph (`<`, `>`, `×`).
 * @param ariaLabel - Accessible name.
 * @returns The button element.
 * @example
 * const close = makeControl("×", "Close");
 */
function makeControl(glyph: string, ariaLabel: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = glyph;
  button.setAttribute("aria-label", ariaLabel);
  return button;
}

/**
 * Apply inline styles to a buffer without transitions (for instant positioning).
 *
 * @param image - The image buffer.
 * @param transform - Transform value to set.
 * @param opacity - Opacity value to set (empty string defers to CSS).
 * @example
 * placeInstant(incoming, "translateX(800px)", "1");
 */
function placeInstant(image: HTMLImageElement, transform: string, opacity: string): void {
  image.style.transition = "none";
  image.style.transform = transform;
  image.style.opacity = opacity;
  forceReflow(image);
  image.style.transition = "";
}

/**
 * Show a shimmer placeholder on a buffer until its image loads (or errors). Cleared immediately
 * when the image is already decoded (cache hit).
 *
 * @param image - The image whose current `src` is loading (a lightbox buffer or a gallery slide).
 * @example
 * image.src = slide.src;
 * trackLoad(image);
 */
export function trackLoad(image: HTMLImageElement): void {
  if (image.complete && image.naturalWidth > 0) {
    delete image.dataset.loading;
    return;
  }
  image.dataset.loading = "";
  /**
   * Drop the shimmer once the image resolves (loaded or errored).
   *
   * @example
   * image.addEventListener("load", clear, { once: true });
   */
  const clear = (): void => {
    delete image.dataset.loading;
  };
  image.addEventListener("load", clear, { once: true });
  image.addEventListener("error", clear, { once: true });
}

/**
 * Preload a pager slide into the browser cache so paging feels instant.
 *
 * @param index - Slide index to warm (out-of-range is ignored).
 * @example
 * preload(pager.index + 1);
 */
function preload(index: number): void {
  const slide = pager?.slides[index];
  if (!slide) return;
  new Image().src = slide.src;
}

/**
 * Sync the counter text and arrow disabled-state to the pager position.
 *
 * @example
 * syncChrome();
 */
function syncChrome(): void {
  if (!ui || !pager) return;
  ui.counter.textContent = `${pager.index + 1}/${pager.slides.length}`;
  ui.previous.disabled = pager.index === 0;
  ui.next.disabled = pager.index === pager.slides.length - 1;
}

/**
 * Reset the active buffer's transform, optionally without the transition (for instant snaps).
 *
 * @param instant - Skip the transition for this reset.
 * @example
 * resetView(true);
 */
function resetView(instant: boolean): void {
  if (!active) return;
  if (instant) {
    placeInstant(active, "", "");
    return;
  }
  active.style.transform = "";
  active.style.opacity = "";
}

/**
 * Hold-to-zoom for the ↑ arrow key: magnify the active image while held, spring back on release
 * (the desktop analog of the mobile pull-up — transient, never a permanent zoom).
 *
 * @param on - True to magnify, false to spring back.
 * @example
 * setZoomHold(true); // on ArrowUp keydown
 */
function setZoomHold(on: boolean): void {
  if (!active) return;
  active.style.transition = "";
  active.style.transform = on ? `scale(${HOLD_ZOOM_SCALE})` : "";
}

/**
 * Show the pager slide at `index` (clamped) as one continuous push: the old frame slides out
 * while the new one slides in from the travel direction, then neighbors are preloaded.
 *
 * @param index - Target slide index.
 * @param fromOffset - Current drag offset of the active frame (a swipe hands over mid-motion).
 * @example
 * showSlide(pager.index + 1);
 */
function showSlide(index: number, fromOffset = 0): void {
  if (!ui || !pager || !active) return;

  const clamped = Math.max(0, Math.min(pager.slides.length - 1, index));
  const direction = Math.sign(clamped - pager.index);
  if (clamped === pager.index) {
    resetView(false);
    return;
  }

  settlePush?.();
  pager.index = clamped;
  const slide = pager.slides[clamped];
  if (!slide) return;

  // Stage the incoming buffer just outside the travel edge, the outgoing one at its drag offset.
  const push = ui.body.clientWidth;
  const outgoing = active;
  const incoming = ui.views[0] === active ? ui.views[1] : ui.views[0];
  incoming.src = slide.src;
  incoming.alt = slide.alt;
  trackLoad(incoming);
  placeInstant(incoming, `translateX(${direction * push}px)`, "1");
  placeInstant(outgoing, `translateX(${fromOffset}px)`, "1");

  // One continuous motion: both buffers travel together.
  outgoing.style.transform = `translateX(${-direction * push}px)`;
  incoming.style.transform = "translateX(0px)";
  active = incoming;

  /**
   * Park the outgoing buffer and normalize the new active frame after the push.
   *
   * @example
   * settlePush?.();
   */
  const settle = (): void => {
    if (settlePush !== settle) return;
    settlePush = undefined;
    placeInstant(outgoing, "", "0");
    placeInstant(incoming, "", "");
  };
  settlePush = settle;
  setTimeout(settle, PAGE_PUSH_MS);

  syncChrome();
  preload(clamped - 1);
  preload(clamped + 1);
}

/**
 * Close with the fade-out animation (double requests are ignored).
 *
 * @example
 * requestClose();
 */
function requestClose(): void {
  if (!ui || closing || !ui.dialog.open) return;
  closing = true;
  ui.dialog.dataset.closing = "";
  closeTimer = setTimeout(() => ui?.dialog.close(), CLOSE_FADE_MS);
}

/**
 * Page the lightbox by `delta` slides (no-op for standalone images or while zoomed).
 *
 * @param delta - Slide offset (-1 previous, +1 next).
 * @example
 * page(1);
 */
function page(delta: number): void {
  if (!pager) return;
  showSlide(pager.index + delta);
}

/**
 * Snap back to a clean state for the current slide — used on viewport changes (phone rotate),
 * where cached pixel geometry and any in-flight transform go stale.
 *
 * @example
 * window.addEventListener("resize", onResize);
 */
function onResize(): void {
  const lb = ui;
  if (!lb?.dialog.open) return;
  settlePush?.();
  drag = undefined;
  lb.dialog.style.opacity = "";
  if (active) placeInstant(active, "", "");
  const standby = lb.views[0] === active ? lb.views[1] : lb.views[0];
  placeInstant(standby, "", "0");
}

/** Keyboard keys the lightbox handles (everything else passes through). */
const HANDLED_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape"]);

/**
 * Document-level keydown while the dialog is open: ←/→ page, ↑ magnifies (held), ↓ and Escape
 * close — all consumed so nothing leaks to the page (or the gallery) underneath.
 *
 * @param event - The keydown event.
 * @example
 * document.addEventListener("keydown", onKeydown, true);
 */
function onKeydown(event: KeyboardEvent): void {
  if (!HANDLED_KEYS.has(event.key)) return;

  event.preventDefault();
  event.stopPropagation();
  switch (event.key) {
    case "Escape":
    case "ArrowDown": {
      requestClose();
      break;
    }
    case "ArrowUp": {
      setZoomHold(true); // held ↑ magnifies (auto-repeat is harmless)
      break;
    }
    case "ArrowLeft": {
      page(-1);
      break;
    }
    case "ArrowRight": {
      page(1);
      break;
    }
  }
}

/**
 * Document-level keyup while the dialog is open: releasing ↑ springs the magnified image back.
 *
 * @param event - The keyup event.
 * @example
 * document.addEventListener("keyup", onKeyup, true);
 */
function onKeyup(event: KeyboardEvent): void {
  if (event.key !== "ArrowUp") return;
  event.preventDefault();
  event.stopPropagation();
  setZoomHold(false);
}

/**
 * Wheel handler: while the lightbox is open, a horizontal trackpad swipe is swallowed so the
 * browser can't turn it into a history back/forward navigation. Paging is buttons + arrow keys
 * only (the trackpad swipe was unreliable), so this no longer pages — it only blocks the gesture.
 *
 * @param event - The wheel event.
 * @example
 * dialog.addEventListener("wheel", onWheel, { passive: false });
 */
function onWheel(event: WheelEvent): void {
  if (!ui?.dialog.open) return;
  // Swallow horizontal scroll so a trackpad swipe doesn't trigger browser back/forward.
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) event.preventDefault();
}

/**
 * Start a drag (touch or mouse) on the dialog body. A fresh interaction always clears stale
 * click suppression (e.g. after a pointercancel).
 *
 * @param event - The pointerdown event.
 * @example
 * body.addEventListener("pointerdown", onPointerDown);
 */
function onPointerDown(event: PointerEvent): void {
  dragConsumedClick = false;
  drag = { x: event.clientX, y: event.clientY, axis: undefined };
  ui?.body.setPointerCapture(event.pointerId);
}

/**
 * Live-follow the drag: horizontal moves the image 1:1 (paging), downward pulls it away (closing)
 * with the dialog fading, upward gives an elastic grow preview that springs back on release.
 *
 * @param event - The pointermove event.
 * @example
 * body.addEventListener("pointermove", onPointerMove);
 */
function onPointerMove(event: PointerEvent): void {
  if (!ui || !drag || !active) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;

  if (!drag.axis) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    drag.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
    active.style.transition = "none";
  }

  if (drag.axis === "x" && pager) {
    active.style.transform = `translateX(${dx}px)`;
  } else if (drag.axis === "y" && dy > 0) {
    // pull down → shrink + fade the backdrop (close preview)
    active.style.transform = `translateY(${dy}px) scale(${Math.max(0.85, 1 - dy / 1200)})`;
    ui.dialog.style.opacity = String(Math.max(0.3, 1 - dy / 500));
  } else if (drag.axis === "y" && dy < 0) {
    // pull up → elastic grow preview only (springs back on release; no permanent zoom)
    const grow = Math.min(PULL_UP_MAX_GROW, -dy / 600);
    active.style.transform = `translateY(${dy * 0.3}px) scale(${1 + grow})`;
  }
}

/**
 * Finish the drag: page on a long horizontal swipe (handing the offset to the push), close on a
 * long pull-down, spring back otherwise (a pull-up always springs back — no permanent zoom).
 *
 * @param event - The pointerup event.
 * @example
 * body.addEventListener("pointerup", onPointerUp);
 */
function onPointerUp(event: PointerEvent): void {
  if (!ui || !drag || !active) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  const axis = drag.axis;
  drag = undefined;

  if (Math.abs(dx) > DRAG_CLICK_SUPPRESS || Math.abs(dy) > DRAG_CLICK_SUPPRESS) {
    dragConsumedClick = true;
  }

  active.style.transition = "";
  ui.dialog.style.opacity = "";

  if (axis === "x" && pager && Math.abs(dx) > SWIPE_PAGE_THRESHOLD) {
    const target = pager.index + (dx < 0 ? 1 : -1);
    if (target >= 0 && target < pager.slides.length) {
      showSlide(target, dx);
      return;
    }
  }
  if (axis === "y" && dy > SWIPE_CLOSE_THRESHOLD) {
    requestClose();
    return;
  }
  resetView(false);
}

/**
 * Build the fullscreen dialog, its chrome and all listeners (runs once).
 *
 * @returns The assembled UI.
 * @example
 * ui ??= buildUi();
 */
function buildUi(): LightboxUi {
  const dialog = document.createElement("dialog");
  dialog.dataset.lightbox = "";
  // Focusable so open() can park focus on the dialog itself — otherwise showModal() autofocuses
  // the close button and its ring reads as "close is selected".
  dialog.tabIndex = -1;

  // Stage: the drag/tap surface with two image buffers (double-buffered paging push).
  const body = document.createElement("div");
  body.dataset.lightboxBody = "";
  const views: [HTMLImageElement, HTMLImageElement] = [
    document.createElement("img"),
    document.createElement("img")
  ];
  body.append(views[0], views[1]);

  // Top bar: position badge + round close.
  const top = document.createElement("div");
  top.dataset.lightboxTop = "";
  const counter = document.createElement("span");
  counter.dataset.lightboxCounter = "";
  const close = makeControl("×", "Close");
  close.dataset.lightboxClose = "";
  top.append(counter, close);

  // Left/right page buttons (hidden on touch devices by CSS — swipe is the pager there). The
  // up/down actions are keyboard-only: ↑ holds to magnify, ↓ closes (see onKeydown/onKeyup).
  const previous = makeControl("<", "Previous photo");
  previous.dataset.lightboxNav = "";
  previous.dataset.side = "prev";
  const next = makeControl(">", "Next photo");
  next.dataset.lightboxNav = "";
  next.dataset.side = "next";

  dialog.append(body, top, previous, next);
  document.body.append(dialog);

  close.addEventListener("click", requestClose);
  previous.addEventListener("click", event => {
    event.stopPropagation();
    page(-1);
  });
  next.addEventListener("click", event => {
    event.stopPropagation();
    page(1);
  });

  // Native cancel (Escape outside our key handler) routes through the animated close.
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    requestClose();
  });
  dialog.addEventListener("close", () => {
    closing = false;
    closeTimer = undefined;
    delete dialog.dataset.closing;
    dialog.style.removeProperty("opacity");
    document.removeEventListener("keydown", onKeydown, true);
    document.removeEventListener("keyup", onKeyup, true);
  });

  dialog.addEventListener("wheel", onWheel, { passive: false });
  body.addEventListener("pointerdown", onPointerDown);
  body.addEventListener("pointermove", onPointerMove);
  body.addEventListener("pointerup", onPointerUp);
  body.addEventListener("pointercancel", () => {
    drag = undefined;
    resetView(false);
    dialog.style.opacity = "";
  });
  globalThis.addEventListener("resize", onResize);
  // iOS fires orientationchange (sometimes before resize settles) — re-snap on both.
  globalThis.addEventListener("orientationchange", onResize);

  // Tap/click off the controls closes (a drag's trailing click is a no-op).
  body.addEventListener("click", event => {
    if (dragConsumedClick) {
      dragConsumedClick = false;
      return;
    }
    if ((event.target as Element).closest("button")) return;
    requestClose();
  });

  return { dialog, body, views, counter, previous, next };
}

/**
 * Open the fullscreen lightbox on a slide set, paged from `index`. The public entry: the gallery
 * island passes a gallery's resolved slides; the lightbox island passes a single-entry list for a
 * lone article image. The pager chrome (arrows + counter) shows only for sets of 2+.
 *
 * @param slides - The slide set ({@link LightboxSlide} list); empty is a no-op.
 * @param index - The slide to open on (clamped into range).
 * @example
 * openLightbox(gallerySlides, 2);
 */
function openLightbox(slides: LightboxSlide[], index: number): void {
  if (slides.length === 0) return;

  ui ??= buildUi();
  settlePush?.();

  // Cancel any in-flight close: reopening mid-fade must not leave the dialog stuck invisible
  // (data-closing → opacity:0) with a pending timer about to close the just-reopened dialog.
  if (closeTimer !== undefined) {
    clearTimeout(closeTimer);
    closeTimer = undefined;
  }
  closing = false;
  delete ui.dialog.dataset.closing;

  const clamped = Math.max(0, Math.min(slides.length - 1, index));
  pager = { slides, index: clamped };

  const paged = slides.length > 1;
  ui.previous.hidden = !paged;
  ui.next.hidden = !paged;
  ui.counter.hidden = !paged;

  // Reset the buffers: first one shows the opening slide, the other parks hidden.
  active = ui.views[0];
  placeInstant(active, "", "");
  placeInstant(ui.views[1], "", "0");
  const slide = slides[clamped];
  if (slide) {
    active.src = slide.src;
    active.alt = slide.alt;
    trackLoad(active);
  }

  syncChrome();
  preload(clamped - 1);
  preload(clamped + 1);

  document.addEventListener("keydown", onKeydown, true);
  document.addEventListener("keyup", onKeyup, true);
  ui.dialog.showModal();
  ui.dialog.focus();
}

/**
 * Open a lone article image (one not inside a gallery — those are handled by the gallery island,
 * which owns the full slide set) in the lightbox, with no pager chrome.
 *
 * @param event - The click event from the article body.
 * @example
 * element.addEventListener("click", openLoneImage);
 */
function openLoneImage(event: Event): void {
  const image = (event.target as Element).closest("img");
  if (!image) return;
  if (image.closest('[data-component="gallery"]')) return;
  const source = image.getAttribute("src");
  if (!source) return;
  openLightbox([{ src: source, alt: image.getAttribute("alt") ?? "" }], 0);
}

/**
 * Lightbox island: a lone article image click → fullscreen dialog (no pager). Also exposes the
 * page-level `open(slides, index)` viewer as its cross-island `api`, resolved by the `gallery`
 * island via `ctx.component<LightboxApi>("lightbox")` (the dialog itself is a page singleton, so its
 * runtime lives in module scope — only the api + the per-instance lone-image listener are wired here).
 */
export const lightbox = createComponent<Record<never, never>, LightboxApi>("lightbox", {
  /**
   * Expose the fullscreen viewer as this island's api (the cross-island seam).
   *
   * @returns The lightbox api with `open(slides, index)`.
   * @example
   * api();
   */
  api() {
    return { open: openLightbox };
  },
  /**
   * Bind the lone-image click handler when the article body mounts (removed on destroy via cleanup).
   *
   * @param ctx - The island lifecycle context.
   * @example
   * onMount(ctx);
   */
  onMount(ctx) {
    ctx.el.addEventListener("click", openLoneImage);
    ctx.cleanup(() => ctx.el.removeEventListener("click", openLoneImage));
  }
});
