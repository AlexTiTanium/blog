---
title: "¡Hola, Pipeline!"
date: "2026-01-15"
description: "Un artículo de prueba para el pipeline de contenido, que ejercita bloques de código en varios lenguajes y funciones básicas de markdown."
tags:
  - testing
  - pipeline
language: es
draft: false
---

Todo blog necesita un comienzo, y todo pipeline de contenido necesita su primer sujeto de pruebas. Este artículo existe para verificar que nuestro procesamiento de markdown funciona de principio a fin: desde el análisis del frontmatter, pasando por el resaltado de sintaxis, hasta el HTML final.

Construir un pipeline de contenido se parece mucho a instalar tuberías. Nadie admira las cañerías, pero todos se dan cuenta cuando el agua deja de correr. Aquí pasa lo mismo -- si el pipeline funciona, los lectores ven artículos bellamente renderizados. Si se rompe, ven markdown en crudo y un pavor existencial.

## Bloques de Código

Empecemos con una función en TypeScript que procesa un artículo:

```typescript
interface Article {
  title: string;
  date: string;
  tags: string[];
}

function processArticle(raw: string): Article {
  const frontmatter = parseFrontmatter(raw);
  const html = renderMarkdown(raw);

  return {
    title: frontmatter.title,
    date: frontmatter.date,
    tags: frontmatter.tags ?? [],
  };
}
```

Y así es como podrías ejecutar el pipeline desde la línea de comandos:

```bash
# Compilar todos los artículos
bun run build

# Vigilar los cambios durante el desarrollo
bun run dev --watch

# Comprobar enlaces rotos
bun run check:links
```

Por último, un ejemplo de configuración en JSON:

```json
{
  "pipeline": {
    "contentDir": "content/articles",
    "outputDir": "dist",
    "languages": ["en", "ru"],
    "features": {
      "syntaxHighlighting": true,
      "pullQuotes": true,
      "readingTime": true
    }
  }
}
```

## Por Qué Esto Importa

El pipeline es la columna vertebral invisible del blog. Cada artículo pasa por él, así que lo probamos a fondo con artículos como este. Si estás leyendo esto correctamente renderizado, el pipeline funciona. Si estás leyendo markdown en crudo, bueno, nos toca depurar un poco.

Este artículo apunta a unas trescientas palabras para darle al calculador de tiempo de lectura algo con lo que trabajar de verdad. Un artículo de un solo párrafo calcularía cero minutos, lo cual es técnicamente exacto pero filosóficamente insatisfactorio.
