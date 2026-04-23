<template>
  <div :class="containerClass">
    <img
      :src="`${base}favicon.svg`"
      alt=""
      class="w-6 h-6 shrink-0"
      aria-hidden="true"
    />
    <span :class="titleClass">MarkFlow</span>
    <span :class="versionClass">v{{ version }}</span>
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
        <path :d="githubPath" />
      </svg>
    </a>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  base: {
    type: String,
    default: "",
  },
  version: {
    type: [String, Number],
    default: "",
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const githubPath =
  "M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z";

const containerClass = computed(() =>
  props.compact
    ? "flex items-center gap-2 min-w-0"
    : "flex items-center gap-2 flex-1 sm:flex-none",
);

const titleClass = computed(() =>
  props.compact
    ? "font-semibold text-[0.92rem] text-fg tracking-tight truncate"
    : "font-semibold text-[0.9rem] text-fg tracking-tight select-none",
);

const versionClass = computed(() =>
  props.compact
    ? "text-[0.68rem] text-muted shrink-0"
    : "hidden sm:inline text-[0.7rem] text-muted select-none",
);
</script>
