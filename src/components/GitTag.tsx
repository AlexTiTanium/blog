/**
 * @file Tag badge — a clickable anchor link to the tag page when a locale is given, otherwise a
 * plain span (used inside other anchors, e.g. ArchiveView rows, to avoid nested `<a>`).
 */

import { tagUrl } from "../lib/urls";

/** Props for {@link GitTag}. */
interface Props {
  /** Tag name. */
  tag: string;
  /** Active locale; required (with `clickable`) to render a link. */
  locale?: string;
  /** Whether to render a link (default `true`); a span is used when `false` or no locale. */
  clickable?: boolean;
}

/**
 * Render a tag badge as an anchor link or a plain span.
 *
 * @param props - Tag name, optional locale, and clickable flag.
 * @returns The tag badge.
 */
export function GitTag({ tag, locale, clickable = true }: Props) {
  if (clickable && locale) {
    const href = tagUrl(locale, tag);
    return (
      <a href={href} data-tag>
        {tag}
      </a>
    );
  }
  return <span data-tag>{tag}</span>;
}
