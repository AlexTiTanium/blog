/**
 * @file OG satori template (plain element tree, NOT Preact VNodes). PORT of legacy OgTemplate.
 *
 * Build phase A (OG spike) resolves the exact contract 0.3.0's `ogImage.template` expects
 * and ports the legacy template body.
 */

/**
 * Input describing a single OG card.
 */
type OgInput = {
  /** Article/page title. */
  title: string;
  /** ISO date string. */
  date: string;
  /** Topic tags. */
  tags: string[];
  /** Blog name shown on the card. */
  blogName: string;
};

/**
 * Render a satori element tree for one OG image.
 *
 * @param _input - Title/date/tags/blogName for the card.
 * @throws {Error} Always — implemented during the build phase (OG spike).
 */
export default function OgTemplate(_input: OgInput): unknown {
  throw new Error("not implemented");
}
