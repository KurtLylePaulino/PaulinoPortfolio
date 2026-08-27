import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/test/**/*.test.ts", "sites/**/test/**/*.test.ts"],
    environment: "node",
  },
});
