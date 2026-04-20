<template>
  <header class="toolbar">
    <div class="toolbar__brand">
      <img :src="`${base}favicon.svg`" alt="MarkFlow" class="toolbar__logo" />
      <span class="toolbar__title">MarkFlow</span>
    </div>

    <div class="toolbar__actions">
      <button
        class="btn btn--icon"
        :title="themeLabel"
        @click="emit('toggle-theme')"
      >
        <span v-if="theme === 'dark'">☀️</span>
        <span v-else>🌙</span>
      </button>

      <button
        class="btn"
        title="Save as Markdown (.md)"
        @click="emit('export-md')"
      >
        ↓ MD
      </button>

      <button class="btn" title="Export as HTML" @click="emit('export-html')">
        ↓ HTML
      </button>

      <button
        class="btn btn--primary"
        title="Export as PDF"
        @click="emit('export-pdf')"
      >
        ↓ PDF
      </button>
    </div>
  </header>
</template>

<script setup>
const base = import.meta.env.BASE_URL;

const props = defineProps({
  theme: {
    type: String,
    default: "light",
  },
});

const emit = defineEmits([
  "toggle-theme",
  "export-md",
  "export-html",
  "export-pdf",
]);

const themeLabel =
  props.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.toolbar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar__logo {
  width: 28px;
  height: 28px;
}

.toolbar__title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text);
  letter-spacing: 0.02em;
}

.toolbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--btn-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.btn:hover {
  background: var(--btn-hover-bg);
}

.btn--icon {
  padding: 6px 10px;
  font-size: 1rem;
  line-height: 1;
}

.btn--primary {
  background: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.btn--primary:hover {
  background: #0b5ed7;
  border-color: #0b5ed7;
}
</style>
