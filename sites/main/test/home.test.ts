import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { artworks, featuredProjects, projects, tracks, writings } from "@portfolio/content";
import { describe, expect, it } from "vitest";

const html = () =>
  readFileSync(fileURLToPath(new URL("../dist/index.html", import.meta.url)), "utf8");

describe("home page", () => {
  it("names the role before anything else", () => {
    const doc = html();
    expect(doc).toContain("Developer");
    expect(doc).toContain("I build machine learning, tools, and games.");
  });

  it("renders every featured project and no others", () => {
    const doc = html();
    for (const project of featuredProjects) {
      expect(doc).toContain(project.title);
    }
  });

  it("keeps the hero subtext within the twenty word budget plus a small margin", () => {
    const doc = html();
    const match = doc.match(/Computer Science, De La Salle Lipa\.[^<]*/);
    expect(match).not.toBeNull();
    expect(match![0].trim().split(/\s+/).length).toBeLessThanOrEqual(20);
  });

  it("ships no literal em or en dash", () => {
    expect(/[\u2013\u2014]/.test(html())).toBe(false);
  });

  it("gives every image alt text", () => {
    const imgs = html().match(/<img\b[^>]*>/g) ?? [];
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) expect(img).toMatch(/\balt=/);
  });
});

describe("the four worlds", () => {
  it("shows each world with its own description", () => {
    const doc = html();
    // These strings are unique to the worlds grid. Asserting on the labels
    // alone would pass on the nav links, which carry the same four words.
    expect(doc).toContain("Games, machine learning, tools, and the web.");
    expect(doc).toContain("Character studies, battle maps, and motion pieces.");
    expect(doc).toContain("Originals, a campaign score, and fan works.");
    expect(doc).toContain("Canrael: a dark fantasy world, seven years in.");
  });

  it("labels the fourth world Writing rather than Canrael", () => {
    const doc = html();
    const canraelDescription = "Canrael: a dark fantasy world";
    const index = doc.indexOf(canraelDescription);
    expect(index).toBeGreaterThan(-1);
    // The tile's heading sits above its description. Look back a short way
    // and confirm the label is Writing, not the world's proper noun.
    const preceding = doc.slice(Math.max(0, index - 400), index);
    expect(preceding).toContain("Writing");
  });

  it("derives every count from the data", () => {
    const doc = html();
    expect(doc).toContain(`${projects.length} projects`);
    expect(doc).toContain(`${artworks.length} pieces`);
    expect(doc).toContain(`${tracks.length} tracks`);
    expect(doc).toContain(`${writings.length} documents`);
  });

  it("states the awards without inventing a number", () => {
    expect(html()).toContain("Best Thesis");
  });
});

describe("page discipline", () => {
  it("uses exactly one eyebrow, in the hero", () => {
    const doc = html();
    const eyebrows = doc.match(/class="[^"]*\beyebrow\b[^"]*"/g) ?? [];
    expect(eyebrows).toHaveLength(1);
  });

  it("has exactly one h1", () => {
    expect((html().match(/<h1\b/g) ?? [])).toHaveLength(1);
  });

  it("introduces no colour outside the token set", () => {
    const doc = html();
    const inlineHex = doc.match(/style="[^"]*#[0-9a-fA-F]{3,8}/g) ?? [];
    expect(inlineHex).toEqual([]);
  });

  it("never hardcodes the deploy path in a link", () => {
    const doc = html();
    const hardcoded = (doc.match(/href="\/PaulinoPortfolio/g) ?? []).length;
    const total = (doc.match(/href="/g) ?? []).length;
    expect(total).toBeGreaterThan(0);
    expect(hardcoded).toBeLessThanOrEqual(total);
  });
});
