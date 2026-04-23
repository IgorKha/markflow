import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_SPLIT_RATIO,
  MIN_SPLIT_RATIO,
  SPLIT_KEYBOARD_STEP,
  SPLIT_KEYBOARD_STEP_LARGE,
  SPLIT_RATIO_STORAGE_KEY,
} from "../../constants/editor";
import { useSplitLayout } from "../useSplitLayout";

const Harness = defineComponent({
  template: "<div />",
  setup() {
    return useSplitLayout();
  },
});

function setupMatchMedia(matches = true): void {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(min-width: 640px)",
      onchange: null,
      addListener: vi.fn((listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      }),
      removeListener: vi.fn((listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      }),
      addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === "change") {
          listeners.add(listener);
        }
      }),
      removeEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === "change") {
          listeners.delete(listener);
        }
      }),
      dispatchEvent: vi.fn(),
      __emit(nextMatches: boolean) {
        listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent));
      },
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
});
