---
title: "Дубль три: как устроен блог, который вы читаете"
date: "2026-06-14"
description: "Третий, а то и четвёртый блог по счёту. До него были WordPress, который ломался сам, и Next.js, который мне так и не дался. Этот я наконец собрал на своём фреймворке — и вот как он работает изнутри."
tags:
  - moku
  - programming
  - typescript
language: ru
draft: false
---

Работа закончена. Будем считать это официальной точкой перезапуска блога, того самого, который вы сейчас читаете. Заняло всё это куда больше времени, чем мне хотелось бы. Зато доказало, что идея с Moku Core вообще работает: я собрал на нём Moku Web, а уже на Moku Web, вот это всё. С таким API и таким вниманием к мелочам, как я люблю.

Баги есть? Бесспорно. Но их уровень меня сейчас устраивает. Иногда надо просто остановиться и сказать себе: достаточно хорошо.

## Два блога, которые я закопал

Сначала был WordPress. Я ненавидел его от начала и до конца. Боты круглосуточно ломились его сломать. Хотя, честно, можно было и не стараться: он прекрасно ломался сам. База ложилась по причинам, которые я так и не выяснил. Думаю, не ложись она — давно стал бы хабом по раздаче вирусов: дыра на дыре, обновлять надо постоянно, иначе беда. И за всё это удовольствие — семь баксов в месяц. Короче, я счастлив, что его больше нет.

Потом была попытка на Next.js. Писал не я. Попросил брата с его девушкой. Им — учебный проект, мне — блог. Вышло так себе. Мне тупо не нравилось, как Next делает роутинг, и какой он сам огромный и неповоротливый. [Ссылка осталась](https://github.com/AlexTiTanium/geek-life), хоть с конца 2023-го там и тишина.

А ведь направление было ровно то, в которое я хотел: генерация статики, статьи в маркдауне, компоненты на React. MDX, если по-честному. Только реализовать это оказалось мучительно больно. Серверные компоненты — отдельная история: оно всё равно тащило React на клиент, а с ним ещё гору кода. Но именно тогда я впервые ясно увидел свою архитектуру. Ту самую идею идеального блога, которая в конце концов и стала вот этим.

## Сначала движок, потом блог

Про Moku Core я уже [писал отдельно](/ru/birth-of-moku-core/): месяц я сидел не над кодом, а над спецификацией ядра. Та статья закончилась на грустной ноте, мол, второго слоя ещё нет, и третьего нет, всё это пока чистая теория, и я очень надеюсь, что они появятся.

Появились. Moku Web — это второй слой, фреймворк. А блог — третий, само приложение. Трёхэтажная башня из той статьи теперь стоит целиком, и вы читаете её верхний этаж.

Весь блог — это один вызов `createApp`. Никаких глобалов, рассованных по углам: подключаешь плагины, отдаёшь им конфиг, и на этом всё.

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

Один файл — и видно, из чего блог собран.

## Где что лежит

Остальной проект такой же плоский. Никаких волшебных папок, никакой скрытой проводки: открываешь директорию, и она делает ровно то, что написано на двери:

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

Два файла тянут на себе всё: `app.ts`, который вы уже видели, и `routes.tsx`, который мне и дорог.

## Роутер — сердце всего

Если у блога и есть сердце, то это `routes.tsx`. Одна таблица, и читают её сразу трое: статическая сборка (какие страницы генерить), навигация в браузере (что отрисовать по клику) и построитель ссылок (каждый `href` на сайте). Описываешь страницу один раз, в одном месте — и все трое навсегда согласны.

Маршрут — это цепочка деклараций:

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

`.generate` говорит, какие страницы штамповать — по одной на статью и локаль. `.load` грузит данные. `.render` — это Preact-компонент. `.head` — сеошка. Вот и весь контракт.

А теперь фокус, из-за которого блог работает как SPA, хотя я не написал ни строчки этой машинерии. На сборке `.load` отрабатывает, и результат запекается в HTML *и* кладётся рядом, как `_data/<lang>/<slug>/index.json`. Кликаешь по ссылке — браузер не перезагружает страницу, а подтягивает этот маленький JSON и гоняет тот же самый `.render`. Один код, два момента: сборка у меня на машине, клик у тебя во вкладке.

А раз ссылки берутся из той же таблицы, протухнуть они не могут:

```typescript
// links come from the SAME table — a typed builder, so a link can't drift from a route:
urls.toUrl("article", { lang: "en", slug: "spark" }); // "/spark/"     — en is bare
urls.toUrl("article", { lang: "ru", slug: "spark" }); // "/ru/spark/"
```

URL руками я не пишу ни разу. Прошу его у таблицы. А если переименую маршрут, все ссылки переедут следом. Вот почему роутер сидит в центре, а всё остальное висит на нём.

## Статья — это просто папка

Чтобы написать пост, я не открываю никакую админку (привет, WordPress). Я создаю папку `content/<slug>/` и кладу в неё по файлу на каждый язык:

```text
content/how-this-blog-works/
  en.md
  uk.md
  ru.md
  es.md
  images/   # images, if you need them
```

Сверху у каждого файла — фронтматтер, обычный YAML:

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

`draft: false` — и пост уезжает в прод. Поставишь `true` — он виден только локально, пока пишется. Никакой кнопки «Опубликовать», никакой базы. Git — это и есть моя CMS.

## Чем я набиваю статьи

А теперь самое вкусное: то, ради чего всё затевалось. Вы любите технические детали? Я люблю.

**Подсветка кода.** Каждый блок кода в этом посте раскрашен [Shiki](https://shiki.style) на этапе сборки, а не в браузере. Тема тёплая, под цвет блога; реальные цвета токенов лежат прямо в инлайновых стилях.

**Диаграммы.** Кидаешь блок ` ```mermaid `, и на сборке он превращается в статичную SVG. Вот прямо под этим абзацем живой пример, та самая фича, о которой я говорю. Путь, который проходит текст, прежде чем стать сайтом:

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

Те же диаграммы я рисую в постах про [Moku Core](/ru/birth-of-moku-core/) и [Spark](/ru/spark/).

**Галереи.** `::gallery{src="./images/board/"}` — и папка с картинками превращается в галерею с лайтбоксом. Так я показывал коробки настолок в [лучших настольных играх](/ru/best-board-games/) и в [Descent](/ru/descent-journeys-in-the-dark/).

**Эмбеды.** `::embed{src="…" title="…"}` — это ленивый iframe: пока не кликнешь, не грузится ничего. В посте про [Screw Master](/ru/screw-master/) так можно прямо в статье поиграть в игру, которую я сделал.

Всё это — директивы: одна строчка в маркдауне на каждую.

## Четыре вида паранойи

Я не доверяю ни себе, ни тем более ИИ, который половину всего этого написал. Поэтому тестов несколько уровней:

- **Юнит-тесты** — на чистую логику: пагинация, форматирование дат, сборка ссылок. Быстрые, без браузера.
- **Интеграционные** — собирают настоящий контент, все статьи целиком, и проверяют, что ничего не отвалилось. Включая рендер тех самых мермейд-диаграмм.
- **E2E на [Playwright](https://playwright.dev)** — гоняют живой собранный сайт в трёх движках: Chromium, WebKit и Firefox. Потому что Safari у меня уже ломался отдельно, и я научен.
- **Визуальные бейзлайны** — золотые скриншоты главной, архива и статьи. Меняет код вёрстку — скриншот не сходится, и тест падает.

Тонкость: e2e гоняется не по живым статьям, а по замороженному набору фикстур. Поэтому я могу публиковать в `content/` что угодно: тесты от этого не краснеют. Новый пост не требует ни единой правки в тестах.

## Хостинг за ноль

Ну и про деньги. Помните семь баксов в месяц за WordPress? Здесь ноль.

Блог — это просто куча статических файлов. Я делаю `git push`, CI прогоняет линт и тесты, и, если всё зелёное, оно само едет на [Cloudflare Pages](https://pages.cloudflare.com). Статика на бесплатном тарифе — это буквально ноль в месяц. Никакого сервера, который надо патчить, и обновлять, и поднимать базу каждую неделю. Страница приезжает к читателю в виде готового HTML, а интерактивность — крошечными островами (небольшие JS-скрипты, которые вешаются на контент или просто работают на клиенте).

Из семи долларов в ноль. Не разбогател, конечно, но сэкономить приятно.

---

Вот такое начало. Или конец — это с какой стороны посмотреть. Блог, который я переписывал трижды (а может, и четырежды — я сбился со счёта), наконец стоит так, как я хотел с самого начала.

А у меня теперь новая игрушка и плюс одно хобби — [Spark](/ru/spark/), движок на Rust, про который я уже начал рассказывать. Так что история не заканчивается. Она просто переезжает в другой репозиторий.
