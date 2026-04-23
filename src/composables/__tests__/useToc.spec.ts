import { defineComponent, nextTick, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { buildTree, extractText, useToc } from "../useToc";
import type { TocItem } from "../useToc";
import type { PreviewExpose } from "../../types/scroll";

// ── Pure helpers ──────────────────────────────────────────────────────────────

describe("extractText", () => {
  it("extracts plain text node value", () => {
    expect(extractText([{ type: "text", value: "Hello" }])).toBe("Hello");
  });

  it("extracts inline code value", () => {
    expect(extractText([{ type: "inlineCode", value: "foo()" }])).toBe("foo()");
  });

  it("recurses into children", () => {
    expect(
      extractText([
        {
          type: "strong",
          children: [{ type: "text", value: "Bold" }],
        },
      ]),
    ).toBe("Bold");
  });

  it("concatenates multiple nodes", () => {
    expect(
      extractText([
        { type: "text", value: "Hello " },
        { type: "inlineCode", value: "world" },
      ]),
    ).toBe("Hello world");
  });

  it("returns empty string for unknown node types with no children", () => {
    expect(extractText([{ type: "image" }])).toBe("");
  });
});

// ── buildTree ─────────────────────────────────────────────────────────────────

describe("buildTree", () => {
  it("returns empty array for empty input", () => {
    expect(buildTree([])).toEqual([]);
  });

  it("builds a flat list of h1s", () => {
    const flat = [
      { id: "a", text: "A", level: 1 },
      { id: "b", text: "B", level: 1 },
    ];
    const tree = buildTree(flat);
    expect(tree).toHaveLength(2);
    expect(tree[0]!.children).toHaveLength(0);
    expect(tree[1]!.children).toHaveLength(0);
  });

  it("nests h2 under h1", () => {
    const flat = [
      { id: "h1", text: "H1", level: 1 },
      { id: "h2", text: "H2", level: 2 },
    ];
    const tree = buildTree(flat);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.children).toHaveLength(1);
    expect(tree[0]!.children[0]!.id).toBe("h2");
  });

  it("nests h3 under h2 under h1", () => {
    const flat = [
      { id: "h1", text: "H1", level: 1 },
      { id: "h2", text: "H2", level: 2 },
      { id: "h3", text: "H3", level: 3 },
    ];
    const [root] = buildTree(flat);
    expect(root!.children[0]!.children[0]!.id).toBe("h3");
  });

  it("h2 after h2 sibling stays at root level under h1", () => {
    const flat = [
      { id: "h1", text: "H1", level: 1 },
      { id: "h2a", text: "H2a", level: 2 },
      { id: "h2b", text: "H2b", level: 2 },
    ];
    const tree = buildTree(flat);
    expect(tree[0]!.children).toHaveLength(2);
  });

  it("sibling h1 after h2 goes to root", () => {
    const flat = [
      { id: "h1a", text: "H1a", level: 1 },
      { id: "h2", text: "H2", level: 2 },
      { id: "h1b", text: "H1b", level: 1 },
    ];
    const tree = buildTree(flat);
    expect(tree).toHaveLength(2);
    expect(tree[1]!.id).toBe("h1b");
  });

  it("headings starting at h2 without h1 go to root", () => {
    const flat = [
      { id: "h2a", text: "H2a", level: 2 },
      { id: "h2b", text: "H2b", level: 2 },
    ];
    const tree = buildTree(flat);
    expect(tree).toHaveLength(2);
  });
});

// ── useToc composable ─────────────────────────────────────────────────────────

function makePreviewEl(ids: string[]): HTMLDivElement {
  const el = document.createElement("div") as HTMLDivElement;
  for (const id of ids) {
    const h = document.createElement("h2");
    h.id = id;
    el.appendChild(h);
  }
  return el;
}

function makeFakePreviewExpose(previewEl: HTMLDivElement): PreviewExpose {
  return {
    previewEl,
    getScrollRatio: vi.fn(),
    setScrollRatio: vi.fn(),
    onScrollChange: vi.fn().mockReturnValue(() => { }),
  };
}

let observerCallback: IntersectionObserverCallback | null = null;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

function stubIntersectionObserver(): void {
  // Must be a regular function (not arrow) so `new IntersectionObserver(cb)` works
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (this: unknown, cb: IntersectionObserverCallback) {
      observerCallback = cb;
      (this as Record<string, unknown>).observe = mockObserve;
      (this as Record<string, unknown>).disconnect = mockDisconnect;
      (this as Record<string, unknown>).unobserve = vi.fn();
    }),
  );
}

describe("useToc", () => {
  beforeEach(() => {
    observerCallback = null;
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    stubIntersectionObserver();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function buildHarness(markdown: string, enabledInitial = false) {
    const mdRef = ref(markdown);
    const enabledRef = ref(enabledInitial);
    const previewRef = ref<PreviewExpose | null>(null);

    const harness = defineComponent({
      template: "<div />",
      setup() {
        return useToc({ markdown: mdRef, previewRef, enabled: enabledRef });
      },
    });

    const wrapper = mount(harness);
    return { wrapper, mdRef, enabledRef, previewRef };
  }

  it("returns empty tocItems for empty markdown", () => {
    const { wrapper } = buildHarness("   ");
    expect((wrapper.vm as { tocItems: TocItem[] }).tocItems).toEqual([]);
  });

  it("parses h1 and h2 headings into nested tocItems", async () => {
    const { wrapper } = buildHarness("# Hello\n\n## World");
    await nextTick();
    const items = (wrapper.vm as { tocItems: TocItem[] }).tocItems;
    expect(items).toHaveLength(1);
    expect(items[0]!.text).toBe("Hello");
    expect(items[0]!.level).toBe(1);
    expect(items[0]!.children[0]!.text).toBe("World");
  });

  it("generates slug id matching github-slugger", async () => {
    const { wrapper } = buildHarness("## Hello World");
    await nextTick();
    const items = (wrapper.vm as { tocItems: TocItem[] }).tocItems;
    expect(items[0]!.id).toBe("hello-world");
  });

  it("handles inline code in headings", async () => {
    const { wrapper } = buildHarness("## Use `foo()` here");
    await nextTick();
    const items = (wrapper.vm as { tocItems: TocItem[] }).tocItems;
    expect(items[0]!.text).toBe("Use foo() here");
  });

  it("activeId is empty when disabled", async () => {
    const { wrapper } = buildHarness("# A", false);
    await nextTick();
    expect((wrapper.vm as { activeId: string }).activeId).toBe("");
  });

  it("sets up IntersectionObserver when enabled with previewEl", async () => {
    const { enabledRef, previewRef } = buildHarness("# A", false);

    previewRef.value = makeFakePreviewExpose(makePreviewEl(["a"]));
    enabledRef.value = true;
    await nextTick();

    vi.advanceTimersByTime(100);

    expect(IntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalled();
  });

  it("disconnects observer when disabled", async () => {
    const { enabledRef, previewRef } = buildHarness("# A", false);

    previewRef.value = makeFakePreviewExpose(makePreviewEl(["a"]));
    enabledRef.value = true;
    await nextTick();
    vi.advanceTimersByTime(100);

    enabledRef.value = false;
    await nextTick();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("navigateTo scrolls to element and sets activeId", async () => {
    const { wrapper, previewRef } = buildHarness("# Section", true);
    await nextTick();
    vi.advanceTimersByTime(100);

    const heading = document.createElement("h1");
    heading.id = "section";
    const scrollIntoView = vi.fn();
    heading.scrollIntoView = scrollIntoView;

    const previewEl = document.createElement("div") as HTMLDivElement;
    previewEl.appendChild(heading);

    previewRef.value = makeFakePreviewExpose(previewEl);

    (wrapper.vm as { navigateTo: (id: string) => void }).navigateTo("section");

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect((wrapper.vm as { activeId: string }).activeId).toBe("section");
  });

  it("navigateTo does nothing when previewRef is null", () => {
    const { wrapper } = buildHarness("# A", false);
    expect(() =>
      (wrapper.vm as { navigateTo: (id: string) => void }).navigateTo("a"),
    ).not.toThrow();
  });
});
