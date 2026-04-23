import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from 'vite-plugin-vue-devtools'

const { version } = JSON.parse(readFileSync("./package.json", "utf-8")) as {
  version: string;
};

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  base: process.env.GITHUB_ACTIONS ? "/markflow/" : "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/monaco-editor")) return "vendor-monaco";
          if (id.includes("node_modules/mermaid")) return "vendor-mermaid";
          if (id.includes("node_modules/katex")) return "vendor-katex";
          if (id.includes("node_modules/highlight.js")) return "vendor-hljs";
          if (id.includes("node_modules/vue")) return "vendor-vue";
          return undefined;
        },
      },
    },
  },
});
