import { describe, expect, it } from "vitest";
import { projectSchema, trackSchema } from "../src/schema.js";

const validProject = {
  id: "circuit-breakers",
  title: "Circuit Breakers",
  domain: "game",
  year: "2024-2026",
  featured: true,
  award: "Best Thesis, Best Paper, Best Presenter",
  tagline: "2D cybersecurity roguelike built in Unity",
  blurb: "A 2D roguelike that teaches cybersecurity through play.",
  summary: "Lead author on the thesis. Owned numerical balancing.",
  stack: ["Unity", "C#", "Firebase"],
  highlights: ["Lead author on the award-winning thesis"],
  metrics: [{ label: "Awards", value: "3x" }],
  links: [{ label: "Read the thesis", href: "https://example.com/t.pdf", kind: "primary" }],
};

describe("projectSchema", () => {
  it("accepts a complete project", () => {
    expect(projectSchema.parse(validProject).id).toBe("circuit-breakers");
  });

  it("accepts a project with every optional field absent", () => {
    const minimal = {
      ...validProject,
      award: undefined,
      media: undefined,
      demo: undefined,
      metrics: [],
      highlights: [],
    };
    expect(projectSchema.safeParse(minimal).success).toBe(true);
  });

  it("defaults link kind to secondary", () => {
    const parsed = projectSchema.parse({
      ...validProject,
      links: [{ label: "GitHub", href: "https://github.com/x/y" }],
    });
    expect(parsed.links[0]?.kind).toBe("secondary");
  });

  it("rejects an unknown domain", () => {
    expect(projectSchema.safeParse({ ...validProject, domain: "music" }).success).toBe(false);
  });

  it("rejects an em dash anywhere in copy", () => {
    const bad = { ...validProject, blurb: "A roguelike \u2014 built in Unity." };
    expect(projectSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a project with an empty stack", () => {
    expect(projectSchema.safeParse({ ...validProject, stack: [] }).success).toBe(false);
  });

  it("rejects a malformed year", () => {
    expect(projectSchema.safeParse({ ...validProject, year: "twenty-24" }).success).toBe(false);
  });
});

describe("trackSchema", () => {
  it("accepts a track with a relative src", () => {
    const parsed = trackSchema.parse({
      id: "gutter-pulse",
      title: "Gutter Pulse",
      collection: "original",
      src: "audio/original/gutter-pulse.mp3",
      duration: 214,
    });
    expect(parsed.duration).toBe(214);
  });

  it("rejects a negative duration", () => {
    const result = trackSchema.safeParse({
      id: "x", title: "X", collection: "original", src: "a.mp3", duration: -1,
    });
    expect(result.success).toBe(false);
  });
});
