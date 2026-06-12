import { describe, expect, it } from "vitest";
import { relativeTimeFrom } from "../../src/lib/relative-time";

/** Fixed "now" for every case: 2026-06-11T12:00:00Z. */
const NOW = Date.parse("2026-06-11T12:00:00Z");

describe("relativeTimeFrom", () => {
  it("formats each unit at its lower boundary", () => {
    expect(relativeTimeFrom("2026-06-11T11:59:00Z", NOW)).toBe("1m ago");
    expect(relativeTimeFrom("2026-06-11T11:00:00Z", NOW)).toBe("1h ago");
    expect(relativeTimeFrom("2026-06-10T12:00:00Z", NOW)).toBe("1d ago");
    expect(relativeTimeFrom("2026-05-12T12:00:00Z", NOW)).toBe("1mo ago");
    expect(relativeTimeFrom("2025-06-11T12:00:00Z", NOW)).toBe("1y ago");
  });

  it("stays in a unit until the next one is reached", () => {
    expect(relativeTimeFrom("2026-06-11T11:00:01Z", NOW)).toBe("59m ago");
    expect(relativeTimeFrom("2026-06-11T10:00:30Z", NOW)).toBe("1h ago");
    expect(relativeTimeFrom("2026-06-10T12:00:01Z", NOW)).toBe("23h ago");
    expect(relativeTimeFrom("2026-06-09T18:00:00Z", NOW)).toBe("1d ago");
  });

  it("counts whole elapsed units", () => {
    expect(relativeTimeFrom("2026-06-11T09:30:00Z", NOW)).toBe("2h ago");
    expect(relativeTimeFrom("2026-06-04T12:00:00Z", NOW)).toBe("7d ago");
    expect(relativeTimeFrom("2024-06-11T12:00:00Z", NOW)).toBe("2y ago");
  });

  it("clamps sub-minute distances to 'just now'", () => {
    expect(relativeTimeFrom("2026-06-11T11:59:30Z", NOW)).toBe("just now");
    expect(relativeTimeFrom("2026-06-11T12:00:00Z", NOW)).toBe("just now");
  });

  it("clamps future instants (clock skew, frozen test clocks) to 'just now'", () => {
    expect(relativeTimeFrom("2026-06-12T12:00:00Z", NOW)).toBe("just now");
  });

  it("handles timezone-offset ISO strings (git %cI format)", () => {
    expect(relativeTimeFrom("2026-06-11T13:00:00+02:00", NOW)).toBe("1h ago");
  });

  it("returns 'n/a' for input that does not parse", () => {
    expect(relativeTimeFrom("not-a-date", NOW)).toBe("n/a");
    expect(relativeTimeFrom("", NOW)).toBe("n/a");
  });
});
