import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { artworks, projects } from "@portfolio/content";
import { describe, expect, it } from "vitest";

const mediaRoot = fileURLToPath(new URL("../../../media/", import.meta.url));

describe("staged media", () => {
  it("has a file for every artwork full image and thumbnail", () => {
    const missing = artworks.flatMap((a) =>
      [a.src, a.thumb].filter((p) => !existsSync(mediaRoot + p)),
    );
    expect(missing).toEqual([]);
  });

  it("has a file for every project image", () => {
    const missing = projects
      .map((p) => p.media)
      .filter((m): m is string => typeof m === "string")
      .filter((m) => !existsSync(mediaRoot + m));
    expect(missing).toEqual([]);
  });

  it("has the resume file", () => {
    expect(existsSync(mediaRoot + "resume.pdf")).toBe(true);
  });
});
