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
      @change-view-mode="onViewModeChange"
      @toggle-split-scroll="onToggleSplitScroll"
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
        :aria-valuemin="minSplitRatio"
        :aria-valuemax="maxSplitRatio"
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
import { defineAsyncComponent, ref } from "vue";
import Toolbar from "./components/Toolbar.vue";
const Editor = defineAsyncComponent(() => import("./components/Editor.vue"));
const Preview = defineAsyncComponent(() => import("./components/Preview.vue"));
import { useMarkdownSource } from "./composables/useMarkdownSource.js";
import { useShareActions } from "./composables/useShareActions.js";
import { useSplitLayout } from "./composables/useSplitLayout.js";
import { useSplitScrollSync } from "./composables/useSplitScrollSync.js";
import { useTheme } from "./composables/useTheme.js";
import { exportPDF, exportHTML, exportMarkdown } from "./utils/export.js";

const editorRef = ref(null);
const previewRef = ref(null);
const { theme, toggleTheme } = useTheme();
const { markdownSource } = useMarkdownSource();
const { shareCopied, onShare } = useShareActions(markdownSource);

const {
  viewMode,
  splitScrollEnabled,
  splitContainerRef,
  isWideLayout,
  splitRatio,
  editorPaneStyle,
  previewPaneStyle,
  splitterOrientation,
  onSplitterPointerDown,
  onSplitterKeydown,
  minSplitRatio,
  maxSplitRatio,
} = useSplitLayout();

useSplitScrollSync({
  splitScrollEnabled,
  viewMode,
  editorRef,
  previewRef,
});

function onViewModeChange(nextMode) {
  viewMode.value = nextMode;
}

function onToggleSplitScroll() {
  splitScrollEnabled.value = !splitScrollEnabled.value;
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
