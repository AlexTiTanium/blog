/**
 * @file About page — a README-style author profile. The profile is described once as the {@link PROFILE}
 * data object and rendered by mapping, so editing content never means touching JSX; identity fields
 * (author, GitHub, email, domain) come from {@link SITE}. The markdown-flavored headings and footer are
 * deliberately English UI chrome.
 */

import type { VNode } from "preact";
import { SITE } from "../config";
import type { Locale } from "../i18n/index";
import { homeUrl } from "../lib/urls";
import { GitTag } from "./GitTag";

/** Site domain shown in the contact list (derived from {@link SITE.url}). */
const DOMAIN = new URL(SITE.url).hostname;

/** Author profile content rendered by {@link AboutView}. */
const PROFILE = {
  /** Role line shown under the name. */
  role: "Senior Developer",
  /** Location shown under the name. */
  location: "Kherson, Ukraine",
  /** Status badges with their accent colors. */
  badges: [
    { label: "available for hire", color: "green" },
    { label: "open source contributor", color: "amber" },
    { label: "blog author", color: "coral" }
  ],
  /** Tech-stack definition list (term → detail). */
  techStack: [
    { term: "Languages", detail: "TypeScript, HTML, CSS" },
    { term: "Frontend", detail: "Preact, CSS wizardry" },
    { term: "Backend", detail: "Bun, Cloudflare Pages" },
    { term: "Tools", detail: "Git (blame enthusiast), Bun bundler, Playwright" },
    { term: "Editor", detail: "VS Code + vim keybindings (the worst of both worlds)" }
  ],
  /** Experience timeline (period → summary). */
  experience: [
    {
      time: "2020–present",
      text: "Senior Developer — building things, breaking things, writing about both"
    },
    { time: "2016–2020", text: "Full-stack Developer — survived three framework migrations" },
    { time: "2013–2016", text: "Junior Developer — jQuery was still cool, and so was I" }
  ],
  /** Interest tags. */
  interests: [
    "systems-programming",
    "static-site-generators",
    "developer-experience",
    "technical-writing",
    "open-source",
    "mechanical-keyboards"
  ],
  /** Contact rows (term → value). */
  contact: [
    { term: "GitHub", detail: SITE.github },
    { term: "Email", detail: SITE.email },
    { term: "Blog", detail: DOMAIN }
  ],
  /** Footer "last updated" comment line. */
  lastUpdated: "// Last updated: 2026-02-13 · README.md · 1 contributor"
} as const;

/** Props for {@link AboutView}. */
interface Props {
  /** Active locale (for the breadcrumb home link). */
  locale: Locale;
}

/**
 * Render the README-style author profile from {@link PROFILE}.
 *
 * @param props - The active locale.
 * @returns The about page content.
 */
export function AboutView({ locale }: Props): VNode {
  return (
    <div data-component="about">
      <header>
        <nav aria-label="breadcrumb">
          <a href={homeUrl(locale)}>blog</a> <span data-sep>/</span> README.md
        </nav>
      </header>

      <div data-body>
        <section>
          <h1># {SITE.author}</h1>
          <p data-role>
            {PROFILE.role} <span data-sep>·</span> {PROFILE.location}
          </p>
          <div data-badges>
            {PROFILE.badges.map(badge => (
              <span key={badge.label} data-badge data-color={badge.color}>
                {badge.label}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2>## About</h2>
          <p>
            Full-stack developer with a weakness for clean architecture, strong types, and rewriting
            things in Rust (see post #001). Building web applications by day, writing self-ironic
            dev confessions by night.
          </p>
          <p>
            Believer in the power of good documentation that nobody reads, meaningful variable
            names, and the occasional <code>console.log</code> in production.
          </p>
        </section>

        <section>
          <h2>## Tech Stack</h2>
          <dl>
            {PROFILE.techStack.map(item => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2>## Experience Highlights</h2>
          <ol data-timeline>
            {PROFILE.experience.map(item => (
              <li key={item.time}>
                <time>{item.time}</time>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2>## Interests</h2>
          <div data-interests>
            {PROFILE.interests.map(tag => (
              <GitTag key={tag} tag={tag} />
            ))}
          </div>
        </section>

        <section>
          <h2>## Contact</h2>
          <dl>
            {PROFILE.contact.map(item => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer>
          <span data-comment>{PROFILE.lastUpdated}</span>
        </footer>
      </div>
    </div>
  );
}
