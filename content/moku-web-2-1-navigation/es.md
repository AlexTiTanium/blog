---
title: "Deja de pelearte con tu propio framework"
date: "2026-06-24"
description: "Monté una app de verdad sobre @moku-labs/web y se fue llenando de pequeños apaños — un click sintetizado sobre un ancla aquí, un congelado de scroll con position:fixed allá, una niñera de WebSocket de 270 líneas. Cada uno de ellos era la app tapando un agujero del framework. Así que dejé de parchear la app y arreglé el framework. moku-web 2.1 son cinco capacidades aditivas, y borra esos apaños de la demo."
tags:
  - moku
  - typescript
  - programming
language: es
author: "Alex Kucherenko"
draft: false
---

Hay una señal inequívoca de que un framework te está mintiendo: tu app se llena de workarounds, y cada workaround lleva un comentario largo y disculpándose que explica por qué tiene que existir. No un "esto es ingenioso", sino un "esto está aquí porque lo de abajo no me deja hacer lo obvio".

Me topé con ese muro montando **Atlas** — el rediseño de la demo Tracker, un tablero kanban en tiempo real sobre `@moku-labs/web`. Funciona. Es bonito. Y el código había ido criando, en silencio, un pequeño museo de disculpas:

- Un helper `navigate()` que **creaba un elemento `<a>` suelto, le hacía click y lo quitaba** — porque una navegación programática no tenía otra forma de hacer que la SPA cambiara de verdad.
- Un módulo entero, `board-scroll.ts`, que clavaba el `<body>` con `position: fixed; top: -scrollY` para que el tablero no pegara un salto al inicio cuando abrías una issue encima.
- Un panel de issue que guardaba sus contenidos *rancios* en memoria y conmutaba un atributo `hidden`, porque devolver un render vacío corrompía el árbol de Preact y el panel ya no volvía a abrirse. El comentario decía, literalmente, *"solo la primera issue llega a abrirse"*.
- Un `realtime.ts` de 270 líneas implementando a mano la reconexión de WebSocket, el keepalive y un buffer de pre-carga.

Cuatro apaños. Cuatro agujeros. La jugada honesta no es escribir el quinto workaround — es bajar una capa y hacer posible lo obvio. Así que publiqué **moku-web 2.1**: cinco capacidades aditivas, ningún cambio rompedor, todos los valores por defecto intactos. Aquí va qué es cada una, y el apaño que jubila.

## 1. Las islas ahora pueden navegar

`app.spa.navigate()` existía, pero una isla no podía alcanzarlo — las islas no reciben un handle de `app`. Así que Atlas sintetizaba un click sobre un ancla desechable, "el único camino que ambos interceptores respetan". Funcionaba como funciona la cinta americana.

Ahora `navigate` es un miembro siempre presente del contexto de la isla, justo al lado de `set`, `cleanup` y `url`:

```ts
events: {
  "click [data-close]": (ctx) => ctx.navigate(ctx.url("board", { id: ctx.params.id })),
}
```

Sin `app`, sin ancla, sin basura en el DOM.

## 2. El aspecto es una propiedad de la pantalla

Atlas quería que tablero↔tablero se sintiera como una cosa y que abrir una issue se sintiera como otra. El framework le daba un único booleano global: view transitions sí, o no. Un solo crossfade para todo.

Las transiciones ahora se declaran en la ruta — una directiva tipada, **no** una bolsa de `.meta()` informe (el framework la interpreta, así que se gana un método de verdad con autocompletado de verdad):

```ts
route("/board/{id}").transition("slide")
route("/board/{id}/issue/{issueId}").transition("morph")
```

El kernel etiqueta cada transición para que tu CSS la pueda estilar (`:root[data-view-transition~="slide"]`, o el estándar emergente `:active-view-transition-type()`), y un `view-transition-name` compartido a través del swap morfeará un elemento en otro. `spa.viewTransitions` pasa a ser el valor por defecto de toda la app; la ruta lo sobrescribe.

## 3. El scroll es una directiva, no un apaño

`board-scroll.ts` — el congelado con `position: fixed` — existía por exactamente una razón: la SPA siempre hacía scroll al inicio al navegar, y una ruta-overlay necesita que la página *se quede quieta*. El archivo entero era la app neutralizando al framework.

El kernel ya tenía internamente un opt-out de scroll por navegación. Solo que no era alcanzable. Ahora lo es:

```ts
route("/board/{id}/issue/{issueId}").scroll("preserve")   // open the overlay; don't move the board
```

Más un valor por defecto de toda la app `spa.scrollRestoration` y uno por llamada `ctx.navigate(path, { scroll: "preserve" })`. Atlas borró `board-scroll.ts` y todo su baile de lock/unlock por completo. Una palabra de metadatos de ruta reemplazó a un archivo.

## 4. Un "no renderices nada" que de verdad funciona

Esto era un bug disfrazado de workaround. Una isla persistente que devolvía una cadena vacía ejecutaba `host.innerHTML = ""`, lo que borra el DOM por debajo del árbol virtual retenido de Preact — así que el render *siguiente* no tenía nada contra lo que hacer diff y, en silencio, no hacía nada. De ahí lo de "solo la primera issue llega a abrirse", y de ahí que la app mantuviera estado rancio para siempre con tal de no renderizar nunca vacío.

Un render ahora puede devolver `null` — no renderizar nada, pero seguir siendo montable. Pasa por el propio `render(null, host)` de Preact, un desmontaje limpio que vuelve a comprometerse más tarde:

```ts
render: (s) => (s.open ? h(IssuePanel, { issue: s.issue }) : null),
```

El panel de issue borró toda su contabilidad de mantener-estado-rancio y simplemente... se cierra.

## 5. Un WebSocket que se cuida solo

Toda app en tiempo real reescribe el mismo gestor de socket: reconexión con backoff, un ping de keepalive, un buffer para los frames que llegan antes de que cargue tu snapshot, fan-out a los handlers. `createChannel` es eso, una sola vez, en el framework:

```ts
const board = createChannel<BoardPatch>({
  url: (id) => `${location.origin.replace(/^http/, "ws")}/ws/board/${id}`,
  keepAlive: { send: "ping", ignore: "pong" },
  bufferUntilSeed: true,
});
const off = board.subscribe(boardId, (patch) => applyPatch(ctx, patch));
```

`subscribe` lleva conteo de referencias — el primero en entrar conecta, el último en salir desconecta — así que dos islas compartiendo un tablero dejan de depender del orden de montaje. El `realtime.ts` de Atlas pasó de 270 líneas de fontanería a un adaptador delgado. Es solo de navegador y se elimina por tree-shaking si nunca abres un canal.

## La parte donde los tests mintieron

Aquí va el trozo que dejo a propósito, porque es la lección de verdad. Las cinco features tenían tests unitarios. 950 de ellos, en verde. Publiqué la 2.1.0.

Luego hice lo que los tests no pueden hacer: abrí la app de verdad en un navegador de verdad e hice click en una tarjeta. El panel se abrió. El scroll se quedó quieto. Y la barra de direcciones seguía diciendo `/`.

`app.spa.navigate` cambiaba el contenido y actualizaba su idea interna de la URL — pero nunca llamaba a `history.pushState`. Un click en un enlace pasa por la maquinaria de navegación del navegador, que compromete la URL por ti; una llamada *programática* se salta todo eso. Así que la página cambiaba mientras la barra de direcciones, el botón de atrás, el refresco y cualquier deep link se quedaban en la URL vieja. Mi nuevo `ctx.navigate` heredó el agujero. Los tests corrían en un DOM que no tiene un `history` de verdad, así que estaban perfecta y confiadamente en verde.

Eso es la `2.1.1`: el kernel compromete la URL él mismo antes de hacer el swap. Cazado por el precio de un click en una tarjeta. Los tests en verde no son una app que funciona — nunca lo fueron.

## De qué va esto en realidad

Ninguna de estas cinco cosas es grande. Ese es justo el punto. Un framework se gana la confianza en los momentos pequeños — cuando lo obvio es también lo que está disponible, y tu app deja de necesitar un museo de disculpas. Cada capacidad de aquí salió directamente de la lista de apaños de una demo real, y publicarla borró el apaño. Esa es la única petición de feature en la que confío: *el workaround que mi propia app tuvo que escribir.*

`@moku-labs/web@2.1.1` está en npm. La demo Atlas está migrada. Cuatro apaños más ligera.
