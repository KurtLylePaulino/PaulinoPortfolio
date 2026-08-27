import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (name: string) =>
  readFileSync(fileURLToPath(new URL(`../components/${name}`, import.meta.url)), "utf8");

// The home page renders SiteNav with current="home", so its built output is
// the concrete evidence that aria-current actually reaches the DOM rather
// than just being mentioned in source.
const homePageHtml = () =>
  readFileSync(
    fileURLToPath(new URL("../../../sites/main/dist/index.html", import.meta.url)),
    "utf8",
  );

describe("SiteNav", () => {
  const src = read("SiteNav.astro");

  it("builds hrefs from BASE_URL rather than hardcoding the deploy path", () => {
    expect(src).toContain("BASE_URL");
    expect(src).not.toContain("/PaulinoPortfolio");
  });

  it("marks the active link for assistive technology", () => {
    expect(src).toContain("aria-current");
  });

  it("actually emits aria-current=\"page\" in built output", () => {
    expect(homePageHtml()).toContain('aria-current="page"');
  });

  it("caps its height so it cannot eat the viewport", () => {
    expect(src).toMatch(/max-height:\s*72px/);
  });
});

describe("SiteFooter", () => {
  const src = read("SiteFooter.astro");

  it("does not hardcode the deploy path", () => {
    expect(src).not.toContain("/PaulinoPortfolio");
  });
});

describe("shared components", () => {
  it("introduce no colour outside the token set", () => {
    for (const name of ["SiteNav.astro", "SiteFooter.astro", "BaseLayout.astro"]) {
      expect(read(name)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it("contain no literal em or en dash", () => {
    const dashPattern = new RegExp(
      `[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`,
    );
    for (const name of ["SiteNav.astro", "SiteFooter.astro", "BaseLayout.astro"]) {
      expect(dashPattern.test(read(name))).toBe(false);
    }
  });
});
