/**
 * @file Custom `warm-syntax` Shiki theme — recovered from the legacy blog and passed to
 * `pluginConfigs.content.shikiTheme` so migrated code blocks keep the legacy warm palette
 * instead of the framework default github-dark. Requires `@moku-labs/web` >= 0.5.3 (content
 * `shikiTheme` accepts a `ThemeRegistration` object, not just a bundled theme name).
 *
 * Maps the design guide's warm color palette to TextMate token scopes.
 *
 * Color reference (from DESIGN-GUIDE.md):
 *   --dash-bg:       #1c1917  (warm near-black)
 *   --dash-text:     #d4c8b8  (body text)
 *   --dash-muted:    #968b80  (metadata / punctuation)
 *   --syntax-amber:  #f59e0b  (comments, italic)
 *   --syntax-coral:  #f97316  (keywords)
 *   --syntax-green:  #84cc16  (strings)
 *   --syntax-cream:  #fde68a  (functions)
 *   --syntax-peach:  #fdba74  (types)
 *   --syntax-blush:  #fda4af  (constants / numbers)
 *   Code background:  #181412
 */

import type { ThemeRegistration } from "shiki";

export const warmSyntaxTheme: ThemeRegistration = {
  name: "warm-syntax",
  type: "dark",
  colors: {
    "editor.background": "#181412",
    "editor.foreground": "#d4c8b8",
    "editorLineNumber.foreground": "#968b80"
  },
  tokenColors: [
    // ── Comments ──────────────────────────────────────────────
    {
      scope: ["comment", "comment.block", "comment.line", "punctuation.definition.comment"],
      settings: {
        foreground: "#f59e0b",
        fontStyle: "italic"
      }
    },

    // ── Keywords / storage / operators ────────────────────────
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator",
        "keyword.other",
        "storage",
        "storage.type",
        "storage.modifier"
      ],
      settings: {
        foreground: "#f97316"
      }
    },

    // ── Strings ──────────────────────────────────────────────
    {
      scope: ["string", "string.quoted", "string.template", "string.other.link"],
      settings: {
        foreground: "#84cc16"
      }
    },

    // ── Functions ────────────────────────────────────────────
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: {
        foreground: "#fde68a"
      }
    },

    // ── Types / classes / interfaces ─────────────────────────
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "entity.other.inherited-class"
      ],
      settings: {
        foreground: "#fdba74"
      }
    },

    // ── Variables ────────────────────────────────────────────
    {
      scope: ["variable", "variable.other", "variable.parameter", "variable.language"],
      settings: {
        foreground: "#d4c8b8"
      }
    },

    // ── Constants / numbers / booleans ───────────────────────
    {
      scope: [
        "constant",
        "constant.numeric",
        "constant.language",
        "constant.character",
        "constant.other",
        "support.constant"
      ],
      settings: {
        foreground: "#fda4af"
      }
    },

    // ── Punctuation ──────────────────────────────────────────
    {
      scope: [
        "punctuation",
        "punctuation.definition",
        "punctuation.separator",
        "punctuation.terminator",
        "meta.brace"
      ],
      settings: {
        foreground: "#968b80"
      }
    },

    // ── HTML tags ────────────────────────────────────────────
    {
      scope: ["entity.name.tag", "punctuation.definition.tag"],
      settings: {
        foreground: "#f97316"
      }
    },

    // ── HTML / XML attributes ────────────────────────────────
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: "#fde68a"
      }
    },

    // ── Attribute values (HTML) ──────────────────────────────
    {
      scope: ["string.quoted.double.html", "string.quoted.single.html"],
      settings: {
        foreground: "#84cc16"
      }
    },

    // ── Regular expressions ──────────────────────────────────
    {
      scope: [
        "string.regexp",
        "constant.other.character-class.regexp",
        "keyword.operator.quantifier.regexp"
      ],
      settings: {
        foreground: "#f59e0b"
      }
    },

    // ── Decorators / annotations ─────────────────────────────
    {
      scope: [
        "meta.decorator",
        "punctuation.decorator",
        "entity.name.function.decorator",
        "storage.type.annotation"
      ],
      settings: {
        foreground: "#fdba74"
      }
    },

    // ── Property keys (JSON, object literals) ────────────────
    {
      scope: ["support.type.property-name", "meta.object-literal.key"],
      settings: {
        foreground: "#d4c8b8"
      }
    },

    // ── Operators (distinct from keyword.operator) ───────────
    {
      scope: [
        "keyword.operator.assignment",
        "keyword.operator.comparison",
        "keyword.operator.logical",
        "keyword.operator.arithmetic"
      ],
      settings: {
        foreground: "#f97316"
      }
    }
  ]
};
