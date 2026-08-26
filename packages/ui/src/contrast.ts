function channel(value: number): number {
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance for a six-digit hex color. */
export function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) throw new Error(`Expected a six-digit hex color, got "${hex}"`);
  const [r, g, b] = [0, 2, 4].map((i) => channel(Number.parseInt(clean.slice(i, i + 2), 16) / 255));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG 2.1 contrast ratio. Ranges from 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}
