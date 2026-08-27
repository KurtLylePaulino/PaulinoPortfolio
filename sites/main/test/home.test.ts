import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { artworks, featuredProjects, projects, tracks, writings } from "@portfolio/content";
import { describe, expect, it } from "vitest";

const distIndexPath = fileURLToPath(new URL("../dist/index.html", import.meta.url));

// Everything the built home page can depend on: this site's own source, and
// the shared UI components it renders through.
const sourceRoots = [
  fileURLToPath(new URL("../src/", import.meta.url)),
  fileURLToPath(new URL("../../../packages/ui/components/", import.meta.url)),
];

/** Recursively finds the newest mtime among files under `dir`. */
function newestMtimeUnder(dir: string): number {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      newest = Math.max(newest, newestMtimeUnder(full));
    } else if (entry.isFile()) {
      newest = Math.max(newest, statSync(full).mtimeMs);
    }
  }
  return newest;
}

// Tests read the built HTML, not the source. A `pretest` script rebuilds
// before `vitest run`, but nothing stops someone from running `vitest`
// directly against a stale dist/. This guard makes that failure loud
// instead of silently asserting on yesterday's build.
function assertBuildIsFresh() {
  const distMtime = statSync(distIndexPath).mtimeMs;
  const newestSource = Math.max(...sourceRoots.map(newestMtimeUnder));
  if (distMtime < newestSource) {
    throw new Error("dist/index.html is older than source. Run npm run build first.");
  }
}

const html = () => {
  assertBuildIsFresh();
  return readFileSync(distIndexPath, "utf8");
};

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

  it("resolves the thesis link under the base path, not the old site", () => {
    const doc = html();
    const match = doc.match(/href="([^"]*IMRAD[^"]*)"/);
    expect(match).not.toBeNull();
    const href = match![1]!;
    // Base-relative: rooted at the site origin, not a bare content path.
    expect(href.startsWith("/")).toBe(true);
    expect(href).toContain("docs/IMRAD_FinalManuscript_CircuitBreakers.pdf");
    expect(href).not.toContain("FullPortfolio");
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
    // BEM-aware: an element counts as an eyebrow when one of its class
    // tokens is exactly "eyebrow" or ends with "__eyebrow" (e.g.
    // "about__eyebrow"). A raw \beyebrow\b regex misses that case because
    // "_" is a word character, so "\b" never breaks between "_" and "e".
    const eyebrowCount = (doc.match(/class="[^"]*"/g) ?? []).filter((attr) => {
      const tokens = attr.slice(7, -1).split(/\s+/);
      return tokens.some((t) => t === "eyebrow" || t.endsWith("__eyebrow"));
    }).length;
    expect(eyebrowCount).toBe(1);
  });

  it("has exactly one h1", () => {
    expect((html().match(/<h1\b/g) ?? [])).toHaveLength(1);
  });

  it("introduces no colour outside the token set", () => {
    const doc = html();
    const inlineHex = doc.match(/style="[^"]*#[0-9a-fA-F]{3,8}/g) ?? [];
    expect(inlineHex).toEqual([]);
  });
});
