---
title: "The Making of Fun Da Vinci"
date: "2011-05-04"
description: "Here's where it all started, and here's what we ended up with. We changed a lot, assembled a solid team, and gained experience selling a game. We'll share all of it with you."
tags:
  - gamedev
  - fun-da-vinci
language: en
author: "Alex Kucherenko"
---

[Here's](https://geeklife.in.ua/2010/07/27/make-game-in-nine-days/) where it all started, and [here's](http://armorgames.com/play/10964/fun-da-vinci) what we ended up with. We changed a lot, assembled a solid team, and gained experience selling a game -- we'll share all of it with you, dear reader. Interested? Welcome aboard.

## Programming

This part's simple -- me and Nikita Sidorenko (Division). People say two programmers on one simple Flash game is too many. I categorically disagree. In practice, if you write a game solo, you eventually give up. Maybe it's just us, but trust me, we tried -- working as a pair is both more fun and more productive. I explain it through guilt: if one person is working on something, the other feels ashamed for slacking and starts pitching in.

![Four art style iterations of the game: early cartoon prototype, item sprites, neon concept, and final Leonardo manuscript style](./images/fdv-1.webp)

## Design

Everything starts with design, and in a quality game it's front and center. As you know, I was the one who drew (read: borrowed) the art for the previous version. That flies for a contest, but for a real product you need proper, and most importantly, original art. Kherson is a small city -- everyone knows everyone -- and there aren't many good designers around, so we didn't have to search long for [Semyon Khramtsov, the "freelancer from the provinces"](https://www.youtube.com/watch?v=K7r9dbqYrHs).

_"Even though I didn't particularly like puzzles, the guys' enthusiasm was infectious. First I proposed several art styles, including a stylization of Leonardo's manuscripts. That's the one everyone fell for. Sure, it's a pretty mainstream trick in graphic design, but the allure of synthesizing an interactive environment with that famous sketch style of the Renaissance mega-designer was too strong. I re-read his biography, googled all his works to mine as much flavor for the game as possible -- basically, immersed myself in the right atmosphere as deeply as I could. Of course, I consider the result an affront to his image and inventions, but who are we compared to the Master? Thank God I didn't repaint the game in bright 'casual' colors, as one of the judges suggested at the game-lynch -- we'd definitely be burning in hell for that. My biggest achievement in this project was diving into level design and combining the artist's grim self-portrait with the Mona Lisa's smile :)" -- Semyon Khramtsov_

![Da Vinci self-portrait evolution: original sketch, grayscale adaptation, and final game version with Mona Lisa smile](./images/fdv-2.jpg)

## Sound and Music

The last but by no means least area -- the musical and sound design of the game. It doesn't just bring the game to life; it keeps the player from getting bored -- at least until it starts to annoy them. Semyon happened to know a very talented composer he'd been working with on small Flash projects for a while -- [Vladimir Marinichev](http://requix.promodj.ru/) -- which was perfect timing.

_"First things first, to immerse myself in the Renaissance atmosphere, I re-watched a biographical film about Leonardo da Vinci and listened to works by composers of that era. For the menu theme, I based it on a piece by Claude Gervaise that would convey the mood of a thoughtful Creator and transport the player to the Renaissance. I tried to keep the arrangement and instrumentation true to the style of that period.
For the gameplay sound design, many sounds were recorded using everyday objects. We decided to leave the levels without a musical score and instead convey the atmosphere of a workshop. During gameplay you can hear Leonardo constantly scribbling notes and humming something to himself, engrossed in yet another experiment.
Unfortunately, in trying to reduce the game's file size, we had to degrade the quality of all sounds and music, which of course made it harder to realistically convey all the nuances and details. But overall, many people were happy with the result, and it was very gratifying to receive a high rating from FGL." -- Vladimir Marinichev_

And so, with the team assembled, off we went...

## The Beginning

The first commit was on August 4, 2010 -- that's when you can mark the start of development. We slowly began fixing bugs, and since we all had day jobs, progress was very slow. We set up a task manager, created a pile of tasks, had lots of discussions -- all about nothing, really. In its final form, if you took all the tasks into account, the game should have looked like a mini Starcraft 2 with its own BattleNet (which had just come out at the time -- very distracting). The unrealistic scope of our plans was our first mistake. Don't build enormous castles. You'll abandon most of it once you realize your plans would have surprised even Napoleon. That's exactly what happened to us. We came to our senses when we decided to participate in FlashGamm KYIV 2010. We needed something to show, and we had nothing -- not even a working prototype. That's when the real work began. First we axed most of the tasks, minimized and optimized everything we could. And that produced results.

![Task manager screenshot: a to-do list including "Stop playing Starcraft 2" with humorous entries](./images/fdv-4.webp)

## FlashGamm KYIV 2010

By the start of the conference we'd managed to cobble together something resembling a prototype and build a few lackluster levels. With that, Semyon and Nikita headed to Kyiv. We competed in the Indie category, plus we signed up for the game-lynch (a public critique session) -- oh boy, did they tear us apart... But the game-lynch itself was incredibly useful. They pointed out our game's shortcomings, our mistakes, and gave us advice on where to go next. The encouraging part was that we'd already anticipated many of the flaws they called out. During the audience vote for best game-lynch game, ours scored exactly 0 points (zen mode) -- and after that, none of us expected to win anything at all. But out of nowhere, we won the "Future Hit" nomination! The joy was immense. I think this event had a really positive effect on the team's morale -- we realized there was something to this game and we needed to finish it no matter what.

![The Fun Da Vinci team receiving the Future Hit award at FlashGamm KYIV 2010 conference](./images/fdv-5.webp)

## Wrapping Up

After the conference, development settled into a steady rhythm and everything ran like clockwork. But there were annoying bugs. The first was objects falling through other objects -- a ghost that had haunted us since Ball Factory (the first prototype). We solved it pragmatically, by trial and error. I started tinkering with Box2D settings and found a quirk: changing `b2_aabbMultiplier` from 0.2 to 0.1 magically fixed the fall-through issue. The second bug crept up from where we least expected. Everywhere we needed a button, we used `SimpleButton`, and it never even crossed our minds that in newer Flash Player versions, button states would start "sticking" -- and there was no way to fix it no matter what hacks we tried. We had to build our own solution. Discussion on [flasher.ru](http://www.flasher.ru/forum/showthread.php?t=148860).

## Selling the Game

Another thing happened at FlashGamm -- we met Stefan Keisch. We had no idea how to sell a game. There was some information online about FGL (Flash Game License), but it was all vague, and you needed to attract sponsors. That's exactly what Stefan does -- not for free, of course: 30% of the game's sale price. After some thought and deliberation, we accepted the offer. Stefan also gave recommendations on how to make the game more attractive to sponsors. The first thing he pointed out was the name. Our working title was "Balls Da Vinci" -- that's the name we competed under at FlashGamm. Unfortunately, the name triggered too many unwanted associations with Leonardo's manhood (which we found hilarious, admittedly), so we rebranded to "Fun Da Vinci" (maybe it's only a puzzle for us -- for da Vinci's brain, it's child's play).

The listing went up on FGL on January 14, 2011. FGL reviews every game submitted.

_Review Information:_

Intuitiveness: 7 Good
Fun: 6 Average
Graphics: 7 Good
Sound: 8 Great
Quality: 7 Good
Overall: 7 Good

Comments:
Standard execution of a traditional physics game with a Leonardo da Vinci theme
Creative level design, familiar game mechanics, polished interface
Lacks depth beyond first playthrough. Consider adding achievements or a scoring mechanism of some sort

Right away someone offered us $1,000, but we wanted more -- at least $3K. That bid sat there for about a month. We were starting to lose hope when suddenly several major portals began competing for the game (I suspect Stefan had something to do with it). Bids rose and fell. We noticed that sponsor activity picked up toward the end of each week. When the bid hit $3,000, we nearly caved and accepted, but a certain bald someone suggested we hold out -- right at that moment, we'd received an offer from [jayisgames.com](http://jayisgames.com/) to write a [review](http://jayisgames.com/archives/2011/03/fun_da_vinci.php) of the game. We were thrilled -- besides the "street cred" from a well-known portal, it could trigger a new wave of bids. And it did... After another round of sponsor bidding wars, the price settled at $5,600. We strangled our inner cheapskate and accepted. That was another victory. From listing on FGL to accepting the bid: exactly 2 months.

As you've probably guessed, Armor Games won. Sponsors usually ask you to brand the game for their portal -- add an intro, integrate their API, and so on. All easy enough, but we ran into problems with the Armor Games API, which absolutely refused to connect. We made a blank project -- worked perfectly there. In the actual game project -- nope. By some miracle, Nikita figured out that if you initialized the API in the preloader, everything was fine. Weird, but whatever.

## Splitting the Money

So, you all want to know how much we made? Here's the breakdown:
FGL takes 10% for its services (half of which Stefan pays by agreement);
10% of 5,600 = 560 (FGL's cut);
560 / 2 = 280 (our share of FGL's fee);
30% of 5,600 = 1,680 (Stefan's cut);
Bottom line: 5,600 -- 280 -- 1,680 = 3,640.

Three and a half grand split four ways over four months -- not a bad result, for Nigerian guest workers. How to make a living from games alone? -- a question that puzzled us. But our enthusiasm only grew, and we're not giving up this hobby. We'll figure out the answer eventually -- maybe even in the comments to this post ;)

## Future Plans

We're already working on a second version with new items, levels, and features. We have ideas for interesting game mechanics and unexplored themes. On the technical side, we're looking toward the App Store and Android Market, with Unity3D to help us get there.

![The Fun Da Vinci development team: Division (Lead Programmer), Titanum (Programmer), Xsem (Art and Design), Requix (Sound)](./images/fdv-3.webp)
