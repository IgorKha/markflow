<template>
  <button
    :class="buttonClass"
    :title="title"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @click="emit('action')"
  >
    <svg
      v-if="!compact"
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
    <span :class="labelClass">{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  ariaLabel: {
    type: String,
    required: true,
  },
  accent: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["action"]);

const buttonClass = computed(() => {
  const baseClass = props.compact
    ? "inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-lg cursor-pointer text-[0.8rem] font-medium leading-none transition-colors duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-[0.38] disabled:cursor-not-allowed disabled:pointer-events-none"
    : "inline-flex items-center gap-1.25 py-1.25 px-2.5 border-0 rounded-md cursor-pointer text-[0.8rem] font-medium whitespace-nowrap leading-none transition-colors duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-[0.38] disabled:cursor-not-allowed disabled:pointer-events-none";

  const toneClass = props.accent
    ? "bg-accent text-accent-fg hover:bg-accent-hover hover:text-accent-fg"
    : "bg-transparent text-muted hover:bg-btn-hover hover:text-fg";

  return [baseClass, toneClass];
});

const labelClass = computed(() => (props.compact ? "" : "hidden sm:inline"));
</script>
