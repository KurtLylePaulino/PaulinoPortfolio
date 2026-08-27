import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { domainsInUse, projects } from "@portfolio/content";
import { describe, expect, it } from "vitest";

const html = () =>
  readFileSync(fileURLToPath(new URL("../dist/work/index.html", import.meta.url)), "utf8");

describe("work index", () => {
  it("lists every project", () => {
    const doc = html();
    for (const project of projects) expect(doc).toContain(project.title);
  });

  it("offers a filter per domain in use, plus All", () => {
    const doc = html();
    const radios = doc.match(/<input[^>]*type="radio"[^>]*>/g) ?? [];
    expect(radios).toHaveLength(domainsInUse().length + 1);
  });

  it("keeps the radios focusable rather than display none", () => {
    expect(html()).not.toMatch(/type="radio"[^>]*style="[^"]*display:\s*none/);
  });

  it("tags every row with its domain so CSS can filter it", () => {
    const doc = html();
    // Match the row ELEMENTS, not every occurrence of the string. Counting raw
    // substrings also catches the attribute selectors inside the injected
    // <style> block, which made this assertion depend on whether that CSS
    // happened to use single or double quotes.
    const rows = doc.match(/<a[^>]*\sdata-domain="[a-z]+"[^>]*>/g) ?? [];
    expect(rows).toHaveLength(projects.length);
  });

  it("carries exactly one h1, so the page outline does not start at h2", () => {
    expect(html().match(/<h1\b/g) ?? []).toHaveLength(1);
  });

  it("states the count from the data", () => {
    expect(html()).toContain(`${projects.length} projects`);
  });

  it("ships no literal em or en dash", () => {
    expect(/[\u2013\u2014]/.test(html())).toBe(false);
  });
});
