/**
 * @file Title-composition gate. The head plugin's `titleTemplate` (`"%s — Geek Life"`, set in
 * src/app.ts and src/spa.tsx) is applied to EVERY route title — including the framework's own
 * `site.name()` fallback — so the builders in src/lib/head.ts must supply only the title TAIL
 * (and pin the bare-name `title` element for the home listing). This suite feeds the REAL route
 * `.head()` handlers through the REAL head plugin compose (`app.head.render`) and asserts no
 * rendered `<title>` ever contains the site name twice — the regression that shipped as
 * `<title>Geek Life — Geek Life</title>` on every home page and
 * `Geek Life — Archive — Geek Life` on every archive page, in all locales.
 */
import { createApp } from "@moku-labs/web";
import { describe, expect, it } from "vitest";
import { SITE } from "../../src/config";
import { DEFAULT_LOCALE, i18nConfig, LOCALES } from "../../src/i18n/index";
import { routes } from "../../src/routes";
import { makeArticle } from "../unit/_factory";

const app = createApp({
  pluginConfigs: {
    site: SITE,
    i18n: i18nConfig,
    router: { routes },
    // Mirrors the title template configured in src/app.ts and src/spa.tsx — the template under test.
    head: { titleTemplate: `%s — ${SITE.name}` }
  }
});

/** Build the synthetic render context a route's `.head()` handler receives. */
function headContext(params: Record<string, string>, data: unknown) {
  return {
    params,
    data,
    locale: params.lang ?? DEFAULT_LOCALE,
    url: (name: string, p?: Record<string, string>) => app.router.toUrl(name, p ?? {})
  };
}

/** Run a route's REAL `.head()` handler through the REAL head compose; return the `<title>` text. */
function renderedTitle(
  name: keyof typeof routes,
  params: Record<string, string>,
  data: unknown = {}
): string {
  const handler = routes[name]._handlers.head;
  if (!handler) throw new Error(`route "${name}" has no .head() handler`);

  const head = handler(headContext(params, data));
  const html = app.head.render(
    {
      name,
      path: app.router.toUrl(name, params),
      params,
      locale: params.lang ?? DEFAULT_LOCALE,
      head
    },
    data
  );

  const titles = [...html.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1] ?? "");
  expect(titles, "exactly one <title> per page").toHaveLength(1);
  return titles[0] ?? "";
}

/** Count non-overlapping occurrences of `needle` in `haystack`. */
function occurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

/** Every listing/static/article case the audit flagged (or that feeds the template). */
const CASES: { label: string; title: () => string }[] = [
  ...LOCALES.map(lang => ({
    label: `home (${lang})`,
    title: () => renderedTitle("home", { lang })
  })),
  {
    label: "homePaged p2",
    title: () => renderedTitle("homePaged", { lang: "en", page: "2" }, { page: 2, items: [] })
  },
  ...LOCALES.map(lang => ({
    label: `archive (${lang})`,
    title: () => renderedTitle("archive", { lang }, { page: 1, items: [] })
  })),
  {
    label: "archivePaged p3",
    title: () => renderedTitle("archivePaged", { lang: "en", page: "3" }, { page: 3, items: [] })
  },
  { label: "about", title: () => renderedTitle("about", { lang: "en" }) },
  {
    label: "tag",
    title: () =>
      renderedTitle("tag", { lang: "en", tag: "pipeline" }, { tag: "pipeline", articles: [] })
  },
  {
    label: "article",
    title: () =>
      renderedTitle(
        "article",
        { lang: "en", slug: "hello-pipeline" },
        {
          article: makeArticle({ slug: "hello-pipeline", title: "Hello, Pipeline!" }),
          recent: [],
          related: []
        }
      )
  }
];

describe("rendered <title> composition (titleTemplate seam)", () => {
  it("home renders the BARE site name in every locale (no template duplication)", () => {
    for (const lang of LOCALES) {
      expect(renderedTitle("home", { lang })).toBe(SITE.name);
    }
  });

  it("listing routes render their tail + the site name exactly once", () => {
    expect(renderedTitle("homePaged", { lang: "en", page: "2" }, { page: 2, items: [] })).toBe(
      `Posts Page 2 — ${SITE.name}`
    );
    expect(renderedTitle("archive", { lang: "en" }, { page: 1, items: [] })).toBe(
      `Archive — ${SITE.name}`
    );
    expect(renderedTitle("archivePaged", { lang: "en", page: "3" }, { page: 3, items: [] })).toBe(
      `Archive Page 3 — ${SITE.name}`
    );
  });

  it("plain-title routes keep their templated titles", () => {
    expect(renderedTitle("about", { lang: "en" })).toBe(`About — ${SITE.name}`);
    expect(
      renderedTitle("tag", { lang: "en", tag: "pipeline" }, { tag: "pipeline", articles: [] })
    ).toBe(`Tag: pipeline — ${SITE.name}`);
  });

  it("title tails are LOCALIZED per locale (nav-label copy, not IDE chrome)", () => {
    expect(renderedTitle("homePaged", { lang: "ru", page: "2" }, { page: 2, items: [] })).toBe(
      `Посты Страница 2 — ${SITE.name}`
    );
    expect(renderedTitle("archive", { lang: "uk" }, { page: 1, items: [] })).toBe(
      `Архів — ${SITE.name}`
    );
    expect(renderedTitle("about", { lang: "es" })).toBe(`Acerca de — ${SITE.name}`);
    expect(
      renderedTitle("tag", { lang: "ru", tag: "pipeline" }, { tag: "pipeline", articles: [] })
    ).toBe(`Тег: pipeline — ${SITE.name}`);
  });

  it("NO rendered <title> contains the site name twice (audit regression gate)", () => {
    for (const c of CASES) {
      const title = c.title();
      expect(occurrences(title, SITE.name), `${c.label}: "${title}"`).toBe(1);
    }
  });
});
