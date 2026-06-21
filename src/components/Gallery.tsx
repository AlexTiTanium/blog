/**
 * @file `::gallery` component — the inner content the framework SSRs (to static markup at build
 * time) inside its `<div class="gallery" data-island="gallery">` wrapper. Renders a full-width
 * scroll-snap slide track plus the chevron + dot controls; with no JS it is already a swipeable
 * strip (the CSS fallback). The `gallery` SPA island (src/islands/gallery.ts) enhances it —
 * active-dot sync, chevron/keyboard paging, click-to-open the fullscreen lightbox. Styled in
 * Gallery.css. Wired via `gallery: { component: Gallery }` in src/app.ts.
 */
import type { GalleryProps } from "@moku-labs/web";
import type { VNode } from "preact";

/**
 * Render the gallery's inner content: a slide track (one `<img>` per resolved slide) with overlay
 * chevrons and a dot rail. Counts come from `slides`, so the dots/track are correct before
 * hydration; the island only wires behavior.
 *
 * @param props - The framework-resolved gallery props (the `slides` drive the markup).
 * @returns The gallery inner-content VNode.
 * @example
 * <Gallery slides={slides} caption="Our game" attributes={{}} />
 */
export function Gallery({ slides }: GalleryProps): VNode {
  return (
    <>
      {/* viewport wraps ONLY the track, so the overlay chevrons center on the image (the dot rail
          lives outside it — otherwise the chevrons center over track+dots and sit too low). */}
      <div data-gallery-viewport>
        <div data-gallery-track>
          {slides.map(slide => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              loading="lazy"
              data-gallery-slide
            />
          ))}
        </div>

        <button type="button" data-gallery-nav="prev" aria-label="Previous photo">
          <span>{"<"}</span>
        </button>
        <button type="button" data-gallery-nav="next" aria-label="Next photo">
          <span>{">"}</span>
        </button>
      </div>

      <div data-gallery-dots>
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            data-gallery-dot
            aria-label={`Photo ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
}
