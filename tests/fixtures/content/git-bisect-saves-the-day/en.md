---
title: "Git Bisect Saves the Day"
date: "2013-04-10"
description: "A love letter to git bisect -- the underappreciated tool that turns a haystack of commits into a binary search for the needle that broke everything."
tags:
  - tools
language: en
author: "Alex Kucherenko"
draft: false
---

Something broke in production. Not the dramatic, everything-is-on-fire kind of broke. The subtle kind. A calculation that was off by 0.3%. A tooltip that appeared two pixels to the left. The kind of bug that makes you question your own sanity before you question the code.

The commit log showed 847 commits since the last known good state. Eight hundred and forty-seven. That's not a number you can reason about manually. That's not a number you should even try. That's a number for `git bisect`.

## Binary Search for Humans

If you haven't used `git bisect`, here's the elevator pitch: it performs a binary search through your commit history. You tell it "this commit is good" and "this commit is bad," and it checks out the midpoint. You test, report good or bad, and it halves the search space. In a repository with 847 commits, you'll find the culprit in about ten steps. Ten. Not 847. Ten.

```bash
git bisect start
git bisect bad HEAD
git bisect good v2.1.0
# Git checks out the midpoint
# You test...
git bisect good
# Git narrows the range, checks out next midpoint
git bisect bad
# ...repeat until found
```

There's something deeply satisfying about watching the range collapse. "423 revisions left to test." Then 211. Then 105. Each step cuts the problem in half with surgical precision. It's the closest programming gets to a magic trick.

## The Reveal

After nine steps, `git bisect` pointed its finger at a commit from three weeks ago. The message read: "minor cleanup, no functional changes." I laughed, because of course it did. The commit reformatted a config file and, in the process, changed a tab to spaces inside a YAML block where indentation mattered. A silent, invisible, catastrophic change hiding behind an innocent commit message.

I fixed the indentation, verified the calculation, and ran `git bisect reset` to return to the present. Total time: twenty minutes. Without bisect, I'd still be reading commit diffs tomorrow. Sometimes the best tools are the ones you forget exist until you desperately need them.
