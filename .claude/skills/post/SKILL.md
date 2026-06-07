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
  whole pipeline end-to-end: it mines the story out of the mess, fact-checks the author's verifiable
  claims (flagging deviations to ask about, never silently rewriting opinions or jokes), writes the
  English post with correct frontmatter and on-brand formatting, places any images/charts the user
  supplies, writes native translations into all configured locales, and runs a full build + content +
  translation verification pass before reporting. Prefer this over hand-writing a post —
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
3. **Ship in one pass — pause only to get a fact right.** English first, then a native post in
   every other locale, no stopping between languages (the user opted into one-shot). The *one*
   thing that earns an interruption is a factual deviation you're unsure the author meant — see
   directive 5 and Step 3.5.
4. **Published, not draft.** New posts go out live (`draft: false`) — see frontmatter below.
5. **Fact-check the author — flag, don't fabricate, don't silently fix.** If the dump states
   something externally verifiable that looks wrong, *highlight it and ask* before it ships. You
   never quietly rewrite what they said, and you never invent a "correction" you can't stand
   behind. Opinions, jokes, and their own lived experience are off-limits — you verify the world,
   not their memory or their taste. Details in Step 3.5.

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

## Step 3.5 — Fact-check the claims, then flag deviations (ask — don't auto-fix)

As you mine the story, sort what the author wrote into **checkable facts** vs. **everything else**.
This matters more here than on a normal blog: the post ships in several languages, so a wrong fact
isn't published once, it's published four times — and once translated, nobody re-checks it. But
this is a *self-ironic* blog, so being "wrong" is sometimes the entire joke. So the rule is: catch
genuine mistakes, **highlight them, and let the author decide**. Never quietly rewrite what they
said, and never invent a "correction" you can't actually stand behind.

**Verify these (objective, externally checkable):**

- Dates, release years, version numbers — *"React shipped in 2015"*, *"Node added `fetch` in 16"*.
- Who built / named / invented something; attributions and quoted lines.
- What a tool, API, spec, or status code actually does — *"301 is a temporary redirect"*.
- Named numbers/metrics stated as real, historical events, and the spelling of products/people.

Use `WebSearch` / `WebFetch` whenever a claim is checkable and you're not certain — don't trust
memory on anything that would embarrass the author if it's wrong.

**Never "correct" these — they aren't facts:**

- Opinions and taste — *"SVN is garbage"*, *"tabs beat spaces"*.
- Jokes, hyperbole, deliberate self-irony — *"I read the code until the words stopped being words."*
  If a line *might* be a bit on purpose, treat it as one.
- The author's own lived experience — what happened to *them* isn't externally checkable and stays
  exactly as written (*"we lost a day's work to SVN"*). You verify the world, not their memory.

**When you find a deviation, stop and ask** (use `AskUserQuestion`). Make the deviation impossible
to miss — quote what they wrote, state what you found, and give your confidence + source:

> ⚠️ **Fact check** — you wrote: *"HTTP 301 is a temporary redirect."*
> What I find: **301 is _permanent_; 302/307 are the temporary ones** (MDN). Confidence: high.

Batch every deviation into a single round so you interrupt **once**, not once per claim. For each,
offer three doors: **Correct it** · **Keep as written** (it's intentional / a joke) · **Rephrase
together**. If you genuinely can't tell whether something is an error or a deliberate bit, *ask
rather than assume* — that's the whole reason this step exists. Whatever the author decides flows
into the English draft **and** every translation, so a correction never gets multiplied across
locales (and an intentional "wrong" is preserved faithfully in all of them).

If everything checks out, say so in one line and keep going one-shot. Don't manufacture pedantic
nitpicks to look thorough — a false alarm every run is its own kind of broken.

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

## Step 7 — Full verification & review (don't skip — this is where quality is won or lost)

A post is only "done" once it builds, reads right, and survives a cold re-read in every language.
Run all four passes below before you report. Fix what you find and re-run the relevant pass — don't
just list problems, *resolve* them (a factual deviation is the only thing you hand back to the
author; everything else here is yours to fix).

### A. Build & structural verification (objective)

1. **Files exist** — `content/<slug>/<locale>.md` for **every** locale in `LOCALES`, plus any
   vendored images under `content/<slug>/images/`. Missing a locale = not done.
2. **Build is green** — `bun run build`. It parses frontmatter and renders every locale, so a clean
   build means the post is valid end-to-end. The usual failure is YAML (an unescaped `"` in
   `title`/`description`) — fix and rebuild. There's no per-post build; it covers the whole site.
3. **Frontmatter sanity** — each file has `title`, `date`, `description`, `tags`, `language`,
   `draft: false`, **no** `author:`. `date` and `tags` are byte-identical across locales; only
   `title`/`description`/`language` differ.

### B. Content & formatting review — English (read it like an editor, not the author)

Read the finished `en.md` cold and hunt for these failure modes:

- **Voice** — does it sound self-ironic, first-person, specific? Kill any AI tells that crept in:
  "delve", "tapestry", "in today's fast-paced world", "robust/seamless/game-changer", "as
  developers, we all know", and rule-of-three padding. Read a paragraph aloud in your head — if it
  sounds like a press release, rewrite it.
- **Faithfulness** — every fact, event, and opinion traces back to the dump; nothing invented; and
  every Step 3.5 fact resolution is actually reflected in the prose.
- **Shape** — hook with no preamble; `## sections` mark real movements; ends on a takeaway with a
  bite, not a summary. Length matches the dump — tight, not padded.
- **Palette correctness (these are the renderer's sharp edges):**
  - **Real `—` em-dashes, never `--`.** Spot-check: `grep -n -- '--' content/<slug>/*.md` — every
    hit outside a code block should become `—`.
  - `:::pullquote` is **one short paragraph**, used once or twice, on the sharpest line.
  - Every code fence is **language-tagged** (```` ```ts ````), or Shiki can't highlight it.
  - `---` dividers mark a shift in tempo, not decoration.
  - Images sit at natural beats with rich, descriptive alt text — never `![](...)` or `![image]`.

### C. Translation review — every non-default locale

For each translated file, verify it's a **native rewrite, not a literal swap**:

- The self-irony lands idiomatically in that language — not translated English idioms.
- **Same structure as `en.md`** (same sections, same number of images, same pull quote), and every
  corrected fact is present (the error must not survive in any locale).
- **Byte-identical to en:** code blocks (incl. comments/strings), `tags`, `date`, the slug, image
  paths (`./images/…`), URLs, and proper nouns. Quick diff of the non-prose bits:
  ```bash
  for f in content/<slug>/*.md; do echo "== $f =="; grep -nE '^(date|tags|  - |language|draft):' "$f"; done
  grep -rno './images/[^")]*' content/<slug>/*.md | sort -u   # paths must match across locales
  ```
- `language:` is the locale; `draft: false`; no `author:`; `title`/`description`/alt-text/pull-quote
  all translated.

### D. Rendered-output spot check (catch what source review can't)

After the build, look at the actual HTML for the new slug — the canonical files are
`dist/<locale>/<slug>/index.html` (the bare `dist/<slug>/` is just a redirect):

```bash
# pull quotes must render as the styled aside, NOT leak as raw ":::" :
grep -rl ':::' dist/*/<slug>/index.html && echo "RAW DIRECTIVE LEAKED — fix the :::pullquote syntax"
# literal double-hyphens that slipped into rendered prose:
grep -rno ' -- ' dist/*/<slug>/index.html
# every referenced image actually exists on disk (local ones):
for p in $(grep -rho './images/[^")]*' content/<slug>/*.md | sort -u); do
  test -f "content/<slug>/${p#./}" && echo "ok  $p" || echo "MISSING $p"; done
```

If you can, run `bun run serve` and open `/en/<slug>/` plus one translated locale to eyeball the
real page (pull quote styled, code highlighted, images load, divider shows as `// ────`). The
Playwright visual baselines won't cover a brand-new post, so this human-ish look is the real check.

### E. (Optional, for a post that matters) independent review

For an important post, spawn a subagent to read the finished `en.md` *cold* — no dump, no context —
and report only: where the voice slips, anything that reads as invented, and any palette/format
misuse. A fresh pair of eyes catches the self-justifying "it's fine" that the writer can't.

### F. Report back

Concise summary: the slug; title + word count / reading time per locale; **any fact deviations you
flagged and how each was resolved**; which images were vendored vs. linked vs. left as a "drop file
here" TODO; build status; and the local preview paths (`/en/<slug>/`, `/uk/<slug>/`, …) with the
`bun run serve` reminder. Call out anything still needing the author's hand (e.g. a pasted-only
image to drop in).

## Voice & a full worked example

For the voice in depth and a complete *brain-dump → finished post* example (so you can calibrate
how much to clean up vs. preserve), read [references/style-guide.md](references/style-guide.md)
before writing if you're at all unsure of the register. It's the difference between "fine" and
"sounds like the author on a good day."
