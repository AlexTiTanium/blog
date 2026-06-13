/**
 * @file lightbox island — opens article images fullscreen in a `<dialog>` overlay. Mounts on
 * `[data-component="lightbox"]` (the article body wrapper). The dialog is a lazily-built
 * fullscreen singleton reused across article views (styles in styles/lightbox.css). When the
 * clicked image belongs to a photo gallery (islands/gallery.ts) it becomes a pager: side arrows
 * (pointer devices), document-level arrow keys, and drag-to-swipe with live follow on touch.
 * Paging is a single continuous push — two image buffers slide together, the old frame out and
 * the new one in. Swipe down closes, as does Escape, the round `×` button, or a tap anywhere off
 * the controls. Neighbor slides are preloaded. The article body is also where galleries live,
 * and one element hosts one island — so this island drives the gallery enhancement through the
 * same lifecycle.
 */
import { createComponent } from "@moku-labs/web/browser";

import type { GallerySlide } from "./gallery";
import { forceReflow, galleryContextFor, mountGalleries, unmountGalleries } from "./gallery";

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

/** Pager state while a gallery image is open (undefined for standalone images). */
let pager: { slides: GallerySlide[]; index: number } | undefined;

/** Active drag state while a pointer is down on the dialog body. */
let drag: { x: number; y: number; axis: "x" | "y" | undefined } | undefined;

/** True right after a drag — suppresses the trailing click so it cannot close the dialog. */
let dragConsumedClick = false;

/** True while the closing fade plays, so a second close request is ignored. */
let closing = false;

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
  setTimeout(() => ui?.dialog.close(), CLOSE_FADE_MS);
}

/**
 * Page the lightbox by `delta` slides (no-op for standalone images).
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
 * Document-level key handler while the dialog is open: arrows page, Escape closes — all consumed
 * so nothing leaks to the page (or the gallery) underneath.
 *
 * @param event - The keydown event.
 * @example
 * document.addEventListener("keydown", onKeydown, true);
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Escape") return;

  event.preventDefault();
  event.stopPropagation();
  if (event.key === "ArrowLeft") page(-1);
  if (event.key === "ArrowRight") page(1);
  if (event.key === "Escape") requestClose();
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
 * Live-follow the drag: horizontal moves the image 1:1 (paging), downward drags pull it away
 * (closing) with the dialog fading out underneath.
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
    active.style.transform = `translateY(${dy}px) scale(${Math.max(0.85, 1 - dy / 1200)})`;
    ui.dialog.style.opacity = String(Math.max(0.3, 1 - dy / 500));
  }
}

/**
 * Finish the drag: page on a long horizontal swipe (handing the current offset to the push so
 * the motion continues seamlessly), close on a long downward one, spring back otherwise.
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
  active.style.transition = "";
  ui.dialog.style.opacity = "";

  if (Math.abs(dx) > DRAG_CLICK_SUPPRESS || Math.abs(dy) > DRAG_CLICK_SUPPRESS) {
    dragConsumedClick = true;
  }

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

  // Side arrows (hidden on touch devices by CSS — swipe is the pager there).
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
    delete dialog.dataset.closing;
    dialog.style.removeProperty("opacity");
    document.removeEventListener("keydown", onKeydown, true);
  });

  body.addEventListener("pointerdown", onPointerDown);
  body.addEventListener("pointermove", onPointerMove);
  body.addEventListener("pointerup", onPointerUp);
  body.addEventListener("pointercancel", () => {
    drag = undefined;
    resetView(false);
    dialog.style.opacity = "";
  });

  // Tap/click anywhere off the controls closes (a drag's trailing click does not).
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
 * Open the clicked article image in the fullscreen lightbox. Gallery images open with the pager
 * armed on their slide set.
 *
 * @param event - The click event from the article body.
 * @example
 * element.addEventListener("click", openImage);
 */
function openImage(event: Event): void {
  const image = (event.target as Element).closest("img");
  if (!image) return;
  const source = image.getAttribute("src");
  if (!source) return;

  ui ??= buildUi();
  settlePush?.();
  const context = galleryContextFor(image);
  pager = context ? { slides: context.slides, index: context.index } : undefined;

  const paged = pager !== undefined;
  ui.previous.hidden = !paged;
  ui.next.hidden = !paged;
  ui.counter.hidden = !paged;

  // Reset the buffers: first one shows the clicked slide, the other parks hidden.
  active = ui.views[0];
  placeInstant(active, "", "");
  placeInstant(ui.views[1], "", "0");
  active.src = pager ? (pager.slides[pager.index]?.src ?? source) : source;
  active.alt = image.getAttribute("alt") ?? "";

  syncChrome();
  if (pager) {
    preload(pager.index - 1);
    preload(pager.index + 1);
  }

  document.addEventListener("keydown", onKeydown, true);
  ui.dialog.showModal();
  ui.dialog.focus();
}

/** Lightbox island: article image click → fullscreen dialog overlay (+ gallery pager). */
export const lightbox = createComponent("lightbox", {
  /**
   * Bind the image-click handler and build galleries when the article body mounts.
   *
   * @param context - The island lifecycle context.
   * @example
   * onMount(context);
   */
  onMount(context) {
    context.el.addEventListener("click", openImage);
    mountGalleries(context.el);
  },
  /**
   * Remove the image-click handler and tear down galleries when the article body is destroyed.
   *
   * @param context - The island lifecycle context.
   * @example
   * onDestroy(context);
   */
  onDestroy(context) {
    context.el.removeEventListener("click", openImage);
    unmountGalleries(context.el);
  }
});
