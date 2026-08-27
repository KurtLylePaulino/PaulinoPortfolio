import { describe, expect, it } from "vitest";
import { DOMAINS, domainMeta, domainsInUse, projects } from "../src/index.js";

describe("domain metadata", () => {
  it("covers every domain the schema allows", () => {
    for (const domain of DOMAINS) {
      expect(domainMeta(domain).label.length).toBeGreaterThan(0);
      expect(domainMeta(domain).accent).toMatch(/^var\(--accent-/);
    }
  });

  it("covers every domain actually used by a project", () => {
    for (const domain of domainsInUse()) {
      expect(() => domainMeta(domain)).not.toThrow();
    }
  });

  it("gives each domain a distinct accent", () => {
    const accents = DOMAINS.map((d) => domainMeta(d).accent);
    expect(new Set(accents).size).toBe(accents.length);
  });

  it("throws on an unknown domain rather than guessing", () => {
    // @ts-expect-error deliberately invalid
    expect(() => domainMeta("music")).toThrow();
  });

  it("labels no domain with the raw key", () => {
    for (const domain of DOMAINS) {
      expect(domainMeta(domain).label).not.toBe(domain);
    }
  });
});
