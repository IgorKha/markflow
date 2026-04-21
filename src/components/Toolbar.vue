<template>
  <header class="toolbar">
    <div class="toolbar__brand">
      <img :src="`${base}favicon.svg`" alt="MarkFlow" class="toolbar__logo" />
      <span class="toolbar__title">MarkFlow</span>
    </div>

    <div class="toolbar__actions">
      <div class="view-toggle" role="group" aria-label="View mode">
        <button
          class="btn view-toggle__btn"
          :class="{ 'view-toggle__btn--active': viewMode === 'editor' }"
          title="Editor only"
          @click="emit('change-view-mode', 'editor')"
        >
          Editor
        </button>
        <button
          class="btn view-toggle__btn"
          :class="{ 'view-toggle__btn--active': viewMode === 'split' }"
          title="Split view"
          @click="emit('change-view-mode', 'split')"
        >
          Split
        </button>
        <button
          class="btn view-toggle__btn"
          :class="{ 'view-toggle__btn--active': viewMode === 'preview' }"
          title="Preview only"
          @click="emit('change-view-mode', 'preview')"
        >
          Preview
        </button>
      </div>

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
  viewMode: {
    type: String,
    default: "split",
  },
});

const emit = defineEmits([
  "toggle-theme",
  "change-view-mode",
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

.view-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  gap: 0;
}

.view-toggle__btn {
  border: none;
  border-radius: 0;
  padding: 6px 10px;
}

.view-toggle__btn + .view-toggle__btn {
  border-left: 1px solid var(--border);
}

.view-toggle__btn--active {
  background: var(--btn-hover-bg);
  color: var(--text);
  font-weight: 700;
}
</style>
