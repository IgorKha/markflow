<template>
  <div class="app" :data-theme="theme">
    <Toolbar
      :theme="theme"
      :view-mode="viewMode"
      :split-scroll-enabled="splitScrollEnabled"
      :split-scroll-available="viewMode === 'split'"
      :share-copied="shareCopied"
      @toggle-theme="toggleTheme"
      @change-view-mode="viewMode = $event"
      @toggle-split-scroll="splitScrollEnabled = !splitScrollEnabled"
      @export-md="onExportMd"
      @export-html="onExportHtml"
      @export-pdf="onExportPdf"
      @share="onShare"
    />

    <main class="workspace">
      <div v-if="viewMode !== 'preview'" class="pane pane--editor">
        <Editor ref="editorRef" v-model="markdownSource" :theme="theme" />
      </div>
      <div v-if="viewMode === 'split'" class="pane-divider" />
      <div v-if="viewMode !== 'editor'" class="pane pane--preview">
        <Preview ref="previewRef" :markdown="markdownSource" :theme="theme" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent, onMounted, watch, watchEffect } from "vue";
import Toolbar from "./components/Toolbar.vue";
const Editor = defineAsyncComponent(() => import("./components/Editor.vue"));
const Preview = defineAsyncComponent(() => import("./components/Preview.vue"));
import { exportPDF, exportHTML, exportMarkdown } from "./utils/export.js";
import { buildShareUrl, readSharedContent } from "./utils/share.js";

const viewMode = ref("split");
const splitScrollEnabled = ref(false);
const editorRef = ref(null);
const previewRef = ref(null);

let isSyncingScroll = false;

watchEffect((onCleanup) => {
  if (
    !splitScrollEnabled.value ||
    viewMode.value !== "split" ||
    !editorRef.value ||
    !previewRef.value
  ) {
    return;
  }

  const releaseSyncLock = () => {
    requestAnimationFrame(() => {
      isSyncingScroll = false;
    });
  };

  const syncToPreview = (ratio) => {
    if (isSyncingScroll) return;
    isSyncingScroll = true;
    previewRef.value?.setScrollRatio(ratio);
    releaseSyncLock();
  };

  const syncToEditor = (ratio) => {
    if (isSyncingScroll) return;
    isSyncingScroll = true;
    editorRef.value?.setScrollRatio(ratio);
    releaseSyncLock();
  };

  syncToPreview(editorRef.value.getScrollRatio());

  const stopEditorScroll = editorRef.value.onScrollChange(syncToPreview);
  const stopPreviewScroll = previewRef.value.onScrollChange(syncToEditor);

  onCleanup(() => {
    stopEditorScroll?.();
    stopPreviewScroll?.();
    isSyncingScroll = false;
  });
});

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

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback to legacy copy path below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}

async function onShare() {
  try {
    const url = await buildShareUrl(markdownSource.value);
    const copied = await copyText(url);
    if (!copied) {
      window.prompt("Copy this link:", url);
      return;
    }

    shareCopied.value = true;
    setTimeout(() => {
      shareCopied.value = false;
    }, 2000);
  } catch (err) {
    console.warn("Share failed:", err);
  }
}

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
