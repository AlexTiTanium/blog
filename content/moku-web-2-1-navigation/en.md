---
title: "Stop Fighting Your Own Framework"
date: "2026-06-24"
description: "I built a real app on @moku-labs/web and it filled up with little hacks — a synthesized anchor click here, a position:fixed scroll freeze there, a 270-line WebSocket babysitter. Every one of them was the app patching a hole in the framework. So I stopped patching the app and fixed the framework. moku-web 2.1 is five additive capabilities, and it deletes those hacks from the demo."
tags:
  - moku
  - typescript
  - programming
language: en
author: "Alex Kucherenko"
draft: false
---

There's a tell that a framework is lying to you: your app fills up with workarounds, and every workaround has a long, apologetic comment explaining why it has to exist. Not "this is clever," but "this is here because the thing underneath won't let me do the obvious."

I hit that wall building **Atlas** — the redesign of the Tracker demo, a real-time kanban board on `@moku-labs/web`. It works. It's nice. And the codebase had quietly grown a little museum of apology:

- A `navigate()` helper that **created a detached `<a>` element, clicked it, and removed it** — because a programmatic navigation had no other way to make the SPA actually swap.
- A whole module, `board-scroll.ts`, that pinned `<body>` with `position: fixed; top: -scrollY` so the board wouldn't lurch to the top when you opened an issue over it.
- An issue panel that kept its *stale* contents in memory and toggled a `hidden` attribute, because returning an empty render corrupted Preact's tree and the panel would never re-open. The comment literally said *"only the first issue ever opens."*
- A 270-line `realtime.ts` hand-rolling WebSocket reconnect, keepalive, and a pre-seed buffer.

Four hacks. Four holes. The honest move isn't to write the fifth workaround — it's to go down a layer and make the obvious thing possible. So I shipped **moku-web 2.1**: five additive capabilities, no breaking changes, every default untouched. Here's what each one is, and the hack it retires.

## 1. Islands can navigate now

`app.spa.navigate()` existed, but an island couldn't reach it — islands don't get an `app` handle. So Atlas synthesized a click on a throwaway anchor, "the one path both interceptors honour." It worked the way duct tape works.

Now `navigate` is an always-present member of the island context, right next to `set`, `cleanup`, and `url`:

```ts
events: {
  "click [data-close]": (ctx) => ctx.navigate(ctx.url("board", { id: ctx.params.id })),
}
```

No `app`, no anchor, no DOM litter.

## 2. The look is a property of the screen

Atlas wanted board↔board to feel like one thing and opening an issue to feel like another. The framework gave it a single global boolean: view transitions on, or off. One crossfade for everything.

Transitions are now declared on the route — a typed directive, **not** a free-form `.meta()` bag (the framework interprets it, so it earns a real method with real autocomplete):

```ts
route("/board/{id}").transition("slide")
route("/board/{id}/issue/{issueId}").transition("morph")
```

The kernel tags each transition so your CSS can style it (`:root[data-view-transition~="slide"]`, or the standards-track `:active-view-transition-type()`), and a shared `view-transition-name` left across the swap will morph one element into another. `spa.viewTransitions` becomes the app-wide default; the route overrides it.

## 3. Scroll is a directive, not a hack

`board-scroll.ts` — the `position: fixed` freeze — existed for exactly one reason: the SPA always scrolled to the top on navigation, and an overlay route needs the page to *stay put*. The whole file was the app neutralizing the framework.

The kernel already had a per-navigation scroll opt-out internally. It just wasn't reachable. Now it is:

```ts
route("/board/{id}/issue/{issueId}").scroll("preserve")   // open the overlay; don't move the board
```

Plus an app-wide `spa.scrollRestoration` default and a per-call `ctx.navigate(path, { scroll: "preserve" })`. Atlas deleted `board-scroll.ts` and its lock/unlock dance entirely. One word of route metadata replaced a file.

## 4. "Render nothing" that actually works

This was a bug wearing a workaround's clothes. A persistent island that returned an empty string ran `host.innerHTML = ""`, which deletes the DOM out from under Preact's retained virtual tree — so the *next* render had nothing to diff against and silently no-op'd. Hence "only the first issue ever opens," and hence the app keeping stale state around forever to avoid ever rendering empty.

A render can now return `null` — render nothing, but stay mountable. It routes through Preact's own `render(null, host)`, a clean unmount that re-commits later:

```ts
render: (s) => (s.open ? h(IssuePanel, { issue: s.issue }) : null),
```

The issue panel deleted its keep-stale-state bookkeeping and just... closes.

## 5. A WebSocket that babysits itself

Every real-time app rewrites the same socket manager: reconnect with backoff, a keepalive ping, a buffer for frames that arrive before your snapshot loads, fan-out to handlers. `createChannel` is that, once, in the framework:

```ts
const board = createChannel<BoardPatch>({
  url: (id) => `${location.origin.replace(/^http/, "ws")}/ws/board/${id}`,
  keepAlive: { send: "ping", ignore: "pong" },
  bufferUntilSeed: true,
});
const off = board.subscribe(boardId, (patch) => applyPatch(ctx, patch));
```

`subscribe` is refcounted — first in connects, last out disconnects — so two islands sharing a board stop being load-bearing on mount order. Atlas's `realtime.ts` went from 270 lines of plumbing to a thin adapter. It's browser-only and tree-shaken away if you never open a channel.

## The part where the tests lied

Here's the bit I'm keeping in because it's the actual lesson. All five features had unit tests. 950 of them, green. I shipped 2.1.0.

Then I did the thing the tests can't do: I opened the real app in a real browser and clicked a card. The panel opened. The scroll stayed put. And the address bar still said `/`.

`app.spa.navigate` swapped the content and updated its internal idea of the URL — but never called `history.pushState`. A link click goes through the browser's navigation machinery, which commits the URL for you; a *programmatic* call bypasses all of that. So the page changed while the address bar, the back button, refresh, and every deep link stayed on the old URL. My new `ctx.navigate` inherited the hole. The tests ran in a DOM that doesn't have real history, so they were perfectly, confidently green.

That's `2.1.1`: the kernel commits the URL itself before swapping. Caught for the price of one card click. Passing tests are not a working app — they never were.

## What this is really about

None of these five things are big. That's the point. A framework earns trust in the small moments — when the obvious thing is also the available thing, and your app stops needing a museum of apologies. Every capability here came straight off a real demo's list of hacks, and shipping it deleted the hack. That's the only feature request I trust: *the workaround my own app had to write.*

`@moku-labs/web@2.1.1` is on npm. The Atlas demo is migrated. Four hacks lighter.
