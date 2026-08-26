/**
 * "Archive": warm near-black and brass.
 * Every text value is verified against the ground and raised surfaces at
 * WCAG AA in packages/ui/test/contrast.test.ts. Do not edit a value here
 * without running that suite.
 */
export const palette = {
  ground: "#0c0b09",
  raised: "#151310",
  line: "#282420",
  ink: "#efe9df",
  inkMid: "#a09689",
  inkLow: "#8a8072",
  accent: "#c4913c",
} as const;

/** One secondary hue per world page. The hub itself uses the brass accent alone. */
export const worldAccents = {
  work: "#c4913c",
  art: "#7c9c8b",
  music: "#c4634c",
  writing: "#cdbfa3",
} as const;
