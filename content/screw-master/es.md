---
title: "Ocho días desenroscando un juego de una IA"
date: "2026-01-07"
description: "En la empresa anunciaron una semana de IA. Mi mujer, justo en ese momento, desenroscaba tornillitos en el móvil. Sumé dos y dos y me di exactamente ocho días: todo el código y todo el arte por IA, y yo solo dirigiendo la orquesta."
tags:
  - gamedev
  - ai
  - programming
language: es
draft: false
---

En mi empresa anunciaron una semana de IA: cada desarrollador podía probar la IA para lo que quisiera. Suscripciones, todas las herramientas que pidiéramos; dentro de lo razonable, claro. Y mi mujer, justo en ese momento, jugaba a un juego donde desenroscas tornillitos. No sé cómo se llama el género. Una especie de puzle: desenroscas tornillos en el orden correcto, los repartes en bandejas de colores y, en resumen, ganas desenroscando tornillos.

Estudié la mecánica y me puse una tarea. Tenía exactamente ocho días, ni uno más ni uno menos. Había que hacer el juego con IA lo más rápido posible y con la mejor calidad posible. Todo el código, todos los gráficos, el concept art, todo: IA. Yo solo dirigía la orquesta: montaba el gameplay y decidía qué se hacía y cómo. Así nació Screw Master, mi primer intento de hacer un juego sin hacerlo con mis propias manos.

## Que no soy un animal para andar pulsando botones

Empecé por el código: ODIE (uno de nuestros motores internos, un ECS clásico), con PixiJS 8 para el render. Lo primero fue apretar todas las validaciones de TypeScript hasta donde dieran de sí, y lo decidí de entrada: las pruebas serían automáticas y el juego se haría desde el primer día pensado para autocomprobarse. Que no soy un animal — eso de pulsar botoncitos a mano.

La idea era esta: Playwright juega al juego. Recibe todo el andamiaje y la instrumentación para hacerlo: acceso al input, al grafo de render, al ECS. Cada feature se demuestra con un vídeo: la IA construye algo, abre un PR, adjunta una grabación; yo la miro, decido si me gusta lo que veo y doy feedback. Nada de «confía en mí, que funciona». Ahí tienes el vídeo y lo compruebas tú.

Y esto es, de hecho, lo que salió. Puedes desenroscar un par de tornillos sin moverte del artículo:

::embed{src="https://screw-master.kucherenko-email.workers.dev/" title="Screw Master"}

## Figma, MCP y la batalla por la cordura

Toda la interfaz pasó por Figma. Yo montaba las escenas tal y como debían verse; luego el Figma MCP le daba al modelo acceso a los datos y a los recursos, y a partir de eso se construía la UI.

Un problema aparte fue enseñar a ese MCP y al modelo a llevarse bien y no construir disparates. Tuve que meterme muy a fondo en Figma: estructurar cada componente con una lógica implacable, para que del otro lado saliera algo cuerdo en vez de un galimatías. Pasé una eternidad eligiendo componentes para que todos quedaran más o menos en un mismo estilo. Generar modelitos idénticos pero de otro color: el mismo sufrimiento.

## Los bugs son lo que mejor genera la IA

Y ahora, el mayor problema de todos.

> Los bugs son lo que mejor genera la IA. Y qué bugs — de verdad, te quedas mirándolos maravillado.

El verdadero reto era incluso *explicar* cuál era el bug. Sobre todo cuando la IA tenía que hacer algo concreto: digamos, varias animaciones tienen que soltar los tornillos en sus huecos *a la vez*. Con eso perdía la cabeza directamente. No, no se puede hacer bonito, con una cola o una pila: hay que montar exactamente esa mierda enrevesada y nada más: cancelando promesas, pausándolas. Vamos, la manera más directa de fabricarte un montón de problemas. Cientos de prompts. Dolor en estado puro.

## Entonces, ¿se pueden hacer juegos así?

Diría que el experimento acabó en positivo: lo llevé hasta el final. Lo que saqué en claro: hacer un prototipo con IA está perfectamente bien. Hacer un producto… eso, sinceramente, no lo sé. Habría que ser muy chulo. Muy, *muy* chulo.

Generar imágenes tampoco fue para tirar cohetes: pedías tornillos rojos y te llegaban setas. ¿Por qué? Ni idea. Quizá la forma, quizá el color. Pero, como todo en esta vida, con suficiente trabajo, nervios y palabrotas acabas sacando algo más o menos no del todo horrible.

¿Es más rápido hacerlo a mano? Con el código, al revés: a mano sale más rápido. Pero solo si no cuentas los tests, que aquí son más que el propio código — así que hay matices. En el arte, yo jamás habría dibujado eso, pero cualquier artista lo habría hecho mejor. Así que saca tus propias conclusiones. Seguramente el listón irá subiendo y proyectos así llegarán a ser posibles de verdad. Hoy por hoy, lo máximo que aguanta la IA es un MVP o un prototipo. De ahí en adelante, pura lotería.

Pero aprendí un montón: Figma, cómo hacer tests e2e — y cómo no hacerlos. Así que doy la experiencia por ganada. Me encantaría tener más tiempo para estas cosas, pero qué le vamos a hacer: el día tiene 24 horas, hay que comer y al niño hay que llevarlo al colegio. Ya me divertí. Con eso basta.
