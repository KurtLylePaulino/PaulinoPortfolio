import { describe, expect, it } from "vitest";
import { contrastRatio } from "../src/contrast.js";
import { palette, worldAccents } from "../src/palette.js";

describe("contrastRatio", () => {
  it("returns 21 for black against white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("returns 1 for a color against itself", () => {
    expect(contrastRatio("#c4913c", "#c4913c")).toBeCloseTo(1, 5);
  });
});

describe("Archive palette", () => {
  const textTokens = ["ink", "inkMid", "inkLow", "accent"] as const;

  it.each(textTokens)("passes WCAG AA for %s on the ground", (token) => {
    expect(contrastRatio(palette[token], palette.ground)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(textTokens)("passes WCAG AA for %s on raised surfaces", (token) => {
    expect(contrastRatio(palette[token], palette.raised)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps every world accent readable on the ground", () => {
    for (const [world, hex] of Object.entries(worldAccents)) {
      expect(contrastRatio(hex, palette.ground), `${world} accent`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("gives the three ink tiers visibly different weights", () => {
    const ink = contrastRatio(palette.ink, palette.ground);
    const mid = contrastRatio(palette.inkMid, palette.ground);
    const low = contrastRatio(palette.inkLow, palette.ground);
    expect(ink).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(low);
  });
});
