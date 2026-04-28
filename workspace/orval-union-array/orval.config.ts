import { defineConfig } from "orval";

export default defineConfig({
  repro: {
    input: {
      target: "./openapi.yaml",
    },
    output: {
      target: "./generated/repro.ts",
      client: "fetch",
      formatter: "oxfmt",
    },
  },
});
