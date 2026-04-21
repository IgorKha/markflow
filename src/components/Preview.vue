<template>
  <div
    ref="previewEl"
    class="preview-container markdown-body"
    v-html="renderedHtml"
  ></div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import { renderMarkdown } from "../utils/markdown.js";
import mermaid from "mermaid";

import "katex/dist/katex.min.css";

import hljsLightCss from "highlight.js/styles/github.css?inline";
import hljsDarkCss from "highlight.js/styles/github-dark.css?inline";
import mdLightCss from "github-markdown-css/github-markdown-light.css?inline";
import mdDarkCss from "github-markdown-css/github-markdown-dark.css?inline";

const props = defineProps({
  markdown: {
    type: String,
    default: "",
  },
  theme: {
    type: String,
    default: "light",
  },
});

const previewEl = ref(null);
const renderedHtml = ref("");

function setStyleContent(id, lightCss, darkCss) {
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = props.theme === "dark" ? darkCss : lightCss;
}

function applyThemeStylesheets() {
  setStyleContent("hljs-theme", hljsLightCss, hljsDarkCss);
  setStyleContent("markdown-theme", mdLightCss, mdDarkCss);
}

applyThemeStylesheets();

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
});

watch(
  () => props.theme,
  (newTheme) => {
    applyThemeStylesheets();
    mermaid.initialize({
      startOnLoad: false,
      theme: newTheme === "dark" ? "dark" : "default",
    });
    renderAndHighlight();
  },
);

watch(
  () => props.markdown,
  () => renderAndHighlight(),
  { immediate: true },
);

async function renderAndHighlight() {
  const html = await renderMarkdown(props.markdown);

  if (renderedHtml.value === html) {
    renderedHtml.value = "";
    await nextTick();
  }

  renderedHtml.value = html;
  await nextTick();

  if (!previewEl.value) return;

  const mermaidBlocks = previewEl.value.querySelectorAll(
    "code.language-mermaid",
  );
  for (const block of mermaidBlocks) {
    const pre = block.parentElement;
    const definition = block.textContent;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;

    try {
      const { svg } = await mermaid.render(id, definition);
      const container = document.createElement("div");
      container.className = "mermaid-diagram";
      container.innerHTML = svg;
      pre.replaceWith(container);
    } catch (err) {
      console.warn("Mermaid render error:", err);
    }
  }
}

defineExpose({ previewEl });
</script>

<style scoped>
.preview-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 24px 32px;
  box-sizing: border-box;
  background: var(--preview-bg);
  color: var(--text);
}

:deep(.mermaid-diagram) {
  display: flex;
  justify-content: center;
  margin: 1.5em 0;
}

:deep(.mermaid-diagram svg) {
  max-width: 100%;
  height: auto;
}

:deep(.markdown-body) {
  background: transparent;
  color: var(--text);
}
</style>
