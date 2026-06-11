/**
 * @file Localized About-page content — the profile prose (role, location, bio paragraphs, stack,
 * experience timeline, git-log fun facts, section headings) in every supported locale. Pure data,
 * browser-safe. UI chrome around it (breadcrumb, badges, interest tags, footer comment) stays
 * English by design and lives in `AboutView`.
 */

import type { Locale } from "./index";

/** One definition-list row on the About page (term → detail). */
export interface AboutRow {
  /** Left column label (localized). */
  term: string;
  /** Right column value. */
  detail: string;
}

/** One experience timeline entry on the About page. */
export interface AboutExperienceEntry {
  /** Period shown in the monospace time column. */
  time: string;
  /** One-line summary of the role. */
  text: string;
}

/** Localized About-page strings for a single locale. */
export interface AboutStrings {
  /** Role line shown under the name. */
  role: string;
  /** Location shown under the name. */
  location: string;
  /** `## About` section heading. */
  aboutHeading: string;
  /** Bio paragraphs, in order. */
  aboutParagraphs: readonly string[];
  /** `## Tech Stack` section heading. */
  stackHeading: string;
  /** Tech-stack rows (term → detail). */
  stack: readonly AboutRow[];
  /** `## Experience` section heading. */
  experienceHeading: string;
  /** Experience timeline entries, newest first. */
  experience: readonly AboutExperienceEntry[];
  /** Fun-fact rows under the `## git log` heading. */
  gitLog: readonly AboutRow[];
  /** `## Interests` section heading. */
  interestsHeading: string;
  /** `## Contact` section heading. */
  contactHeading: string;
}

/** English About-page content. */
const en: AboutStrings = {
  role: "Senior Game Engineer",
  location: "Santa Pola, Alicante, Spain",
  aboutHeading: "About",
  aboutParagraphs: [
    'Senior Game Engineer at Playco. Writing software since 2007 — back when "deploy" meant FTP. Along the way there were games, web apps, backends and mobile — but the last decade has been mostly games: live-ops platforms, monetization, inventory systems, and the plumbing behind titles people actually play.',
    "Started with PHP, survived Flash (rest in peace, you beautiful disaster), detoured through Android, iOS, Ruby and high-load backends, and went full-time gamedev in 2016.",
    'These days it\'s TypeScript by day and Rust by night — a power-grid city simulator running on my own 2D engine, built "for fun", because apparently my idea of rest is writing another game engine.',
    "These days home is Santa Pola, a small seaside town in Alicante, Spain. The code is the same — the view got a serious upgrade. Off duty: board games, electric guitar, and family."
  ],
  stackHeading: "Tech Stack",
  stack: [
    {
      term: "Languages",
      detail: "TypeScript, JavaScript, Rust (+ a long tail of PHP, Ruby, Python, C#, AS3)"
    },
    { term: "Game dev", detail: "PixiJS, WebGL, Phaser, Unity3D, live-ops & monetization" },
    { term: "Frontend", detail: "React, Preact, Three.js" },
    { term: "Backend", detail: "Node.js, PostgreSQL, MongoDB, Redis, RabbitMQ" },
    { term: "Infra", detail: "AWS, Docker, Linux, CI/CD" }
  ],
  experienceHeading: "Experience",
  experience: [
    {
      time: "2020–now",
      text: "Playco — Senior Game Engineer: live-ops, payments, inventory, analytics — the plumbing that keeps games alive"
    },
    {
      time: "2016–2020",
      text: "Game Closure — Game Developer: mobile games and platform features at startup speed"
    },
    {
      time: "2015–2016",
      text: "ELITEX — Senior Developer: Node.js backends, Angular, and the DevOps hat"
    },
    {
      time: "2014–2015",
      text: "Teempla — Senior Developer: distributed systems in four languages at once"
    },
    {
      time: "2013–2014",
      text: "DataArt — Senior Developer: high-load web, 3D WebGL, Ruby on Rails"
    },
    {
      time: "2009–2013",
      text: 'YourWebStyle — Developer: Android, iOS, PHP, servers — the "we do everything" era'
    },
    { time: "2007–2009", text: "Astra — Developer: PHP, where it all began" }
  ],
  gitLog: [
    { term: "On GitHub since", detail: "May 2012 · 31 public repos" },
    {
      term: "Language drift",
      detail: "PHP → AS3 → Ruby, Python → C#, Java → Objective-C → JS → TS → Rust"
    },
    {
      term: "Most starred repo",
      detail: "an ExtJS 4 tree plugin from 2012 — fame is unpredictable"
    },
    {
      term: "Most honest repo",
      detail: "“One of the Infinite attempts to write multiplayer top down shooter” (2016)"
    }
  ],
  interestsHeading: "Interests",
  contactHeading: "Contact"
};

/** Ukrainian About-page content. */
const uk: AboutStrings = {
  role: "Senior Game Engineer",
  location: "Санта-Пола, Аліканте, Іспанія",
  aboutHeading: "Про мене",
  aboutParagraphs: [
    "Senior Game Engineer у Playco. Пишу софт із 2007 року — з часів, коли «деплой» означав FTP. За цей час були ігри, веб, бекенди й мобільні застосунки, але останні десять років — здебільшого ігри: live-ops платформи, монетизація, системи інвентаря та платформна сантехніка для тайтлів, у які люди справді грають.",
    "Починав із PHP, пережив Flash (спочивай з миром, прекрасна катастрофо), зробив гак через Android, iOS, Ruby та високонавантажені бекенди — і з 2016-го повністю в геймдеві.",
    "Нині вдень TypeScript, уночі Rust: симулятор міської електромережі на власному 2D-рушії — «для задоволення», бо мій спосіб відпочивати, схоже, — написати ще один рушій.",
    "Тепер мій дім — Санта-Пола, маленьке приморське містечко в Аліканте, Іспанія. Код той самий — а от краєвид помітно апгрейднувся. Поза роботою: настільні ігри, електрогітара та родина."
  ],
  stackHeading: "Стек",
  stack: [
    {
      term: "Мови",
      detail: "TypeScript, JavaScript, Rust (+ довгий хвіст: PHP, Ruby, Python, C#, AS3)"
    },
    { term: "Геймдев", detail: "PixiJS, WebGL, Phaser, Unity3D, live-ops і монетизація" },
    { term: "Фронтенд", detail: "React, Preact, Three.js" },
    { term: "Бекенд", detail: "Node.js, PostgreSQL, MongoDB, Redis, RabbitMQ" },
    { term: "Інфра", detail: "AWS, Docker, Linux, CI/CD" }
  ],
  experienceHeading: "Досвід",
  experience: [
    {
      time: "2020–зараз",
      text: "Playco — Senior Game Engineer: live-ops, платежі, інвентар, аналітика — все, на чому тримаються ігри-сервіси"
    },
    {
      time: "2016–2020",
      text: "Game Closure — Game Developer: мобільні ігри та платформні фічі на стартап-швидкості"
    },
    {
      time: "2015–2016",
      text: "ELITEX — Senior Developer: бекенди на Node.js, Angular і капелюх девопса"
    },
    {
      time: "2014–2015",
      text: "Teempla — Senior Developer: розподілені системи чотирма мовами одночасно"
    },
    {
      time: "2013–2014",
      text: "DataArt — Senior Developer: високонавантажений веб, 3D WebGL, Ruby on Rails"
    },
    {
      time: "2009–2013",
      text: "YourWebStyle — розробник: Android, iOS, PHP, сервери — епоха «ми вміємо все»"
    },
    { time: "2007–2009", text: "Astra — розробник: PHP, з якого все почалося" }
  ],
  gitLog: [
    { term: "На GitHub із", detail: "травень 2012 · 31 публічний репозиторій" },
    {
      term: "Дрейф мов",
      detail: "PHP → AS3 → Ruby, Python → C#, Java → Objective-C → JS → TS → Rust"
    },
    {
      term: "Найбільше зірок",
      detail: "у плагіна дерева для ExtJS 4 з 2012-го — слава непередбачувана"
    },
    {
      term: "Найчесніший репозиторій",
      detail: "«Одна з нескінченних спроб написати мультиплеєрний топ-даун шутер» (2016)"
    }
  ],
  interestsHeading: "Інтереси",
  contactHeading: "Контакти"
};

/** Russian About-page content. */
const ru: AboutStrings = {
  role: "Senior Game Engineer",
  location: "Санта-Пола, Аликанте, Испания",
  aboutHeading: "Обо мне",
  aboutParagraphs: [
    "Senior Game Engineer в Playco. Пишу софт с 2007 года — со времён, когда «деплой» означал FTP. За это время были игры, веб, бэкенды и мобильные приложения, но последние десять лет — в основном игры: live-ops платформы, монетизация, системы инвентаря и платформенная сантехника для тайтлов, в которые люди действительно играют.",
    "Начинал с PHP, пережил Flash (покойся с миром, прекрасная катастрофа), сделал крюк через Android, iOS, Ruby и высоконагруженные бэкенды — и с 2016-го полностью в геймдеве.",
    "Сейчас днём TypeScript, ночью Rust: симулятор городской электросети на собственном 2D-движке — «для удовольствия», потому что мой способ отдыхать, видимо, — написать ещё один движок.",
    "Сейчас мой дом — Санта-Пола, маленький приморский городок в Аликанте, Испания. Код всё тот же — а вот вид из окна заметно апгрейднулся. Вне работы: настольные игры, электрогитара и семья."
  ],
  stackHeading: "Стек",
  stack: [
    {
      term: "Языки",
      detail: "TypeScript, JavaScript, Rust (+ длинный хвост: PHP, Ruby, Python, C#, AS3)"
    },
    { term: "Геймдев", detail: "PixiJS, WebGL, Phaser, Unity3D, live-ops и монетизация" },
    { term: "Фронтенд", detail: "React, Preact, Three.js" },
    { term: "Бэкенд", detail: "Node.js, PostgreSQL, MongoDB, Redis, RabbitMQ" },
    { term: "Инфра", detail: "AWS, Docker, Linux, CI/CD" }
  ],
  experienceHeading: "Опыт",
  experience: [
    {
      time: "2020–сейчас",
      text: "Playco — Senior Game Engineer: live-ops, платежи, инвентарь, аналитика — всё, на чём держатся игры-сервисы"
    },
    {
      time: "2016–2020",
      text: "Game Closure — Game Developer: мобильные игры и платформенные фичи на стартап-скорости"
    },
    {
      time: "2015–2016",
      text: "ELITEX — Senior Developer: бэкенды на Node.js, Angular и шляпа девопса"
    },
    {
      time: "2014–2015",
      text: "Teempla — Senior Developer: распределённые системы на четырёх языках сразу"
    },
    {
      time: "2013–2014",
      text: "DataArt — Senior Developer: высоконагруженный веб, 3D WebGL, Ruby on Rails"
    },
    {
      time: "2009–2013",
      text: "YourWebStyle — разработчик: Android, iOS, PHP, серверы — эпоха «мы умеем всё»"
    },
    { time: "2007–2009", text: "Astra — разработчик: PHP, с которого всё началось" }
  ],
  gitLog: [
    { term: "На GitHub с", detail: "май 2012 · 31 публичный репозиторий" },
    {
      term: "Дрейф языков",
      detail: "PHP → AS3 → Ruby, Python → C#, Java → Objective-C → JS → TS → Rust"
    },
    {
      term: "Больше всего звёзд",
      detail: "у плагина дерева для ExtJS 4 из 2012-го — слава непредсказуема"
    },
    {
      term: "Самый честный репозиторий",
      detail: "«Одна из бесконечных попыток написать мультиплеерный топ-даун шутер» (2016)"
    }
  ],
  interestsHeading: "Интересы",
  contactHeading: "Контакты"
};

/** Spanish About-page content. */
const es: AboutStrings = {
  role: "Senior Game Engineer",
  location: "Santa Pola, Alicante, España",
  aboutHeading: "Sobre mí",
  aboutParagraphs: [
    "Senior Game Engineer en Playco. Escribo software desde 2007 — de cuando «desplegar» significaba FTP. Por el camino hubo juegos, web, backends y apps móviles, pero la última década ha sido sobre todo juegos: plataformas de live-ops, monetización, sistemas de inventario y la fontanería detrás de títulos a los que la gente juega de verdad.",
    "Empecé con PHP, sobreviví a Flash (descansa en paz, hermoso desastre), di un rodeo por Android, iOS, Ruby y backends de alta carga — y desde 2016, gamedev a tiempo completo.",
    "Hoy es TypeScript de día y Rust de noche: un simulador de red eléctrica urbana sobre mi propio motor 2D — «por diversión», porque por lo visto mi manera de descansar es escribir otro motor.",
    "Hoy mi casa es Santa Pola, un pueblo costero de Alicante, España. El código es el mismo — las vistas han recibido un upgrade serio. Fuera del trabajo: juegos de mesa, guitarra eléctrica y familia."
  ],
  stackHeading: "Stack",
  stack: [
    {
      term: "Lenguajes",
      detail: "TypeScript, JavaScript, Rust (+ una larga cola de PHP, Ruby, Python, C#, AS3)"
    },
    { term: "Game dev", detail: "PixiJS, WebGL, Phaser, Unity3D, live-ops y monetización" },
    { term: "Frontend", detail: "React, Preact, Three.js" },
    { term: "Backend", detail: "Node.js, PostgreSQL, MongoDB, Redis, RabbitMQ" },
    { term: "Infra", detail: "AWS, Docker, Linux, CI/CD" }
  ],
  experienceHeading: "Experiencia",
  experience: [
    {
      time: "2020–hoy",
      text: "Playco — Senior Game Engineer: live-ops, pagos, inventario, analítica — la fontanería que mantiene vivos los juegos"
    },
    {
      time: "2016–2020",
      text: "Game Closure — Game Developer: juegos móviles y features de plataforma a velocidad de startup"
    },
    {
      time: "2015–2016",
      text: "ELITEX — Senior Developer: backends en Node.js, Angular y el sombrero de DevOps"
    },
    {
      time: "2014–2015",
      text: "Teempla — Senior Developer: sistemas distribuidos en cuatro lenguajes a la vez"
    },
    {
      time: "2013–2014",
      text: "DataArt — Senior Developer: web de alta carga, WebGL 3D, Ruby on Rails"
    },
    {
      time: "2009–2013",
      text: "YourWebStyle — Developer: Android, iOS, PHP, servidores — la era de «hacemos de todo»"
    },
    { time: "2007–2009", text: "Astra — Developer: PHP, donde empezó todo" }
  ],
  gitLog: [
    { term: "En GitHub desde", detail: "mayo de 2012 · 31 repos públicos" },
    {
      term: "Deriva de lenguajes",
      detail: "PHP → AS3 → Ruby, Python → C#, Java → Objective-C → JS → TS → Rust"
    },
    {
      term: "Más estrellas",
      detail: "un plugin de árbol para ExtJS 4 de 2012 — la fama es impredecible"
    },
    {
      term: "Repo más honesto",
      detail: "«Uno de los infinitos intentos de escribir un shooter multijugador top-down» (2016)"
    }
  ],
  interestsHeading: "Intereses",
  contactHeading: "Contacto"
};

/** All About-page string sets keyed by locale. */
const aboutStrings: Record<Locale, AboutStrings> = { en, uk, ru, es };

/**
 * Resolve the About-page content for a locale.
 *
 * @param locale - Target locale code.
 * @returns The locale's {@link AboutStrings}.
 * @example
 * aboutContent("ru").experienceHeading; // "Опыт"
 */
export function aboutContent(locale: Locale): AboutStrings {
  return aboutStrings[locale];
}
