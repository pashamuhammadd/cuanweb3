import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Uji LIVE terhadap sumber asli (butuh internet). Jalankan: pnpm test:live */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/live/**/*.live.ts"],
    testTimeout: 60_000,
  },
});
