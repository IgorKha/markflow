<template>
  <div :class="containerClass" role="group" aria-label="Select view mode">
    <button
      :class="buttonClass('editor')"
      :aria-pressed="viewMode === 'editor'"
      title="Editor only"
      @click="emit('change', 'editor')"
    >
      Editor
    </button>
    <button
      :class="buttonClass('split')"
      :aria-pressed="viewMode === 'split'"
      title="Split view"
      @click="emit('change', 'split')"
    >
      Split
    </button>
    <button
      :class="buttonClass('preview')"
      :aria-pressed="viewMode === 'preview'"
      title="Preview only"
      @click="emit('change', 'preview')"
    >
      Preview
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ViewMode } from "../../types/ui";

interface Props {
  viewMode?: ViewMode;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: "split",
  compact: false,
});

const emit = defineEmits<{
  change: [mode: ViewMode];
}>();

const containerClass = computed(() =>
  props.compact
    ? "mt-2 grid grid-cols-3 gap-1 bg-btn-hover rounded-lg p-0.5"
    : "flex bg-btn-hover rounded-lg p-0.5",
);

function buttonClass(mode: ViewMode): string[] {
  const baseClass = props.compact
    ? "inline-flex items-center justify-center min-h-11 px-2 border-0 rounded-md cursor-pointer text-[0.78rem] font-medium leading-none transition-[background-color,color,box-shadow] duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
    : "inline-flex items-center py-1 px-2.5 border-0 rounded-md cursor-pointer text-[0.78rem] font-medium leading-none transition-[background-color,color,box-shadow] duration-120 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

  const activeClass =
    props.viewMode === mode
      ? "bg-surface text-fg font-semibold shadow-sm"
      : "bg-transparent text-muted hover:text-fg";

  return [baseClass, activeClass];
}
</script>
