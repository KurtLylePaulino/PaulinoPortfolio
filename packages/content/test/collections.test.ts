import { describe, expect, it } from "vitest";
import {
  artByCollection, artworks, tracks, tracksByCollection, videos, writings,
} from "../src/collections.js";

describe("artworks", () => {
  it("loads all 83 stills", () => {
    expect(artworks).toHaveLength(83);
  });

  it("matches the audited count for each collection", () => {
    const expected = { artwork: 16, vivi: 11, yuria: 14, maps: 25, memes: 17 } as const;
    for (const [name, count] of Object.entries(expected)) {
      expect(artByCollection(name as keyof typeof expected)).toHaveLength(count);
    }
  });

  it("gives every artwork a unique id", () => {
    const ids = artworks.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every artwork positive dimensions", () => {
    for (const art of artworks) {
      expect(art.width).toBeGreaterThan(0);
      expect(art.height).toBeGreaterThan(0);
    }
  });

  it("gives every artwork alt text naming its collection and position", () => {
    const labels = {
      artwork: "Concept artwork",
      vivi: "Vivi character study",
      yuria: "Yuria character study",
      maps: "Battle map",
      memes: "Meme",
    } as const;
    const totals = { artwork: 16, vivi: 11, yuria: 14, maps: 25, memes: 17 } as const;

    for (const collection of Object.keys(labels) as (keyof typeof labels)[]) {
      const group = artByCollection(collection);
      group.forEach((art, index) => {
        expect(art.alt).toBe(`${labels[collection]}, image ${index + 1} of ${totals[collection]}`);
      });
    }
  });

  it("uses relative paths, never absolute URLs", () => {
    for (const art of artworks) {
      expect(art.src).not.toMatch(/^https?:\/\//);
      expect(art.src).not.toMatch(/^assets\//);
      expect(art.thumb).not.toMatch(/^assets\//);
    }
  });

  it("gives every artwork a thumb distinct from its full image", () => {
    for (const art of artworks) {
      expect(art.thumb).not.toBe(art.src);
      expect(art.thumb).toContain("-thumb");
    }
  });
});

describe("videos", () => {
  it("loads all 6 motion pieces", () => {
    expect(videos).toHaveLength(6);
  });

  it("gives every video a unique id and a src", () => {
    const ids = videos.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const v of videos) expect(v.src.length).toBeGreaterThan(0);
  });

  it("uses relative paths, never absolute URLs", () => {
    for (const v of videos) {
      expect(v.src).not.toMatch(/^https?:\/\//);
      expect(v.src).not.toMatch(/^assets\//);
    }
  });
});

describe("tracks", () => {
  it("loads all 40 unique tracks", () => {
    expect(tracks).toHaveLength(40);
  });

  it("matches the audited count for each playlist", () => {
    expect(tracksByCollection("original")).toHaveLength(6);
    expect(tracksByCollection("dnd")).toHaveLength(23);
    expect(tracksByCollection("ruina")).toHaveLength(11);
  });

  it("gives every track a unique id", () => {
    const ids = tracks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("excludes the personal picks category, which duplicates other tracks", () => {
    expect(tracks.some((t) => (t.collection as string) === "personal")).toBe(false);
    expect(tracks).toHaveLength(40);
  });

  it("gives every track a vibe", () => {
    for (const t of tracks) expect(t.vibe.length).toBeGreaterThan(0);
  });

  it("preserves the em dash in all six artist-styled titles", () => {
    const styled = tracks.filter((t) => t.title.includes("\u2014"));
    expect(styled).toHaveLength(6);
  });

  it("keeps every vibe free of em dashes and en dashes", () => {
    const dash = /[\u2013\u2014]/;
    for (const t of tracks) expect(dash.test(t.vibe)).toBe(false);
  });
});

describe("writings", () => {
  it("loads all 10 documents", () => {
    expect(writings).toHaveLength(10);
  });

  it("gives every document a unique id", () => {
    const ids = writings.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every kind used by the archive", () => {
    const kinds = new Set(writings.map((w) => w.kind));
    expect(kinds).toContain("lore");
    expect(kinds).toContain("story");
    expect(kinds).toContain("reference");
    expect(kinds).toContain("notes");
  });

  it("points every document at a pdf", () => {
    for (const w of writings) expect(w.pdf).toMatch(/\.pdf$/);
  });
});
