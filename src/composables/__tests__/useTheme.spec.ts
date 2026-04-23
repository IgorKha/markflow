import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "../useTheme";

const Harness = defineComponent({
  template: "<div />",
  setup() {
    return useTheme();
  },
});

function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("useTheme", () => {
  beforeEach(() => {
    document.head.querySelector('meta[name="theme-color"]')?.remove();
    document.documentElement.style.colorScheme = "";
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("uses system preference as initial theme and applies meta color", async () => {
    mockMatchMedia(true);

    const themedRoot = document.createElement("div");
    themedRoot.setAttribute("data-theme", "dark");
    themedRoot.style.setProperty("--toolbar-bg", "#121212");
    document.body.appendChild(themedRoot);

    const wrapper = mount(Harness);
    await nextTick();

    expect((wrapper.vm as { theme: string }).theme).toBe("dark");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#121212",
    );
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("falls back to default palette when theme root is missing", async () => {
    mockMatchMedia(false);

    const wrapper = mount(Harness);
    await nextTick();

    (wrapper.vm as { toggleTheme: () => void }).toggleTheme();
    await nextTick();

    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#111113",
    );
  });

  it("toggles theme value", async () => {
    mockMatchMedia(false);

    const wrapper = mount(Harness);
    await nextTick();

    expect((wrapper.vm as { theme: string }).theme).toBe("light");

    (wrapper.vm as { toggleTheme: () => void }).toggleTheme();
    await nextTick();

    expect((wrapper.vm as { theme: string }).theme).toBe("dark");
  });
});
