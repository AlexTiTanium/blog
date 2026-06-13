/**
 * @file lightbox — a fullscreen `<dialog>` image viewer with a pager. Exposes {@link openLightbox}
 * `(slides, index)` as the public entry: the `gallery` island (islands/gallery.ts) calls it with a
 * gallery's full slide set; the `lightbox` island here calls it with a single-entry list for a
 * lone article image. Controls: side arrows (pointer devices), document-level arrow keys, trackpad
 * horizontal wheel, and drag-to-swipe with live follow on touch. Paging is a single continuous
 * push — two image buffers slide together, the old frame out and the new one in. Drag down closes;
 * drag up zooms into a pannable view. Escape, the round `×` button, or a tap off the controls also
 * close. Neighbor slides are preloaded; a viewport change (phone rotate) re-snaps to a clean state.
 * Styles in styles/lightbox.css.
 */
import { createComponent } from "@moku-labs/web/browser";

/** One fullscreen slide: image URL + alt (galleries pass resolved slides; a lone image passes one). */
export type LightboxSlide = { src: string; alt: string };

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

/** How far (px) an upward drag must travel to lock into the zoomed view. */
const SWIPE_ZOOM_THRESHOLD = 70;

/** Drag distance (px) past which the trailing click must not close the dialog. */
const DRAG_CLICK_SUPPRESS = 10;

/** Duration (ms) of the closing fade — matches the CSS transition. */
const CLOSE_FADE_MS = 220;

/** Duration (ms) of the paging push — matches the CSS transform transition. */
const PAGE_PUSH_MS = 320;

/** Scale factor of the zoomed view. */
const ZOOM_SCALE = 2.4;

/** Accumulated trackpad deltaX (px) that pages one slide. */
const WHEEL_PAGE_THRESHOLD = 80;

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

/** Zoom state: scale 1 = normal, ZOOM_SCALE = zoomed-and-pannable; pan is the committed offset. */
let zoom = { scale: 1, panX: 0, panY: 0 };

/** Accumulated trackpad deltaX between paging steps. */
let wheelAccum = 0;

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
 * CSS transform for the current zoom + pan of the active buffer.
 *
 * @param extraX - Live drag dx to add to the committed pan.
 * @param extraY - Live drag dy to add to the committed pan.
 * @returns The transform string.
 * @example
 * active.style.transform = zoomTransform(dx, dy);
 */
function zoomTransform(extraX = 0, extraY = 0): string {
  return `translate(${zoom.panX + extraX}px, ${zoom.panY + extraY}px) scale(${zoom.scale})`;
}

/**
 * Whether the lightbox is currently zoomed in.
 *
 * @returns True when the active buffer is scaled up.
 * @example
 * if (isZoomed()) exitZoom();
 */
function isZoomed(): boolean {
  return zoom.scale !== 1;
}

/**
 * Leave the zoomed view and spring the image back to its fitted size.
 *
 * @example
 * exitZoom();
 */
function exitZoom(): void {
  zoom = { scale: 1, panX: 0, panY: 0 };
  if (active) active.style.transform = "";
  if (ui) delete ui.body.dataset.zoomed;
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
  if (isZoomed()) exitZoom();

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
 * Page the lightbox by `delta` slides (no-op for standalone images or while zoomed).
 *
 * @param delta - Slide offset (-1 previous, +1 next).
 * @example
 * page(1);
 */
function page(delta: number): void {
  if (!pager || isZoomed()) return;
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
  zoom = { scale: 1, panX: 0, panY: 0 };
  lb.dialog.style.opacity = "";
  delete lb.body.dataset.zoomed;
  if (active) placeInstant(active, "", "");
  const standby = lb.views[0] === active ? lb.views[1] : lb.views[0];
  placeInstant(standby, "", "0");
}

/**
 * Document-level key handler while the dialog is open: arrows page, Escape closes/unzooms — all
 * consumed so nothing leaks to the page (or the gallery) underneath.
 *
 * @param event - The keydown event.
 * @example
 * document.addEventListener("keydown", onKeydown, true);
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Escape") return;

  event.preventDefault();
  event.stopPropagation();
  if (event.key === "Escape") {
    if (isZoomed()) exitZoom();
    else requestClose();
    return;
  }
  if (event.key === "ArrowLeft") page(-1);
  if (event.key === "ArrowRight") page(1);
}

/**
 * Trackpad / wheel handler: a horizontal swipe pages (and is prevented so the browser does not
 * trigger history back/forward), a vertical wheel is left alone.
 *
 * @param event - The wheel event.
 * @example
 * dialog.addEventListener("wheel", onWheel, { passive: false });
 */
function onWheel(event: WheelEvent): void {
  if (!ui?.dialog.open || isZoomed()) return;
  if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

  // Claim the horizontal gesture so macOS/Chrome can't turn it into a page back/forward.
  event.preventDefault();
  if (!pager) return;

  wheelAccum += event.deltaX;
  if (Math.abs(wheelAccum) >= WHEEL_PAGE_THRESHOLD) {
    page(wheelAccum > 0 ? 1 : -1);
    wheelAccum = 0;
  }
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
 * Live-follow the drag. Zoomed: pan the image. Otherwise: horizontal moves the image 1:1
 * (paging), downward pulls it away (closing) with the dialog fading, upward scales it up (zoom
 * preview).
 *
 * @param event - The pointermove event.
 * @example
 * body.addEventListener("pointermove", onPointerMove);
 */
function onPointerMove(event: PointerEvent): void {
  if (!ui || !drag || !active) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;

  if (isZoomed()) {
    active.style.transition = "none";
    active.style.transform = zoomTransform(dx, dy);
    return;
  }

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
    // pull up → grow toward the zoom scale (zoom preview)
    const grow = Math.min(ZOOM_SCALE - 1, -dy / 260);
    active.style.transform = `translateY(${dy * 0.4}px) scale(${1 + grow})`;
  }
}

/**
 * Finish the drag. Zoomed: commit the pan, or exit on a tap. Otherwise: page on a long
 * horizontal swipe (handing the offset to the push), close on a long pull-down, enter zoom on a
 * long pull-up, spring back otherwise.
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

  if (isZoomed()) {
    // Commit the pan; a tap (no real movement) is handled by the click→exitZoom path.
    zoom.panX += dx;
    zoom.panY += dy;
    active.style.transition = "";
    active.style.transform = zoomTransform();
    return;
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
  if (axis === "y" && dy < -SWIPE_ZOOM_THRESHOLD) {
    enterZoom();
    return;
  }
  resetView(false);
}

/**
 * Enter the zoomed, pannable view.
 *
 * @example
 * enterZoom();
 */
function enterZoom(): void {
  if (!ui || !active) return;
  zoom = { scale: ZOOM_SCALE, panX: 0, panY: 0 };
  active.style.transition = "";
  active.style.transform = zoomTransform();
  ui.body.dataset.zoomed = "";
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
    zoom = { scale: 1, panX: 0, panY: 0 };
    wheelAccum = 0;
    delete dialog.dataset.closing;
    dialog.style.removeProperty("opacity");
    delete body.dataset.zoomed;
    document.removeEventListener("keydown", onKeydown, true);
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
  window.addEventListener("resize", onResize);

  // Tap/click off the controls: exit zoom if zoomed, else close (a drag's trailing click is no-op).
  body.addEventListener("click", event => {
    if (dragConsumedClick) {
      dragConsumedClick = false;
      return;
    }
    if ((event.target as Element).closest("button")) return;
    if (isZoomed()) exitZoom();
    else requestClose();
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
export function openLightbox(slides: LightboxSlide[], index: number): void {
  if (slides.length === 0) return;

  ui ??= buildUi();
  settlePush?.();
  zoom = { scale: 1, panX: 0, panY: 0 };
  wheelAccum = 0;
  delete ui.body.dataset.zoomed;

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
  }

  syncChrome();
  preload(clamped - 1);
  preload(clamped + 1);

  document.addEventListener("keydown", onKeydown, true);
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

/** Lightbox island: a lone article image click → fullscreen dialog (no pager). */
export const lightbox = createComponent("lightbox", {
  /**
   * Bind the lone-image click handler when the article body mounts.
   *
   * @param context - The island lifecycle context.
   * @example
   * onMount(context);
   */
  onMount(context) {
    context.el.addEventListener("click", openLoneImage);
  },
  /**
   * Remove the lone-image click handler when the article body is destroyed.
   *
   * @param context - The island lifecycle context.
   * @example
   * onDestroy(context);
   */
  onDestroy(context) {
    context.el.removeEventListener("click", openLoneImage);
  }
});
