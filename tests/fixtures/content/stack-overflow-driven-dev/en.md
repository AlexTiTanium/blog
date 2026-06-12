---
title: "Stack Overflow Driven Development"
date: "2020-05-30"
description: "An honest examination of how much of modern software development is really just searching Stack Overflow, copying the accepted answer, and hoping for the best."
tags:
  - devlife
  - javascript
language: en
author: "Alex Kucherenko"
draft: false
---

Let's be honest with each other. We're all adults here. A significant percentage of professional software development consists of the following workflow: encounter a problem, open a browser tab, type the error message into a search engine, click the first Stack Overflow link, scroll past the question, read the accepted answer, copy the code, paste it into your editor, and pray. This is not a shameful secret. This is industry standard practice.

I once tracked my browser history during a normal work day. I opened Stack Overflow forty-three times. Forty-three. That's roughly once every eleven minutes. Some visits were for genuine questions I couldn't answer from memory. Others were for things I absolutely knew but wanted to double-check. And a few were for things I've looked up so many times that I recognize the answer by the commenter's avatar before I read the text.

## The Copy-Paste Spectrum

Not all Stack Overflow copying is equal. There's a spectrum:

At one end, you have the thoughtful developer who reads the answer, understands the underlying principle, adapts the solution to their specific context, and closes the tab enriched with new knowledge. At the other end, you have the developer who copies the entire answer including the variable names `foo` and `bar`, ships it to production, and closes the tab before the page finishes loading. Most of us oscillate between these extremes depending on the day, the deadline, and how many hours since our last coffee.

The dangerous middle ground is the developer who copies the code, makes it work, but doesn't understand why it works. This creates what I call "cargo cult code" -- code that functions correctly but for reasons nobody on the team can explain. It sits in the codebase like a mysterious artifact, and everyone is afraid to touch it because the last person who tried broke the deployment pipeline for two days.

## The Deeper Truth

The real skill isn't knowing the answer. It's knowing how to find the answer and -- crucially -- how to evaluate whether the answer is correct, current, and applicable to your situation. A Stack Overflow answer from 2014 about JavaScript might reference practices that are now anti-patterns. An answer with 847 upvotes might be technically correct but architecturally inappropriate for your use case. An answer marked as accepted might have a comment from 2019 saying "this no longer works" with seventeen upvotes.

Reading Stack Overflow critically is itself a skill, and it's one that nobody teaches in computer science programs. Maybe they should. Call it "Applied Information Foraging" or "Practical Epistemology for Software Engineers." Until then, we'll keep copying, pasting, and hoping. At least we're honest about it.
