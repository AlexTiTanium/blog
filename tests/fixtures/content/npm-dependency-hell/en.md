---
title: "npm Dependency Hell"
date: "2017-02-28"
description: "A deep dive into the terrifying moment when you run npm install and 1,347 packages appear in your node_modules, three of which are maintained by a single person in Nebraska."
tags:
  - javascript
  - tools
language: en
author: "Alex Kucherenko"
draft: false
---

I ran `npm install` on a fresh project today. A simple web application -- Express server, a couple of API endpoints, nothing fancy. The install pulled in 1,347 packages. One thousand three hundred and forty-seven. For a project with twelve lines in its `package.json`. I stared at the number for a while, the way you stare at a restaurant bill that can't possibly be right but mathematically is.

The `node_modules` directory weighs 247 megabytes. That's larger than the operating system I grew up with. Somewhere in those 247 megabytes is a package called `is-odd` that checks if a number is odd. It has one dependency: `is-number`. Which has its own dependency tree. To determine if 7 is odd, we've assembled a small civilization of code.

## The Audit

I ran `npm audit` because I enjoy pain. It reported 14 vulnerabilities: 3 critical, 5 high, 6 moderate. One of the critical vulnerabilities is in a package four levels deep in the dependency tree -- a dependency of a dependency of a dependency of something I actually chose to install. Fixing it requires updating the top-level package, which has a major version bump, which changes its API, which means rewriting the three places I use it.

```bash
$ npm audit
found 14 vulnerabilities (6 moderate, 5 high, 3 critical)
run `npm audit fix` to fix them, or `npm audit fix --force` to accept breaking changes

$ npm audit fix --force
# 45 packages changed
# 3 new vulnerabilities introduced
# npm audit fix has mass-created a time loop
```

The `--force` flag is npm's version of "hold my beer." It fixes vulnerabilities by introducing different vulnerabilities, creating a conservation-of-bugs principle that would make a physicist proud.

## The Existential Question

The JavaScript ecosystem has a dependency problem, and we all know it, and we all keep `npm install`-ing anyway. It's collective denial on an industrial scale. We trust that the person maintaining `left-pad` won't delete it (they did), that critical infrastructure packages are well-funded (they aren't), and that our lock files will protect us from supply chain attacks (they might, if we actually commit them).

I don't have a solution. Nobody does. But I've started a new habit: before adding a dependency, I look at the package's GitHub page. If it has one maintainer, no recent commits, and the README starts with "this package is no longer maintained," I write those twelve lines of code myself. It's not much, but my `node_modules` directory is now only 230 megabytes, and I sleep marginally better at night.
