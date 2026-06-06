---
title: "Empezando el desarrollo de STDS"
date: "2016-02-20"
description: "La primavera se acerca y me está entrando la inquietud. Nació una idea: crear un shooter multijugador con vista cenital en el navegador con JavaScript, ambientado en el espacio. Título provisional: STDS (Space Top Down Shooter)."
tags:
  - gamedev
  - stds
language: es
author: "Alex Kucherenko"
---

La primavera se acerca y me está entrando la inquietud. Nació una idea: crear un shooter multijugador con vista cenital en el navegador con JavaScript, ambientado en el espacio. Título provisional: STDS (Space Top Down Shooter).

## Stack principal

JavaScript ES5 puro

Módulos JS en formato CommonJS (como en Node.js, pero en el frontend)

[Webpack 1.x](https://webpack.github.io/) -- no estoy seguro de que la 2.x esté madura todavía; incluso la primera rama aún está verde (IMHO). Ya veremos, quizá migremos.

Del renderizado se encarga [PIXI JS](http://www.pixijs.com/)

Como motor del juego elegí [PHASER IO](http://phaser.io/)

El CSS lo generaremos a partir de [Less](http://lesscss.org/) -- simplemente me gusta

Puedes seguir el avance del proyecto en GitHub: [STDS](https://github.com/AlexTiTanium/Space-Top-Down-Shooter). Todavía es pronto para pensar en el lado del servidor, pero lo más probable es que sea Node.js.
