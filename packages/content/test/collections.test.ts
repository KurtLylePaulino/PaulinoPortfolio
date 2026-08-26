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

  it("gives every artwork non-empty alt text", () => {
    for (const art of artworks) {
      expect(art.alt.length).toBeGreaterThan(0);
    }
  });

  it("uses relative paths, never absolute URLs", () => {
    for (const art of artworks) {
      expect(art.src).not.toMatch(/^https?:\/\//);
      expect(art.src).not.toMatch(/^assets\//);
      expect(art.thumb).not.toMatch(/^assets\//);
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

  it("excludes the personal picks category, which duplicates other tracks", () => {
    const ids = tracks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every track a vibe", () => {
    for (const t of tracks) expect(t.vibe.length).toBeGreaterThan(0);
  });

  it("preserves artist styling in titles", () => {
    const styled = tracks.filter((t) => t.title.includes("\u2014"));
    expect(styled.length).toBeGreaterThan(0);
  });
});

describe("writings", () => {
  it("loads all 10 documents", () => {
    expect(writings).toHaveLength(10);
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
