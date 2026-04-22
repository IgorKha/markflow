<template>
  <a
    class="absolute translate-y-[-200%] left-4 top-4 z-9999 px-3.5 py-1.5 rounded-md bg-accent text-accent-fg text-sm font-semibold no-underline transition-transform duration-150 focus:translate-y-0 focus:outline-2 focus:outline-accent-fg focus:outline-offset-2"
    href="#main-content"
    >Skip to main content</a
  >

  <div class="flex flex-col h-screen bg-canvas text-fg" :data-theme="theme">
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

    <main
      id="main-content"
      ref="splitContainerRef"
      class="flex flex-1 overflow-hidden flex-col sm:flex-row"
    >
      <div
        v-if="viewMode !== 'preview'"
        :class="[
          viewMode === 'split' ? 'shrink-0' : 'flex-1',
          'overflow-hidden min-w-0 min-h-0',
        ]"
        :style="editorPaneStyle"
        role="region"
        aria-label="Markdown editor"
      >
        <Editor ref="editorRef" v-model="markdownSource" :theme="theme" />
      </div>
      <div
        v-if="viewMode === 'split'"
        class="group shrink-0 select-none touch-none h-2 w-full sm:h-auto sm:w-2 bg-border/80 hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-accent transition-colors duration-150 cursor-row-resize sm:cursor-col-resize flex items-center justify-center"
        role="separator"
        :aria-orientation="splitterOrientation"
        aria-label="Resize editor and preview"
        :aria-valuemin="MIN_SPLIT_RATIO"
        :aria-valuemax="MAX_SPLIT_RATIO"
        :aria-valuenow="Math.round(splitRatio)"
        tabindex="0"
        @pointerdown="onSplitterPointerDown"
        @keydown="onSplitterKeydown"
      >
        <span
          class="pointer-events-none rounded-md border border-border/80 bg-surface/70 flex items-center justify-center transition-colors duration-150 group-hover:border-accent/60 group-focus-visible:border-accent/70"
          :class="isWideLayout ? 'h-10 w-3.5' : 'h-3.5 w-10'"
          aria-hidden="true"
        >
          <span
            class="rounded-full bg-muted/80 transition-colors duration-150 group-hover:bg-accent/70 group-focus-visible:bg-accent/80"
            :class="isWideLayout ? 'h-6 w-0.5' : 'h-0.5 w-6'"
          />
        </span>
      </div>
      <div
        v-if="viewMode !== 'editor'"
        :class="[
          viewMode === 'split' ? 'shrink-0' : 'flex-1',
          'overflow-hidden min-w-0 min-h-0',
        ]"
        :style="previewPaneStyle"
        role="region"
        aria-label="Markdown preview"
      >
        <Preview ref="previewRef" :markdown="markdownSource" :theme="theme" />
      </div>
    </main>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  onMounted,
  watch,
  watchEffect,
} from "vue";
import Toolbar from "./components/Toolbar.vue";
const Editor = defineAsyncComponent(() => import("./components/Editor.vue"));
const Preview = defineAsyncComponent(() => import("./components/Preview.vue"));
import { exportPDF, exportHTML, exportMarkdown } from "./utils/export.js";
import { buildShareUrl, readSharedContent } from "./utils/share.js";

const STORAGE_KEY = "markflow_content";
const SPLIT_RATIO_STORAGE_KEY = "markflow_split_ratio";
const DEFAULT_SPLIT_RATIO = 50;
const MIN_SPLIT_RATIO = 20;
const MAX_SPLIT_RATIO = 80;
const SPLIT_KEYBOARD_STEP = 2;
const SPLIT_KEYBOARD_STEP_LARGE = 5;

function clampSplitRatio(value) {
  return Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, value));
}

function loadSplitRatio() {
  const raw = Number.parseFloat(localStorage.getItem(SPLIT_RATIO_STORAGE_KEY));
  if (!Number.isFinite(raw)) {
    return DEFAULT_SPLIT_RATIO;
  }

  return clampSplitRatio(raw);
}

const viewMode = ref("split");
const splitScrollEnabled = ref(false);
const editorRef = ref(null);
const previewRef = ref(null);
const splitContainerRef = ref(null);
const viewportMediaQuery = window.matchMedia("(min-width: 640px)");
const isWideLayout = ref(viewportMediaQuery.matches);
const splitRatio = ref(loadSplitRatio());

const editorPaneStyle = computed(() =>
  viewMode.value === "split" ? { flex: `0 0 ${splitRatio.value}%` } : undefined,
);

const previewPaneStyle = computed(() =>
  viewMode.value === "split"
    ? { flex: `1 1 ${100 - splitRatio.value}%` }
    : undefined,
);

const splitterOrientation = computed(() =>
  isWideLayout.value ? "vertical" : "horizontal",
);

let isSyncingScroll = false;
let isDraggingSplitter = false;
let cleanupSplitterDragListeners = null;
let cleanupViewportListener = () => {};
let previousBodyUserSelect = "";
let previousBodyCursor = "";

function setSplitRatio(nextRatio) {
  splitRatio.value = clampSplitRatio(nextRatio);
}

function updateSplitRatioFromPointer(clientX, clientY) {
  const container = splitContainerRef.value;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  if (isWideLayout.value) {
    if (rect.width <= 0) return;
    setSplitRatio(((clientX - rect.left) / rect.width) * 100);
    return;
  }

  if (rect.height <= 0) return;
  setSplitRatio(((clientY - rect.top) / rect.height) * 100);
}

function stopSplitterDrag() {
  if (!isDraggingSplitter && !cleanupSplitterDragListeners) {
    return;
  }

  isDraggingSplitter = false;
  cleanupSplitterDragListeners?.();
  cleanupSplitterDragListeners = null;
  document.body.style.userSelect = previousBodyUserSelect;
  document.body.style.cursor = previousBodyCursor;
}

function onSplitterPointerDown(event) {
  if (event.button !== 0) {
    return;
  }

  event.preventDefault();
  isDraggingSplitter = true;
  updateSplitRatioFromPointer(event.clientX, event.clientY);

  previousBodyUserSelect = document.body.style.userSelect;
  previousBodyCursor = document.body.style.cursor;
  document.body.style.userSelect = "none";
  document.body.style.cursor = isWideLayout.value ? "col-resize" : "row-resize";

  const handlePointerMove = (moveEvent) => {
    if (!isDraggingSplitter) return;
    updateSplitRatioFromPointer(moveEvent.clientX, moveEvent.clientY);
  };

  const handlePointerUp = () => {
    stopSplitterDrag();
  };

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  cleanupSplitterDragListeners = () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };
}

function onSplitterKeydown(event) {
  const step = event.shiftKey ? SPLIT_KEYBOARD_STEP_LARGE : SPLIT_KEYBOARD_STEP;
  let nextRatio = splitRatio.value;

  if (event.key === "Home") {
    nextRatio = MIN_SPLIT_RATIO;
  } else if (event.key === "End") {
    nextRatio = MAX_SPLIT_RATIO;
  } else if (isWideLayout.value) {
    if (event.key === "ArrowLeft") {
      nextRatio -= step;
    } else if (event.key === "ArrowRight") {
      nextRatio += step;
    } else {
      return;
    }
  } else if (event.key === "ArrowUp") {
    nextRatio -= step;
  } else if (event.key === "ArrowDown") {
    nextRatio += step;
  } else {
    return;
  }

  event.preventDefault();
  setSplitRatio(nextRatio);
}

watch(splitRatio, (value) => {
  localStorage.setItem(SPLIT_RATIO_STORAGE_KEY, value.toFixed(2));
});

watch(viewMode, (mode) => {
  if (mode !== "split") {
    stopSplitterDrag();
  }
});

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

const FALLBACK_THEME_COLORS = {
  light: "#f4f4f5",
  dark: "#111113",
};

function getToolbarThemeColor(themeValue) {
  const themedRoot = document.querySelector("[data-theme]");
  const fallback =
    FALLBACK_THEME_COLORS[themeValue] ?? FALLBACK_THEME_COLORS.light;

  if (!themedRoot) {
    return fallback;
  }

  const toolbarBg = getComputedStyle(themedRoot)
    .getPropertyValue("--toolbar-bg")
    .trim();

  return toolbarBg || fallback;
}

function applyThemeColorMeta(themeValue) {
  const color = getToolbarThemeColor(themeValue);
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (!themeColorMeta) {
    themeColorMeta = document.createElement("meta");
    themeColorMeta.setAttribute("name", "theme-color");
    document.head.appendChild(themeColorMeta);
  }

  themeColorMeta.setAttribute("content", color);
  document.documentElement.style.colorScheme = themeValue;
}

watch(
  theme,
  (value) => {
    applyThemeColorMeta(value);
  },
  { immediate: true, flush: "post" },
);

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
}

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
  applyThemeColorMeta(theme.value);

  const handleViewportChange = (event) => {
    isWideLayout.value = event.matches;
  };

  if (viewportMediaQuery.addEventListener) {
    viewportMediaQuery.addEventListener("change", handleViewportChange);
    cleanupViewportListener = () => {
      viewportMediaQuery.removeEventListener("change", handleViewportChange);
    };
  } else {
    viewportMediaQuery.addListener(handleViewportChange);
    cleanupViewportListener = () => {
      viewportMediaQuery.removeListener(handleViewportChange);
    };
  }

  const shared = await readSharedContent();
  if (shared !== null) {
    markdownSource.value = shared;
    history.replaceState(null, "", location.pathname);
  }
});

onBeforeUnmount(() => {
  stopSplitterDrag();
  cleanupViewportListener();
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
