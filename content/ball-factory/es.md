---
title: "Hacer un juego en nueve días, ¿es eso siquiera posible?!"
date: "2010-07-27"
description: "No soy precisamente un tipo aventurero, pero a veces pasa. Y hace diez días pasó. Un amigo me propuso entrar en una game jam de la IGDC. Aquí van mis impresiones."
tags:
  - gamedev
  - ball-factory
language: es
author: "Alex Kucherenko"
---

No soy precisamente un tipo aventurero, pero a veces pasa. Y hace diez días pasó. Exactamente hace diez días, mi amigo Nikita (que se hace llamar Division) me propuso entrar en una game jam de la IGDC.
Aquí van mis impresiones…

## El concurso

Para quien no lo sepa, la IGDC es una comunidad de gente a la que le gusta hacer juegos. Se anuncia un concurso, se fijan las reglas y a darle: cualquiera puede participar. El tema de este concurso en concreto era realmente interesante: Indirect Control. La idea es que el jugador no tiene control directo sobre el desarrollo del juego. Solo puedes influir en las cosas de forma indirecta.

Yo nunca había entrado en uno de estos concursos, a diferencia de Nikita, que incluso había quedado entre los primeros puestos. Decidimos escribir en ActionScript 3, que yo conocía solo muy por encima. ¿Por qué AS? Sencillamente porque Division tenía un motor hecho en AS que usaba el conocidísimo patrón Decorator; lo usaba tanto, de hecho, que el propio motor se llamaba Decorator.

Al oír «indirect» me vino a la cabeza el famoso juego de puzles «The Incredible Machine». Se me ocurrió la idea de hacer algo parecido pero cambiando el objetivo. En The Incredible Machine, la meta es poner en marcha un mecanismo. En nuestro juego, había que hacer rodar todas las bolas hasta una tubería concreta usando toda clase de cajas, tablones y, cómo no, física. Por suerte, el motor Decorator soportaba Box2D, aunque viendo los tamaños relativos del motor y de Box2D, es difícil saber quién soporta a quién. En fin, física resuelta.

El diseño, mmm… ni yo ni mucho menos Division sabíamos dibujar en absoluto. Decidimos ofrecerle el honroso puesto de diseñador a un conocido mío. Dibujó un par de escenas, pero luego le surgió algo y tuvimos que dibujarlo todo nosotros mismos; y por «nosotros mismos» me refiero a mí.

![Menú principal de Ball Factory con varias pelotas deportivas y opciones: Empezar juego, Editor, Sobre nosotros](./images/bf-1.webp)

![Jugabilidad de Ball Factory en el nivel 2: cajas de madera, tablones y tuberías en una colorida ladera](./images/bf-2.webp)

## Desarrollo

Una regla clave del concurso: tienes que hacer el juego en 9 días. Así que el trabajo arrancó a un ritmo animado. Yo iba ideando el concepto, esbozando cómo debía verse todo, mientras Division preparaba el motor. Usamos Dropbox para compartir archivos; una vez más me convencí de que esa aplicación es indispensable.

La preparación del motor llevó unos tres días y recayó de lleno sobre los hombros de Division. Pero para trabajar en equipo necesitábamos un control de versiones. La elección estaba entre Git y SVN. Elegimos SVN, de lo que más tarde nos arrepentiríamos.

Cogimos el ritmo bastante rápido. El desarrollo transcurría de noche. Como mi experiencia con AS dejaba mucho que desear, Division me explicaba por Skype qué estaba haciendo mal. La verdad es que Skype nos ayudó muchísimo en este proyecto: primero, hacía las cosas más divertidas y, segundo, podíamos coordinar rápidamente nuestras tareas y acciones.

Recuerdo con cariño aquellas noches en vela. Fue realmente emocionante aprender algo nuevo (AS) sobre la marcha. Antes pensaba que había que leerse un libro tocho antes de poder empezar a escribir en un lenguaje nuevo; qué equivocado estaba. En aquellos 4 días de programación aprendí más de lo que aprendería en un mes leyendo un libro sesudo. Claro, me faltaban conocimientos teóricos, pero eso se arreglaba rápido a base de palos y de aprender por las malas…

![Jugabilidad de Ball Factory en el nivel 4: rampas triangulares, tuberías y contador de bolas atrapadas y totales](./images/bf-3.webp)

![Editor de niveles de Ball Factory mostrando los datos XML del nivel con definiciones de entidades y coordenadas](./images/bf-4.webp)

## El desastre de SVN

Durante unos cuatro días todo fue sobre ruedas, pero entonces llegó el sábado: el punto de inflexión. Cargamos SVN. Os cuento con detalle cómo ocurrió… Yo subí un nuevo commit, Division tenía que actualizar su repo, pero hubo un conflicto que había que resolver a mano. Por inexperiencia, Division le dio a lo que no era o pulsó el botón equivocado, y cargó un archivo. Todos sus cambios en ese archivo se perdieron. Y, cómo no, las tonterías nunca vienen solas… En una jugada más tonta que inexperta, le aconsejé que volviera a la revisión anterior, dando por hecho que había hecho un commit antes de eso. Naturalmente, la revisión anterior borró el trabajo de un día entero… Estábamos furiosos. Había que entregar al día siguiente y aún no habíamos montado los niveles; y, como por ley de Murphy, se borró la parte más compleja y enrevesada…

No había nada que hacer: a Division le tocó restaurarlo todo. La moral quedó tocada, pero la recompensa mereció la pena: acabamos con un editor de niveles estupendo y un juego bastante mono (de nada, ese diseño fue cosa mía)…

## La descalificación y la redención

Ley de Murphy, segundo acto… Según las reglas del concurso, podías llegar un día tarde con una penalización del 30 %, pero tenías que avisar al organizador. Por supuesto que no íbamos a llegar, y lo sabíamos de antemano. En el hilo correspondiente del foro de la IGDC, Nikita había estado expresando dudas y conjeturas de que no terminaríamos a tiempo. Todavía no estábamos seguros, así que avisamos de forma más explícita en cuanto nos dimos cuenta de que nuestros mensajes anteriores no se habían tomado como un aviso oficial de retraso. El organizador dijo «¿por qué tan tarde?», pero nada más. Estuvimos dibujando niveles hasta cerca de las 3 de la madrugada (con el trabajo en 4 horas). Habríamos querido entregar antes, pero, como siempre, las cosas nunca salen como uno quiere. Al darnos cuenta de que nos enfrentábamos al 30 % de penalización completo, nos fuimos a dormir. Durante el día, en los ratos libres entre mi trabajo, seguí retocando niveles, arreglando fallos, preparando el juego para el lanzamiento. Y entonces, como caído del cielo… nos descalifican. Por llegar tarde. La verdad es que me quedé en shock. Tanto esfuerzo y tanta alma volcados, fue de verdad un disgusto. Pero qué le vas a hacer: empaquetamos el archivo y lo enviamos…

Arrastrándome hacia casa, compré un montón de comida basura —patatas y galletas— para al menos consolarme de algún modo. Llegué a casa y caí redondo sin llegar siquiera a las galletas ni a las patatas. Sobre las 10 de la noche, mi mujer me despierta con una gran noticia: ¡el administrador revocó la descalificación! La alegría no tenía palabras. ¡Gracias en especial al administrador! El mundo volvía a estar en su sitio… Seguimos en la pelea… Seguimos compitiendo… Y esperamos las puntuaciones…

## Lecciones aprendidas

Lecciones que me llevé:
-- Aprende haciendo.
-- Hacer juegos es divertido.
-- A la mierda SVN. En el próximo proyecto, usamos Git.

![Jugabilidad de Ball Factory en el nivel 3: bolas rebotando por una trayectoria circular con tuberías y rampas](./images/bf-5.webp)

![Pantalla de selección de niveles de Ball Factory con 16 niveles numerados en una cuadrícula verde](./images/bf-6.webp)
