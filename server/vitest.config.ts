import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// En local : variables de .env.test. En CI : celles du workflow (parsed = {}).
const parsed = dotenv.config({ path: ".env.test" }).parsed ?? {};

export default defineConfig({
  test: {
    environment: "node",
    env: parsed,
    setupFiles: ["./tests/setup.ts"],
    fileParallelism: false, // les fichiers partagent la même base
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});