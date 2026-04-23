<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import type { TocItem } from "../../composables/useToc";
import type { Theme } from "../../types/ui";
import TocTreeNode from "./TocTreeNode.vue";

interface Props {
  open: boolean;
  items: TocItem[];
  activeId?: string;
  theme?: Theme;
}

const props = withDefaults(defineProps<Props>(), {
  activeId: "",
  theme: "light",
});

const emit = defineEmits<{
  close: [];
  navigate: [id: string];
}>();

const drawerRef = ref<HTMLElement | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);

// ── Focus trap ───────────────────────────────────────────────────────────────
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function trapFocus(e: KeyboardEvent): void {
  if (!drawerRef.value) return;
  const focusable = Array.from(
    drawerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE),
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.key === "Tab") {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    emit("close");
  }
  trapFocus(e);
}

// ── Lifecycle: focus management & keyboard listeners ─────────────────────────
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener("keydown", onKeydown);
      // Move focus into drawer after transition starts
      setTimeout(() => closeButtonRef.value?.focus(), 50);
    } else {
      document.removeEventListener("keydown", onKeydown);
    }
  },
);

onMounted(() => {
  if (props.open) document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="toc-backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer panel -->
    <Transition name="toc-drawer">
      <aside
        v-if="open"
        ref="drawerRef"
        :data-theme="theme"
        class="fixed right-0 top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-surface border-l border-border shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Table of contents"
      >
        <!-- Header -->
        <div
          class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <!-- TOC icon -->
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              class="text-muted shrink-0"
            >
              <line x1="3" y1="6" x2="10" y2="6" />
              <line x1="3" y1="12" x2="16" y2="12" />
              <line x1="3" y1="18" x2="13" y2="18" />
              <polyline points="20 9 17 12 20 15" />
            </svg>
            <h2 class="text-sm font-semibold text-fg">Content</h2>
          </div>

          <button
            ref="closeButtonRef"
            class="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-120 hover:bg-btn-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
            aria-label="Close table of contents"
            @click="emit('close')"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-if="items.length === 0"
          class="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            class="text-muted/50"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p class="text-xs text-muted">No headings found</p>
          <p class="text-[0.7rem] text-muted/70 leading-relaxed">
            Add headings (# H1, ## H2…) to your document to see them here.
          </p>
        </div>

        <!-- TOC tree -->
        <nav
          v-else
          class="flex-1 overflow-y-auto px-2 py-2"
          aria-label="Document headings"
        >
          <ul class="list-none m-0 p-0">
            <TocTreeNode
              v-for="item in items"
              :key="item.id"
              :item="item"
              :active-id="activeId"
              :depth="0"
              @navigate="
                (id) => {
                  emit('navigate', id);
                  emit('close');
                }
              "
            />
          </ul>
        </nav>

        <!-- Footer hint -->
        <div
          class="shrink-0 border-t border-border px-4 py-2 text-[0.68rem] text-muted/60 select-none"
        >
          Press
          <kbd class="rounded bg-btn-hover px-1 py-0.5 font-mono text-[0.65rem]"
            >Esc</kbd
          >
          to close
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toc-drawer-enter-active,
.toc-drawer-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.toc-drawer-enter-from,
.toc-drawer-leave-to {
  transform: translateX(100%);
}

.toc-backdrop-enter-active,
.toc-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.toc-backdrop-enter-from,
.toc-backdrop-leave-to {
  opacity: 0;
}
</style>
