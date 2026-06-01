---
title: "Code Reviews: A Survival Guide"
date: "2017-08-14"
description: "Navigating the delicate social dynamics of code reviews, where technical feedback meets human ego and nobody wants to be the person who blocks the merge."
tags:
  - devlife
  - opinion
language: en
author: "Alex Kucherenko"
draft: false
---

Code reviews are the part of software development where we pretend that our feedback is purely technical and has nothing to do with personal style preferences, aesthetic opinions, or the fact that we would have written it completely differently. We dress up "I don't like this" in the language of best practices and pretend we're being objective. We're not, but the fiction is useful.

I've been on both sides of the review table. I've been the nervous junior developer whose first pull request received forty-seven comments, twelve of which were about variable naming. And I've been the senior reviewer who left forty-seven comments, twelve of which were about variable naming, and felt righteous about every single one. Both experiences were educational. Neither was comfortable.

## The Unwritten Rules

Every team has unwritten code review rules. Here are some I've collected over the years:

"Nit:" means "I know this doesn't matter but I'm going to mention it anyway." It's the reviewer's way of saying "I spotted something that bothers me aesthetically but isn't worth blocking the merge over." The correct response is to fix it silently. The incorrect response is to argue about it. Both happen with equal frequency.

"Could we maybe..." is not a question. It's a polite command. When a senior developer writes "Could we maybe extract this into a separate function?", what they mean is "Extract this into a separate function." The question mark is a social lubricant, not an invitation to say no.

"I'm not sure about this approach" means "This approach is wrong and I'd like you to arrive at that conclusion yourself so I don't have to say it directly." This is the code review equivalent of Socratic dialogue, and it's equally frustrating for everyone involved.

## Finding the Balance

The best code reviews I've participated in shared one quality: they were conversations, not verdicts. The reviewer asked genuine questions. The author explained their reasoning. Sometimes the reviewer learned something. Sometimes the author changed their approach. Often, both happened.

The worst code reviews were monologues -- long lists of demands with no context, or defensive responses that addressed the letter of each comment while ignoring its spirit. Code reviews work when both parties remember that they're collaborating on a shared codebase, not competing in a correctness tournament. But it's hard to remember that when someone leaves a comment on your carefully crafted function that just says "why."
