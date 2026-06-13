/**
 * @file Photo-gallery enhancement for article bodies. A markdown paragraph holding 2+ adjacent
 * images is a gallery: the base CSS (styles/gallery.css) renders it as a swipeable scroll-snap
 * strip even without JS, and this module wraps each strip in a `[data-gallery]` frame — one
 * full-width slide at a time, overlay chevrons, and an amber dot rail underneath. The frame is
 * focusable and pages with the arrow keys. It also feeds the lightbox (islands/lightbox.ts) the
 * slide list behind any clicked image via {@link galleryContextFor}, so the fullscreen view can
 * page through the set. Invoked by the `lightbox` island — the article body carries a single
 * `data-component` mount, so the gallery rides the same lifecycle instead of being its own island.
 */

/** Teardown callback returned by the per-strip builder. */
type Cleanup = () => void;

/** One slide's display data (used by the page chrome and the lightbox pager). */
export type GallerySlide = {
  /** Image URL. */
  src: string;
  /** Localized alt text. */
  alt: string;
};

/** Lightbox pager context for an image that belongs to a gallery. */
export type GalleryContext = {
  /** All slides of the gallery, in order. */
  slides: GallerySlide[];
  /** The clicked image's slide index. */
  index: number;
};

/** Per-article-body teardown lists, keyed by the mounted island element. */
const cleanups = new WeakMap<Element, Cleanup[]>();

/** Lightbox lookup: visible image → getter for its gallery context. */
const registry = new WeakMap<HTMLImageElement, () => GalleryContext>();

/**
 * Resolve the gallery behind a clicked article image, if any — the lightbox uses this to enable
 * its prev/next pager.
 *
 * @param image - The clicked `<img>`.
 * @returns The gallery context, or `undefined` for a standalone image.
 * @example
 * const context = galleryContextFor(clickedImage);
 */
export function galleryContextFor(image: HTMLImageElement): GalleryContext | undefined {
  return registry.get(image)?.();
}

/**
 * Force a synchronous reflow so a just-set transform applies before transitions re-enable.
 *
 * @param element - The element to flush layout for.
 * @example
 * forceReflow(view);
 */
export function forceReflow(element: HTMLElement): void {
  element.getBoundingClientRect();
}

/**
 * Collect the strip's slides — the paragraph's direct `<img>` children.
 *
 * @param strip - The gallery paragraph.
 * @returns The slide images in document order.
 * @example
 * const images = stripImages(paragraph);
 */
function stripImages(strip: HTMLParagraphElement): HTMLImageElement[] {
  return [...strip.querySelectorAll<HTMLImageElement>(":scope > img")];
}

/**
 * A slide's center in the strip's scroll-content coordinates. Measured via bounding rects —
 * `offsetLeft` is relative to the nearest positioned ancestor, not the scroll container.
 *
 * @param strip - The scrolling gallery paragraph.
 * @param slide - One slide image.
 * @returns The slide-center x position within the scrollable content.
 * @example
 * const center = slideCenter(strip, images[0]);
 */
function slideCenter(strip: HTMLParagraphElement, slide: HTMLImageElement): number {
  const stripRect = strip.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();
  return slideRect.left - stripRect.left + strip.scrollLeft + slideRect.width / 2;
}

/**
 * Index of the slide whose center is nearest to the strip's visible center.
 *
 * @param strip - The scrolling gallery paragraph.
 * @param images - The strip's slide images.
 * @returns The nearest slide index (0 when the strip is empty).
 * @example
 * const current = nearestSlideIndex(strip, images);
 */
function nearestSlideIndex(strip: HTMLParagraphElement, images: HTMLImageElement[]): number {
  const viewCenter = strip.scrollLeft + strip.clientWidth / 2;

  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const [index, slide] of images.entries()) {
    const distance = Math.abs(slideCenter(strip, slide) - viewCenter);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  }

  return nearest;
}

/**
 * Smooth-scroll the strip so the requested slide lands centered (index is clamped).
 *
 * @param strip - The scrolling gallery paragraph.
 * @param images - The strip's slide images.
 * @param index - Target slide index; out-of-range values are clamped.
 * @example
 * scrollToSlide(strip, images, current + 1);
 */
function scrollToSlide(
  strip: HTMLParagraphElement,
  images: HTMLImageElement[],
  index: number
): void {
  const slide = images[Math.max(0, Math.min(images.length - 1, index))];
  if (!slide) return;
  const left = slideCenter(strip, slide) - strip.clientWidth / 2;
  strip.scrollTo({ left, behavior: "smooth" });
}

/**
 * Wire a strip's scroll-position tracking: `apply(current)` runs once per animation frame on
 * scroll/resize (slides lazy-load, so sizes change without scroll events), plus step handlers
 * for prev/next controls.
 *
 * @param strip - The scrolling gallery paragraph.
 * @param images - The strip's slide images.
 * @param apply - Chrome-sync callback receiving the centered slide index.
 * @returns Step handlers and a dispose callback.
 * @example
 * const tracker = trackStrip(strip, images, current => markCurrent(dots, current));
 */
function trackStrip(
  strip: HTMLParagraphElement,
  images: HTMLImageElement[],
  apply: (current: number) => void
): { stepBack: () => void; stepForward: () => void; dispose: () => void } {
  /**
   * Recompute the centered slide and sync the chrome.
   *
   * @example
   * update();
   */
  const update = (): void => {
    apply(nearestSlideIndex(strip, images));
  };

  let frameId = 0;
  /**
   * Scroll/resize handler throttled to one {@link update} per animation frame.
   *
   * @example
   * strip.addEventListener("scroll", onScroll);
   */
  const onScroll = (): void => {
    if (frameId) return;
    frameId = requestAnimationFrame(() => {
      frameId = 0;
      update();
    });
  };

  /**
   * Build a handler scrolling by `delta` slides from the current one.
   *
   * @param delta - Slide offset (-1 previous, +1 next).
   * @returns The click handler.
   * @example
   * next.addEventListener("click", step(1));
   */
  const step = (delta: number) => (): void => {
    scrollToSlide(strip, images, nearestSlideIndex(strip, images) + delta);
  };

  strip.addEventListener("scroll", onScroll, { passive: true });
  const observer = new ResizeObserver(onScroll);
  for (const slide of images) observer.observe(slide);
  update();

  /**
   * Detach the scroll listener and observer, cancel any pending frame.
   *
   * @example
   * tracker.dispose();
   */
  const dispose = (): void => {
    strip.removeEventListener("scroll", onScroll);
    observer.disconnect();
    if (frameId) cancelAnimationFrame(frameId);
  };

  return { stepBack: step(-1), stepForward: step(1), dispose };
}

/**
 * Build a `<button>` with gallery styling hooks.
 *
 * @param label - Visible text (terminal glyphs like `<<`).
 * @param ariaLabel - Accessible name.
 * @returns The button element.
 * @example
 * const next = makeButton(">>", "Next photo");
 */
function makeButton(label: string, ariaLabel: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-label", ariaLabel);
  return button;
}

/**
 * Build an overlay chevron zone (`prev`/`next`) for the slide stage.
 *
 * @param side - Which side of the stage the zone covers.
 * @returns The zone button.
 * @example
 * stage.append(makeZone("next"));
 */
function makeZone(side: "prev" | "next"): HTMLButtonElement {
  const zone = makeButton("", side === "prev" ? "Previous photo" : "Next photo");
  zone.dataset.galleryZone = "";
  zone.dataset.side = side;
  const glyph = document.createElement("span");
  glyph.textContent = side === "prev" ? "<" : ">";
  zone.append(glyph);
  return zone;
}

/**
 * Mark `data-current` on exactly one element of a list.
 *
 * @param elements - Candidate elements.
 * @param index - The current index.
 * @example
 * markCurrent(dots, 2);
 */
function markCurrent(elements: HTMLElement[], index: number): void {
  for (const [position, element] of elements.entries()) {
    if (position === index) element.dataset.current = "";
    else delete element.dataset.current;
  }
}

/**
 * Bind arrow-key paging to a gallery frame (the frame is focusable; keys are consumed so the
 * page does not scroll underneath).
 *
 * @param frame - The gallery frame element.
 * @param step - Pager callback receiving -1/+1.
 * @returns Teardown removing the listener.
 * @example
 * const unbind = bindArrowKeys(frame, delta => (delta < 0 ? back() : forward()));
 */
function bindArrowKeys(frame: HTMLElement, step: (delta: number) => void): Cleanup {
  /**
   * Arrow-key handler for the focused frame.
   *
   * @param event - The keydown event.
   * @example
   * frame.addEventListener("keydown", onKeydown);
   */
  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    step(event.key === "ArrowLeft" ? -1 : 1);
  };
  frame.addEventListener("keydown", onKeydown);
  return () => frame.removeEventListener("keydown", onKeydown);
}

/**
 * Enhance one strip: wrap it in the gallery frame (full-width slides), add overlay chevrons and
 * the dot rail, register slides for the lightbox pager.
 *
 * @param strip - The gallery paragraph (2+ direct images).
 * @returns Teardown restoring the bare strip.
 * @example
 * const cleanup = buildGallery(strip);
 */
function buildGallery(strip: HTMLParagraphElement): Cleanup {
  const images = stripImages(strip);
  const slides = images.map(image => ({ src: image.src, alt: image.alt }));
  for (const [index, image] of images.entries()) {
    registry.set(image, () => ({ slides, index }));
  }

  const frame = document.createElement("div");
  frame.dataset.gallery = "";
  frame.tabIndex = 0;
  strip.before(frame);

  const stage = document.createElement("div");
  stage.dataset.galleryStage = "";
  frame.append(stage);
  stage.append(strip);

  const zonePrevious = makeZone("prev");
  const zoneNext = makeZone("next");
  stage.append(zonePrevious, zoneNext);

  const rail = document.createElement("div");
  rail.dataset.galleryDots = "";
  const dots = images.map((_, index) => {
    const dot = makeButton("", `Photo ${index + 1}`);
    dot.addEventListener("click", () => scrollToSlide(strip, images, index));
    return dot;
  });
  rail.append(...dots);
  frame.append(rail);

  const tracker = trackStrip(strip, images, current => {
    markCurrent(dots, current);
    zonePrevious.disabled = current === 0;
    zoneNext.disabled = current === images.length - 1;
  });

  zonePrevious.addEventListener("click", tracker.stepBack);
  zoneNext.addEventListener("click", tracker.stepForward);
  const unbindKeys = bindArrowKeys(frame, delta =>
    delta < 0 ? tracker.stepBack() : tracker.stepForward()
  );

  return () => {
    zonePrevious.removeEventListener("click", tracker.stepBack);
    zoneNext.removeEventListener("click", tracker.stepForward);
    unbindKeys();
    tracker.dispose();
    frame.before(strip);
    frame.remove();
  };
}

/**
 * Enhance every multi-image paragraph inside an article body into a controlled gallery.
 *
 * @param root - The article body element (the `lightbox` island mount).
 * @example
 * mountGalleries(context.el);
 */
export function mountGalleries(root: Element): void {
  const strips = [...root.querySelectorAll<HTMLParagraphElement>("p")].filter(
    paragraph => paragraph.querySelectorAll(":scope > img").length >= 2
  );
  cleanups.set(
    root,
    strips.map(strip => buildGallery(strip))
  );
}

/**
 * Tear down every gallery previously mounted for an article body.
 *
 * @param root - The article body element passed to {@link mountGalleries}.
 * @example
 * unmountGalleries(context.el);
 */
export function unmountGalleries(root: Element): void {
  for (const cleanup of cleanups.get(root) ?? []) cleanup();
  cleanups.delete(root);
}
