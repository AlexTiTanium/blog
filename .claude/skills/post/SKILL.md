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
  whole pipeline end-to-end: it executes any directives embedded in the dump (fetch a linked
  article and weave in its information, pull an image from the internet, vendor supplied assets),
  mines the story out of the mess, fact-checks the author's verifiable claims (flagging deviations
  to ask about, never silently rewriting opinions or jokes), writes the English post with correct
  frontmatter and on-brand formatting, runs a human-voice pass on the source prose BEFORE
  translating (so AI-sounding lines never multiply across locales), places any images/charts the
  user supplies, writes native translations into all configured locales, runs an interactive
  review loop that applies the author's edits across every locale in parallel and learns the
  author's recurring preferences, then a final translationese check, mechanical lint, and a fast
  build check before reporting. Prefer this over hand-writing a post — it knows this blog's exact
  file layout, frontmatter schema, voice, and the renderer's quirks.
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
   don't stop between languages — then hand it back for a real review pass (Step 8). The author
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
6. **The dump can contain instructions, not just content.** "read this article and use it",
   "grab an image of X from the internet", "take the chart from this page" are directives to
   *execute* (Step 1.5), not prose to publish. Directives outrank this skill's defaults but never
   the prime directives above — fetched material can inform the post; it can't replace the
   author's take or smuggle in unverified facts.

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

If they also handed you images or links, note them now — directives get executed in Step 1.5,
plain illustration images get wired in at Step 5.

## Step 1.5 — Execute the author's directives (links, images, assets)

Before mining the story, separate **directives** from **content**. A directive is anything the
author wants *done*, not *published*: a URL to read, an asset to fetch, an editorial constraint
("keep it short", "no jokes about the client"). Execute them all here so the material is on hand
when you draft.

- **"Read this article / use this page"** → `WebFetch` the URL. Harvest what the author points
  at: facts, numbers, quotes, the gist. This is *source material* — the author's take stays the
  spine of the post; the article feeds it. Direct quotes get attributed (link to the source in the
  prose). If what the article says contradicts what the author wrote in the dump, that's a
  deviation — batch it into the Step 3.5 fact-check round, don't silently side with either.
- **Image at a known URL** ("use this image: https://…") → download it and vendor it like a local
  file (Step 5 conversion rules): `curl -L -o` into a temp path, convert to `.webp` into
  `content/<slug>/images/`. If the download fails, fall back to referencing the URL directly and
  tell the author.
- **"Find an image of X on the internet"** → `WebSearch` for it. Prefer permissively-licensed
  sources (Wikimedia Commons, official press kits, the project's own site) over random blogs —
  this gets published. Vendor the best candidate, keep the source URL, and **surface your choice
  in the review loop** ("I picked this one — want a different image?") so the author can swap it.
  Note the source in the report; add attribution in the post if the license requires it.
- **Asset on a page** ("take the chart from this post") → fetch the page, locate the asset URL,
  vendor it as above with alt text describing what it actually shows.
- **Editorial directives** ("make it short", "more sarcasm", "don't mention the company") →
  note them and obey them through every later step. They override the skill's defaults (length
  heuristics, tone calibration) but not the prime directives.

Everything fetched still goes through the Step 3.5 fact-check like any other claim. Never let a
fetched article's framing replace the author's opinion — they linked it as ammunition, not as a
ghost-writer.

## Step 2 — Read the live config and calibrate on the real corpus

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
- **Recent corpus (mandatory, not optional).** Read the **two most recent** real posts before
  drafting — they are the live voice, fresher than any style guide:
  ```bash
  grep -H '^date:' content/*/en.md | sort -t'"' -k2 -r | head -2
  ```
  Note their rhythm, how often they use blockquotes/dividers, how their sections end. You're
  calibrating, not copying — see the anti-template rule in Step 4.
- **Author's learned preferences** — read [references/author-edits.md](references/author-edits.md).
  It accumulates the recurring patterns of the author's review-loop edits from past posts
  ("always cuts the explanatory closer", "hates exclamation marks"). Apply them from the first
  draft so the author doesn't have to repeat themselves. (You'll append to it in Step 8.)

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
  Even Possible?!"`, `"Hello, Pipeline!"`) Not a generic SEO phrase — and not the same formula
  every time: "The X That Y'ed" is a fine title *once*; if the recent corpus already has one
  shaped like that, find another shape.
- **`slug`** — kebab-case, short, derived from the title/topic. **Always ASCII**, even when the
  dump and title are in Russian — translate or transliterate the idea to an English slug (the slug
  is the directory name and the URL). That's the existing convention: `descent-journeys-in-the-dark`
  and `bad-monday` have Russian `ru.md` bodies but English slugs. **Check for collisions:**
  `ls content/` — if `content/<slug>/` exists, pick a distinct slug (don't overwrite).
- **`description`** — 1–2 sentence hook in the post's own voice. This is the OG/meta text and the
  archive teaser, so make it earn the click without spoiling the punchline. No `--`; real prose.
  (Per locale: written in that locale's language — see Step 7.)
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
- Claims sourced from a Step 1.5 fetched article — and any place the dump and the article disagree.

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
and always gets written. This step documents the English file; Step 7 produces the rest.

**If the dump itself is in English,** `en.md` *is* the original — write it straight from the dump
and you're done with this step. **If the dump is in another language (e.g. Russian),** the voice
lives in that language, so draft the post **in the author's language first** (it'll be the most
faithful file — same craft rules below, just in that language), then write `en.md` as a *native
English rewrite* of it. Either way you end Step 4 with a real, on-brand `en.md`; the author's-language
file (if different) is finished here too and skipped in Step 7.

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
- `## Section headings` to mark movements of the story. Use `###` only if a section genuinely
  needs sub-beats.
- End on a real takeaway with a bite to it — a lesson, a confession, or a one-liner. Not a summary.
- **Length follows the dump.** A meaty dump → 600–1000 words. A thin one → keep it 300–450 and
  tight (reading time needs ≥~300 words to be non-zero, but never pad to hit a number).

Three rules that keep the prose human (these are load-bearing, not suggestions):

- **Verbatim anchors.** Every section keeps at least one phrase lifted (near-)verbatim from the
  dump. The dump is the most human text in this whole pipeline — the author's actual word choices,
  their actual rhythm. A post assembled entirely from *your* paraphrases will sound like you;
  anchored to their phrases, it sounds like them. (Translate the anchor's *flavor* faithfully in
  the other locales.)
- **No house template.** The style guide's worked examples show *possible* shapes, not the shape.
  Don't default to hook → wrong turn → villain → lesson with one blockquote and one divider —
  if the last post had that arc, this one needs its own. Some posts want no headings at all.
  Structural sameness is an AI tell that no sentence-level polish can fix; let *this* story dictate
  its structure.
- **Em-dash budget.** Use real `—` glyphs (see quirks below) but ration them: more than about one
  per 80–100 words reads as machine-written, because it is. When a sentence wants its third dash,
  it actually wants a period, a comma, or parentheses.

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
  artifact, not the style. Type the real glyphs — within the budget above.
- **Match the real corpus, not an aspirational label.** Before reaching for any flourish, check how
  the actual articles do it (`grep -rl ':::' content/` for pull quotes, `grep -rl '^> ' content/`
  for blockquotes) and match that. When the corpus diverges from a flourish, default to the simpler
  element. If you *do* use `:::pullquote`, keep it one short paragraph, used once.

## Step 5 — Place the images / charts

The visuals come from the user (pasted into the prompt, a local file path, an external link) or
from a Step 1.5 directive (already vendored). Your job is to *adapt and wire them in well* — not
to invent diagrams.

- **Descriptive alt text, always.** Match the bar set by existing posts — say what's actually in
  the frame, not "image1". (e.g. `![Ball Factory level editor showing XML level data with entity
  coordinates](./images/bf-4.webp)`.) Alt text gets **translated** per locale in Step 7.
- **Local file path the user gave you** → vendor it into `content/<slug>/images/` with a short
  kebab name, preferring `.webp` (that's the house format). Convert with whatever's installed:
  ```bash
  cwebp -q 82 "<src>" -o "content/<slug>/images/<name>.webp"     # preferred
  # fallback: magick "<src>" -quality 82 "content/<slug>/images/<name>.webp"
  # fallback: sips -s format webp "<src>" --out "content/<slug>/images/<name>.webp"
  ```
  Non-webp is tolerated (one existing post uses `.jpg`), so if no converter exists, copy the file
  in as-is rather than failing. Reference it relative: `![alt](./images/<name>.webp)`.
- **Internet-sourced images** (Step 1.5 directives) are vendored the same way; keep the source
  URL for the report, and add in-post attribution if the source's license requires it.
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

## Step 6 — Human-voice pass on the source files (BEFORE translating)

A fresh post reads fine to the writer and robotic to everyone else, and self-review rarely catches
it. Strip the AI sound from the **source prose now**, before it multiplies into four languages —
a tell fixed here is fixed once; a tell fixed after translation has to be re-fixed everywhere.

1. **Spawn one human-voice reviewer per source file** — `en.md`, plus the author's-language file
   if the dump wasn't English. Give each the file and the brief in
   [references/human-voice-review.md](references/human-voice-review.md). It reads cold (no dump)
   and returns flagged sentences with suggested rewrites, plus structural findings.
2. **Use a different model than the one drafting.** A model reviewing its own family's prose
   shares its blind spots — the tics it writes are the tics it can't see. Pass a `model` override
   on the Agent call: `opus` if the session isn't running on Opus, otherwise `sonnet`. (The
   reviewer doesn't need the session model's context — it needs different eyes.)
3. **Apply with the dump in hand.** The reviewer's rewrites are *suggestions* — you have something
   it doesn't: the author's original words. When applying a fix, prefer re-anchoring the sentence
   to the dump's own phrasing over accepting the reviewer's paraphrase; the reviewer can only
   tell you *where* it sounds machine-made, the dump tells you what the human actually said.
   Skip fixes you disagree with — a deliberate joke or a real opinion is not an AI tell.
4. **Iterate until clean.** Applied rewrites can introduce new tells. After applying a round, run
   one more cold pass; repeat until a pass comes back clean. Cap it at 3 rounds — if round 3
   still finds things, apply and move on (perfection isn't the bar, "no longer obviously
   machine-made" is).

## Step 7 — Write the remaining locales (one pass)

Write `content/<slug>/<locale>.md` for every locale in `LOCALES` you haven't produced yet — that's
all of them except `en` (always written in Step 4) and the author's-language file (if the dump
wasn't in English, you wrote that in Step 4 too). At the end, *every* locale in `LOCALES` must
exist. These are **native rewrites, not literal translations** — the self-irony has to land
naturally in each language; a Ukrainian, Russian, or Spanish reader should feel the same wry voice,
idioms and all. Work from the most faithful source you have: the author's-language file if the dump
wasn't English, otherwise `en.md` — both already cleaned by Step 6, so you're translating the good
version.

**Register anchor:** before writing a locale, skim one real existing post in that language
(`content/*/<locale>.md`) — translationese is what you get when you translate from the source's
rhythm instead of writing in the target language's.

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

## Step 8 — Review loop (interactive, real-time edits)

This is where most of the real work happens — and where a one-shot mindset fails. Once a full draft
of every locale is down, **show it and invite edits**, then apply them fast, across all locales,
without making the author wait.

1. **Hand it back compactly.** Don't paste the whole post. Give the slug, per-locale word count, and
   a one-line "draft's down in every locale — fire away with edits, I'll apply each across all of
   them." If the dump was in the author's language, point them at *that* file to read (it's the most
   faithful one). If Step 1.5 involved choices (a picked image, a quoted article), surface them
   here for a possible swap.
2. **Treat every edit as cross-locale.** The author edits one line; the same change has to land in
   *all* locale files, natively. Pick the method by size:
   - **Small / one-liner** (a word, a joke, a fixed name): apply it inline yourself to every locale.
     You're already in context — faster than spawning anything.
   - **Many edits at once, or a substantial rewrite:** fan out — spawn one subagent per *other*
     locale **in parallel** (single message, multiple `Agent` calls), each given the exact change and
     that locale's file, re-expressing it natively. Separate files = disjoint writes = safe in
     parallel. This is the "fix it in parallel" the author wants; they shouldn't wait on N sequential
     edits. **Hand each subagent the byte-identical invariants from Step 7** (`tags`/`date`/slug/code
     blocks/proper nouns stay untouched) so a "rewrite" can't quietly drift them out of lockstep.
3. **Don't rebuild between edits.** Hold all verification (Step 9) until the author says they're
   done. A build after every tweak is wasted time.
4. **Keep the locales in lockstep.** After each change the non-prose invariants must still hold (same
   `tags`/`date`/slug/image paths/code blocks across locales). Prose edits get re-translated
   natively; code and proper-noun edits get propagated byte-identically.
5. **Loop until they're done.** Ask "anything else, or ship it?" When they say ship (or "commit and
   push"), go to Step 9 — once. If they're firing rapid edits top-to-bottom, that's normal: stay in
   the loop, keep the files in sync, and resist re-verifying or re-reporting after each one.
6. **Learn from the edits.** When the loop ends, look at *what kinds* of changes the author made —
   not the individual diffs, the patterns ("cut both explanatory closers", "swapped formal words
   for slang", "removed an emoji"). Append any recurring pattern to
   [references/author-edits.md](references/author-edits.md) (format documented in the file). Next
   post starts pre-calibrated. Don't log one-offs — a pattern needs to plausibly generalize.

## Step 9 — Final pass: translationese check + lint + build (once, at the end)

The English-side voice work happened in Step 6; what's left is the translations and the mechanics.

### A. Translationese check on the translated locales

A sentence can be clean in the source and machine-made in a translation — calques, textbook
connectors, rhythm imported from English. Spawn the **human-voice reviewer** over each locale file
that was *translated* (not the Step 6 source files, unless the review loop substantially rewrote
them):

- One subagent per locale, **in parallel**, each with the locale's file and the brief in
  [references/human-voice-review.md](references/human-voice-review.md) — same different-model rule
  as Step 6.
- Apply the rewrites you agree with; keep the invariants (Step 7) intact. One pass is enough here —
  the source was already iterated clean.

### B. Mechanical lint + build — deterministic, costs nothing

```bash
bun run build 2>&1 | tail -3                                # whole-site build; green = valid end-to-end
ls content/<slug>/                                          # every locale present?
grep -rl ':::' dist/*/<slug>/index.html && echo "DIRECTIVE LEAKED"   # raw ::: must not reach HTML
grep -rno ' -- ' content/<slug>/*.md                        # bare double-hyphens in prose → make them —

# Cliché lint — the greppable tells, per locale (hits = go fix, then re-grep):
grep -rniE 'delve|tapestry|game.?changer|seamless|testament to|fast-paced world|needless to say|worth noting|at the end of the day' content/<slug>/en.md
grep -rniE 'не просто.*, а|стоит отметить|в современном мире|давайте разбер(е|ё)мся' content/<slug>/ru.md
grep -rniE 'не просто.*, а|варто зазначити|у сучасному світі' content/<slug>/uk.md
grep -rniE 'no es solo.*sino|cabe destacar|en el mundo actual|sumerg' content/<slug>/es.md

# Em-dash density — flag any locale running hotter than ~1 per 80 words:
for f in content/<slug>/*.md; do w=$(wc -w < "$f"); d=$(grep -o '—' "$f" | wc -l); \
  [ "$d" -gt $((w / 80)) ] && echo "$f: em-dash heavy ($d dashes / $w words)"; done
```

The usual build failure is YAML (an unescaped `"` in `title`/`description`) — fix and rebuild.
A cliché-grep hit isn't automatically wrong (the regex can't read intent) — eyeball it, fix it if
it's a real tell, leave it if it's a quote or a bit. Skip the exhaustive per-locale frontmatter
diff and the serve-and-eyeball unless something looks off or the post matters.

### C. Report back

Short: the slug; title + word count per locale; directives executed (articles fetched, images
sourced — with origin URLs); any fact deviations and how each was resolved; voice-pass rounds and
the headline fixes; images vendored / linked / left as a "drop file here" TODO; lint results;
build status; preview paths (`/<locale>/<slug>/`). Flag anything still needing the author's hand.

## Voice & worked examples

For the voice in depth and complete *brain-dump → finished post* examples (so you can calibrate
how much to clean up vs. preserve — and see that different dumps demand different shapes), read
[references/style-guide.md](references/style-guide.md) before writing if you're at all unsure of
the register. It's the difference between "fine" and "sounds like the author on a good day."

The catalog of AI tells the human-voice agent hunts for (Steps 6 and 9) — sentence-level *and*
structural, per locale — and what it must *not* flatten, lives in
[references/human-voice-review.md](references/human-voice-review.md). It's the subagent's brief;
read it if you want to hand-check the prose yourself instead of spawning the agent.

The author's accumulated review-loop preferences live in
[references/author-edits.md](references/author-edits.md) — read at Step 2, appended at Step 8.
