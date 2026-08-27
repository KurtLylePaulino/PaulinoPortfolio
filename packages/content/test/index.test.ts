import { describe, expect, it } from "vitest";
import {
  artByCollection,
  artworks,
  artworkSchema,
  domainsInUse,
  featuredProjects,
  projectById,
  projects,
  projectSchema,
  tracks,
  tracksByCollection,
  trackSchema,
  videos,
  videoSchema,
  writings,
  writingSchema,
} from "../src/index.js";

describe("public barrel", () => {
  it("exports the project surface", () => {
    expect(projects).toHaveLength(7);
    expect(featuredProjects).toHaveLength(3);
    expect(projectById("circuit-breakers")?.id).toBe("circuit-breakers");
    expect(domainsInUse().length).toBeGreaterThan(0);
  });

  it("exports the art surface", () => {
    expect(artworks).toHaveLength(83);
    expect(artByCollection("yuria").length).toBeGreaterThan(0);
  });

  it("exports the video surface", () => {
    expect(videos).toHaveLength(6);
  });

  it("exports the music surface", () => {
    expect(tracks).toHaveLength(40);
    expect(tracksByCollection("original").length).toBeGreaterThan(0);
  });

  it("exports the writing surface", () => {
    expect(writings).toHaveLength(10);
  });

  it("exports every schema", () => {
    expect(projectSchema).toBeDefined();
    expect(artworkSchema).toBeDefined();
    expect(videoSchema).toBeDefined();
    expect(trackSchema).toBeDefined();
    expect(writingSchema).toBeDefined();
  });
});
