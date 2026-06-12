---
title: "When the Build Breaks"
date: "2014-12-01"
description: "A chronicle of the five stages of grief as experienced through a CI/CD pipeline that refuses to turn green, and the lessons learned along the way."
tags:
  - devlife
  - tools
language: en
author: "Alex Kucherenko"
draft: false
---

The Slack notification arrives at 2:14 PM on a Friday. "Build failed on main." Five words that can ruin a weekend. You check the CI dashboard and see a wall of red. The build has been failing for three commits, which means three developers pushed without checking, which means the problem has been composting in the pipeline for about two hours. This is fine.

The first stage is denial. "It's probably a flaky test." You re-run the pipeline. It fails again, this time with a different error, which is somehow worse than the same error. At least a consistent failure has dignity. An inconsistent failure is chaos wearing a lab coat.

## The Investigation

You start reading the build log. It's 2,400 lines long, and the actual error is on line 2,387, buried under a mountain of successful steps that the CI system reports with the enthusiasm of a golden retriever. "Step 1: SUCCESS! Step 2: SUCCESS! Step 3: SUCCESS!" And then, quietly, at the bottom: `TypeError: Cannot read properties of undefined (reading 'map')`.

The error is in a test file. The test was added in the second commit, depends on a utility function from the first commit, and the third commit refactored that utility function without updating the test. A classic three-body problem. Each commit is correct in isolation. Together, they're a disaster.

## The Fix

You could fix the test. That's the obvious solution. But fixing a test on a Friday afternoon is like fixing a leaky pipe -- you touch one thing and three other things start leaking. Instead, you do the responsible thing: you fix the test, run the full suite locally, watch it pass, push with a commit message that reads "fix: update test after refactor," and close your laptop before anything else can go wrong.

The build turns green at 3:02 PM. You've spent forty-eight minutes on what amounts to changing two lines of code. But those two lines kept five developers from deploying for an entire afternoon, and that math -- forty-eight minutes of your time versus five person-hours of blocked productivity -- is why CI/CD pipelines matter, why keeping them green matters, and why breaking the build on a Friday should be a fireable offense. I'm mostly joking about that last part. Mostly.
