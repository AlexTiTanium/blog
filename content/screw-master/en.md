---
title: "Eight Days of Unscrewing a Game Out of an AI"
date: "2026-01-07"
description: "My company announced an AI week. My wife, at that exact moment, was unscrewing little bolts on her phone. I put the two together and gave myself exactly eight days: all code and all art by AI, me just conducting."
tags:
  - gamedev
  - ai
  - programming
language: en
draft: false
---

My company announced an AI week: every developer could try AI for any purpose they wanted. Subscriptions, any tools we asked for — within reason, obviously. And my wife, at that exact moment, was playing a game where you unscrew little bolts. I don't know what the genre is called. Some kind of puzzle: you unscrew bolts in the right order, sort them into colored trays, and basically win by unscrewing bolts.

I studied the mechanic and set myself a task. I had exactly eight days — no more, no less. I had to make the game with AI as fast as possible, at the best quality possible. All the code, all the graphics, the concept art, everything — AI. Me, I only orchestrate: I organize the gameplay and decide what gets done and how. That's how Screw Master happened: my first attempt at making a game without making it with my own hands.

## I'm Not an Animal — I Don't Poke Buttons

I started with the code: ODIE (one of our internal engines, a classic ECS) with PixiJS 8 doing the rendering. The first thing I did was tighten every TypeScript validation as strictly as it would go, and I decided up front: testing would be automatic, and the game would be built from day one with self-verification in mind. I'm not an animal — I don't poke buttons by hand.

The idea was this: Playwright plays the game. It gets the whole harness and the instrumentation to do it: access to input, access to the render graph, access to the ECS. Every feature is proven by video: the AI builds something, opens a PR, attaches a recording — I watch it, decide whether I like what I see, and give feedback. No "trust me, it works." Here's the footage, see for yourself.

And here, in fact, is what came out of it. You can unscrew a few bolts without leaving the article:

::embed{src="https://screw-master.kucherenko-email.workers.dev/" title="Screw Master" width="450" height="800"}

All the code is on GitHub, PRs and video proofs and all: [AlexTiTanium/screw-master](https://github.com/AlexTiTanium/screw-master).

## Figma, MCP, and the Battle for Sanity

The entire interface went through Figma. I assembled the scenes the way they were supposed to look, then the Figma MCP gave the model access to the data and the assets — and the UI got built from that.

A whole separate problem was teaching that MCP and the model to be friends and not build nonsense. I had to go deep into Figma: structure every component with ruthless logic, so that what came out the other end was something sane instead of gibberish. I spent ages picking components so they'd all sit in more or less one style. Generating identical models in a different color — same suffering.

## Bugs Are What AI Generates Best

And now for the biggest problem of all.

> Bugs are what AI generates best. And what bugs — honestly, you just stand there marveling.

The real challenge was even *explaining* what the bug was. Especially when the AI had to do something concrete: say, several animations have to drop bolts onto their slots *at the same time*. It simply lost its mind over that. No, you can't do it the pretty way, with a queue or a stack — you need exactly this weird contraption and nothing else: cancelling promises, pausing them. Basically the most direct way to pile up problems for yourself. Hundreds of prompts. Pure pain.

## So, Can You Make Games This Way?

I'd say the experiment ended on a positive note: I took it all the way to the finish. What I learned for myself: building a prototype with AI is completely fine. Building a product… that I honestly don't know. You'd have to be cocky. Very, *very* cocky.

Image generation wasn't great either: you'd order red bolts and get mushrooms. Why? No idea. Maybe the shape, maybe the color. But like everything in this world, enough work, nerves, and swearing gets you something more or less not-terrible.

Is it faster to just do it by hand? For code — the other way around, actually: by hand is faster. But only if you don't count the tests, of which there are more than the code itself — so, nuances. For the art — I could never have drawn it myself, but any artist would have done it better. So draw your own conclusions. The bar will probably rise, and projects like this will become genuinely possible. Right now, the level of quality AI can carry is an MVP or a prototype. Past that, it's a lottery.

But I learned a lot for myself: Figma, how to do e2e tests — and how not to do them. So I count the experience as a win. I'd love to have more time for things like this, but alas: a day has 24 hours, food doesn't earn itself, and the kid needs to get to school. So I had my fun. That'll do.
