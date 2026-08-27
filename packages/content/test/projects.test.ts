import { describe, expect, it } from "vitest";
import { domainsInUse, featuredProjects, projectById, projects } from "../src/projects.js";

describe("projects", () => {
  it("loads all seven projects", () => {
    expect(projects).toHaveLength(7);
  });

  it("gives every project a unique id", () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes the three known featured projects", () => {
    expect(featuredProjects.map((p) => p.id).sort()).toEqual(
      ["canrael-codex", "circuit-breakers", "fightmap-generator"],
    );
  });

  it("covers machine learning, games, and web", () => {
    const domains = domainsInUse();
    expect(domains).toContain("ml");
    expect(domains).toContain("game");
    expect(domains).toContain("web");
  });

  it("derives domains from the data rather than a hardcoded list", () => {
    const fromData = new Set(projects.map((p) => p.domain));
    expect(new Set(domainsInUse())).toEqual(fromData);
  });

  it("finds a project by id and returns undefined for a miss", () => {
    expect(projectById("circuit-breakers")?.title).toBe("Circuit Breakers");
    expect(projectById("nope")).toBeUndefined();
  });

  it("points every link at an absolute URL or a site-relative path with no leading slash", () => {
    for (const project of projects) {
      for (const link of project.links) {
        const isAbsolute = /^https?:\/\//.test(link.href);
        const isSiteRelative = !link.href.startsWith("/") && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(link.href);
        expect(isAbsolute || isSiteRelative).toBe(true);
      }
    }
  });

  it("keeps the live demo, drive, and github links absolute", () => {
    const absoluteOnly = [
      "fightmap-generator",
      "canrael-codex",
      "haiku-daily",
      "jianghu-proverbs",
      "library-system",
    ];
    for (const id of absoluteOnly) {
      for (const link of projectById(id)?.links ?? []) {
        expect(link.href).toMatch(/^https?:\/\//);
      }
    }
    const circuitBreakersDownload = projectById("circuit-breakers")?.links.find(
      (l) => l.label === "Download build",
    );
    expect(circuitBreakersDownload?.href).toMatch(/^https?:\/\//);
    const melanomaModels = projectById("melanoma-cnn")?.links.find(
      (l) => l.label === "Models and dataset",
    );
    expect(melanomaModels?.href).toMatch(/^https?:\/\//);
  });

  it("points the two document links at a site-relative docs path", () => {
    const thesis = projectById("circuit-breakers")?.links.find((l) => l.label === "Read the thesis");
    expect(thesis?.href).toBe("docs/IMRAD_FinalManuscript_CircuitBreakers.pdf");

    const notebook = projectById("melanoma-cnn")?.links.find(
      (l) => l.label === "Download the notebook",
    );
    expect(notebook?.href).toBe("docs/melanoma_model.ipynb");
  });

  it("links the five projects that have their own repo", () => {
    const expected: Record<string, string> = {
      "fightmap-generator": "MapGenConcept",
      "canrael-codex": "canrael-codex",
      "haiku-daily": "HaikuDaily",
      "jianghu-proverbs": "jianghu-proverbs",
      "library-system": "Finals-Project-Webdev-LIBRARYMANAGEMENT",
    };
    for (const [id, repo] of Object.entries(expected)) {
      const hrefs = projectById(id)?.links.map((l) => l.href).join(" ") ?? "";
      expect(hrefs).toContain(repo);
    }
  });

  it("keeps every visible string free of em dashes", () => {
    const dash = /[\u2013\u2014]/;
    for (const project of projects) {
      for (const value of [project.title, project.tagline, project.blurb, project.summary]) {
        expect(dash.test(value)).toBe(false);
      }
    }
  });
});
