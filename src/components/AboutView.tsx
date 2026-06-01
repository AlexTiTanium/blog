/**
 * README-style about page content.
 * Hardcoded author profile matching the prototype's #about section.
 */

import type { Locale } from "../i18n/index";
import { homeUrl } from "../lib/urls";
import { GitTag } from "./GitTag";

interface Props {
  locale: Locale;
}

/**
 * Render the about page with semantic HTML elements.
 * @returns README-style author profile section
 */
export function AboutView({ locale }: Props) {
  return (
    <div data-component="about">
      <header>
        <nav aria-label="breadcrumb">
          <a href={homeUrl(locale)}>blog</a> <span data-sep>/</span> README.md
        </nav>
      </header>

      <div data-body>
        <section>
          <h1># Alex Kucherenko</h1>
          <p data-role>
            Senior Developer <span data-sep>{"·"}</span> Kherson, Ukraine
          </p>
          <div data-badges>
            <span data-badge data-color="green">
              available for hire
            </span>
            <span data-badge data-color="amber">
              open source contributor
            </span>
            <span data-badge data-color="coral">
              blog author
            </span>
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
            <div>
              <dt>Languages</dt>
              <dd>TypeScript, HTML, CSS</dd>
            </div>
            <div>
              <dt>Frontend</dt>
              <dd>Preact, CSS wizardry</dd>
            </div>
            <div>
              <dt>Backend</dt>
              <dd>Bun, Cloudflare Pages</dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>Git (blame enthusiast), Bun bundler, Playwright</dd>
            </div>
            <div>
              <dt>Editor</dt>
              <dd>VS Code + vim keybindings (the worst of both worlds)</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2>## Experience Highlights</h2>
          <ol data-timeline>
            <li>
              <time>2020{"–"}present</time>
              <span>
                Senior Developer {"—"} building things, breaking things, writing about both
              </span>
            </li>
            <li>
              <time>2016{"–"}2020</time>
              <span>Full-stack Developer {"—"} survived three framework migrations</span>
            </li>
            <li>
              <time>2013{"–"}2016</time>
              <span>Junior Developer {"—"} jQuery was still cool, and so was I</span>
            </li>
          </ol>
        </section>

        <section>
          <h2>## Interests</h2>
          <div data-interests>
            <GitTag tag="systems-programming" />
            <GitTag tag="static-site-generators" />
            <GitTag tag="developer-experience" />
            <GitTag tag="technical-writing" />
            <GitTag tag="open-source" />
            <GitTag tag="mechanical-keyboards" />
          </div>
        </section>

        <section>
          <h2>## Contact</h2>
          <dl>
            <div>
              <dt>GitHub</dt>
              <dd>@alexkucherenko</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>hello@geeklife.dev</dd>
            </div>
            <div>
              <dt>Blog</dt>
              <dd>geeklife.dev</dd>
            </div>
          </dl>
        </section>

        <footer>
          <span data-comment>{"// Last updated: 2026-02-13 · README.md · 1 contributor"}</span>
        </footer>
      </div>
    </div>
  );
}
