<script setup lang="ts">
import { shallowRef } from "vue";
import type { TocItem } from "../../composables/useToc";
// Self-import for recursion (Volar resolves this via component name)
import TocTreeNode from "./TocTreeNode.vue";

interface Props {
  item: TocItem;
  activeId: string;
  depth?: number;
}

const props = withDefaults(defineProps<Props>(), { depth: 0 });

const emit = defineEmits<{
  navigate: [id: string];
}>();

const expanded = shallowRef(true);

function toggle(e: Event): void {
  e.stopPropagation();
  expanded.value = !expanded.value;
}
</script>

<template>
  <li>
    <div
      class="group flex items-center gap-1 rounded-md pr-2 transition-colors duration-120"
      :class="[
        item.id === activeId
          ? 'bg-accent/10 text-accent'
          : 'text-muted hover:bg-btn-hover hover:text-fg',
      ]"
      :style="{ paddingLeft: `${depth * 14 + 8}px` }"
    >
      <!-- Expand / collapse toggle -->
      <button
        v-if="item.children.length > 0"
        class="shrink-0 flex items-center justify-center w-4 h-4 rounded transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
        :class="expanded ? 'rotate-90' : ''"
        :aria-expanded="expanded"
        :aria-label="expanded ? 'Collapse' : 'Expand'"
        tabindex="-1"
        @click="toggle"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M3 1.5l4 3.5-4 3.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
      </button>
      <!-- Indent spacer for leaf nodes -->
      <span v-else class="shrink-0 w-4" aria-hidden="true" />

      <!-- Heading link -->
      <button
        class="flex-1 text-left py-1 text-[0.78rem] leading-snug truncate cursor-pointer bg-transparent border-0 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 rounded-sm"
        :class="[
          item.level === 1
            ? 'font-semibold'
            : item.level === 2
              ? 'font-medium'
              : 'font-normal',
          item.id === activeId ? 'text-accent' : '',
        ]"
        :title="item.text"
        @click="emit('navigate', item.id)"
      >
        {{ item.text }}
      </button>
    </div>

    <!-- Children with vertical guide line -->
    <ul
      v-if="item.children.length > 0 && expanded"
      class="list-none m-0 p-0 relative"
    >
      <!-- Vertical guide line aligned to toggle-button center -->
      <span
        class="pointer-events-none absolute top-0 bottom-1 w-px bg-border/50"
        :style="{ left: `${depth * 14 + 16}px` }"
        aria-hidden="true"
      />
      <TocTreeNode
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :active-id="activeId"
        :depth="depth + 1"
        @navigate="emit('navigate', $event)"
      />
    </ul>
  </li>
</template>
