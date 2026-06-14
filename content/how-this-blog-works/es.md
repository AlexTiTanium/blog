---
title: "Toma tres: cómo funciona de verdad este blog"
date: "2026-06-14"
description: "Mi tercer blog. O el cuarto — perdí la cuenta. Antes vino un WordPress que se rompía solo y un Next.js que nunca me terminó de encajar. Este por fin lo monté sobre mi propio framework, y aquí va cómo funciona por dentro."
tags:
  - moku
  - programming
  - typescript
language: es
draft: false
---

El trabajo está hecho. Llamémoslo el relanzamiento oficial del blog — este mismo que estás leyendo. Me llevó muchísimo más tiempo del que me habría gustado. Pero demostró lo que necesitaba que demostrara: que Moku Core funciona de verdad. Monté Moku Web encima, y este blog encima de eso, con exactamente la API y el cuidado por los detalles que a mí me gustan.

¿Hay bugs? Sin ninguna duda. Pero estoy en paz con el nivel en el que están. A veces hay que parar y decirse: suficientemente bueno.

## Los dos blogs que enterré

Primero fue WordPress. Lo odié de principio a fin. Los bots le caían encima a todas horas intentando colarse — aunque, sinceramente, podían haberse ahorrado la molestia: se rompía estupendamente él solo. La base de datos se caía por razones que nunca llegué a averiguar. Y estoy bastante seguro de que, de no haberse caído tanto, habría acabado convertido en un repartidor de virus: agujero sobre agujero, actualizar sin parar o desastre asegurado. Y todo ese gozo me costaba siete pavos al mes. En corto: feliz de que ya no esté.

Después vino el intento con Next.js. Ese no lo escribí yo — se lo pedí a mi hermano y a su novia. Para ellos, un proyecto de clase; para mí, un blog. El resultado fue regular. Sencillamente no me gustaba cómo hace Next el routing, ni lo enorme y aparatoso que es todo el tinglado. [El repo sigue ahí](https://github.com/AlexTiTanium/geek-life), criando polvo desde finales de 2023.

Y eso que la dirección era exactamente la correcta: generación estática, artículos en Markdown, componentes en React. MDX, si nos ponemos finos. Solo que construirlo de verdad resultó un suplicio. Los componentes de servidor fueron una saga aparte; la cosa arrastraba React al cliente igualmente, y con él un montón de código. Pero fue justo entonces cuando vi por primera vez mi propia arquitectura con claridad. Esa idea del blog ideal que al final acabó siendo este.

## Primero el motor, luego el blog

Sobre Moku Core ya [escribí en su momento](/es/birth-of-moku-core/): un mes sentado no sobre el código, sino sobre la spec del núcleo. Aquel artículo terminaba con una nota triste — que la segunda capa todavía no existía, ni la tercera, que todo era pura teoría y yo esperando que aparecieran.

Aparecieron. Moku Web es la segunda capa, el framework. El blog es la tercera, la aplicación en sí. La torre de tres pisos de aquel artículo ya está entera, y estás leyendo su planta de arriba.

El blog entero es una sola llamada a `createApp`. Nada de globales escondidos por las esquinas: registras plugins, les pasas su config, y se acabó.

```typescript
// src/app.ts — the whole blog is one createApp() call.
const app = createApp({
  plugins: [contentPlugin, buildPlugin, deployPlugin, dataPlugin, cliPlugin],
  config: { mode: "hybrid", stage: "production" },
  pluginConfigs: {
    site: SITE,            // name, url, author — one source of truth
    i18n: i18nConfig,      // en · uk · ru · es
    content: {
      providers: [
        fileSystemContent({
          contentDir: "./content",
          shikiTheme: warmSyntaxTheme,                  // code blocks
          mermaid: { mermaidConfig: warmMermaidTheme }, // ```mermaid fences
          embed: { facade: EmbedFacade },               // ::embed{...}
          gallery: { component: Gallery }               // ::gallery{...}
        })
      ]
    },
    router: { routes },
    deploy: { target: "cloudflare-pages" }
  }
});
```

Un archivo, y ves de qué está hecho el blog.

## Dónde vive cada cosa

El resto del proyecto es igual de plano. Nada de carpetas mágicas ni cableado oculto: abres un directorio y hace exactamente lo que pone en la puerta:

```text
blog/
  src/
    app.ts        # Node-side composition — the createApp() from above
    spa.tsx       # browser entry — same routes, none of the Node plugins
    routes.tsx    # THE route table — one source of truth (next section)
    config.ts     # SITE identity: name, url, author
    i18n/         # en · uk · ru · es — UI strings + locale config
    pages/        # one Preact page per route (home, article, archive…)
    components/   # SSR'd UI: nav, gallery, the embed facade
    islands/      # the tiny client scripts, hydrated on demand
    lib/          # pure helpers: articles, head, urls, dates
    styles/       # CSS: tokens, fonts, article typography
    og/           # build-time OG-image cards (Satori)
  content/        # the articles — one folder per post (see above)
  public/         # served as-is: fonts, _headers, favicons
  scripts/        # one-liners: build / serve / preview / deploy
  tests/          # unit · integration · e2e (the paranoia, below)
```

Dos archivos cargan con todo el peso: `app.ts`, el que acabas de ver, y `routes.tsx` — que es la parte que de verdad me importa.

## El router es el corazón de todo

Si el blog tiene un corazón, es `routes.tsx`. Una sola tabla, y de ella leen tres cosas distintas: la compilación estática (qué páginas generar), la navegación dentro del navegador (qué renderizar al hacer clic) y el constructor de enlaces (cada `href` del sitio). Defines una página una vez, en un único sitio, y los tres quedan de acuerdo para siempre.

Una ruta es una pequeña cadena de declaraciones:

```typescript
// src/routes.tsx — define a page once; the build, the SPA, and every link obey it.
article: route("/{lang:?}/{slug}/")          // {lang:?}: bare "/slug/" for en, "/ru/slug/" for the rest
  .generate(async ctx =>                       // which static pages to emit at build time
    (await allArticles(ctx)).map(a => ({ lang: ctx.locale, slug: a.computed.slug }))
  )
  .load(async ctx => {                         // fetch the data — runs at build, persisted as JSON
    const article = await articleBySlug(ctx);
    const all = await allArticles(ctx);
    return { article, related: relatedArticles(all, article, 5) };
  })
  .render(ctx => <ArticlePage article={ctx.data.article} related={ctx.data.related} />)
  .head(ctx => articleHead(ctx, ctx.data.article))   // <title>, OG, canonical, hreflang
```

`.generate` dice qué páginas estampar — una por artículo y por idioma. `.load` trae los datos. `.render` es el componente Preact. `.head` es el SEO. Ese es todo el contrato.

Y aquí está el truco que lo convierte en una single-page app sin que yo escriba nada de esa fontanería. En la compilación se ejecuta `.load`, y su resultado se hornea en el HTML *y* se deja al lado, como `_data/<lang>/<slug>/index.json`. Haces clic en un enlace y el navegador no recarga: trae ese pequeño archivo JSON y ejecuta el mismo `.render`. Un solo trozo de código, dos momentos: la compilación en mi máquina, el clic en tu pestaña.

Y como los enlaces salen de la misma tabla, no pueden pudrirse:

```typescript
// links come from the SAME table — a typed builder, so a link can't drift from a route:
urls.toUrl("article", { lang: "en", slug: "spark" }); // "/spark/"     — en is bare
urls.toUrl("article", { lang: "ru", slug: "spark" }); // "/ru/spark/"
```

Nunca escribo una URL a mano. Se la pido a la tabla, y el día que renombre una ruta, todos los enlaces se mudan con ella. Por eso el router se sienta en el centro y todo lo demás cuelga de él.

## Un artículo es solo una carpeta

Para escribir un post no abro ningún panel de administración (hola, WordPress). Creo una carpeta `content/<slug>/` y meto dentro un archivo por idioma:

```text
content/how-this-blog-works/
  en.md
  uk.md
  ru.md
  es.md
  images/   # images, if you need them
```

Arriba del todo, cada archivo lleva su frontmatter — YAML pelado:

```yaml
---
title: "Take Three: How This Blog Actually Works"
date: "2026-06-14"
description: "One hook of a sentence — it doubles as the OG card and the archive teaser."
tags:
  - moku
  - programming
language: en
draft: false
---
```

`draft: false` y el post se va a producción. Ponlo en `true` y solo se ve en local, mientras lo estás escribiendo. Ningún botón de Publicar, ninguna base de datos. Git es mi CMS.

## Las piezas que de verdad quería

Esta es la parte por la que monté todo esto. ¿Te gustan los detalles técnicos? A mí sí.

**Resaltado de sintaxis.** Cada bloque de código de este post lo colorea [Shiki](https://shiki.style), en tiempo de build, no en el navegador. El tema es cálido, afinado al blog; los colores reales de los tokens viven en estilos inline.

**Diagramas.** Sueltas un bloque ` ```mermaid ` y el build lo convierte en un SVG estático. Justo debajo de este párrafo hay uno en vivo, la mismísima función que estoy describiendo. Es el camino que recorre el texto antes de convertirse en una web:

```mermaid
graph LR
  md["content/*.md<br>en · uk · ru · es"]
  build["@moku-labs/web<br>Shiki · Mermaid · ::embed · ::gallery"]
  out["dist/ · static HTML<br>+ tiny islands"]
  cf["Cloudflare Pages<br>$0 / month"]
  md -->|bun run build| build --> out -->|git push| cf

  classDef src fill:#231f1b,stroke:#f97316,color:#fdba74
  classDef mid fill:#231f1b,stroke:#f59e0b,color:#fde68a
  classDef ship fill:#231f1b,stroke:#84cc16,color:#d9f99d
  class md src
  class build,out mid
  class cf ship
```

Los mismos diagramas los dibujo en los posts sobre [Moku Core](/es/birth-of-moku-core/) y [Spark](/es/spark/).

**Galerías.** `::gallery{src="./images/board/"}` convierte una carpeta de imágenes en una galería con lightbox. Así enseñé las cajas de juegos de mesa en [los mejores juegos de mesa](/es/best-board-games/) y en [Descent](/es/descent-journeys-in-the-dark/).

**Embeds.** `::embed{src="…" title="…"}` es un iframe perezoso: hasta que no haces clic, no carga nada. En el post de [Screw Master](/es/screw-master/) puedes jugar al juego que hice dentro del propio artículo.

Todo esto son directivas — una sola línea de Markdown cada una.

## Cuatro clases de paranoia

No me fío de mí mismo, y mucho menos de la IA que escribió la mitad de esto. Así que hay varias capas de tests:

- **Tests unitarios** para la lógica pura: paginación, formateo de fechas, construcción de enlaces. Rápidos, sin navegador.
- **Tests de integración** que construyen el contenido real, cada artículo entero, y comprueban que no se cayó nada. Incluido el render de esos diagramas de mermaid.
- **E2E con [Playwright](https://playwright.dev)** que ejecutan el sitio en vivo, ya construido, en tres motores: Chromium, WebKit y Firefox. Porque Safari ya se me ha roto solo otras veces, y escarmenté.
- **Baselines visuales**: capturas doradas de la portada, el archivo y un artículo. Si el código mueve la maquetación, la captura no cuadra y el test falla.

Un detalle fino: el e2e corre contra un set congelado de fixtures, no contra los artículos en vivo. Así que puedo publicar lo que me dé la gana en `content/` y los tests ni se inmutan. Un post nuevo no necesita ni un solo cambio en los tests.

## Hosting por el precio de nada

Y ahora, el dinero. ¿Te acuerdas de los siete pavos al mes de WordPress? Aquí son cero.

El blog no es más que un montón de archivos estáticos. Hago `git push`, la CI pasa el lint y los tests, y si todo está en verde se va él solo a [Cloudflare Pages](https://pages.cloudflare.com). Los archivos estáticos en el plan gratis cuestan literalmente cero al mes. Ningún servidor que parchear, y actualizar, y levantar la base de datos cada semana. La página ya llega como HTML completo, y la interactividad se reduce a unas islitas (pequeños scripts JS que se enganchan al contenido o que simplemente se ejecutan en el cliente).

De siete dólares al mes a nada. No me hice rico, pero ahorrar sienta bien.

---

Así que este es el principio. O el final, según por dónde lo mires. El blog que reescribí tres veces (puede que cuatro — perdí la cuenta) por fin se sostiene sobre los cimientos que quería desde el primer día.

Y ahora tengo un juguete nuevo, más un hobby de propina: [Spark](/es/spark/), un motor de juegos en Rust sobre el que ya he empezado a escribir. Así que la historia no termina. Solo se muda a otro repositorio.
