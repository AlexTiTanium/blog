/**
 * @file gallery island — enhances a `::gallery` block (the framework's
 * `<div data-island="gallery">`, inner markup from src/components/Gallery.tsx). Mounts on each
 * gallery, tracks the scroll-snap slide track to sync the active dot + chevron disabled-state,
 * wires chevron/dot/arrow-key paging, and opens the fullscreen lightbox (islands/lightbox.ts) on a
 * slide click — paged across the whole set. With no JS the block is already a swipeable strip
 * (Gallery.css); this only adds the chrome behavior.
 */
import { createIsland } from "@moku-labs/web/browser";
import type { LightboxApi, LightboxSlide } from "./lightbox";
import { trackLoad } from "./lightbox";

/**
 * Opens the fullscreen viewer for a slide set — supplied by the gallery island (resolved via
 * `ctx.island("lightbox")`), so `enhanceGallery` never imports the lightbox behaviour directly.
 */
type OpenLightbox = (slides: LightboxSlide[], index: number) => void;

/**
 * A slide's center in the track's scroll-content coordinates. Measured via bounding rects —
 * `offsetLeft` is relative to the nearest positioned ancestor, not the scroll container.
 *
 * @param track - The scrolling slide track.
 * @param slide - One slide image.
 * @returns The slide-center x position within the scrollable content.
 * @example
 * const center = slideCenter(track, slides[0]);
 */
function slideCenter(track: HTMLElement, slide: HTMLElement): number {
  const trackRect = track.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();
  return slideRect.left - trackRect.left + track.scrollLeft + slideRect.width / 2;
}

/**
 * Index of the slide whose center is nearest the track's visible center.
 *
 * @param track - The scrolling slide track.
 * @param slides - The slide images.
 * @returns The nearest slide index (0 when empty).
 * @example
 * const current = nearestSlideIndex(track, slides);
 */
function nearestSlideIndex(track: HTMLElement, slides: HTMLElement[]): number {
  const viewCenter = track.scrollLeft + track.clientWidth / 2;

  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const [index, slide] of slides.entries()) {
    const distance = Math.abs(slideCenter(track, slide) - viewCenter);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  }

  return nearest;
}

/**
 * Smooth-scroll the track so the slide at `index` lands centered (index is clamped).
 *
 * @param track - The scrolling slide track.
 * @param slides - The slide images.
 * @param index - Target slide index.
 * @param behavior - Scroll behavior (`"smooth"` for paging, `"instant"` for re-centering).
 * @example
 * scrollToSlide(track, slides, current + 1);
 */
function scrollToSlide(
  track: HTMLElement,
  slides: HTMLElement[],
  index: number,
  behavior: ScrollBehavior = "smooth"
): void {
  const slide = slides[Math.max(0, Math.min(slides.length - 1, index))];
  if (!slide) return;
  track.scrollTo({ left: slideCenter(track, slide) - track.clientWidth / 2, behavior });
}

/**
 * Mark `data-current` on exactly the dot at `index`.
 *
 * @param dots - The dot buttons.
 * @param index - The current slide index.
 * @example
 * markCurrentDot(dots, 2);
 */
function markCurrentDot(dots: HTMLElement[], index: number): void {
  for (const [position, dot] of dots.entries()) {
    if (position === index) dot.dataset.current = "";
    else delete dot.dataset.current;
  }
}

/**
 * Wire one gallery element: scroll tracking, chevron/dot/arrow paging, and click-to-lightbox.
 *
 * @param root - The gallery element (the framework's `[data-island="gallery"]`).
 * @param open - Opens the fullscreen viewer (resolved from the lightbox island's api).
 * @returns A teardown removing all listeners/observers.
 * @example
 * const cleanup = enhanceGallery(galleryEl, open);
 */
function enhanceGallery(root: HTMLElement, open: OpenLightbox): () => void {
  const track = root.querySelector<HTMLElement>("[data-gallery-track]");
  if (!track) return () => {};

  const slides = [...track.querySelectorAll<HTMLElement>("[data-gallery-slide]")];
  const dots = [...root.querySelectorAll<HTMLElement>("[data-gallery-dot]")];
  const previous = root.querySelector<HTMLButtonElement>('[data-gallery-nav="prev"]');
  const next = root.querySelector<HTMLButtonElement>('[data-gallery-nav="next"]');
  if (slides.length === 0) return () => {};

  // The slide set handed to the lightbox (resolved URLs + per-slide alt).
  const lightboxSlides: LightboxSlide[] = slides.map(slide => ({
    src: (slide as HTMLImageElement).currentSrc || (slide as HTMLImageElement).src,
    alt: (slide as HTMLImageElement).alt
  }));

  // Shimmer each slide until it decodes (lazy slides load as they scroll into view).
  for (const slide of slides) trackLoad(slide as HTMLImageElement);

  // Arrow keys page the focused gallery.
  root.tabIndex = 0;

  let current = 0;

  /**
   * Recompute the centered slide and sync dots + chevron disabled-state.
   *
   * @example
   * update();
   */
  const update = (): void => {
    current = nearestSlideIndex(track, slides);
    markCurrentDot(dots, current);
    if (previous) previous.disabled = current === 0;
    if (next) next.disabled = current === slides.length - 1;
  };

  let frameId = 0;
  /**
   * Scroll/resize handler throttled to one {@link update} per animation frame.
   *
   * @example
   * track.addEventListener("scroll", onScroll);
   */
  const onScroll = (): void => {
    if (frameId) return;
    frameId = requestAnimationFrame(() => {
      frameId = 0;
      update();
    });
  };

  /**
   * Re-center the current slide instantly — slide widths track the viewport, so after a rotate the
   * pixel scroll offset no longer centers anything.
   *
   * @example
   * window.addEventListener("resize", recenter);
   */
  const recenter = (): void => {
    scrollToSlide(track, slides, current, "instant");
  };

  /**
   * Build a handler scrolling by `delta` slides from the centered one.
   *
   * @param delta - Slide offset (-1 previous, +1 next).
   * @returns The click handler.
   * @example
   * next.addEventListener("click", step(1));
   */
  const step = (delta: number) => (): void => {
    scrollToSlide(track, slides, nearestSlideIndex(track, slides) + delta);
  };
  const stepBack = step(-1);
  const stepForward = step(1);

  /**
   * Arrow-key paging for the focused gallery.
   *
   * @param event - The keydown event.
   * @example
   * root.addEventListener("keydown", onKeydown);
   */
  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    if (event.key === "ArrowLeft") stepBack();
    else stepForward();
  };

  /**
   * Open the clicked slide fullscreen, paged across the whole set.
   *
   * @param event - The click event on the track.
   * @example
   * track.addEventListener("click", onSlideClick);
   */
  const onSlideClick = (event: Event): void => {
    const image = (event.target as Element).closest<HTMLElement>("[data-gallery-slide]");
    if (!image) return;
    const index = slides.indexOf(image);
    open(lightboxSlides, index === -1 ? current : index);
  };

  /**
   * Build a click handler that jumps to the dot's slide.
   *
   * @param index - The dot's slide index.
   * @returns The click handler.
   * @example
   * dot.addEventListener("click", dotHandler(2));
   */
  const dotHandler = (index: number) => (): void => {
    scrollToSlide(track, slides, index);
  };
  const dotBindings = dots.map((dot, index) => ({ dot, handler: dotHandler(index) }));

  track.addEventListener("scroll", onScroll, { passive: true });
  track.addEventListener("click", onSlideClick);
  previous?.addEventListener("click", stepBack);
  next?.addEventListener("click", stepForward);
  for (const { dot, handler } of dotBindings) dot.addEventListener("click", handler);
  root.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", recenter);

  // Slides lazy-load: sizes change without a scroll event, so re-sync on box changes.
  const observer = new ResizeObserver(onScroll);
  for (const slide of slides) observer.observe(slide);
  update();

  return () => {
    track.removeEventListener("scroll", onScroll);
    track.removeEventListener("click", onSlideClick);
    previous?.removeEventListener("click", stepBack);
    next?.removeEventListener("click", stepForward);
    for (const { dot, handler } of dotBindings) dot.removeEventListener("click", handler);
    root.removeEventListener("keydown", onKeydown);
    window.removeEventListener("resize", recenter);
    observer.disconnect();
    if (frameId) cancelAnimationFrame(frameId);
  };
}

/** Gallery island: enhances each `::gallery` block with paging + click-to-lightbox. */
export const gallery = createIsland("gallery", {
  /**
   * Enhance the gallery on mount; its listeners/observers are released via `ctx.cleanup`. The
   * fullscreen viewer is resolved from the sibling `lightbox` island's api (`ctx.island`), so
   * the gallery no longer imports the lightbox behaviour directly.
   *
   * @param ctx - The island lifecycle context.
   * @example
   * onMount(ctx);
   */
  onMount(ctx) {
    // eslint-disable-next-line jsdoc/require-jsdoc -- inline binding of the lightbox island's api
    const open: OpenLightbox = (slides, index) =>
      ctx.island<LightboxApi>("lightbox")?.open(slides, index);
    ctx.cleanup(enhanceGallery(ctx.el as HTMLElement, open));
  }
});
