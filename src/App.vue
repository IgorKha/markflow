<template>
  <div class="app" :data-theme="theme">
    <Toolbar
      :theme="theme"
      :view-mode="viewMode"
      @toggle-theme="toggleTheme"
      @change-view-mode="viewMode = $event"
      @export-md="onExportMd"
      @export-html="onExportHtml"
      @export-pdf="onExportPdf"
    />

    <main class="workspace">
      <div v-if="viewMode !== 'preview'" class="pane pane--editor">
        <Editor v-model="markdownSource" :theme="theme" />
      </div>
      <div v-if="viewMode === 'split'" class="pane-divider" />
      <div v-if="viewMode !== 'editor'" class="pane pane--preview">
        <Preview ref="previewRef" :markdown="markdownSource" :theme="theme" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from "vue";
import Toolbar from "./components/Toolbar.vue";
const Editor = defineAsyncComponent(() => import("./components/Editor.vue"));
const Preview = defineAsyncComponent(() => import("./components/Preview.vue"));
import { exportPDF, exportHTML, exportMarkdown } from "./utils/export.js";

const viewMode = ref("split");

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const theme = ref(prefersDark ? "dark" : "light");

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
}

const STORAGE_KEY = "markflow_content";

const DEFAULT_CONTENT = `# Welcome to MarkFlow

A live Markdown editor with **GFM**, LaTeX math, Mermaid diagrams, and code highlighting.

---

## Math (KaTeX)

Inline: $E = mc^2$

Block:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

## Code

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`
console.log(greet('MarkFlow'))
\`\`\`

## Mermaid Diagram

\`\`\`mermaid
flowchart LR
  A[Write Markdown] --> B{Preview}
  B --> C[Export PDF]
  B --> D[Export HTML]
\`\`\`

## GFM Tables

| Feature       | Status |
|---------------|--------|
| GFM           | ✅     |
| LaTeX / KaTeX | ✅     |
| Mermaid       | ✅     |
| PDF Export    | ✅     |
| HTML Export   | ✅     |
| Dark Mode     | ✅     |

## Task List

- [x] Set up project
- [x] Markdown pipeline
- [ ] Deploy to GitHub Pages
`;

const markdownSource = ref(
  localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CONTENT,
);

import { watch } from "vue";
watch(markdownSource, (val) => {
  localStorage.setItem(STORAGE_KEY, val);
});

const previewRef = ref(null);

async function onExportPdf() {
  const el = previewRef.value?.previewEl;
  if (!el) return;
  await exportPDF(el, "markflow-export");
}

function onExportMd() {
  exportMarkdown(markdownSource.value, "markflow-export");
}

async function onExportHtml() {
  const el = previewRef.value?.previewEl;
  if (!el) return;
  await exportHTML(el.innerHTML, "markflow-export");
}
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
}

.workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.pane {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.pane-divider {
  width: 1px;
  background: var(--border);
  flex-shrink: 0;
}
</style>
