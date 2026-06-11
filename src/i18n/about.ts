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
    "Senior Game Engineer at Playco, shipping software since 2007 — games, web apps, backends, mobile apps, and the occasional tool nobody asked for. The last decade has been mostly games: live-ops platforms, monetization, inventory systems, and platform tech behind titles people actually play.",
    "The career arc, briefly: PHP (2007) → a bit of everything — Android, iOS, Ruby, WebGL, high-load backends → full-time game development since 2016. These days it's TypeScript by day and Rust by night: a 2D game engine and a power-grid city simulator, because apparently the word \"rest\" doesn't compile in my vocabulary.",
    "Recently relocated to Santa Pola, Alicante, Spain — same memory leaks, better sea view. Off duty: board games, game design, and family time."
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
    { term: "Language drift", detail: "AS3 → PHP → Ruby → C# → JS → TS → Rust" },
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
    "Senior Game Engineer у Playco. Пишу софт із 2007 року — ігри, веб, бекенди, мобільні застосунки й подекуди інструменти, про які ніхто не просив. Останні десять років — здебільшого ігри: live-ops платформи, монетизація, системи інвентаря та платформні технології для тайтлів, у які люди справді грають.",
    "Кар'єрна траєкторія, якщо коротко: PHP (2007) → усього потроху — Android, iOS, Ruby, WebGL, високонавантажені бекенди → з 2016-го повністю в геймдеві. Нині вдень TypeScript, уночі Rust: 2D-рушій і симулятор міської електромережі, бо слово «відпочинок» у моєму словнику, схоже, не компілюється.",
    "Нещодавно переїхав до Санта-Поли (Аліканте, Іспанія) — ті самі витоки пам'яті, але з видом на море. Поза роботою: настільні ігри, геймдизайн і час із родиною."
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
      text: "Playco — Senior Game Engineer: live-ops, платежі, інвентар, аналітика — все, на чому тримаються живі ігри"
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
    { term: "Дрейф мов", detail: "AS3 → PHP → Ruby → C# → JS → TS → Rust" },
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
    "Senior Game Engineer в Playco. Пишу софт с 2007 года — игры, веб, бэкенды, мобильные приложения и иногда инструменты, о которых никто не просил. Последние десять лет — в основном игры: live-ops платформы, монетизация, системы инвентаря и платформенные технологии для тайтлов, в которые люди действительно играют.",
    "Карьерная траектория, если коротко: PHP (2007) → всего понемногу — Android, iOS, Ruby, WebGL, высоконагруженные бэкенды → с 2016-го полностью в геймдеве. Сейчас днём TypeScript, ночью Rust: 2D-движок и симулятор городской электросети, потому что слово «отдых» в моём словаре, видимо, не компилируется.",
    "Недавно переехал в Санта-Полу (Аликанте, Испания) — те же утечки памяти, но с видом на море. Вне работы: настольные игры, геймдизайн и время с семьёй."
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
      text: "Playco — Senior Game Engineer: live-ops, платежи, инвентарь, аналитика — всё, на чём держатся живые игры"
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
    { term: "Дрейф языков", detail: "AS3 → PHP → Ruby → C# → JS → TS → Rust" },
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
    "Senior Game Engineer en Playco. Escribo software desde 2007: juegos, aplicaciones web, backends, apps móviles y, de vez en cuando, herramientas que nadie pidió. La última década ha sido sobre todo juegos: plataformas de live-ops, monetización, sistemas de inventario y tecnología de plataforma para títulos a los que la gente juega de verdad.",
    "La trayectoria, en resumen: PHP (2007) → un poco de todo — Android, iOS, Ruby, WebGL, backends de alta carga → desde 2016, desarrollo de juegos a tiempo completo. Hoy: TypeScript de día y Rust de noche — un motor 2D y un simulador de red eléctrica urbana, porque por lo visto la palabra «descanso» no compila en mi vocabulario.",
    "Hace poco me mudé a Santa Pola (Alicante, España): las mismas fugas de memoria, pero con vistas al mar. Fuera del trabajo: juegos de mesa, diseño de juegos y tiempo en familia."
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
    { term: "Deriva de lenguajes", detail: "AS3 → PHP → Ruby → C# → JS → TS → Rust" },
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
