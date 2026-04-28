import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_SPLIT_RATIO,
  MIN_SPLIT_RATIO,
  SPLIT_SCROLL_ENABLED_STORAGE_KEY,
  SPLIT_KEYBOARD_STEP,
  SPLIT_KEYBOARD_STEP_LARGE,
  SPLIT_RATIO_STORAGE_KEY,
  VIEW_MODE_STORAGE_KEY,
} from "../../constants/editor";
import { useSplitLayout } from "../useSplitLayout";

const Harness = defineComponent({
  template: "<div />",
  setup() {
    return useSplitLayout();
  },
});

interface MockMediaQuery {
  matches: boolean;
  __emit: (nextMatches: boolean) => void;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  addEventListener?: ReturnType<typeof vi.fn>;
  removeEventListener?: ReturnType<typeof vi.fn>;
}

let currentMediaQuery: MockMediaQuery | null = null;

function setupMatchMedia(
  matches = true,
  options?: { legacyOnly?: boolean },
): void {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const addListener = vi.fn((listener: (event: MediaQueryListEvent) => void) => {
    listeners.add(listener);
  });
  const removeListener = vi.fn((listener: (event: MediaQueryListEvent) => void) => {
    listeners.delete(listener);
  });

  const addEventListener =
    options?.legacyOnly
      ? undefined
      : vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === "change") {
          listeners.add(listener);
        }
      });

  const removeEventListener =
    options?.legacyOnly
      ? undefined
      : vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === "change") {
          listeners.delete(listener);
        }
      });

  currentMediaQuery = {
    matches,
    addListener,
    removeListener,
    addEventListener,
    removeEventListener,
    __emit(nextMatches: boolean) {
      listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent));
    },
  };

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(min-width: 640px)",
      onchange: null,
      addListener,
      removeListener,
      addEventListener,
      removeEventListener,
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("useSplitLayout", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setupMatchMedia(true);
    vi.clearAllMocks();
  });

  it("loads split ratio from storage and clamps it", async () => {
    window.localStorage.setItem(SPLIT_RATIO_STORAGE_KEY, "999");

    const wrapper = mount(Harness);
    await nextTick();

    expect((wrapper.vm as { splitRatio: number }).splitRatio).toBe(MAX_SPLIT_RATIO);
  });

  it("loads persisted view mode and split-scroll state", async () => {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, "preview");
    window.localStorage.setItem(SPLIT_SCROLL_ENABLED_STORAGE_KEY, "true");

    const wrapper = mount(Harness);
    await nextTick();

    const vm = wrapper.vm as {
      viewMode: "editor" | "split" | "preview";
      splitScrollEnabled: boolean;
    };

    expect(vm.viewMode).toBe("preview");
    expect(vm.splitScrollEnabled).toBe(true);
  });

  it("falls back to defaults for invalid persisted view mode", async () => {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, "invalid");

    const wrapper = mount(Harness);
    await nextTick();

    expect((wrapper.vm as { viewMode: "editor" | "split" | "preview" }).viewMode).toBe("split");
  });

  it("supports keyboard resizing in wide layout", async () => {
    const wrapper = mount(Harness);
    await nextTick();

    const vm = wrapper.vm as {
      splitRatio: number;
      onSplitterKeydown: (event: KeyboardEvent) => void;
    };

    vm.onSplitterKeydown({
      key: "ArrowRight",
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(vm.splitRatio).toBe(50 + SPLIT_KEYBOARD_STEP);

    vm.onSplitterKeydown({
      key: "ArrowRight",
      shiftKey: true,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(vm.splitRatio).toBe(50 + SPLIT_KEYBOARD_STEP + SPLIT_KEYBOARD_STEP_LARGE);
  });

  it("handles Home and End keys with bounds", async () => {
    const wrapper = mount(Harness);
    await nextTick();

    const vm = wrapper.vm as {
      splitRatio: number;
      onSplitterKeydown: (event: KeyboardEvent) => void;
    };

    vm.onSplitterKeydown({
      key: "Home",
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);
    expect(vm.splitRatio).toBe(MIN_SPLIT_RATIO);

    vm.onSplitterKeydown({
      key: "End",
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);
    expect(vm.splitRatio).toBe(MAX_SPLIT_RATIO);
  });

  it("persists updated split ratio to storage", async () => {
    const wrapper = mount(Harness);
    await nextTick();

    const vm = wrapper.vm as {
      onSplitterKeydown: (event: KeyboardEvent) => void;
    };

    vm.onSplitterKeydown({
      key: "ArrowRight",
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    await nextTick();

    expect(window.localStorage.getItem(SPLIT_RATIO_STORAGE_KEY)).toBe("52.00");
  });

  it("persists view mode and split-scroll changes to storage", async () => {
    const wrapper = mount(Harness);
    await nextTick();

    const vm = wrapper.vm as {
      viewMode: "editor" | "split" | "preview";
      splitScrollEnabled: boolean;
    };

    vm.viewMode = "editor";
    vm.splitScrollEnabled = true;
    await nextTick();

    expect(window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)).toBe("editor");
    expect(window.localStorage.getItem(SPLIT_SCROLL_ENABLED_STORAGE_KEY)).toBe(
      "true",
    );
  });

  it("supports pointer dragging and restores body styles after pointer up", async () => {
    const wrapper = mount(Harness);
    await nextTick();

    const container = document.createElement("div");
    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 200, height: 100 }),
    });

    const vm = wrapper.vm as {
      splitRatio: number;
      splitContainerRef: HTMLElement | null;
      onSplitterPointerDown: (event: PointerEvent) => void;
      viewMode: "editor" | "split" | "preview";
    };

    vm.splitContainerRef = container;

    const preventDefault = vi.fn();
    vm.onSplitterPointerDown({
      button: 0,
      clientX: 120,
      clientY: 40,
      preventDefault,
    } as unknown as PointerEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(document.body.style.userSelect).toBe("none");
    expect(document.body.style.cursor).toBe("col-resize");
    expect(vm.splitRatio).toBe(60);

    const pointerMoveEvent = new Event("pointermove");
    Object.defineProperty(pointerMoveEvent, "clientX", { value: 160 });
    Object.defineProperty(pointerMoveEvent, "clientY", { value: 40 });
    window.dispatchEvent(pointerMoveEvent);

    expect(vm.splitRatio).toBe(80);

    vm.viewMode = "editor";
    await nextTick();

    expect(document.body.style.userSelect).toBe("");
    expect(document.body.style.cursor).toBe("");

    wrapper.unmount();
  });

  it("handles vertical keyboard arrows on narrow layout", async () => {
    setupMatchMedia(false);

    const wrapper = mount(Harness);
    await nextTick();

    const vm = wrapper.vm as {
      splitRatio: number;
      splitterOrientation: "vertical" | "horizontal";
      onSplitterKeydown: (event: KeyboardEvent) => void;
    };

    expect(vm.splitterOrientation).toBe("horizontal");

    vm.onSplitterKeydown({
      key: "ArrowDown",
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(vm.splitRatio).toBe(50 + SPLIT_KEYBOARD_STEP);

    vm.onSplitterKeydown({
      key: "ArrowUp",
      shiftKey: true,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(vm.splitRatio).toBe(50 + SPLIT_KEYBOARD_STEP - SPLIT_KEYBOARD_STEP_LARGE);
  });

  it("ignores unsupported keyboard keys", async () => {
    const wrapper = mount(Harness);
    await nextTick();

    const vm = wrapper.vm as {
      splitRatio: number;
      onSplitterKeydown: (event: KeyboardEvent) => void;
    };

    const preventDefault = vi.fn();

    vm.onSplitterKeydown({
      key: "Enter",
      shiftKey: false,
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(vm.splitRatio).toBe(50);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("reacts to media query changes after mount", async () => {
    const wrapper = mount(Harness);
    await nextTick();

    const vm = wrapper.vm as {
      isWideLayout: boolean;
      splitterOrientation: "vertical" | "horizontal";
    };

    expect(vm.isWideLayout).toBe(true);

    currentMediaQuery?.__emit(false);
    await nextTick();

    expect(vm.isWideLayout).toBe(false);
    expect(vm.splitterOrientation).toBe("horizontal");
  });

  it("uses legacy addListener/removeListener when addEventListener is unavailable", async () => {
    setupMatchMedia(true, { legacyOnly: true });

    const wrapper = mount(Harness);
    await nextTick();

    expect(currentMediaQuery?.addListener).toHaveBeenCalledTimes(1);

    wrapper.unmount();

    expect(currentMediaQuery?.removeListener).toHaveBeenCalledTimes(1);
  });
});
