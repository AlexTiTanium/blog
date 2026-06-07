---
name: post
description: >-
  Turn a raw, unpunctuated stream-of-consciousness brain-dump into a polished,
  self-ironic blog post for THIS repo (the "Geek Life" Moku blog), then translate it
  into every locale the site is configured for. Use this whenever the user pastes messy,
  rambling, voice-memo-style notes — no capitals, no punctuation, half-finished thoughts,
  sometimes no logic — and wants them turned into an article. Trigger on "/post", "turn this
  into a blog post", "write this up", "make an article from my notes", "draft a post", "blog
  this", or any time the user dumps thoughts they clearly want published. This skill owns the
  whole pipeline end-to-end: it mines the story out of the mess, writes the English post with
  correct frontmatter and on-brand formatting, places any images/charts the user supplies, and
  writes native translations into all configured locales. Prefer this over hand-writing a post —
  it knows this blog's exact file layout, frontmatter schema, voice, and the renderer's quirks.
---

# /post — brain-dump → published, translated blog post

You take whatever the user braindumps — lowercase, no punctuation, tangents, jokes, half-logic —
and turn it into a post that reads like it belongs on **Geek Life**, *"a literary, self-ironic dev
blog."* Then you ship it in every language the site speaks.

The hard part is **not** the markdown. It's hearing the actual human story under the noise,
keeping their voice, sharpening the self-irony, and not inventing things they didn't say. A great
result feels like the user wrote it on a good day — funnier, tighter, honest about the screw-ups —
not like a press release a robot wrote about them.

## The prime directives

1. **Preserve the voice and the facts.** Reorganize, tighten, punctuate, and add structure —
   but the opinions, the events, the punchlines, and the conclusions must be *theirs*. If the dump
   is thin, write a short tight post; do **not** pad it with invented anecdotes, fake metrics, or
   stock "as developers we all know…" filler. Inventing facts is the one unforgivable failure here.
2. **Self-ironic, first person, literary.** This blog laughs at itself. The narrator screws up,
   notices, and makes it funny. Dry, specific, a little dramatic. Never corporate, never the flat
   "In today's fast-paced world of software development…" register that screams AI.
3. **Ship everything in one pass.** English first, then a native post in every other locale —
   no stopping to ask between languages (the user opted into one-shot).
4. **Published, not draft.** New posts go out live (`draft: false`) — see frontmatter below.

## Step 1 — Get the brain-dump

The raw text is whatever the user supplied with the request (the message that invoked `/post`,
or text they pasted). Use it verbatim as the source. If they invoked the skill with **no** text
to work from, ask once: *"Paste the brain-dump — as messy as you like, I'll do the rest."* and wait.

If they also handed you images or links, note them now — you'll wire them in at Step 5.

## Step 2 — Read the live config (never hardcode identity)

This blog keeps identity in source. Read it at runtime so the post stays correct if it changes:

- **Locales** — read `src/i18n/index.ts`: `LOCALES` (the full set) and `DEFAULT_LOCALE`. Today
  that's `["en", "uk", "ru", "es"]` with `en` default — but trust the file, not this line.
- **Author** — `SITE.author` in `src/config.ts`. **Do not** write an `author:` field; the
  framework falls back to `SITE.author` automatically (`frontmatter.author ?? SITE.author`). Only
  add `author:` if the user explicitly wants a different byline. (The legacy posts that hardcode
  "Alex Kucherenko" predate this rule — don't copy them.)
- **Tag vocabulary** — discover what already exists so you reuse tags instead of inventing synonyms:
  ```bash
  awk '/^tags:/{f=1;next} f&&/^  - /{print $2;next} f&&/^[a-zA-Z]/{f=0}' content/*/*.md | sort | uniq -c | sort -rn
  ```
  Common ones: `devlife`, `tools`, `testing`, `javascript`, `gamedev`, `opinion`, `life`. Plus
  per-series tags. Prefer an existing tag over a new near-duplicate (`testing` not `unit-tests`).

## Step 3 — Mine the story, then decide the metadata

Before writing a word of prose, figure out what this post actually *is*:

- **The point.** What's the one thing that happened or the one opinion being argued? Everything
  serves that. Tangents that don't serve it get cut (or become a single funny aside).
- **The arc.** Most of these dumps are a story: setup → it goes wrong → what I learned. Or an
  opinion: here's the take → here's why → here's the caveat. Find which shape fits and lean in.
- **The funny.** Find the self-deprecating beats already in the dump and let them breathe. The
  best line becomes a `:::pullquote` (see formatting).

Then lock the metadata:

- **`title`** — punchy, specific, a little self-aware. (`"Making a Game in Nine Days — Is That
  Even Possible?!"`, `"Hello, Pipeline!"`) Not a generic SEO phrase.
- **`slug`** — kebab-case, short, derived from the title/topic. **Check for collisions:**
  `ls content/` — if `content/<slug>/` exists, pick a distinct slug (don't overwrite).
- **`description`** — 1–2 sentence hook in the post's own voice. This is the OG/meta text and the
  archive teaser, so make it earn the click without spoiling the punchline. No `--`; real prose.
- **`tags`** — 2–4, lowercase kebab, reused from the existing vocabulary where possible.
- **`date`** — today, `YYYY-MM-DD` (run `date +%Y-%m-%d`).

## Step 4 — Write the English post → `content/<slug>/en.md`

### Frontmatter (exact shape)

```yaml
---
title: "<title>"
date: "<YYYY-MM-DD>"
description: "<1–2 sentence self-ironic hook>"
tags:
  - <tag>
  - <tag>
language: en
draft: false
---
```

Rules that keep the build green: wrap every string value in **double quotes**; if a value
contains a double quote, switch that value to YAML single-quotes (`'He said "no"'`). No
`author:` field (it inherits). No trailing commas — this is YAML, not JSON.

### The body — craft, not transcription

- Open with a hook that drops the reader mid-thought — curiosity or a confession. No "In this
  post I will…".
- Short paragraphs. Vary rhythm: a long observation, then a short punch.
- `## Section headings` to mark movements of the story (look at `content/ball-factory/en.md` for
  the cadence: *The Contest → Development → The Disaster → Lessons Learned*). Use `###` only if a
  section genuinely needs sub-beats.
- End on a real takeaway with a bite to it — a lesson, a confession, or a one-liner. Not a summary.
- **Length follows the dump.** A meaty dump → 600–1000 words. A thin one → keep it 300–450 and
  tight (reading time needs ≥~300 words to be non-zero, but never pad to hit a number).

### Formatting palette (only what this blog actually styles — verified against the renderer)

The renderer is remark-gfm + a couple of custom bits. Use these; they all render and are styled:

| Element | Syntax | Renders as |
| --- | --- | --- |
| Section heading | `## Heading` / `### Sub` | styled headings |
| Pull quote | `:::pullquote` … `:::` (own lines) | `<aside class="pull-quote">` — the signature flourish |
| Divider | `---` on its own line | on-brand `// ──────────` break between movements |
| Blockquote | `> quoted line` | accent left-border, italic |
| Inline code | `` `value` `` | green monospace |
| Code block | ```` ```ts ```` … ```` ``` ```` | Shiki "warm-syntax" highlighting — **always tag the language** |
| Lists | `- item` / `1. item` / `- [ ] task` | standard / GFM task lists |
| Table | GFM pipe tables | standard table |
| Link | `[text](url)` | accent link |
| Image | `![alt](./images/name.webp)` | see Step 5 |

Two quirks to respect:

- **Use real em-dashes `—`** (and `…` for ellipsis). There is **no** smartypants/typographer, so
  ASCII `--` renders literally as two hyphens. The old posts are full of `--`; that's a migration
  artifact, not the style. Type the real glyphs.
- **`:::pullquote` content is parsed as markdown but must stay a single short paragraph** — no
  headings or code inside. Use it once or twice for the sharpest, funniest line. Don't overuse it.

## Step 5 — Place the images / charts the user gave you

The user supplies the visuals (pasted into the prompt, a local file path, or an external link).
Your job is to *adapt and wire them in well* — not to invent diagrams.

- **Descriptive alt text, always.** Match the bar set by existing posts — say what's actually in
  the frame, not "image1". (e.g. `![Ball Factory level editor showing XML level data with entity
  coordinates](./images/bf-4.webp)`.) Alt text gets **translated** per locale in Step 6.
- **Local file path the user gave you** → vendor it into `content/<slug>/images/` with a short
  kebab name, preferring `.webp` (that's the house format). Convert with whatever's installed:
  ```bash
  cwebp -q 82 "<src>" -o "content/<slug>/images/<name>.webp"     # preferred
  # fallback: magick "<src>" -quality 82 "content/<slug>/images/<name>.webp"
  # fallback: sips -s format webp "<src>" --out "content/<slug>/images/<name>.webp"
  ```
  Non-webp is tolerated (one existing post uses `.jpg`), so if no converter exists, copy the file
  in as-is rather than failing. Reference it relative: `![alt](./images/<name>.webp)`.
- **External URL** ("outer resource") → reference it directly: `![alt](https://…)`. Offer to
  vendor+convert it locally if the user wants it self-hosted, but direct linking is fine.
- **Pasted-only image (no path/URL)** → you can *see* it, so write precise alt text and choose its
  placement, but you can't save the bytes. Insert the `![alt](./images/<name>.webp)` reference and
  tell the user the exact path to drop the file into. Don't silently omit it.
- **Placement.** Set images at natural beats — after the section they illustrate, ~1–2 per section,
  never two in a row without prose between (mirror `content/ball-factory/en.md`).

If the dump literally asks for a chart/diagram and gives no image, the cleanest on-brand option is
a fenced ASCII diagram in a code block (fits the terminal aesthetic) — but only if it genuinely
helps; otherwise leave it out rather than fabricate data.

## Step 6 — Translate into every other locale (one pass)

For each locale in `LOCALES` except the default, write `content/<slug>/<locale>.md`. These are
**native rewrites, not literal translations** — the self-irony has to land naturally in each
language. A Ukrainian or Russian or Spanish reader should feel the same wry voice, idioms and all.

**Translate:** `title`, `description`, every heading, all prose, blockquotes, `:::pullquote`
content, and image **alt text**.

**Keep byte-identical across all locales:**

- `date`, `tags`, the `slug` (directory name), and every image path (`./images/…`).
- Code blocks, including comments and string literals — keep code in English so it stays
  maintainable and matches the en source.
- URLs, proper nouns, product/library names, and the `:::pullquote` / `---` syntax itself.

**Change:** the `language:` field to the locale. Keep `draft: false`. No `author:` field.

> Don't translate the site's UI chrome — but that lives in `src/i18n/`, not in content, so it
> never appears in these files anyway. Article content is the only thing localized here.

## Step 7 — Verify and report

1. **Confirm the files exist:** `content/<slug>/{en,…}.md` for every locale, plus any vendored
   images under `content/<slug>/images/`.
2. **Build-check (recommended):** `bun run build`. It parses frontmatter and renders every locale,
   so a clean build means the post is valid end-to-end. If it fails, the usual culprit is YAML
   (an unescaped quote in `title`/`description`) — fix and rebuild. There's no per-post build; the
   build covers the whole site.
3. **Report back concisely:** the slug; the title per locale; word counts / reading time; which
   images were vendored vs. linked vs. left as a "drop file here" TODO; and the local preview
   paths (`/en/<slug>/`, `/uk/<slug>/`, …) with a reminder they can run `bun run serve` to view.

## Voice & a full worked example

For the voice in depth and a complete *brain-dump → finished post* example (so you can calibrate
how much to clean up vs. preserve), read [references/style-guide.md](references/style-guide.md)
before writing if you're at all unsure of the register. It's the difference between "fine" and
"sounds like the author on a good day."
