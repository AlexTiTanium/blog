import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts", "src/plugins/**/__tests__/unit/**/*.test.ts"]
        }
      },
      {
        test: {
          name: "integration",
          include: [
            "tests/integration/**/*.test.ts",
            "src/plugins/**/__tests__/integration/**/*.test.ts"
          ]
        }
      }
    ],
    coverage: {
      provider: "istanbul",
      // Pure-logic surface only. Vitest unit tests cover the framework-agnostic helpers
      // (lib/* + i18n/*); the DOM islands, app/spa wiring, and .tsx UI are exercised by
      // the Playwright e2e + visual suite instead (see tests/e2e/).
      include: ["src/lib/**/*.ts", "src/i18n/**/*.ts"],
      // Excluded: pure-data/markup modules with no testable logic — shiki-theme.ts is a static
      // ThemeRegistration object literal, route-helpers.tsx is a JSX `.layout()` wrapper. Both are
      // exercised by the build + e2e visual suite, not unit tests.
      exclude: [
        "src/**/types.ts",
        "src/**/types/**",
        "src/**/__tests__/**",
        "src/lib/shiki-theme.ts",
        "src/lib/route-helpers.tsx"
      ],
      reporter: ["text", "lcov"],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 }
    }
  }
});
