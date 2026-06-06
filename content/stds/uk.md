---
title: "Початок розробки STDS"
date: "2016-02-20"
description: "Скоро весна, і мене вже бере нудьга. Народилася ідея зробити мережевий топдаун-шутер у браузері на JavaScript у космічному сеттингу. Робоча назва проєкту STDS (Space Top Down Shooter)."
tags:
  - gamedev
  - stds
language: uk
author: "Alex Kucherenko"
---

Скоро весна, і мене вже бере нудьга. Народилася ідея зробити мережевий топдаун-шутер у браузері на JavaScript у космічному сеттингу. Робоча назва проєкту STDS (Space Top Down Shooter).

## Основний стек

Чистий JavaScript ES5

JS-модулі у форматі CommonJS (як у Node.js, тільки на фронтенді)

[Webpack 1.x](https://webpack.github.io/) -- не певен, що 2.x уже годиться; навіть перша гілка ще сируватá (IMHO). Подивимось, можливо, мігруємо.

Рендером займеться [PIXI JS](http://www.pixijs.com/)

Як рушій узяв [PHASER IO](http://phaser.io/)

CSS будемо генерувати з [Less](http://lesscss.org/) -- просто він мені до вподоби

Стежити за розвитком проєкту можна на GitHub: [STDS](https://github.com/AlexTiTanium/Space-Top-Down-Shooter). Про серверну частину думати ще зарано, але це найімовірніше буде Node.js.
