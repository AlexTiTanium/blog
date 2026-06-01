---
title: "Начало разработки STDS"
date: "2016-02-20"
description: "Скоро весна, я заскучал. Родилась идея сделать сетевой топдаун шутер в браузере на JavaScript, в сеттинге космоса. Рабочее название проекта STDS (Space Top Down Shooter)."
tags:
  - gamedev
  - stds
language: ru
author: "Alex Kucherenko"
---

Скоро весна, я заскучал. Родилась идея сделать сетевой топдаун шутер в браузере на JavaScript, в сеттинге космоса. Рабочее название проекта STDS (Space Top Down Shooter).

## Основной стек

Чистый JavaScript ES5

JS модули в формате CommonJs (Как в NodeJs только на фронтенде)

[Webpack 1.x](https://webpack.github.io/), не уверен что 2.х уже норм, у них и первая ветка сырая ещё(IMHO). Посмотрим может мигрируем.

Рендером займется [PIXI JS](http://www.pixijs.com/)

В качестве движка взял [PHASER IO](http://phaser.io/)

Css будем генерить из [Less](http://lesscss.org/), нравиться мне он

Следить за развитием проекта можно на Github: [STDS](https://github.com/AlexTiTanium/Space-Top-Down-Shooter). Пока о сервере думать рано, скорее всего будет NodeJS.
