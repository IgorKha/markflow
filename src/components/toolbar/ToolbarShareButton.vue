<template>
  <button
    :class="buttonClass"
    title="Copy shareable link"
    :aria-label="ariaLabel"
    @click="emit('action')"
  >
    <svg
      v-if="!compact && !copied"
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>

    <svg
      v-if="!compact && copied"
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

    <span :class="labelClass">{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  copied: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["action"]);

const buttonClass = computed(() => {
  const compactClass =
    "inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-lg bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

  const regularClass =
    "inline-flex items-center justify-center min-w-19 gap-1.25 py-1.25 px-2.5 border-0 rounded-md bg-transparent text-muted cursor-pointer text-[0.8rem] font-medium whitespace-nowrap leading-none transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

  return props.compact ? compactClass : regularClass;
});

const ariaLabel = computed(() =>
  props.copied ? "Link copied to clipboard" : "Copy shareable link",
);

const label = computed(() => {
  if (props.copied) {
    return "Copied";
  }

  return props.compact ? "Share link" : "Share";
});

const labelClass = computed(() => (props.compact ? "" : "hidden sm:inline"));
</script>
