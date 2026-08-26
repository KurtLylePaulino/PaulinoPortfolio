import { describe, expect, it } from "vitest";
import { EM_DASH_MESSAGE, httpUrl, prose, properName, slug } from "../src/primitives.js";

describe("prose", () => {
  it("accepts ordinary copy", () => {
    expect(prose.parse("A melanoma classifier at 90% accuracy.")).toBe(
      "A melanoma classifier at 90% accuracy.",
    );
  });

  it("rejects an em dash", () => {
    const result = prose.safeParse("Lead author \u2014 owned the balancing.");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(EM_DASH_MESSAGE);
    }
  });

  it("rejects an en dash", () => {
    expect(prose.safeParse("2024\u20132026").success).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(prose.safeParse("").success).toBe(false);
  });

  it("allows a plain hyphen", () => {
    expect(prose.parse("2024-2026")).toBe("2024-2026");
  });
});

describe("httpUrl", () => {
  it("accepts an absolute https URL", () => {
    expect(httpUrl.parse("https://example.com/a")).toBe("https://example.com/a");
  });

  it("rejects a relative path", () => {
    expect(httpUrl.safeParse("/assets/img/a.webp").success).toBe(false);
  });
});

describe("slug", () => {
  it("accepts a kebab-case id", () => {
    expect(slug.parse("circuit-breakers")).toBe("circuit-breakers");
  });

  it("rejects uppercase and spaces", () => {
    expect(slug.safeParse("Circuit Breakers").success).toBe(false);
  });
});

describe("properName", () => {
  it("accepts an ordinary title", () => {
    expect(properName.parse("Gutter Pulse")).toBe("Gutter Pulse");
  });

  it("permits an em dash, because artists style their own titles", () => {
    const title = "PANDÆMONIUM \u2014 BE NOT AFRAID";
    expect(properName.parse(title)).toBe(title);
  });

  it("permits a middle dot", () => {
    expect(properName.parse("darkwave · pulse")).toBe("darkwave · pulse");
  });

  it("rejects an empty string", () => {
    expect(properName.safeParse("").success).toBe(false);
  });
});
