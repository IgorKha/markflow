import BananaSlug from "github-slugger";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { computed, onUnmounted, ref, watch, type Ref, type ComputedRef } from "vue";
import type { PreviewExpose } from "../types/scroll";

export interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
}

type MdastNode = {
  type: string;
  depth?: number;
  value?: string;
  children?: MdastNode[];
};

export function extractText(nodes: MdastNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text" || node.type === "inlineCode") {
        return node.value ?? "";
      }
      if (node.children) {
        return extractText(node.children);
      }
      return "";
    })
    .join("");
}

export function buildTree(flat: Omit<TocItem, "children">[]): TocItem[] {
  const root: TocItem[] = [];
  const stack: TocItem[] = [];

  for (const item of flat) {
    const node: TocItem = { ...item, children: [] };
    while (stack.length > 0 && (stack[stack.length - 1]?.level ?? 0) >= item.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1]!.children.push(node);
    }
    stack.push(node);
  }

  return root;
}

interface UseTocOptions {
  markdown: Ref<string>;
  previewRef: Ref<PreviewExpose | null>;
  enabled: Ref<boolean>;
}

export function useToc({
  markdown,
  previewRef,
  enabled,
}: UseTocOptions): {
  tocItems: ComputedRef<TocItem[]>;
  activeId: Ref<string>;
  navigateTo: (id: string) => void;
} {
  const activeId = ref<string>("");

  const tocItems = computed<TocItem[]>(() => {
    if (!markdown.value.trim()) return [];

    const ast = unified().use(remarkParse).parse(markdown.value);
    const slugger = new BananaSlug();
    const flat: Omit<TocItem, "children">[] = [];

    for (const node of (ast as { children: MdastNode[] }).children) {
      if (node.type === "heading" && node.depth && node.children) {
        const text = extractText(node.children);
        const id = slugger.slug(text);
        flat.push({ id, text, level: node.depth });
      }
    }

    return buildTree(flat);
  });

  // Scroll spy via IntersectionObserver
  let observer: IntersectionObserver | null = null;

  function setupObserver(): void {
    observer?.disconnect();
    observer = null;

    const previewEl = previewRef.value?.previewEl;
    if (!previewEl || !enabled.value) return;

    const headings = Array.from(
      previewEl.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"),
    );

    if (headings.length === 0) return;

    const visibleHeadings = new Map<string, boolean>();

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (id) {
            visibleHeadings.set(id, entry.isIntersecting);
          }
        }
        // Pick the topmost visible heading
        for (const heading of headings) {
          if (visibleHeadings.get(heading.id)) {
            activeId.value = heading.id;
            return;
          }
        }
      },
      {
        rootMargin: "0px 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const heading of headings) {
      observer.observe(heading);
    }
  }

  // Re-setup observer when enabled or markdown changes (after next tick)
  watch(
    [enabled, tocItems],
    ([isEnabled]) => {
      if (!isEnabled) {
        observer?.disconnect();
        observer = null;
        activeId.value = "";
        return;
      }
      // Wait a tick for Preview to finish re-rendering
      setTimeout(setupObserver, 60);
    },
    { immediate: true },
  );

  onUnmounted(() => {
    observer?.disconnect();
  });

  function navigateTo(id: string): void {
    const previewEl = previewRef.value?.previewEl;
    if (!previewEl) return;
    // CSS.escape may be absent in some environments (e.g. jsdom)
    const escaped =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(id)
        : id.replace(/(["\\#%&'()*+,./:;<=>?@[\]^`{|}~!$])/g, "\\$1");
    const target = previewEl.querySelector<HTMLElement>(`#${escaped}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    activeId.value = id;
  }

  return { tocItems, activeId, navigateTo };
}
