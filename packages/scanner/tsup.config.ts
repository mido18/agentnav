import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs", "iife"],
  globalName: "AgentNavScanner",
  dts: true,
  sourcemap: true,
  clean: true,
  noExternal: ["@agentnav/core"],
  outExtension({ format }) {
    if (format === "esm") return { js: ".mjs" };
    if (format === "cjs") return { js: ".cjs" };
    return { js: ".global.js" };
  }
});
