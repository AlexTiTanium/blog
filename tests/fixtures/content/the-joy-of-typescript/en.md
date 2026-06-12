---
title: "The Joy of TypeScript"
date: "2014-06-07"
description: "How I went from 'types are for people who can't hold code in their head' to 'I will never write untyped JavaScript again' in about six months."
tags:
  - javascript
language: en
author: "Alex Kucherenko"
draft: false
---

I resisted TypeScript for longer than I'd like to admit. My arguments were the usual ones: it's just JavaScript with extra steps, the compiler is slow, type annotations clutter the code, and real programmers don't need types because they can hold the entire program state in their head. That last one aged particularly poorly.

The turning point came on a Thursday afternoon when I spent four hours debugging a function that expected an array of user objects but was receiving an array of user IDs. The function didn't crash -- it silently produced wrong results, because JavaScript is nothing if not accommodating. It'll happily iterate over a string as if it were an array of characters, multiply `undefined` by 7 to get `NaN`, and concatenate a number with an object to produce `"42[object Object]"`. It's the language equivalent of a waiter who brings you whatever's in the kitchen and insists it's what you ordered.

## The Conversion

My first TypeScript file was a disaster. I typed everything as `any` because the compiler kept yelling at me, and `any` made it stop. This is like solving a fire alarm problem by removing the batteries. It works in the sense that the noise stops. It doesn't work in any other sense.

```typescript
// Week 1: The any phase
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// Week 4: The enlightenment
function processData(data: UserRecord[]): number[] {
  return data.map((item) => item.value);
}
```

The real joy came about a month in, when the compiler caught a bug I was about to introduce. I'd renamed a field in an interface, and TypeScript immediately highlighted every file that referenced the old name. In JavaScript, that rename would have been a ticking time bomb -- working fine in development, exploding in production three weeks later when someone hit the one code path that used the old field name.

## The Verdict

TypeScript doesn't make you a better programmer. It makes you an honest one. It forces you to think about your data shapes before you write your logic, to consider edge cases before they consider you, and to document your intentions in a way that a machine can verify. You still write bugs -- you just write different bugs. Higher-class bugs. Bugs with type safety.

I'll never go back to untyped JavaScript. Not because TypeScript is perfect, but because the alternative is holding the entire program state in my head, and my head has a garbage collector with very aggressive thresholds.
