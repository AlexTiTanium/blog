import { describe, expect, it } from "vitest";
import { pickQuote, QUOTES } from "../../src/lib/quotes";

describe("quotes", () => {
  it("exposes a non-empty pool", () => {
    expect(QUOTES.length).toBeGreaterThan(0);
  });

  it("returns a quote from the pool", () => {
    expect(QUOTES).toContain(pickQuote());
  });

  it("is deterministic within the same hour", () => {
    expect(pickQuote()).toBe(pickQuote());
  });
});
