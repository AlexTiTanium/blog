---
title: "Refactoring Legacy Spaghetti"
date: "2013-11-18"
description: "Every developer inherits a codebase they didn't write. The question isn't whether to refactor -- it's how to do it without losing your mind or breaking everything."
tags:
  - devlife
  - opinion
language: en
author: "Alex Kucherenko"
draft: false
---

I inherited a codebase last month. "Inherited" is the polite word. "Was abandoned with" is more accurate. The original developer left the company, taking with him the only brain that understood why the main service class has 4,200 lines, no tests, and a method called `doEverything()` that lives up to its name in the worst possible way.

The codebase has layers like geological strata. You can trace the history of web development through its dependencies: jQuery at the bottom, Angular 1 in the middle, a thin layer of React on top, and scattered throughout, raw DOM manipulation that predates all of them. It's an archaeological dig site masquerading as a web application.

## The Refactoring Dilemma

Here's the thing about legacy code that nobody tells you: it works. That 4,200-line method? It processes ten thousand requests a day without failing. The tangled mess of jQuery and Angular? Users don't see it. They see a functioning application that does what it's supposed to do. From a business perspective, this code is perfect.

So why refactor? Because the next feature request will take three weeks instead of three days. Because every bug fix introduces two new bugs. Because the build takes fourteen minutes and nobody knows why. Because the new hire stared at the codebase for a week and then quietly updated their LinkedIn.

## The Strategy

You don't refactor legacy code all at once. That's a rewrite, and rewrites fail. You refactor it the way you eat an elephant -- one bite at a time, while everyone around you wonders why you're eating an elephant at all.

Start at the edges. Find a function with clear inputs and outputs. Write a test for it. Refactor it. Move on. Don't touch `doEverything()` yet. Don't even look at it. It feeds on attention. When you've refactored enough of the periphery, `doEverything()` will be smaller by subtraction -- you'll have extracted its responsibilities one by one, like removing Jenga blocks from a tower that, against all odds, refuses to fall.

Three months in, I've extracted forty-two functions, written a hundred and twelve tests, and reduced the main class to 3,100 lines. It's still spaghetti. But it's spaghetti with unit tests, and that's practically fine dining.
