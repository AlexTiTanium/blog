---
title: "Bad Monday"
date: "2015-12-05"
description: "It's 4 AM, insomnia got me again. Usually I go work. For me this is a blessed time of peace and quiet -- what more do you need to write beautiful, maintainable code?"
tags:
  - life
language: en
author: "Alex Kucherenko"
---

It's 4 AM, insomnia got me again. Usually I go work. For me this is a blessed time of peace and quiet -- what more do you need to write beautiful, maintainable code?

Beautiful code... let's talk about that, shall we?

Recently I was listening to Radio-T (a popular Russian tech podcast) -- don't remember which episode, one of the recent ones -- where they discussed an article about outsourcing.

Yet another client decided to save money and ordered iOS app development from the cheapest company they could find on the internet. The result is obvious: a complete disaster. And he goes point by point explaining why, in his opinion, everything went wrong.

Of course nobody's willing to admit the correlation between price and quality. It must be something else, right? You want to believe you can get the best for five bucks an hour. Though you should understand that a big price tag doesn't guarantee anything either.

There was a lot of back-and-forth on this topic. Umputun's brief take was that there's a difference in mentality: for Americans, the result is everything, the process is nothing. For Russians, the process is everything, and the result is a side effect. For Indians, one thing's rubbish, another thing's rubbish -- life's too short to sweat it.

So I'm sitting there thinking: damn, there's something to this. Should you even bother with the process?

After all, the client needs results, and what am I doing? I'm fussing over the process. Sure, I fuss over it to produce the best result I'm capable of, but you could get results faster.

The task: write a simple autocomplete for a service. Just shove everything into the damn controller that renders the list of results and call it a day.

But no, I have to extract it into a separate controller, refactor it -- because someone will come along to maintain this, and what will they think of me?

And what about the server side? A normal, efficient programmer would just regex through the database and be done with it. Result achieved.

But no, we're "special." Everything has to be fast, and the autocomplete has to actually help you type something. Instead of regex search, let's build a prefix tree? And let's add tag weights to surface the most popular ones first. And of course we need tests and documentation.

And just like that, I'm deep in the weeds of process.

This is not results. The client doesn't need any of this. Not only doesn't need it, but it's actively harmful -- financially and deadline-wise. And in a year they'll rewrite the whole thing anyway, if anyone still cares.

Maybe subconsciously I realize I'm paid by the hour, and if I do it in one hour instead of ten, I'll earn less? No, that's not it -- I did the same thing back when I worked for a fixed price.

What's bad is that for me this is a conscious choice. I don't want to change, to adapt to the market. (Probably why the last time I looked for a job it took me about three months.)

Kill me, but I want to write proper code. And proper code takes time, and time is money. The conclusion: by all rights, I should be fired. In this unequal battle between process and results, I'm the broken gear.

Beautiful code to you all, friends!
