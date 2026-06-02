/**
 * @file Tiny CLI logger shared by the build/dev/serve/deploy scripts. Each script gets a colored,
 * symbol-prefixed line so terminal output reads clearly at a glance. Colors auto-disable when stdout
 * is not a TTY (CI logs, pipes) or when `NO_COLOR` is set, so piped/CI output stays plain.
 */

/** Whether to emit ANSI color (TTY + `NO_COLOR` unset). */
const useColor = process.stdout.isTTY === true && process.env.NO_COLOR === undefined;

/** ANSI SGR codes used by the logger. */
const ANSI = {
  reset: "[0m",
  dim: "[2m",
  red: "[31m",
  green: "[32m",
  yellow: "[33m",
  cyan: "[36m"
} as const;

/**
 * Wrap text in an ANSI color (a no-op when color is disabled).
 *
 * @param code - ANSI color code from {@link ANSI}.
 * @param text - Text to colorize.
 * @returns The colorized (or plain) text.
 */
function paint(code: string, text: string): string {
  return useColor ? `${code}${text}${ANSI.reset}` : text;
}

/** A scoped logger returned by {@link createLogger}. */
export type Logger = {
  /** Neutral progress line (cyan `›`). */
  info(message: string): void;
  /** Success line (green `✓`). */
  success(message: string): void;
  /** Warning line (yellow `⚠`), written to stderr. */
  warn(message: string): void;
  /** Error line (red `✗`), written to stderr. */
  error(message: string, cause?: unknown): void;
};

/**
 * Create a logger scoped to one script (the scope is shown as a dim `[scope]` tag).
 *
 * @param scope - Short script name (e.g. "build", "dev").
 * @returns A {@link Logger} bound to `scope`.
 * @example
 * const log = createLogger("build");
 * log.success("42 pages in 1200ms");
 */
export function createLogger(scope: string): Logger {
  const tag = paint(ANSI.dim, `[${scope}]`);
  const line = (symbol: string, message: string): string => `${symbol} ${tag} ${message}`;

  return {
    info(message) {
      console.log(line(paint(ANSI.cyan, "›"), message));
    },
    success(message) {
      console.log(line(paint(ANSI.green, "✓"), message));
    },
    warn(message) {
      console.warn(line(paint(ANSI.yellow, "⚠"), message));
    },
    error(message, cause) {
      console.error(line(paint(ANSI.red, "✗"), message));
      if (cause !== undefined) console.error(cause);
    }
  };
}
