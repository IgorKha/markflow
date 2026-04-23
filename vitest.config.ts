import { fileURLToPath } from "node:url";
import type { UserConfig as ViteUserConfig } from "vite";
import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

const baseConfig = viteConfig as ViteUserConfig;

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "json-summary"],
        reportsDirectory: "./coverage",
        include: ["src/**/*.{ts,vue}"],
        exclude: ["src/**/*.d.ts", "src/**/__tests__/**"],
      },
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
    },
  }),
);
