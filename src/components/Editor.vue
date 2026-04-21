<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import loader from "@monaco-editor/loader";

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
let monaco = null;

onMounted(async () => {
  loader.config({
    paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" },
  });

  monaco = await loader.init();

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
    if (monaco && editor) {
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
