import { z } from "zod";
import { httpUrl, prose, slug } from "./primitives.js";

export const DOMAINS = ["ml", "game", "web", "tool"] as const;

const linkSchema = z.object({
  label: prose,
  href: httpUrl,
  kind: z.enum(["primary", "secondary"]).default("secondary"),
});

const metricSchema = z.object({
  label: prose,
  value: prose,
});

export const projectSchema = z.object({
  id: slug,
  title: prose,
  domain: z.enum(DOMAINS),
  /** A single year ("2025") or an inclusive range ("2024-2026"). */
  year: z.string().refine((v) => /^\d{4}(-\d{4})?$/.test(v), {
    message: "Year must be YYYY or YYYY-YYYY",
  }),
  featured: z.boolean(),
  award: prose.optional(),
  tagline: prose,
  blurb: prose,
  summary: prose,
  stack: z.array(prose).min(1, "A project needs at least one stack entry"),
  highlights: z.array(prose),
  metrics: z.array(metricSchema),
  media: z.string().min(1).optional(),
  demo: httpUrl.optional(),
  links: z.array(linkSchema),
});

export const artworkSchema = z.object({
  id: slug,
  collection: z.enum(["artwork", "maps", "memes", "vivi", "yuria"]),
  src: z.string().min(1),
  thumb: z.string().min(1),
  alt: prose,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const trackSchema = z.object({
  id: slug,
  title: prose,
  collection: z.enum(["original", "dnd", "ruina"]),
  src: z.string().min(1),
  /** Length in whole seconds. */
  duration: z.number().int().positive(),
});

export const writingSchema = z.object({
  id: slug,
  title: prose,
  kind: z.enum(["lore", "story", "reference", "notes"]),
  blurb: prose,
  pdf: z.string().min(1),
  year: z.string().refine((v) => /^\d{4}$/.test(v), { message: "Year must be YYYY" }),
});

export type Project = z.infer<typeof projectSchema>;
export type Artwork = z.infer<typeof artworkSchema>;
export type Track = z.infer<typeof trackSchema>;
export type Writing = z.infer<typeof writingSchema>;
export type Domain = (typeof DOMAINS)[number];
