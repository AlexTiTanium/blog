---
title: "The Dark Arts of Regular Expressions"
date: "2018-07-05"
description: "Some people, when confronted with a problem, think 'I know, I'll use regular expressions.' Now they have two problems. Here's a field guide to both."
tags:
  - javascript
language: en
author: "Alex Kucherenko"
draft: false
---

There's a famous quote attributed to Jamie Zawinski: "Some people, when confronted with a problem, think 'I know, I'll use regular expressions.' Now they have two problems." I used to think this was a warning. Now I realize it's a description of my typical Tuesday.

Regular expressions are the closest thing programming has to magic spells. They're powerful, cryptic, write-only, and if you get one character wrong, the results range from "nothing happens" to "the server catches fire." A regex that validates email addresses looks like a cat walked across the keyboard during an earthquake. And yet, it works. Somehow. Nobody knows why. Nobody dares change it.

## A Field Guide

Let's start with something simple. You need to match a phone number. Easy, right?

```javascript
// Attempt 1: The optimist
/\d{3}-\d{3}-\d{4}/

// Attempt 2: The realist (people use spaces, dots, parentheses...)
/[\(]?\d{3}[\)\-\.\s]?\s?\d{3}[\-\.\s]?\d{4}/

// Attempt 3: The person who has seen international phone numbers
// [abandoned, seeking therapy]
```

The progression from Attempt 1 to Attempt 3 mirrors the five stages of grief, compressed into a single afternoon. You start with confidence, encounter reality, and end up questioning whether phone numbers are even a coherent concept.

## The Readability Problem

The real issue with regex isn't capability -- it's readability. A regex is a compressed algorithm, and compression always trades clarity for density. Consider this pattern that validates dates:

```javascript
/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
```

This validates dates including leap years. It is correct. It is also an abomination. If you need to modify it, you don't debug it -- you delete it and start over. Or, better yet, you use a date parsing library like a reasonable person and save the regex for problems that actually deserve it.

## The Wisdom

After years of writing, debugging, and cursing at regular expressions, I've arrived at one piece of wisdom: use regex for pattern matching, not parsing. Matching "does this string look like an email?" is a regex problem. Parsing "extract the semantic components of this email address" is not. The boundary between matching and parsing is where regex transforms from a useful tool into a Lovecraftian horror. Stay on the right side of that boundary, and regex is your friend. Cross it, and may your stack traces be merciful.
