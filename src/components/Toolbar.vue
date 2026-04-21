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
          width="16"
          height="16"
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
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': viewMode === 'editor' }"
          title="Editor only"
          @click="emit('change-view-mode', 'editor')"
        >
          Editor
        </button>
        <button
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': viewMode === 'split' }"
          title="Split view"
          @click="emit('change-view-mode', 'split')"
        >
          Split
        </button>
        <button
          class="view-toggle__btn"
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
        Sync
      </button>

      <div class="toolbar__divider" aria-hidden="true" />

      <button
        class="btn"
        title="Save as Markdown (.md)"
        @click="emit('export-md')"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        MD
      </button>

      <button class="btn" title="Export as HTML" @click="emit('export-html')">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        HTML
      </button>

      <button
        class="btn btn--primary"
        title="Export as PDF"
        @click="emit('export-pdf')"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        PDF
      </button>

      <div class="toolbar__divider" aria-hidden="true" />

      <button
        class="btn btn--share"
        title="Copy shareable link"
        @click="emit('share')"
      >
        <svg
          v-if="!shareCopied"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          />
          <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          />
        </svg>
        <svg
          v-else
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {{ shareCopied ? "Copied" : "Share" }}
      </button>

      <div class="toolbar__divider" aria-hidden="true" />

      <button
        class="btn btn--icon"
        :title="themeLabel"
        @click="emit('toggle-theme')"
      >
        <!-- Sun: shown in dark mode to switch to light -->
        <svg
          v-if="theme === 'dark'"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
        <!-- Moon: shown in light mode to switch to dark -->
        <svg
          v-else
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
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
  gap: 8px;
}

.toolbar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.toolbar__logo {
  width: 24px;
  height: 24px;
}

.toolbar__title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
  letter-spacing: -0.01em;
}

.toolbar__version {
  font-size: 0.7rem;
  color: var(--text-muted);
  align-self: center;
}

.toolbar__github {
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition: color 0.15s;
  text-decoration: none;
}

.toolbar__github:hover {
  color: var(--text);
}

.toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar__divider {
  width: 1px;
  height: 18px;
  background: var(--border);
  flex-shrink: 0;
  margin: 0 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  background: var(--btn-bg);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: inherit;
  transition:
    background 0.12s,
    color 0.12s;
  white-space: nowrap;
}

.btn:hover {
  background: var(--btn-hover-bg);
  color: var(--text);
}

.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.btn--active {
  background: var(--btn-hover-bg);
  color: var(--text);
}

.btn--icon {
  padding: 5px 8px;
  color: var(--text-muted);
}

.btn--icon:hover {
  color: var(--text);
}

.btn--primary {
  background: var(--accent);
  color: var(--accent-text);
}

.btn--primary:hover {
  background: var(--accent-hover);
  color: var(--accent-text);
}

/* View toggle — segmented control */
.view-toggle {
  display: flex;
  background: var(--btn-hover-bg);
  border-radius: 8px;
  padding: 2px;
  gap: 0;
}

.view-toggle__btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 500;
  font-family: inherit;
  transition:
    background 0.12s,
    color 0.12s,
    box-shadow 0.12s;
}

.view-toggle__btn:hover {
  color: var(--text);
}

.view-toggle__btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.view-toggle__btn--active {
  background: var(--surface);
  color: var(--text);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn--share {
  min-width: 76px;
  justify-content: center;
}
</style>
