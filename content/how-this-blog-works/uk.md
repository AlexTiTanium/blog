---
title: "Дубль три: як насправді влаштований цей блог"
date: "2026-06-14"
description: "Третій блог. А може, і четвертий — я збився з ліку. До нього був WordPress, що ламався сам, і Next.js, який мені так і не дався. Цей я нарешті зібрав на власному фреймворку — і ось як він працює зсередини."
tags:
  - moku
  - programming
  - typescript
language: uk
draft: false
---

Роботу зроблено. Будемо вважати це офіційним перезапуском блогу, того самого, який ви зараз читаєте. Часу пішло куди більше, ніж мені хотілося б. Зате воно довело те, що мені й треба було довести: Moku Core справді працює. На ньому я зібрав Moku Web, а вже на Moku Web, ось це все, з рівно таким API і такою увагою до дрібниць, які я люблю.

Чи є баги? Беззаперечно. Але там, де вони зараз, мене все влаштовує. Іноді треба просто зупинитися й сказати собі: достатньо добре.

## Два блоги, які я закопав

Спершу був WordPress. Я ненавидів його від початку й до кінця. Боти цілодобово лізли його зламати. Хоча, чесно, могли б і не старатися: він чудово ламався сам. База лягала з причин, яких я так і не зʼясував. Якби вона не падала раз у раз, я майже певен, що блог давно став би хабом з роздачі вірусів: діра на дірі, оновлюй постійно, бо біда. І за все це щастя — сім баксів на місяць. Коротше, я радий, що його більше немає.

Потім була спроба на Next.js. Сам я її не писав. Попросив брата з його дівчиною. Їм — навчальний проєкт, мені — блог. Вийшло так собі. Мені банально не подобалося, як Next робить роутинг і який він сам величезний та неповороткий. [Репозиторій ще живий](https://github.com/AlexTiTanium/geek-life), хоч і припадає пилом з кінця 2023-го.

А напрямок же був рівно той, що треба: статична генерація, статті в маркдауні, компоненти на React. MDX, якщо вже зовсім чесно. Тільки реалізувати це було болісно. Серверні компоненти — окрема сага: воно все одно тягло React на клієнт, а з ним ще купу коду. Але саме тоді я вперше ясно побачив власну архітектуру. Ту саму ідею ідеального блогу, яка зрештою й стала ось цим.

## Спочатку рушій, потім блог

Про Moku Core я вже [писав окремо](/uk/birth-of-moku-core/): місяць я сидів не над кодом, а над специфікацією ядра. Та стаття закінчилася на сумній ноті, мовляв, другого шару ще немає, і третього немає, усе це поки чиста теорія, і я дуже сподіваюся, що вони зʼявляться.

Зʼявилися. Moku Web — це другий шар, фреймворк. А блог — третій, сам застосунок. Триповерхова вежа з тієї статті тепер стоїть повністю, і ви читаєте її верхній поверх.

Увесь блог — це один виклик `createApp`. Жодних глобалів, розпханих по кутках: підключаєш плагіни, віддаєш їм конфіг, і на цьому все.

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

Один файл — і видно, з чого блог зібраний.

## Де що лежить

Решта проєкту така ж пласка. Жодних чарівних папок, жодної прихованої проводки: відкриваєш директорію, і вона робить рівно те, що написано на дверях:

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

Два файли тримають на собі все: `app.ts`, який ви щойно бачили, і `routes.tsx`, а от він мені й дорогий.

## Роутер — серце всього

Якщо в блогу і є серце, то це `routes.tsx`. Одна таблиця, і читають її одразу троє: статична збірка (які сторінки генерувати), навігація в браузері (що відмалювати по кліку) і будівник посилань (кожен `href` на сайті). Описуєш сторінку один раз, в одному місці — і всі троє назавжди згодні між собою.

Маршрут — це невеличкий ланцюжок декларацій:

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

`.generate` каже, які сторінки створювати, по одній на статтю і локаль. `.load` вантажить дані. `.render` — це Preact-компонент. `.head` — сеошка. Ось і весь контракт.

А тепер фокус, через який блог працює як SPA, хоч я й рядка цієї машинерії не написав. На збірці `.load` відпрацьовує, і результат запікається в HTML *і* кладеться поряд, як `_data/<lang>/<slug>/index.json`. Клікаєш по посиланню — браузер не перезавантажує сторінку, а підвантажує цей маленький JSON і ганяє той самий `.render`. Один код, два моменти: збірка у мене на машині, клік у тебе у вкладці.

А раз посилання беруться з тієї ж таблиці, протухнути вони не можуть:

```typescript
// links come from the SAME table — a typed builder, so a link can't drift from a route:
urls.toUrl("article", { lang: "en", slug: "spark" }); // "/spark/"     — en is bare
urls.toUrl("article", { lang: "ru", slug: "spark" }); // "/ru/spark/"
```

URL руками я не пишу жодного разу. Прошу його в таблиці. А перейменую маршрут, і всі посилання переїдуть слідом. Ось чому роутер сидить у центрі, а все решта висить на ньому.

## Стаття — це просто папка

Щоб написати пост, я не відкриваю жодну адмінку (привіт, WordPress). Я створюю папку `content/<slug>/` і кладу в неї по файлу на кожну мову:

```text
content/how-this-blog-works/
  en.md
  uk.md
  ru.md
  es.md
  images/   # images, if you need them
```

Зверху в кожного файлу — фронтматтер, звичайний YAML:

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

`draft: false` — і пост їде в прод. Поставиш `true` — і його видно лише локально, поки він ще пишеться. Жодної кнопки «Опублікувати», жодної бази. Git — це і є моя CMS.

## Те, заради чого я це й затівав

А ось та частина, заради якої я взагалі це все робив. Ви любите технічні деталі? Я люблю.

**Підсвічування коду.** Кожен блок коду в цьому пості розфарбований [Shiki](https://shiki.style) на етапі збірки, а не в браузері. Тема тепла, під колір блогу; самі кольори токенів лежать прямо в інлайнових стилях.

**Діаграми.** Кидаєш блок ` ```mermaid `, і на збірці він перетворюється на статичний SVG. Ось прямо під цим абзацом живий приклад, та сама фіча, про яку я розповідаю. Шлях, який проходить текст, перш ніж стати сайтом:

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

Ті самі діаграми я малюю в постах про [Moku Core](/uk/birth-of-moku-core/) і [Spark](/uk/spark/).

**Галереї.** `::gallery{src="./images/board/"}` — і папка з картинками перетворюється на галерею з лайтбоксом. Так я показував коробки настолок у [найкращих настільних іграх](/uk/best-board-games/) і в [Descent](/uk/descent-journeys-in-the-dark/).

**Ембеди.** `::embed{src="…" title="…"}` — це лінивий iframe: поки не клікнеш, нічого не вантажиться. У пості про [Screw Master](/uk/screw-master/) так можна прямо в статті пограти в гру, яку я зробив.

Усе це — директиви: по одному рядку маркдауну на кожну.

## Чотири різновиди паранойї

Я не довіряю ні собі, ні тим більше ШІ, що половину всього цього написав. Тому тестів кілька шарів:

- **Юніт-тести** — на чисту логіку: пагінація, форматування дат, збірка посилань. Швидкі, без браузера.
- **Інтеграційні** — збирають справжній контент, усі статті цілком, і перевіряють, що нічого не відвалилося. Включно з рендером тих самих мермейд-діаграм.
- **E2E на [Playwright](https://playwright.dev)** — ганяють живий зібраний сайт у трьох рушіях: Chromium, WebKit і Firefox. Бо Safari в мене вже ламався окремо, і я навчений.
- **Візуальні бейзлайни** — золоті скриншоти головної, архіву та статті. Зсуне код верстку — скриншот не сходиться, і тест падає.

Тонкість: e2e ганяється не по живих статтях, а по замороженому наборі фікстур. Тому я можу публікувати в `content/` що завгодно: тести від цього й бровою не ведуть. Новий пост не вимагає жодної правки в тестах.

## Хостинг за нуль

Ну і про гроші. Памʼятаєте сім баксів на місяць за WordPress? Тут нуль.

Блог — це просто купа статичних файлів. Я роблю `git push`, CI запускає лінт і тести, і якщо все зелене — воно само їде на [Cloudflare Pages](https://pages.cloudflare.com). Статика на безкоштовному тарифі — це буквально нуль на місяць. Жодного сервера, який треба патчити, й оновлювати, й щотижня піднімати базу. Сторінка приїжджає до читача готовим HTML, а інтерактивність — крихітними острівцями (невеликі JS-скрипти, що чіпляються на контент або просто працюють на клієнті).

Із семи доларів у нуль. Не розбагатів, звісно, але заощадити приємно.

---

Ось такий початок. Або кінець — це з якого боку подивитися. Блог, який я переписував тричі (а може, і чотири рази — я збився з ліку), нарешті стоїть на тому фундаменті, який я хотів від самого початку.

А в мене тепер нова іграшка і плюс одне хобі — [Spark](/uk/spark/), рушій на Rust, про який я вже почав розповідати. Тож історія не закінчується. Вона просто переїжджає в інший репозиторій.
