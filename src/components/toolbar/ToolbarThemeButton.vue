<template>
  <button
    :class="buttonClass"
    :title="label"
    :aria-label="label"
    @click="emit('toggle')"
  >
    <svg
      v-if="theme === 'dark'"
      :width="iconSize"
      :height="iconSize"
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
      :width="iconSize"
      :height="iconSize"
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
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  theme: {
    type: String,
    default: "light",
  },
  label: {
    type: String,
    default: "Toggle theme",
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle"]);

const buttonClass = computed(() =>
  props.compact
    ? "inline-flex items-center justify-center w-11 h-11 rounded-lg border-0 bg-transparent text-muted cursor-pointer transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
    : "inline-flex items-center gap-1.25 py-1.25 px-2 border-0 rounded-md bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium whitespace-nowrap leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
);

const iconSize = computed(() => (props.compact ? 17 : 15));
</script>
