<template>
  <div ref="editorContainer" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { createScrollBridge } from "../utils/scrollBridge.js";

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  theme: {
    type: String,
    default: "light",
  },
});

const emit = defineEmits(["update:modelValue"]);

const editorContainer = ref(null);
let editor = null;

const scrollBridge = createScrollBridge({
  getMetrics: () => {
    if (!editor) {
      return null;
    }

    return {
      scrollTop: editor.getScrollTop(),
      scrollHeight: editor.getScrollHeight(),
      viewportSize: editor.getLayoutInfo().height,
    };
  },
  setScrollTop: (nextScrollTop) => {
    if (!editor) {
      return;
    }

    editor.setScrollTop(nextScrollTop);
  },
  subscribe: (handler) => {
    if (!editor) {
      return () => {};
    }

    const disposable = editor.onDidScrollChange(handler);
    return () => {
      disposable.dispose();
    };
  },
});

const { getScrollRatio, setScrollRatio, onScrollChange } = scrollBridge;

onMounted(() => {
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: "markdown",
    theme: props.theme === "dark" ? "vs-dark" : "vs",
    wordWrap: "on",
    minimap: { enabled: false },
    lineNumbers: "on",
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
  });

  editor.onDidChangeModelContent(() => {
    emit("update:modelValue", editor.getValue());
  });
});

watch(
  () => props.theme,
  (newTheme) => {
    if (editor) {
      monaco.editor.setTheme(newTheme === "dark" ? "vs-dark" : "vs");
    }
  },
);

watch(
  () => props.modelValue,
  (newVal) => {
    if (editor && editor.getValue() !== newVal) {
      editor.setValue(newVal);
    }
  },
);

onBeforeUnmount(() => {
  editor?.dispose();
});

defineExpose({
  getScrollRatio,
  setScrollRatio,
  onScrollChange,
});
</script>
