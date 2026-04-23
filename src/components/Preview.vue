<template>
  <div
    ref="previewContainer"
    class="w-full h-full overflow-y-auto px-4 py-6 sm:px-10 sm:py-12 markdown-body text-fg justify-center flex"
  >
    <div
      ref="previewEl"
      class="preview-content max-w-198.5 mx-auto bg-transparent text-fg markdown-body"
      v-html="renderedHtml"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import DOMPurify from "dompurify";
import { renderMarkdown } from "../utils/markdown.js";
import { createScrollBridge } from "../utils/scrollBridge.js";
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
const previewContainer = ref(null);
const renderedHtml = ref("");
let renderToken = 0;

const SANITIZE_OPTIONS = {
  USE_PROFILES: { html: true, svg: true, mathMl: true },
};

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
  const currentToken = ++renderToken;
  const html = await renderMarkdown(props.markdown);
  const sanitizedHtml = DOMPurify.sanitize(html, SANITIZE_OPTIONS);

  if (currentToken !== renderToken) return;

  if (renderedHtml.value === sanitizedHtml) {
    renderedHtml.value = "";
    await nextTick();
    if (currentToken !== renderToken) return;
  }

  renderedHtml.value = sanitizedHtml;
  await nextTick();

  if (currentToken !== renderToken) return;

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
      if (currentToken !== renderToken) return;

      const container = document.createElement("div");
      container.className =
        "flex justify-center my-6 [&_svg]:max-w-full [&_svg]:h-auto";
      container.innerHTML = svg;
      if (pre?.isConnected) {
        pre.replaceWith(container);
      }
    } catch (err) {
      console.warn("Mermaid render error:", err);
    }
  }
}

const scrollBridge = createScrollBridge({
  getMetrics: () => {
    const container = previewContainer.value;
    if (!container) {
      return null;
    }

    return {
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
      viewportSize: container.clientHeight,
    };
  },
  setScrollTop: (nextScrollTop) => {
    const container = previewContainer.value;
    if (!container) {
      return;
    }

    container.scrollTop = nextScrollTop;
  },
  subscribe: (handler) => {
    const container = previewContainer.value;
    if (!container) {
      return () => {};
    }

    container.addEventListener("scroll", handler, { passive: true });
    return () => {
      container.removeEventListener("scroll", handler);
    };
  },
});

const { getScrollRatio, setScrollRatio, onScrollChange } = scrollBridge;

defineExpose({
  previewEl,
  getScrollRatio,
  setScrollRatio,
  onScrollChange,
});
</script>
