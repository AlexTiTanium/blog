---
title: "Mal lunes"
date: "2015-12-05"
description: "Son las 4 de la madrugada, el insomnio me ha pillado otra vez. Normalmente me pongo a trabajar. Para mí es una bendita hora de paz y silencio: ¿qué más hace falta para escribir código bonito y mantenible?"
tags:
  - life
language: es
author: "Alex Kucherenko"
---

Son las 4 de la madrugada, el insomnio me ha pillado otra vez. Normalmente me pongo a trabajar. Para mí es una bendita hora de paz y silencio: ¿qué más hace falta para escribir código bonito y mantenible?

Código bonito… hablemos de eso, ¿vale?

Hace poco estaba escuchando Radio-T (un popular pódcast tecnológico ruso) —no recuerdo qué episodio, uno de los recientes— donde comentaban un artículo sobre el outsourcing.

Otro cliente más decidió ahorrar y encargó el desarrollo de una app de iOS a la empresa más barata que pudo encontrar por internet. El resultado es obvio: un desastre absoluto. Y él va explicando punto por punto por qué, según su opinión, todo salió mal.

Por supuesto, nadie está dispuesto a reconocer la correlación entre precio y calidad. La cosa tiene que ser por otro motivo, ¿verdad? Uno quiere creer que por cinco dólares la hora puede conseguir lo mejor. Aunque conviene entender que un precio alto tampoco garantiza nada.

Se habló largo y tendido sobre el tema. La opinión breve de Umputun era que hay una diferencia de mentalidad: para los estadounidenses lo único que importa es el resultado, el proceso no es nada. Para los rusos lo que importa es el proceso, y el resultado es un efecto secundario. Para los indios una cosa es una porquería, la otra es una porquería: la vida es demasiado corta para comerse la cabeza.

Y ahí estoy yo pensando: pues sí, caramba, algo de razón hay en esto. ¿Merece la pena siquiera preocuparse por el proceso?

Al fin y al cabo, el cliente necesita resultados, ¿y qué hago yo? Me obsesiono con el proceso. Claro que me obsesiono con él para lograr el mejor resultado del que soy capaz, pero los resultados se podrían conseguir más rápido.

La tarea: escribir un autocompletado sencillo para un servicio. Mete todo de una vez en el maldito controlador que renderiza la lista de resultados y asunto resuelto.

Pero no, tengo que extraerlo a un controlador aparte, refactorizarlo… porque alguien vendrá a mantener esto, ¿y qué pensará de mí?

¿Y la parte del servidor? Un programador normal y eficiente le pasaría un regex a la base de datos y listo. Resultado conseguido.

Pero no, nosotros somos «especiales». Todo tiene que ser rápido, y el autocompletado tiene que ayudarte de verdad a escribir algo. En lugar de buscar con regex, ¿por qué no montamos un árbol de prefijos? Y de paso le añadimos pesos a las etiquetas para detectar las más populares y ponerlas arriba. Y cómo no, hacen falta pruebas y documentación.

Y así, sin más, ya estoy metido hasta el cuello en el proceso.

Esto no son resultados. El cliente no necesita nada de esto. No solo no lo necesita, sino que es perjudicial, tanto en lo económico como en los plazos. Y dentro de un año lo van a reescribir todo igualmente, si es que a alguien le importa todavía.

¿Quizá, inconscientemente, entiendo que me pagan por horas y que si lo hago en una hora en vez de diez voy a ganar menos? No, no es eso: hacía lo mismo antes, cuando trabajaba por un precio fijo.

Lo malo es que para mí esto es una decisión consciente. No quiero cambiar, adaptarme al mercado. (Seguramente por eso la última vez que busqué trabajo tardé unos tres meses.)

Que me maten, pero quiero escribir código como Dios manda. Y ese código lleva tiempo, y el tiempo es dinero. La conclusión: a decir verdad, deberían despedirme. En esta lucha desigual entre el proceso y los resultados, yo soy el engranaje roto.

¡Código bonito para todos, amigos!
