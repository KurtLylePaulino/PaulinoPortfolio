import { describe, expect, it } from "vitest";
import { contrastRatio, palette, relativeLuminance, worldAccents } from "../src/index.js";

describe("public barrel", () => {
  it("exports the palette and world accents", () => {
    expect(palette.ground).toMatch(/^#[0-9a-f]{6}$/);
    expect(Object.keys(worldAccents).length).toBeGreaterThan(0);
  });

  it("exports working contrast math", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });
});
