import { describe, expect, it } from "vitest";

describe("workspace", () => {
  it("runs vitest on Node 22 or newer", () => {
    const major = Number(process.versions.node.split(".")[0]);
    expect(major).toBeGreaterThanOrEqual(22);
  });
});
