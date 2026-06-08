# Geek Life — voice guide & worked example

Read this when you want to nail the register. The mechanics live in `SKILL.md`; this is about
*sound*. The tagline is the whole brief: **"a literary, self-ironic dev blog."**

## What the voice is

- **First person, past tense, confessional.** The narrator is the protagonist and usually the
  fool. Things go wrong *to* them and often *because* of them, and they're honest about it.
- **Self-irony, not cynicism.** Laugh at yourself, not at the reader and not at the craft. The
  warmth underneath is what makes it likeable: you love this stuff even when it ruins your week.
- **Specific beats generic.** "We chose SVN, which we would later regret" lands; "we had some
  version control issues" dies. Real tool names, real numbers, real 3 AM. The humor lives in the
  specifics, never in "as developers, we all know that…".
- **Literary texture.** Vary sentence length. Let one short sentence hit after a long one. A
  little drama is allowed ("Murphy's Law, act two…"). Earn it, don't sprinkle it.
- **Dry closers.** End on a line with a bite — a lesson, a confession, a shrug. *"A blog that
  cannot handle pull quotes is just a README with ambition."*

## What it is NOT

- Not LinkedIn. No "I'm humbled and excited to share…", no thought-leader throat-clearing.
- Not a tutorial. It can teach in passing, but the spine is a *story* or a *take*, not steps.
- Not flattering AI prose: drop "delve", "tapestry", "in today's fast-paced world", "robust
  solution", "game-changer", and the rule-of-three padding ("fast, reliable, and scalable").
- Not padded. If the dump is two paragraphs of real content, the post is short. Tight and honest
  beats long and invented — every time.

## The cardinal rule: preserve, don't fabricate

You are cleaning up someone's thinking, not ghost-writing a fictional version of their life. Keep
their events, opinions, punchlines, and conclusions. You may reorder, compress, punctuate,
sharpen a joke that's already there, and add connective tissue. You may **not** invent a metric, a
co-worker, an outcome, or a "lesson" they didn't reach. When the dump is ambiguous, write around
the gap rather than filling it with a confident lie.

---

## Worked example

### The raw brain-dump (what the user pastes)

> ok so today i finally killed the flaky test that's been haunting our CI for like a month
> everyone just hit rerun when it failed nobody wanted to touch it because it was in the payment
> flow and scary turns out it wasnt even the payment code it was a setTimeout in the test itself
> waiting 100ms for some animation and on the slow CI box it sometimes took 140 lol classic
> i spent two days adding logs convinced it was a race in our code meanwhile the answer was delete
> the sleep and await the actual event facepalm. anyway moral dont sleep in tests wait for the
> thing. also i feel like flaky tests are worse than failing tests because failing tests are
> honest

### The finished `content/kill-the-flaky-test/en.md`

```markdown
---
title: "The Flaky Test That Wasn't Even Our Fault"
date: "2026-06-07"
description: "I spent two days hunting a race condition in our payment code. The bug was a 100ms nap in the test, and it had been mocking us for a month."
tags:
  - testing
  - devlife
language: en
draft: false
---

For about a month, our CI had a ghost. One test in the payment flow would fail maybe one run in
five, and the entire team had developed the same coping mechanism: hit rerun, look away, pretend
it didn't happen. Nobody wanted to open it. It was in the *payment* flow. You don't poke the thing
that moves money.

So naturally I assumed the worst — a race condition in our own code, the kind that only shows up
under load and ruins a launch.

## Two Days Down the Wrong Hole

I did what you do when you're sure the bug is profound: I added logs. Everywhere. I was going to
*catch* this race in the act. I read the payment code until the function names stopped looking like
words.

The payment code was fine. The payment code had been fine the whole time.

> A flaky test is worse than a failing one. A failing test is at least honest with you.

## The Actual Villain

The test was waiting for an animation. Not by listening for it — by *sleeping*:

```typescript
// what the test did
await sleep(100); // "the animation is definitely done by now"
expect(modal).toBeVisible();
```

A hundred milliseconds is plenty of time on my laptop. On the tired CI box, under load, the
animation sometimes took 140. The test wasn't catching a bug. The test *was* the bug.

The fix was to stop guessing and wait for the real thing:

```typescript
// what it should have done
await screen.findByRole("dialog"); // wait for the event, not the clock
expect(modal).toBeVisible();
```

---

## The Lesson, Such As It Is

Don't sleep in tests. Wait for the event, not the clock — a timer is a bet that the slowest
machine you'll ever run on is faster than a number you made up while annoyed.

And the month of reruns? That's the real bug. The flaky test was lying to us five times a day and
we'd all quietly agreed to believe it.
```

### Why this is a good transformation

- **Every fact is from the dump.** Month-long ghost, the rerun habit, payment flow, two days of
  logs, `setTimeout`/sleep 100ms vs ~140ms on CI, "wait for the event", "flaky is worse than
  failing". Nothing invented — the code blocks just *show* what the dump described.
- **The dump's best line became a blockquote** ("flaky is worse than failing — failing is
  honest"), sharpened but still theirs — the plain `>` that real articles use, not the rare `:::pullquote`.
- **Structure appeared** (hook → wrong hole → real villain → lesson) without adding events.
- **Real em-dashes, tagged code blocks, one divider, one blockquote** — palette used, not abused.
- **The "lol / facepalm" got translated into the prose's own dryness** instead of being quoted
  literally. The humor survives; the texting tics don't.

### On the translations

The other locales are *native rewrites of this*, not literal swaps. The blockquote in Ukrainian
should sound like a Ukrainian developer's wry aside; the Spanish closer should carry the same
shrug. Keep the code blocks, `setTimeout`, `findByRole`, tags, date, slug, and image paths
identical — translate the prose, the title, the description, and any alt text around them.

### When the dump arrives in Russian (or any non-English language)

This example's dump is English, so `en.md` is the original. Flip it: a *Russian* dump means the
voice lives in Russian, so the **`ru.md` is the faithful original** — write it first, straight from
the dump, preserving the author's actual jokes and phrasing. Then `en.md` (the canonical default)
and `uk`/`es` become native rewrites of *that*. Everything above still holds: same preserve-don't-
fabricate rule, same native-voice bar per language, and the slug + tags stay English/ASCII even
though the body is Cyrillic (exactly like the existing `bad-monday` and `descent-journeys-in-the-dark`
posts). The author shouldn't have to write in English to blog in English.
