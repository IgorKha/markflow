import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [vue()],
  base: process.env.GITHUB_ACTIONS ? "/markflow/" : "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/monaco-editor")) return "vendor-monaco";
          if (id.includes("node_modules/mermaid")) return "vendor-mermaid";
          if (id.includes("node_modules/katex")) return "vendor-katex";
          if (id.includes("node_modules/highlight.js")) return "vendor-hljs";
          if (id.includes("node_modules/vue")) return "vendor-vue";
        },
      },
    },
  },
});
