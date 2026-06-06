---
title: "La historia de cómo creamos Fun Da Vinci"
date: "2011-05-04"
description: "Aquí empezó todo, y esto es lo que terminamos haciendo. Cambiamos muchas cosas, formamos un equipo sólido y aprendimos a vender un juego; te contamos todo."
tags:
  - gamedev
  - fun-da-vinci
language: es
author: "Alex Kucherenko"
---

[Aquí](https://geeklife.in.ua/2010/07/27/make-game-in-nine-days/) empezó todo, y [esto](http://armorgames.com/play/10964/fun-da-vinci) es lo que terminamos haciendo. Cambiamos muchas cosas, formamos un equipo sólido y aprendimos a vender un juego: te contamos todo, querido lector. ¿Te interesa? Bienvenido a bordo.

## Programación

Esta parte es sencilla: yo y Nikita Sidorenko (Division). Dicen que dos programadores para un sencillo juego en Flash son demasiados. Yo discrepo categóricamente. En la práctica, si programas un juego en solitario, tarde o temprano lo dejas tirado. Quizá sea solo cosa nuestra, pero créeme, lo intentamos: trabajar en pareja es a la vez más divertido y más productivo. Yo lo explico desde la conciencia: si uno está haciendo algo, al otro le da vergüenza estar mano sobre mano y empieza a arrimar el hombro.

![Cuatro iteraciones del estilo artístico del juego: prototipo de dibujos animados inicial, sprites de objetos, concepto neón y estilo final de los manuscritos de Leonardo](./images/fdv-1.webp)

## Diseño

Con él empieza todo, y en un juego de calidad ocupa el lugar central. Como ya sabéis, el arte de la versión anterior lo dibujé (léase: lo mangué) yo. Eso cuela para un concurso, pero para un producto serio hace falta arte como Dios manda y, sobre todo, original. Jersón es una ciudad pequeña —todos se conocen de vista— y buenos diseñadores se cuentan con los dedos de una mano, así que no tuvimos que buscar mucho para dar con [Semión Jramtsov, el «freelancer de la provincia»](https://www.youtube.com/watch?v=K7r9dbqYrHs).

_«Aunque los rompecabezas no me entusiasmaban demasiado, el entusiasmo de los chicos se me contagió. Primero propuse
varios estilos artísticos, entre ellos una estilización de los manuscritos de Leonardo.
Ese fue el que enamoró a todos. Claro, en diseño gráfico es un recurso bastante manido,
pero el atractivo de fusionar un entorno interactivo con aquel famoso estilo de bocetos del megadiseñador
del Renacimiento era demasiado fuerte. Releí su biografía, googleé todas sus obras para exprimir
todo el jugo posible para el juego; en resumen, me sumergí en la atmósfera adecuada lo más a fondo que pude. Por supuesto,
considero que el resultado es una ofensa a su imagen y a sus inventos, pero ¿quiénes somos
nosotros al lado del Maestro? Gracias a Dios no repinté el juego con colores vivos y «casuales»,
como nos sugirió en el game-lynch uno de los jueces; por eso seguro que arderíamos en el infierno.
Mi mayor logro en este proyecto fue meterme de lleno en el diseño de niveles y
combinar el sombrío autorretrato del artista con la sonrisa de la Gioconda :)» — Semión Jramtsov._

![Evolución del autorretrato de Da Vinci: boceto original, adaptación en escala de grises y versión final del juego con la sonrisa de la Mona Lisa](./images/fdv-2.jpg)

## Sonido y música

Queda el último apartado, pero en absoluto el menos importante: el diseño musical y sonoro del juego. No solo le da vida, sino que evita que el jugador se aburra, al menos hasta que empieza a fastidiarle. Resulta que Semión conocía a un compositor con muchísimo talento con el que ya llevaba un tiempo trabajando en pequeños proyectos en Flash —[Vladímir Marínichev](http://requix.promodj.ru/)—, lo cual vino de perlas.

_«Lo primero de todo, para sumergirme en la atmósfera del Renacimiento, volví a ver una película biográfica sobre Leonardo da Vinci y escuché obras de compositores de aquella época. Para el tema del menú me basé en una pieza de Claude Gervaise que transmitiera el ánimo de un Creador reflexivo y transportara al jugador al Renacimiento. Intenté que el arreglo y la instrumentación fueran fieles al estilo de aquel período.
Para el diseño de sonido de la jugabilidad, muchos sonidos se grabaron con objetos cotidianos. Decidimos dejar los niveles sin acompañamiento musical y, en su lugar, transmitir la atmósfera de un taller. Durante la partida se oye a Leonardo garabateando notas sin parar y tarareando algo entre dientes, absorto en uno más de sus experimentos.
Por desgracia, al intentar reducir el tamaño del juego, tuvimos que degradar la calidad de todos los sonidos y la música, lo que, claro, dificultó transmitir de forma realista todos los matices y detalles. Pero en general mucha gente quedó contenta con el resultado, y por supuesto fue muy gratificante recibir una nota alta de FGL» — Vladímir Marínichev_

Y así, con el equipo ya reunido, nos pusimos en marcha…

## El comienzo

El primer commit fue el 4 de agosto de 2010: ahí se puede marcar el inicio del desarrollo. Empezamos a corregir bugs poco a poco y, como todos teníamos un trabajo principal, todo avanzaba muy despacio. Montamos un gestor de tareas, creamos un montón de tareas, muchísimas discusiones... todas, en realidad, sobre nada. En su versión final, si tenías en cuenta todas las tareas, el juego tendría que haber parecido un mini Starcraft 2 con su propio BattleNet (que acababa de salir justo entonces, algo que distraía muchísimo). Precisamente en lo irreal de nuestros planes se escondía el primer error. No construyáis castillos enormes. Acabaréis abandonando la mayor parte cuando os deis cuenta de que vuestros planes habrían sorprendido hasta al mismísimo Napoleón. A nosotros nos pasó exactamente eso. Recuperamos la cordura cuando decidimos participar en FlashGamm KYIV 2010. Teníamos que mostrar algo y no teníamos nada, ni siquiera un prototipo que funcionara. Ahí fue cuando empezó el trabajo de verdad. Lo primero, eliminamos la mayoría de las tareas, minimizamos y optimizamos todo lo que se pudo. Y eso dio resultados.

![Captura del gestor de tareas: una lista de pendientes que incluye «Dejar de jugar a Starcraft 2» junto con entradas humorísticas](./images/fdv-4.webp)

## FlashGamm KYIV 2010

Para cuando empezó la conferencia, habíamos logrado apañar algo que recordaba a un prototipo y montar unos cuantos niveles deslucidos. Con eso, Semión y Nikita se fueron a Kiev. Competimos en la categoría «Indie» y, además, nos apuntamos al game-lynch (una sesión pública de crítica)... ay, madre, cómo nos pusieron de vuelta y media... Pero el game-lynch en sí fue utilísimo: nos señalaron los fallos de nuestro juego, nuestros errores, y nos aconsejaron hacia dónde tirar a continuación. Lo alentador fue que muchas de las carencias que mencionaron ya las habíamos previsto. En la votación del público al mejor juego del game-lynch, el nuestro sacó exactamente 0 puntos (modo zen), y después de eso ninguno esperaba que nos lleváramos absolutamente nada. Pero, de la nada, ¡ganamos la nominación a «Futuro éxito»! La alegría fue inmensa. Creo que este evento tuvo un efecto muy positivo en la moral del equipo: nos dimos cuenta de que el juego tenía algo y de que había que terminarlo costara lo que costara.

![El equipo de Fun Da Vinci recibiendo el premio «Futuro éxito» en la conferencia FlashGamm KYIV 2010](./images/fdv-5.webp)

## Recta final

Tras la conferencia, el desarrollo se asentó en un ritmo estable y todo funcionaba como un reloj. Pero había bugs molestos. El primero era que los objetos se colaban a través de otros objetos, un fantasma que nos perseguía desde Ball Factory (el primer prototipo). Lo resolvimos a lo bruto, por ensayo y error. Me puse a trastear con los ajustes de Box2D y descubrí una peculiaridad: cambiar `b2_aabbMultiplier` de 0,2 a 0,1 arreglaba por arte de magia el problema de que los objetos se colaran. El segundo bug se nos coló por donde menos lo esperábamos. En todas partes donde necesitábamos un botón usábamos `SimpleButton`, y ni se nos pasó por la cabeza que en versiones más nuevas de Flash Player los estados del botón empezarían a «quedarse pegados», y no había forma de arreglarlo por más apaños que probáramos. Tuvimos que montar nuestra propia solución. Discusión en [flasher.ru](http://www.flasher.ru/forum/showthread.php?t=148860).

## La venta del juego

En FlashGamm pasó otra cosa: conocimos a Stefan Keisch. No teníamos ni idea de cómo vender un juego. Por internet había algo de información sobre FGL (Flash Game License), pero todo era muy vago y, además, había que atraer patrocinadores. De eso se encarga precisamente Stefan, y no gratis, claro: un 30% del precio de venta del juego. Tras pensarlo y deliberar, aceptamos la oferta. Stefan también da recomendaciones sobre cómo hacer el juego más atractivo para los patrocinadores. Lo primero que señaló fue el nombre. Nuestro título de trabajo era «Balls Da Vinci»: con ese nombre competimos en FlashGamm. Por desgracia, el nombre despertaba demasiadas asociaciones indeseadas con la hombría de Leonardo (cosa que, todo hay que decirlo, nos hacía mucha gracia), así que lo rebautizamos como «Fun Da Vinci» (puede que solo sea un rompecabezas para nosotros; para el cerebro de Da Vinci es un juego de niños).

El anuncio se publicó en FGL el 14 de enero de 2011. FGL hace una reseña de cada juego que se publica.

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

Enseguida alguien nos ofreció 1000 $, pero queríamos más, al menos 3 mil. Esa puja se quedó ahí parada cerca de un mes. Estábamos empezando a perder la esperanza cuando, de repente, varios portales importantes empezaron a pelearse por el juego (sospecho que Stefan tuvo algo que ver). Las pujas subían y bajaban. Nos fijamos en que la actividad de los patrocinadores se animaba hacia el final de cada semana. Cuando la puja llegó a 3000 $, estuvimos a punto de ceder y aceptarla, pero cierto calvo sugirió que aguantáramos: justo en ese momento nos había llegado una oferta de [jayisgames.com](http://jayisgames.com/) para escribir una [reseña](http://jayisgames.com/archives/2011/03/fun_da_vinci.php) del juego. Nos hizo mucha ilusión, porque además del «prestigio» de un portal conocido, podía desencadenar una nueva oleada de pujas. Y así fue... Tras otra ronda de guerras de pujas entre patrocinadores, el precio se quedó en 5600 $. Estrangulamos a nuestro tacaño interior y aceptamos. Esa fue otra victoria. Desde la publicación en FGL hasta aceptar la puja: exactamente 2 meses.

Como seguramente ya habréis adivinado, ganó Armor Games. Los patrocinadores suelen pedir que adaptes el branding del juego a su portal: añadir un intro, integrar su API, etcétera. Todo bastante fácil, pero tuvimos problemas con la API de Armor Games, que se negaba en redondo a conectarse. Hicimos un proyecto en blanco: ahí funcionaba a la perfección. En el proyecto real del juego: nada. Por algún milagro, Nikita averiguó que si inicializabas la API en el preloader todo iba bien. Raro, pero qué le vamos a hacer.

## El reparto del dinero

Bueno, todos queréis saber cuánto ganamos, ¿verdad? Aquí va el desglose:
FGL se lleva un 10% por sus servicios (la mitad la paga Stefan, según lo acordado);
el 10% de 5600 = 560 (la parte de FGL);
560 / 2 = 280 (nuestra parte de la comisión de FGL);
el 30% de 5600 = 1680 (la parte de Stefan);
Resultado final: 5600 – 280 – 1680 = 3640.

Tres mil quinientos y pico repartidos entre cuatro a lo largo de cuatro meses: no está mal el resultado, para ser trabajadores inmigrantes nigerianos. ¿Cómo vivir solo de los juegos? Una pregunta que nos dejó perplejos. Pero nuestro entusiasmo no hizo más que crecer, y no vamos a dejar este hobby. La respuesta ya la resolveremos o la encontraremos algún día, quizá hasta en los comentarios de este post ;)

## Planes de futuro

Ya estamos trabajando en una segunda versión con nuevos objetos, niveles y funciones. Tenemos ideas para mecánicas de juego interesantes y temáticas aún por explorar. En el plano técnico, miramos hacia la App Store y Android Market, con Unity3D para ayudarnos a llegar.

![El equipo de desarrollo de Fun Da Vinci: Division (programador principal), Titanum (programador), Xsem (arte y diseño), Requix (sonido)](./images/fdv-3.webp)
