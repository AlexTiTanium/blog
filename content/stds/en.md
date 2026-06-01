---
title: "Starting Development of STDS"
date: "2016-02-20"
description: "Spring is coming and I'm getting restless. An idea was born: build a multiplayer top-down shooter in the browser with JavaScript, set in space. Working title: STDS (Space Top Down Shooter)."
tags:
  - gamedev
  - stds
language: en
author: "Alex Kucherenko"
---

Spring is coming and I'm getting restless. An idea was born: build a multiplayer top-down shooter in the browser with JavaScript, set in space. Working title: STDS (Space Top Down Shooter).

## Main stack

Plain JavaScript ES5

JS modules in CommonJS format (like Node.js, but on the frontend)

[Webpack 1.x](https://webpack.github.io/) -- not sure 2.x is solid yet; even the first branch is still rough (IMHO). We'll see, maybe we'll migrate.

Rendering by [PIXI JS](http://www.pixijs.com/)

Using [PHASER IO](http://phaser.io/) as the game engine

CSS generated from [Less](http://lesscss.org/) -- I just like it

You can follow the project's progress on GitHub: [STDS](https://github.com/AlexTiTanium/Space-Top-Down-Shooter). Too early to think about the server side, but it'll most likely be Node.js.
