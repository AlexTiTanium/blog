---
name: post
description: >-
  Turn a raw, unpunctuated stream-of-consciousness brain-dump into a polished,
  self-ironic blog post for THIS repo (the "Geek Life" Moku blog), then translate it
  into every locale the site is configured for. Use this whenever the user pastes messy,
  rambling, voice-memo-style notes — in any language (Russian and English are both common), no
  capitals, no punctuation, half-finished thoughts, sometimes no logic — and wants them turned into
  an article (output always covers every configured locale, with English canonical). Trigger on "/post", "turn this
  into a blog post", "write this up", "make an article from my notes", "draft a post", "blog
  this", or any time the user dumps thoughts they clearly want published. This skill owns the
  whole pipeline end-to-end: it mines the story out of the mess, fact-checks the author's verifiable
  claims (flagging deviations to ask about, never silently rewriting opinions or jokes), writes the
  English post with correct frontmatter and on-brand formatting, places any images/charts the user
  supplies, writes native translations into all configured locales, runs an interactive review loop
  that applies the author's edits across every locale in parallel, then a human-voice pass that strips
  AI-sounding prose and a fast build check before reporting. Prefer this over hand-writing a post —
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
   stock "as developers we all know…" filler. Inventing facts is the one unforgivable failure here —
   and that includes **decorative epithets**: a throwaway adjective — "*her first-ever* X", "the
   *seasoned* Y", "his *long-awaited* Z" — is a factual claim wearing a costume. If it isn't in the
   dump and you haven't verified it, don't add it. The cheap flourish is where invented "facts" hide.
2. **Self-ironic, first person, literary.** This blog laughs at itself. The narrator screws up,
   notices, and makes it funny. Dry, specific, a little dramatic. Never corporate, never the flat
   "In today's fast-paced world of software development…" register that screams AI.
3. **Draft fast, then review together.** Get a complete first draft of *every* locale down quickly —
   don't stop between languages — then hand it back for a real review pass (Step 7). The author
   *will* have edits, and that's the point, not a failure: this skill is built around an interactive
   review loop, not a one-shot drop. Apply their feedback live and fan each change out to every
   locale in parallel. The only thing that earns an interruption *before* the draft exists is a
   factual deviation you're unsure the author meant — see directive 5 and Step 3.5.
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

**The dump can be in any language — Russian and English are both common (Ukrainian/Spanish too).**
Comprehend it *natively* in whatever language it arrives: catch the jokes, the slang, and any
wordplay that only works in that language. The input language does **not** shrink the output —
you always produce a post in **every** locale in `LOCALES` (see Step 2), with `en` as the canonical
default. The only thing the input language changes is *which file mirrors the author's original
wording most faithfully* — see Step 4. Don't ask the user to translate their dump or to pick a
language; just read it and go.

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
  The **high-count** results are the shared vocabulary (`devlife`, `tools`, `testing`, `gamedev`,
  `opinion`, `life`, …); the long tail is per-post/per-series tags — reuse a shared tag, don't mistake
  a one-off for vocabulary. Prefer an existing tag over a new near-duplicate (`testing` not `unit-tests`).

## Step 3 — Mine the story, then decide the metadata

Before writing a word of prose, figure out what this post actually *is*:

- **The point.** What's the one thing that happened or the one opinion being argued? Everything
  serves that. Tangents that don't serve it get cut (or become a single funny aside).
- **The arc.** Most of these dumps are a story: setup → it goes wrong → what I learned. Or an
  opinion: here's the take → here's why → here's the caveat. Find which shape fits and lean in.
- **The funny.** Find the self-deprecating beats already in the dump and let them breathe. Pull the
  sharpest line out as a `>` blockquote — that's what the real posts use. Don't reach for
  `:::pullquote` unless the author specifically wants the big pulled-aside (see formatting).

Then lock the metadata:

- **`title`** — punchy, specific, a little self-aware. (`"Making a Game in Nine Days — Is That
  Even Possible?!"`, `"Hello, Pipeline!"`) Not a generic SEO phrase.
- **`slug`** — kebab-case, short, derived from the title/topic. **Always ASCII**, even when the
  dump and title are in Russian — translate or transliterate the idea to an English slug (the slug
  is the directory name and the URL). That's the existing convention: `descent-journeys-in-the-dark`
  and `bad-monday` have Russian `ru.md` bodies but English slugs. **Check for collisions:**
  `ls content/` — if `content/<slug>/` exists, pick a distinct slug (don't overwrite).
- **`description`** — 1–2 sentence hook in the post's own voice. This is the OG/meta text and the
  archive teaser, so make it earn the click without spoiling the punchline. No `--`; real prose.
  (Per locale: written in that locale's language — see Step 6.)
- **`tags`** — 2–4, lowercase ASCII kebab from the **English** taxonomy, reused from the existing
  vocabulary where possible. Tags are shared identically across all locales regardless of the input
  language — even a fully-Russian post tags `gamedev`/`devlife`, not Cyrillic.
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

If everything checks out, say so in one line and keep drafting — don't stall. Don't manufacture pedantic
nitpicks to look thorough — a false alarm every run is its own kind of broken.

## Step 4 — Write the canonical post → `content/<slug>/en.md`

`en` is the blog's `DEFAULT_LOCALE` (bare-path output + fallback), so `en.md` is the canonical file
and always gets written. This step documents the English file; Step 6 produces the rest.

**If the dump itself is in English,** `en.md` *is* the original — write it straight from the dump
and you're done with this step. **If the dump is in another language (e.g. Russian),** the voice
lives in that language, so draft the post **in the author's language first** (it'll be the most
faithful file — same craft rules below, just in that language), then write `en.md` as a *native
English rewrite* of it. Either way you end Step 4 with a real, on-brand `en.md`; the author's-language
file (if different) is finished here too and skipped in Step 6.

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
| Blockquote (**preferred** for a set-off line) | `> quoted line` | accent left-border, italic — what real articles use |
| Pull quote (**rare**) | `:::pullquote` … `:::` (own lines) | big `<aside class="pull-quote">`. Supported, but check whether real articles actually use it before you do — prefer a `>` blockquote unless the author asks for the big aside |
| Divider | `---` on its own line | on-brand `// ──────────` break between movements |
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
- **Match the real corpus, not an aspirational label.** Before reaching for any flourish, check how
  the actual articles do it (`grep -rl ':::' content/` for pull quotes, `grep -rl '^> ' content/`
  for blockquotes) and match that. When the corpus diverges from a flourish, default to the simpler
  element. If you *do* use `:::pullquote`, keep it one short paragraph, used once.

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

## Step 6 — Write the remaining locales (one pass)

Write `content/<slug>/<locale>.md` for every locale in `LOCALES` you haven't produced yet — that's
all of them except `en` (always written in Step 4) and the author's-language file (if the dump
wasn't in English, you wrote that in Step 4 too). At the end, *every* locale in `LOCALES` must
exist. These are **native rewrites, not literal translations** — the self-irony has to land
naturally in each language; a Ukrainian, Russian, or Spanish reader should feel the same wry voice,
idioms and all. Work from the most faithful source you have: the author's-language file if the dump
wasn't English, otherwise `en.md`.

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

## Step 7 — Review loop (interactive, real-time edits)

This is where most of the real work happens — and where a one-shot mindset fails. Once a full draft
of every locale is down, **show it and invite edits**, then apply them fast, across all locales,
without making the author wait.

1. **Hand it back compactly.** Don't paste the whole post. Give the slug, per-locale word count, and
   a one-line "draft's down in every locale — fire away with edits, I'll apply each across all of
   them." If the dump was in the author's language, point them at *that* file to read (it's the most
   faithful one).
2. **Treat every edit as cross-locale.** The author edits one line; the same change has to land in
   *all* locale files, natively. Pick the method by size:
   - **Small / one-liner** (a word, a joke, a fixed name): apply it inline yourself to every locale.
     You're already in context — faster than spawning anything.
   - **Many edits at once, or a substantial rewrite:** fan out — spawn one subagent per *other*
     locale **in parallel** (single message, multiple `Agent` calls), each given the exact change and
     that locale's file, re-expressing it natively. Separate files = disjoint writes = safe in
     parallel. This is the "fix it in parallel" the author wants; they shouldn't wait on N sequential
     edits. **Hand each subagent the byte-identical invariants from Step 6** (`tags`/`date`/slug/code
     blocks/proper nouns stay untouched) so a "rewrite" can't quietly drift them out of lockstep.
3. **Don't rebuild between edits.** Hold all verification (Step 8) until the author says they're
   done. A build after every tweak is wasted time.
4. **Keep the locales in lockstep.** After each change the non-prose invariants must still hold (same
   `tags`/`date`/slug/image paths/code blocks across locales). Prose edits get re-translated
   natively; code and proper-noun edits get propagated byte-identically.
5. **Loop until they're done.** Ask "anything else, or ship it?" When they say ship (or "commit and
   push"), go to Step 8 — once. If they're firing rapid edits top-to-bottom, that's normal: stay in
   the loop, keep the files in sync, and resist re-verifying or re-reporting after each one.

## Step 8 — Final pass: human voice + fast check (once, at the end)

Two things, then report. Keep it lean — the old multi-pass audit is gone; verify once.

### A. Human-voice agent — strip the AI sound (the important one)

A fresh post reads fine to the writer and robotic to everyone else, and self-review rarely catches
it. Spawn the **human-voice reviewer** as a subagent (cold read, no dump) over the finished prose,
then apply its fixes:

- Spawn **one subagent per locale, in parallel** — a sentence can sound machine-made in one language
  even when the others are clean. Give each the locale's file and the brief in
  [references/human-voice-review.md](references/human-voice-review.md).
- It returns flagged sentences, each with a human rewrite: AI clichés, fake symmetry / rule-of-three,
  hollow intensifiers, button-sentences that exist only to sound clever, press-release register,
  mechanical transitions.
- **Apply the rewrites you agree with** — you don't have to take all of them; a deliberate joke or a
  real opinion is not an AI tell. Re-propagate any change that touches the shared source back through
  the other locales.

### B. Fast verification — one build, a few greps

```bash
bun run build 2>&1 | tail -3                                # whole-site build; green = valid end-to-end
ls content/<slug>/                                          # every locale present?
grep -rl ':::' dist/*/<slug>/index.html && echo "DIRECTIVE LEAKED"   # raw ::: must not reach HTML
grep -rno ' -- ' content/<slug>/*.md                        # bare double-hyphens in prose → make them —
```

That's the whole check: it builds, all locales exist, no directive leaked, no `--`. The usual build
failure is YAML (an unescaped `"` in `title`/`description`) — fix and rebuild. Skip the exhaustive
per-locale frontmatter diff and the serve-and-eyeball unless something looks off or the post matters.

### C. Report back

Short: the slug; title + word count per locale; any fact deviations and how each was resolved; the
headline human-voice fixes you applied; images vendored / linked / left as a "drop file here" TODO;
build status; preview paths (`/<locale>/<slug>/`). Flag anything still needing the author's hand.

## Voice & a full worked example

For the voice in depth and a complete *brain-dump → finished post* example (so you can calibrate
how much to clean up vs. preserve), read [references/style-guide.md](references/style-guide.md)
before writing if you're at all unsure of the register. It's the difference between "fine" and
"sounds like the author on a good day."

The catalog of AI tells the human-voice agent hunts for (Step 8) — and what it must *not* flatten —
lives in [references/human-voice-review.md](references/human-voice-review.md). It's the subagent's
brief; read it if you want to hand-check the prose yourself instead of spawning the agent.
