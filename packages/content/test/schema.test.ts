import { describe, expect, it } from "vitest";
import {
  artworkSchema,
  projectSchema,
  trackSchema,
  videoSchema,
  writingSchema,
} from "../src/schema.js";

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

describe("artworkSchema", () => {
  const validArtwork = {
    id: "yuria-03",
    collection: "yuria",
    src: "img/art/yuria/yuria-03.webp",
    thumb: "img/art/yuria/yuria-03-thumb.webp",
    alt: "Yuria character study, image 3 of 14",
    width: 2688,
    height: 1520,
  };

  it("accepts a complete artwork", () => {
    expect(artworkSchema.parse(validArtwork).id).toBe("yuria-03");
  });

  it("rejects an unknown collection", () => {
    expect(artworkSchema.safeParse({ ...validArtwork, collection: "motion" }).success).toBe(false);
  });

  it("rejects a zero or negative dimension", () => {
    expect(artworkSchema.safeParse({ ...validArtwork, width: 0 }).success).toBe(false);
    expect(artworkSchema.safeParse({ ...validArtwork, height: -5 }).success).toBe(false);
  });

  it("rejects empty alt text, because every image needs a description", () => {
    expect(artworkSchema.safeParse({ ...validArtwork, alt: "" }).success).toBe(false);
  });

  it("rejects an em dash in alt text", () => {
    const bad = { ...validArtwork, alt: "Yuria \u2014 image 3" };
    expect(artworkSchema.safeParse(bad).success).toBe(false);
  });
});

describe("videoSchema", () => {
  const validVideo = {
    id: "showcase-1",
    title: "Showcase 1",
    src: "video/art/showcase-1.mp4",
  };

  it("accepts a video without a poster", () => {
    expect(videoSchema.parse(validVideo).id).toBe("showcase-1");
  });

  it("accepts a video with a poster", () => {
    const parsed = videoSchema.parse({ ...validVideo, poster: "video/art/showcase-1.webp" });
    expect(parsed.poster).toBe("video/art/showcase-1.webp");
  });

  it("permits an em dash in the title, because it is a proper name", () => {
    const title = "Showcase \u2014 One";
    expect(videoSchema.parse({ ...validVideo, title }).title).toBe(title);
  });

  it("rejects a missing src", () => {
    expect(videoSchema.safeParse({ id: "x", title: "X" }).success).toBe(false);
  });
});

describe("writingSchema", () => {
  const validWriting = {
    id: "canrael-timeline",
    title: "Canrael Timeline",
    kind: "reference",
    blurb: "A chronology of the Abyss and the Lighthouses.",
    pdf: "docs/writing/canrael-timeline.pdf",
    year: "2025",
  };

  it("accepts a complete document", () => {
    expect(writingSchema.parse(validWriting).id).toBe("canrael-timeline");
  });

  it("rejects an unknown kind", () => {
    expect(writingSchema.safeParse({ ...validWriting, kind: "novel" }).success).toBe(false);
  });

  it("rejects a year range, because writing takes a single year", () => {
    expect(writingSchema.safeParse({ ...validWriting, year: "2024-2025" }).success).toBe(false);
  });

  it("rejects an em dash in the blurb", () => {
    const bad = { ...validWriting, blurb: "A chronology \u2014 of the Abyss." };
    expect(writingSchema.safeParse(bad).success).toBe(false);
  });

  it("accepts a document with no year", () => {
    const { year, ...withoutYear } = validWriting;
    expect(writingSchema.safeParse(withoutYear).success).toBe(true);
  });
});

describe("trackSchema", () => {
  const validTrack = {
    id: "gutter-pulse",
    title: "Gutter Pulse",
    collection: "original",
    src: "audio/original/gutter-pulse.mp3",
    vibe: "darkwave · pulse",
  };

  it("accepts a track with no duration", () => {
    expect(trackSchema.parse(validTrack).duration).toBeUndefined();
  });

  it("accepts a track with a duration", () => {
    expect(trackSchema.parse({ ...validTrack, duration: 214 }).duration).toBe(214);
  });

  it("permits an em dash in the title, because it is a proper name", () => {
    const title = "PANDÆMONIUM \u2014 BE NOT AFRAID";
    expect(trackSchema.parse({ ...validTrack, title }).title).toBe(title);
  });

  it("rejects a negative duration", () => {
    expect(trackSchema.safeParse({ ...validTrack, duration: -1 }).success).toBe(false);
  });

  it("rejects a non-integer duration", () => {
    expect(trackSchema.safeParse({ ...validTrack, duration: 3.5 }).success).toBe(false);
  });

  it("requires a vibe", () => {
    const { vibe, ...withoutVibe } = validTrack;
    expect(trackSchema.safeParse(withoutVibe).success).toBe(false);
  });

  it("rejects an unknown collection", () => {
    expect(trackSchema.safeParse({ ...validTrack, collection: "personal" }).success).toBe(false);
  });
});
