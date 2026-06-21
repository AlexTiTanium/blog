/**
 * @file About page — a README-style author profile. All prose (role, location, bio, stack terms,
 * experience, section headings) is localized via {@link aboutContent}; identity fields (author,
 * GitHub, LinkedIn, email, domain) come from {@link SITE}. The surrounding UI chrome — breadcrumb,
 * status badges, `##` heading prefixes, `git log` heading, interest tags, and the footer comment —
 * is deliberately English, matching the site-wide IDE/terminal aesthetic.
 */

import type { VNode } from "preact";
import { SITE } from "../config";
import { aboutContent } from "../i18n/about";
import type { Locale } from "../i18n/index";
import { homeUrl } from "../lib/urls";
import { GitTag } from "./GitTag";

/** One status badge (English chrome — styled like repo shields). */
interface Badge {
  /** Badge text. */
  label: string;
  /** Accent color key (see `AboutView.css`). */
  color: "green" | "amber" | "coral";
  /** Render dimmed with a blinking status dot — on standby, not gone. */
  dimmed?: boolean;
}

/** Status badges. `dimmed` ones render muted with a blinking dot, like a service on standby. */
const BADGES: readonly Badge[] = [
  { label: "open to interesting offers", color: "green", dimmed: true },
  { label: "typescript by day, rust by night", color: "amber" },
  { label: "blog author", color: "coral" }
];

/** Interest tags (English chrome — styled like git tags). */
const INTERESTS = ["game-development", "board-games", "electric-guitar", "rust"] as const;

/** Contact rows (term → displayed value → link); terms are proper names, so they stay locale-invariant. */
const CONTACT = [
  { term: "GitHub", detail: SITE.github, href: `https://github.com/${SITE.github.slice(1)}` },
  {
    term: "LinkedIn",
    detail: `in/${SITE.linkedin}`,
    href: `https://www.linkedin.com/in/${SITE.linkedin}/`
  },
  { term: "Email", detail: SITE.email, href: `mailto:${SITE.email}` }
] as const;

/** Footer "last updated" comment line (English chrome). */
const LAST_UPDATED = "// Last updated: 2026-06-11 · README.md · 1 contributor";

/** Props for {@link AboutView}. */
interface Props {
  /** Active locale (drives the profile prose and the breadcrumb home link). */
  locale: Locale;
}

/**
 * Render the README-style author profile in the active locale.
 *
 * @param props - The active locale.
 * @returns The about page content.
 */
export function AboutView({ locale }: Props): VNode {
  const profile = aboutContent(locale);

  return (
    <div data-island="about">
      <header>
        <nav aria-label="breadcrumb">
          <a href={homeUrl(locale)}>blog</a> <span data-sep>/</span> README.md
        </nav>
      </header>

      <div data-body>
        <section>
          <h1># {SITE.author}</h1>
          <p data-role>
            {profile.role} <span data-sep>·</span> {profile.location}
          </p>
          <div data-badges>
            {BADGES.map(badge => (
              <span
                key={badge.label}
                data-badge
                data-color={badge.color}
                data-dimmed={badge.dimmed || undefined}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2>## {profile.aboutHeading}</h2>
          {profile.aboutParagraphs.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section>
          <h2>## {profile.stackHeading}</h2>
          <dl>
            {profile.stack.map(item => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2>## {profile.experienceHeading}</h2>
          <ol data-timeline>
            {profile.experience.map(item => (
              <li key={item.time}>
                <time>{item.time}</time>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2>## git log --oneline</h2>
          <dl>
            {profile.gitLog.map(item => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2>## {profile.interestsHeading}</h2>
          <div data-interests>
            {INTERESTS.map(tag => (
              <GitTag key={tag} tag={tag} />
            ))}
          </div>
        </section>

        <section>
          <h2>## {profile.contactHeading}</h2>
          <dl>
            {CONTACT.map(item => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>
                  <a href={item.href}>{item.detail}</a>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer>
          <span data-comment>{LAST_UPDATED}</span>
        </footer>
      </div>
    </div>
  );
}
