<template>
  <header class="toolbar">
    <div class="toolbar__brand">
      <img :src="`${base}favicon.svg`" alt="MarkFlow" class="toolbar__logo" />
      <span class="toolbar__title">MarkFlow</span>
      <span class="toolbar__version">v{{ version }}</span>
      <a
        class="toolbar__github"
        href="https://github.com/IgorKha/markflow"
        target="_blank"
        rel="noopener noreferrer"
        title="View on GitHub"
        aria-label="View on GitHub"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
      </a>
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
        class="btn"
        :class="{ 'btn--active': splitScrollEnabled }"
        :disabled="!splitScrollAvailable"
        :title="splitScrollLabel"
        @click="emit('toggle-split-scroll')"
      >
        Sync Scroll
      </button>
      |
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
      |
      <button
        class="btn btn--share"
        title="Copy shareable link"
        @click="emit('share')"
      >
        {{ shareCopied ? "✓ Copied!" : "⤴ Share" }}
      </button>

      <button
        class="btn btn--icon"
        :title="themeLabel"
        @click="emit('toggle-theme')"
      >
        <span v-if="theme === 'dark'">☀️</span>
        <span v-else>🌙</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";

const base = import.meta.env.BASE_URL;
const version = __APP_VERSION__;

const props = defineProps({
  theme: {
    type: String,
    default: "light",
  },
  viewMode: {
    type: String,
    default: "split",
  },
  splitScrollEnabled: {
    type: Boolean,
    default: false,
  },
  splitScrollAvailable: {
    type: Boolean,
    default: false,
  },
  shareCopied: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "toggle-theme",
  "change-view-mode",
  "toggle-split-scroll",
  "export-md",
  "export-html",
  "export-pdf",
  "share",
]);

const themeLabel = computed(() =>
  props.theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
);

const splitScrollLabel = computed(() => {
  if (!props.splitScrollAvailable) {
    return "Available only in split view";
  }

  return props.splitScrollEnabled
    ? "Disable split scroll sync"
    : "Enable split scroll sync";
});
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

.toolbar__version {
  font-size: 0.75rem;
  color: var(--text-muted, #888);
  opacity: 0.7;
  align-self: center;
}

.toolbar__github {
  display: flex;
  align-items: center;
  color: var(--text);
  opacity: 0.6;
  transition: opacity 0.15s;
  text-decoration: none;
}

.toolbar__github:hover {
  opacity: 1;
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

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--active {
  background: var(--btn-hover-bg);
  border-color: var(--text);
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

.btn--share {
  background: var(--btn-bg);
  border-color: var(--border);
  min-width: 84px;
  transition:
    background 0.15s,
    color 0.15s;
}

.btn--share:hover {
  background: var(--btn-hover-bg);
}
</style>
