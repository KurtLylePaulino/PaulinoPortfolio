import type { Domain } from "./schema.js";

export const DOMAIN_META: Record<Domain, { label: string; accent: string }> = {
  game: {
    label: "Games",
    accent: "var(--accent-work)",
  },
  ml: {
    label: "Machine learning",
    accent: "var(--accent-art)",
  },
  web: {
    label: "Web",
    accent: "var(--accent-music)",
  },
  tool: {
    label: "Tools",
    accent: "var(--accent-writing)",
  },
};

export function domainMeta(domain: Domain): { label: string; accent: string } {
  if (!(domain in DOMAIN_META)) {
    throw new Error(`Unknown domain: ${domain}`);
  }
  return DOMAIN_META[domain];
}
