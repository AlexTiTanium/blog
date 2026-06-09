import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { formatDate } from "../../src/og/template";

// Pin the process to a timezone west of UTC for the whole file: bare frontmatter dates
// ("YYYY-MM-DD") parse as UTC midnight, so without `timeZone: "UTC"` in the formatter
// these assertions would roll back to the previous day and fail.
const ORIGINAL_TZ = process.env.TZ;

beforeAll(() => {
  process.env.TZ = "America/Los_Angeles";
});

afterAll(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

describe("formatDate", () => {
  it("formats a bare frontmatter date in UTC, independent of the build machine timezone", () => {
    expect(formatDate("2026-01-15", "en")).toBe("January 15, 2026");
  });

  it("does not roll over month or year boundaries west of UTC", () => {
    expect(formatDate("2026-01-01", "en")).toBe("January 1, 2026");
    expect(formatDate("2026-03-01", "en")).toBe("March 1, 2026");
  });

  it("localizes the date to the active locale", () => {
    expect(formatDate("2026-01-15", "ru")).toBe("15 января 2026 г.");
  });

  it("falls back to the raw string when the date cannot be parsed", () => {
    expect(formatDate("not-a-date", "en")).toBe("not-a-date");
  });
});
