<template>
  <!-- Screen-reader live region for clipboard feedback -->
  <span class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {{ shareCopied ? "Link copied to clipboard" : "" }}
  </span>

  <header
    class="sm:hidden px-3 py-2 bg-toolbar border-b border-border shrink-0"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <img
          :src="`${base}favicon.svg`"
          alt=""
          class="w-6 h-6 shrink-0"
          aria-hidden="true"
        />
        <span
          class="font-semibold text-[0.92rem] text-fg tracking-tight truncate"
          >MarkFlow</span
        >
        <span class="text-[0.68rem] text-muted shrink-0">v{{ version }}</span>
        <a
          class="flex items-center text-muted no-underline transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded-sm"
          href="https://github.com/IgorKha/markflow"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View MarkFlow source code on GitHub (opens in new tab)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </a>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <button
          class="inline-flex items-center justify-center w-11 h-11 rounded-lg border-0 bg-transparent text-muted cursor-pointer transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          :title="themeLabel"
          :aria-label="themeLabel"
          @click="emit('toggle-theme')"
        >
          <svg
            v-if="theme === 'dark'"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            />
          </svg>
          <svg
            v-else
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <button
          class="inline-flex items-center justify-center w-11 h-11 rounded-lg border-0 bg-transparent text-muted cursor-pointer transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          :aria-label="mobileMenuLabel"
          :title="mobileMenuLabel"
          :aria-expanded="mobileActionsOpen"
          aria-controls="mobile-toolbar-actions"
          @click="mobileActionsOpen = !mobileActionsOpen"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <div
      class="mt-2 grid grid-cols-3 gap-1 bg-btn-hover rounded-lg p-0.5"
      role="group"
      aria-label="Select view mode"
    >
      <button
        :class="[
          'inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-md cursor-pointer text-[0.78rem] font-medium leading-none transition-[background-color,color,box-shadow] duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          viewMode === 'editor'
            ? 'bg-surface text-fg font-semibold shadow-sm'
            : 'bg-transparent text-muted hover:text-fg',
        ]"
        :aria-pressed="viewMode === 'editor'"
        title="Editor only"
        @click="emit('change-view-mode', 'editor')"
      >
        Editor
      </button>
      <button
        :class="[
          'inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-md cursor-pointer text-[0.78rem] font-medium leading-none transition-[background-color,color,box-shadow] duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          viewMode === 'split'
            ? 'bg-surface text-fg font-semibold shadow-sm'
            : 'bg-transparent text-muted hover:text-fg',
        ]"
        :aria-pressed="viewMode === 'split'"
        title="Split view"
        @click="emit('change-view-mode', 'split')"
      >
        Split
      </button>
      <button
        :class="[
          'inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-md cursor-pointer text-[0.78rem] font-medium leading-none transition-[background-color,color,box-shadow] duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          viewMode === 'preview'
            ? 'bg-surface text-fg font-semibold shadow-sm'
            : 'bg-transparent text-muted hover:text-fg',
        ]"
        :aria-pressed="viewMode === 'preview'"
        title="Preview only"
        @click="emit('change-view-mode', 'preview')"
      >
        Preview
      </button>
    </div>

    <div
      v-if="mobileActionsOpen"
      id="mobile-toolbar-actions"
      class="mt-2 p-2 rounded-lg border border-border bg-surface grid grid-cols-2 gap-2"
      role="toolbar"
      aria-label="Additional editor controls"
    >
      <button
        :class="[
          'col-span-2 inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-lg cursor-pointer text-[0.8rem] font-medium leading-none transition-colors duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-[0.38] disabled:cursor-not-allowed disabled:pointer-events-none',
          splitScrollEnabled
            ? 'bg-btn-hover text-fg'
            : 'bg-transparent text-muted hover:bg-btn-hover hover:text-fg',
        ]"
        :disabled="!splitScrollAvailable"
        :title="splitScrollLabel"
        :aria-label="splitScrollLabel"
        :aria-pressed="splitScrollEnabled"
        @click="runMobileAction('toggle-split-scroll')"
      >
        Sync scroll
      </button>

      <button
        class="inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-lg bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        title="Save as Markdown (.md)"
        aria-label="Download as Markdown file"
        @click="runMobileAction('export-md')"
      >
        Markdown
      </button>

      <button
        class="inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-lg bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        title="Export as HTML"
        aria-label="Export as HTML file"
        @click="runMobileAction('export-html')"
      >
        HTML
      </button>

      <button
        class="inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-lg bg-accent text-accent-fg cursor-pointer text-[0.8rem] font-medium leading-none transition-colors duration-120 hover:bg-accent-hover hover:text-accent-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        title="Export as PDF"
        aria-label="Export as PDF file"
        @click="runMobileAction('export-pdf')"
      >
        PDF
      </button>

      <button
        class="inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-lg bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        :aria-label="
          shareCopied ? 'Link copied to clipboard' : 'Copy shareable link'
        "
        title="Copy shareable link"
        @click="runMobileAction('share')"
      >
        {{ shareCopied ? "Copied" : "Share link" }}
      </button>
    </div>
  </header>

  <header
    class="hidden sm:flex items-center px-4 gap-x-2 py-0 h-12 bg-toolbar border-b border-border shrink-0"
  >
    <div class="flex items-center gap-2 flex-1 sm:flex-none">
      <img
        :src="`${base}favicon.svg`"
        alt=""
        class="w-6 h-6 shrink-0"
        aria-hidden="true"
      />
      <span
        class="font-semibold text-[0.9rem] text-fg tracking-tight select-none"
        >MarkFlow</span
      >
      <span class="hidden sm:inline text-[0.7rem] text-muted select-none"
        >v{{ version }}</span
      >
      <a
        class="flex items-center text-muted no-underline transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded-sm"
        href="https://github.com/IgorKha/markflow"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View MarkFlow source code on GitHub (opens in new tab)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
      </a>
    </div>

    <button
      class="inline-flex items-center gap-1.25 py-1.25 px-2 border-0 rounded-md bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium whitespace-nowrap leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 order-last"
      :title="themeLabel"
      :aria-label="themeLabel"
      @click="emit('toggle-theme')"
    >
      <!-- Sun: shown in dark mode → switch to light -->
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
        focusable="false"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        />
      </svg>
      <!-- Moon: shown in light mode → switch to dark -->
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
        focusable="false"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>

    <div
      class="flex items-center gap-1 ml-auto"
      role="toolbar"
      aria-label="Editor controls"
    >
      <!-- View mode segmented control -->
      <div
        class="flex bg-btn-hover rounded-lg p-0.5"
        role="group"
        aria-label="Select view mode"
      >
        <button
          :class="[
            'inline-flex items-center py-1 px-2.5 border-0 rounded-md cursor-pointer text-[0.78rem] font-medium leading-none transition-[background-color,color,box-shadow] duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
            viewMode === 'editor'
              ? 'bg-surface text-fg font-semibold shadow-sm'
              : 'bg-transparent text-muted hover:text-fg',
          ]"
          :aria-pressed="viewMode === 'editor'"
          title="Editor only"
          @click="emit('change-view-mode', 'editor')"
        >
          Editor
        </button>
        <button
          :class="[
            'inline-flex items-center py-1 px-2.5 border-0 rounded-md cursor-pointer text-[0.78rem] font-medium leading-none transition-[background-color,color,box-shadow] duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
            viewMode === 'split'
              ? 'bg-surface text-fg font-semibold shadow-sm'
              : 'bg-transparent text-muted hover:text-fg',
          ]"
          :aria-pressed="viewMode === 'split'"
          title="Split view"
          @click="emit('change-view-mode', 'split')"
        >
          Split
        </button>
        <button
          :class="[
            'inline-flex items-center py-1 px-2.5 border-0 rounded-md cursor-pointer text-[0.78rem] font-medium leading-none transition-[background-color,color,box-shadow] duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
            viewMode === 'preview'
              ? 'bg-surface text-fg font-semibold shadow-sm'
              : 'bg-transparent text-muted hover:text-fg',
          ]"
          :aria-pressed="viewMode === 'preview'"
          title="Preview only"
          @click="emit('change-view-mode', 'preview')"
        >
          Preview
        </button>
      </div>

      <button
        :class="[
          'inline-flex items-center gap-1.25 py-1.25 px-2.5 border-0 rounded-md cursor-pointer text-[0.8rem] font-medium whitespace-nowrap leading-none transition-colors duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-[0.38] disabled:cursor-not-allowed disabled:pointer-events-none',
          splitScrollEnabled
            ? 'bg-btn-hover text-fg'
            : 'bg-transparent text-muted hover:bg-btn-hover hover:text-fg',
        ]"
        :disabled="!splitScrollAvailable"
        :title="splitScrollLabel"
        :aria-label="splitScrollLabel"
        :aria-pressed="splitScrollEnabled"
        @click="emit('toggle-split-scroll')"
      >
        Sync
      </button>

      <div class="w-px h-4.5 bg-border shrink-0 mx-1" aria-hidden="true" />

      <button
        class="inline-flex items-center gap-1.25 py-1.25 px-2.5 border-0 rounded-md bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium whitespace-nowrap leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        title="Save as Markdown (.md)"
        aria-label="Download as Markdown file"
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
          focusable="false"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span class="hidden sm:inline">MD</span>
      </button>

      <button
        class="inline-flex items-center gap-1.25 py-1.25 px-2.5 border-0 rounded-md bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium whitespace-nowrap leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        title="Export as HTML"
        aria-label="Export as HTML file"
        @click="emit('export-html')"
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
          focusable="false"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span class="hidden sm:inline">HTML</span>
      </button>

      <button
        class="inline-flex items-center gap-1.25 py-1.25 px-2.5 border-0 rounded-md bg-accent text-accent-fg cursor-pointer text-[0.8rem] font-medium whitespace-nowrap leading-none transition-colors duration-120 hover:bg-accent-hover hover:text-accent-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-[0.38] disabled:cursor-not-allowed disabled:pointer-events-none"
        title="Export as PDF"
        aria-label="Export as PDF file"
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
          focusable="false"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span class="hidden sm:inline">PDF</span>
      </button>

      <div class="w-px h-4.5 bg-border shrink-0 mx-1" aria-hidden="true" />

      <button
        class="inline-flex items-center justify-center min-w-19 gap-1.25 py-1.25 px-2.5 border-0 rounded-md bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium whitespace-nowrap leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        title="Copy shareable link"
        :aria-label="
          shareCopied ? 'Link copied to clipboard' : 'Copy shareable link'
        "
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
          focusable="false"
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
          focusable="false"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span class="hidden sm:inline">{{
          shareCopied ? "Copied" : "Share"
        }}</span>
      </button>

      <div class="w-px h-4.5 bg-border shrink-0 mx-1" aria-hidden="true" />
    </div>
  </header>
</template>

<script setup>
import { computed, shallowRef } from "vue";

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

const mobileActionsOpen = shallowRef(false);

const mobileMenuLabel = computed(() =>
  mobileActionsOpen.value
    ? "Close additional editor actions"
    : "Open additional editor actions",
);

function runMobileAction(action) {
  emit(action);
  mobileActionsOpen.value = false;
}
</script>
