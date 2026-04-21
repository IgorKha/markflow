<template>
  <div class="app" :data-theme="theme">
    <Toolbar
      :theme="theme"
      :view-mode="viewMode"
      :share-copied="shareCopied"
      @toggle-theme="toggleTheme"
      @change-view-mode="viewMode = $event"
      @export-md="onExportMd"
      @export-html="onExportHtml"
      @export-pdf="onExportPdf"
      @share="onShare"
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
import { ref, defineAsyncComponent, onMounted } from "vue";
import Toolbar from "./components/Toolbar.vue";
const Editor = defineAsyncComponent(() => import("./components/Editor.vue"));
const Preview = defineAsyncComponent(() => import("./components/Preview.vue"));
import { exportPDF, exportHTML, exportMarkdown } from "./utils/export.js";
import { buildShareUrl, readSharedContent } from "./utils/share.js";

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

## Alerts


> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

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

onMounted(async () => {
  const shared = await readSharedContent();
  if (shared !== null) {
    markdownSource.value = shared;
    history.replaceState(null, "", location.pathname);
  }
});

const shareCopied = ref(false);

async function onShare() {
  const url = await buildShareUrl(markdownSource.value);
  await navigator.clipboard.writeText(url);
  shareCopied.value = true;
  setTimeout(() => {
    shareCopied.value = false;
  }, 2000);
}

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
