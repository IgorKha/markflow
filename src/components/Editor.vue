<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

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
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
}
</style>
