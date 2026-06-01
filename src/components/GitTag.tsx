/**
 * Tag badge component.
 * Renders as clickable anchor link when locale is provided,
 * falls back to span for nested-anchor prevention (ArchiveView).
 */

import { tagUrl } from "../lib/urls";

interface Props {
  tag: string;
  locale?: string;
  clickable?: boolean;
}

/** Render a tag badge as anchor link or span. */
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
