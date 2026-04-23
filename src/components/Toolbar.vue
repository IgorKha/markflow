<template>
  <!-- Screen-reader live region for clipboard feedback -->
  <span class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {{ shareCopied ? "Link copied to clipboard" : "" }}
  </span>

  <header
    class="sm:hidden px-3 py-2 bg-toolbar border-b border-border shrink-0"
  >
    <div class="flex items-center justify-between gap-2">
      <ToolbarBrand :base="base" :version="version" compact />

      <div class="flex items-center gap-1 shrink-0">
        <ToolbarThemeButton
          :theme="theme"
          :label="themeLabel"
          compact
          @toggle="emit('toggle-theme')"
        />

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

    <ToolbarViewModeSwitch
      :view-mode="viewMode"
      compact
      @change="emit('change-view-mode', $event)"
    />

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

      <ToolbarExportButton
        label="Markdown"
        title="Save as Markdown (.md)"
        aria-label="Download as Markdown file"
        compact
        @action="runMobileAction('export-md')"
      />

      <ToolbarExportButton
        label="HTML"
        title="Export as HTML"
        aria-label="Export as HTML file"
        compact
        @action="runMobileAction('export-html')"
      />

      <ToolbarExportButton
        label="PDF"
        title="Export as PDF"
        aria-label="Export as PDF file"
        accent
        compact
        @action="runMobileAction('export-pdf')"
      />

      <ToolbarShareButton
        :copied="shareCopied"
        compact
        @action="runMobileAction('share')"
      />
    </div>
  </header>

  <header
    class="hidden sm:flex items-center px-4 gap-x-2 py-0 h-12 bg-toolbar border-b border-border shrink-0"
  >
    <ToolbarBrand :base="base" :version="version" />

    <ToolbarThemeButton
      class="order-last"
      :theme="theme"
      :label="themeLabel"
      @toggle="emit('toggle-theme')"
    />

    <div
      class="flex items-center gap-1 ml-auto"
      role="toolbar"
      aria-label="Editor controls"
    >
      <!-- View mode segmented control -->
      <ToolbarViewModeSwitch
        :view-mode="viewMode"
        @change="emit('change-view-mode', $event)"
      />

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

      <ToolbarExportButton
        label="MD"
        title="Save as Markdown (.md)"
        aria-label="Download as Markdown file"
        @action="emit('export-md')"
      />

      <ToolbarExportButton
        label="HTML"
        title="Export as HTML"
        aria-label="Export as HTML file"
        @action="emit('export-html')"
      />

      <ToolbarExportButton
        label="PDF"
        title="Export as PDF"
        aria-label="Export as PDF file"
        accent
        @action="emit('export-pdf')"
      />

      <div class="w-px h-4.5 bg-border shrink-0 mx-1" aria-hidden="true" />

      <ToolbarShareButton :copied="shareCopied" @action="emit('share')" />

      <div class="w-px h-4.5 bg-border shrink-0 mx-1" aria-hidden="true" />
    </div>
  </header>
</template>

<script setup>
import { computed, shallowRef } from "vue";
import ToolbarBrand from "./toolbar/ToolbarBrand.vue";
import ToolbarExportButton from "./toolbar/ToolbarExportButton.vue";
import ToolbarShareButton from "./toolbar/ToolbarShareButton.vue";
import ToolbarThemeButton from "./toolbar/ToolbarThemeButton.vue";
import ToolbarViewModeSwitch from "./toolbar/ToolbarViewModeSwitch.vue";

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
