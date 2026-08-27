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

  it("has the Circuit Breakers thesis and the melanoma notebook staged locally", () => {
    // Staged so the flagship project's links do not depend on the old
    // FullPortfolio site staying online. DOCS in projects.ts still points
    // there: httpUrl requires an absolute http(s) URL, and a site-relative
    // path here would both fail that validation and hardcode the deploy
    // path, so repointing DOCS is left as a follow-up.
    expect(existsSync(mediaRoot + "docs/IMRAD_FinalManuscript_CircuitBreakers.pdf")).toBe(true);
    expect(existsSync(mediaRoot + "docs/melanoma_model.ipynb")).toBe(true);
  });
});
