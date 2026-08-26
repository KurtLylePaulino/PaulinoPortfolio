import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { palette, worldAccents } from "../src/palette.js";

const css = readFileSync(fileURLToPath(new URL("../src/tokens.css", import.meta.url)), "utf8");

const TOKEN_NAMES: Record<keyof typeof palette, string> = {
  ground: "--ground",
  raised: "--raised",
  line: "--line",
  ink: "--ink",
  inkMid: "--ink-mid",
  inkLow: "--ink-low",
  accent: "--accent",
};

describe("tokens.css", () => {
  it("declares every palette value with the exact hex from TypeScript", () => {
    for (const [key, cssName] of Object.entries(TOKEN_NAMES)) {
      const expected = palette[key as keyof typeof palette];
      const match = css.match(new RegExp(`${cssName}\\s*:\\s*(#[0-9a-fA-F]{6})`));
      expect(match, `${cssName} missing from tokens.css`).not.toBeNull();
      expect(match?.[1]?.toLowerCase()).toBe(expected.toLowerCase());
    }
  });

  it("declares every world accent with the exact hex from TypeScript", () => {
    const accentMap: Record<string, string> = {
      work: "--accent-work",
      art: "--accent-art",
      music: "--accent-music",
      writing: "--accent-writing",
    };
    for (const [key, cssName] of Object.entries(accentMap)) {
      const expected = worldAccents[key as keyof typeof worldAccents];
      const match = css.match(new RegExp(`${cssName}\\s*:\\s*(#[0-9a-fA-F]{6})`));
      expect(match, `${cssName} missing from tokens.css`).not.toBeNull();
      expect(match?.[1]?.toLowerCase()).toBe(expected.toLowerCase());
    }
  });

  it("never uses pure black or pure white", () => {
    expect(css).not.toMatch(/#000000|#ffffff/i);
  });

  it("contains no em dashes", () => {
    expect(/[\u2013\u2014]/.test(css)).toBe(false);
  });
});
