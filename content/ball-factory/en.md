---
title: "Making a Game in Nine Days -- Is That Even Possible?!"
date: "2010-07-27"
description: "I'm not really the adventurous type, but sometimes it happens. And ten days ago, it happened. A buddy suggested I enter an IGDC game jam. Here are my impressions."
tags:
  - gamedev
  - ball-factory
language: en
author: "Alex Kucherenko"
---

I'm not really the adventurous type, but sometimes it happens. And ten days ago, it happened. Exactly ten days ago, my buddy Nikita (who goes by Division) suggested I enter an IGDC game jam.
Here are my impressions...

## The Contest

For those who don't know, IGDC is a community of people who enjoy making games. A contest is announced, rules are set, and off you go -- anyone can participate. The theme for this particular contest was genuinely interesting: Indirect Control. The idea is that the player has no direct control over the game process. You can only influence things indirectly.

I'd never entered one of these contests before, unlike Nikita, who had even placed in the top ranks. We decided to write in ActionScript 3, which I knew only vaguely. Why AS? Simply because Division had an engine built on AS that used the well-known Decorator pattern -- used it so heavily, in fact, that the engine itself was called Decorator.

When I heard "indirect," the famous puzzle game "The Incredible Machine" came to mind. I got the idea to make something similar but change the goal. In The Incredible Machine, the objective is to get a mechanism working. In our game, you'd make all the balls roll into a specific pipe using various boxes, planks, and -- of course -- physics. Luckily, the Decorator engine supported Box2D, though looking at the relative sizes of the engine and Box2D, it's hard to tell who's supporting whom. Anyway, physics sorted.

Design, hmm... neither I nor Division could draw at all. We decided to offer the honorary position of designer to an acquaintance of mine. He drew a couple of scenes, but then something came up, and we had to draw everything ourselves -- by "ourselves" I mean me.

![Ball Factory main menu with various sports balls and options: Start Game, Editor, About Us](./images/bf-1.webp)

![Ball Factory gameplay on level 2: wooden crates, planks, and pipes on a colorful hillside](./images/bf-2.webp)

## Development

One key rule of the contest: you have to make the game in 9 days. So work kicked off at a lively pace. I was coming up with the concept, sketching out what everything should look like, while Division was preparing the engine. We used Dropbox for file sharing -- once again convinced that app is indispensable.

The engine prep took about three days and fell squarely on Division's shoulders. But for collaborative work we needed version control. The choice was between Git and SVN. We chose SVN, which we would later regret.

We got into a rhythm pretty quickly. Development happened at night. Since my AS experience left much to be desired, Division would explain over Skype what I was doing wrong. Skype was a huge help on this project, actually -- first, it made things more fun, and second, we could quickly coordinate our tasks and actions.

I fondly remember those sleepless nights. It was genuinely exciting to learn something new (AS) by doing it. I used to think you had to read a thick book before you could start writing in a new language -- how wrong I was. In those 4 days of coding, I learned more than I would from a month of reading a smart book. Sure, I lacked theoretical knowledge, but that was quickly fixed by the school of hard knocks...

![Ball Factory level 4 gameplay: triangular ramps, pipes, and ball counter showing caught and total balls](./images/bf-3.webp)

![Ball Factory level editor showing XML level data with entity definitions and coordinates](./images/bf-4.webp)

## The SVN Disaster

Things went smoothly for about four days, but then Saturday came -- the turning point. We wrecked SVN. Here's how it went down... I pushed a new commit, Division was supposed to update his repo, but there was a conflict that needed manual resolution. Out of inexperience, Division clicked the wrong thing or pressed the wrong button, and wrecked one file. All his changes in that file were lost. And of course, stupidity never comes alone... In a move that was more dumb than inexperienced, I advised him to roll back to the previous revision, assuming he'd committed before that. Naturally, the previous revision wiped out an entire day's work... We were livid. The submission deadline was the next day, and we hadn't even built the levels yet -- and as if by Murphy's Law, the most complex and tangled part got erased.

Nothing to do about it -- Division had to restore everything. Morale was dented, but the payoff was worth it: we ended up with a solid level editor and a pretty good-looking game (you're welcome, that was my design work).

## The Disqualification and Redemption

Murphy's Law, act two... According to contest rules, you could be a day late with a 30% penalty, but you had to notify the organizer. Of course we weren't going to make it, and we'd known it beforehand. In the relevant IGDC forum thread, Nikita had been voicing concerns and guesses that we wouldn't finish on time. We weren't sure yet, so we warned them more explicitly once we realized our earlier posts hadn't been taken as an official late notice. The organizer said "why so late?" but nothing more. We were drawing levels until about 3 AM (with work in 4 hours). We'd wanted to submit earlier, but as always, things never go the way you want. Realizing we were looking at the full 30% penalty, we went to sleep. During the day, in breaks between my day job, I kept tweaking levels, fixing issues, preparing the game for release. And then, like a bolt from the blue -- we get disqualified. For being late. I was honestly in shock. So much effort and soul poured in, it was really upsetting. But what can you do -- we packed the archive and sent it off.

Dragging myself home, I bought a bunch of junk food -- chips and cookies -- to at least console myself somehow. Got home and crashed without even reaching the cookies or chips. Around 10 PM, my wife wakes me up with great news -- the admin reversed the disqualification! The joy was beyond words. Special thanks to the admin! The world was right again... We're in the fight... We're competing... And we wait for the scores...

## Lessons Learned

Lessons I took away:
-- Learn by doing.
-- Making games is fun.
-- To hell with SVN. Next project, we're using Git.

![Ball Factory level 3 gameplay: balls bouncing along a circular path with pipes and ramps](./images/bf-5.webp)

![Ball Factory level selection screen with 16 numbered levels in a green grid](./images/bf-6.webp)
