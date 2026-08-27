import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { featuredProjects } from "@portfolio/content";
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
