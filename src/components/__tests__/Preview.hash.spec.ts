import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Preview from "../Preview.vue";

const mockState = vi.hoisted(() => ({
  html: `
    <p>
      Footnote reference
      <a id="jump-link" href="#user-content-fn-md-note">[1]</a>
    </p>
    <p id="user-content-fn-md-note">Footnote content</p>
  `,
}));

vi.mock("../../utils/markdown", () => ({
  renderMarkdown: vi.fn(async () => mockState.html),
}));

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async () => ({ svg: "<svg></svg>" })),
  },
}));

function makeRect(top: number, height: number): DOMRect {
  return {
    x: 0,
    y: top,
    width: 100,
    height,
    top,
    right: 100,
    bottom: top + height,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("Preview hash navigation", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("scrolls preview container on hashchange instead of using scrollIntoView", async () => {
    const wrapper = mount(Preview, {
      props: {
        markdown: "# demo",
        theme: "light",
      },
    });

    await flushPromises();

    const container = wrapper.get(".w-full.h-full.overflow-y-auto")
      .element as HTMLDivElement;
    const target = wrapper.get("#user-content-fn-md-note").element as HTMLElement;

    const containerScrollTo = vi.fn();
    const scrollIntoView = vi.fn();

    container.scrollTo = containerScrollTo;
    target.scrollIntoView = scrollIntoView;

    Object.defineProperty(container, "scrollTop", {
      value: 40,
      writable: true,
      configurable: true,
    });

    vi.spyOn(container, "getBoundingClientRect").mockReturnValue(makeRect(100, 500));
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(makeRect(340, 24));

    window.history.replaceState(null, "", "#user-content-fn-md-note");
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(containerScrollTo).toHaveBeenCalledWith({
      top: 280,
      behavior: "smooth",
    });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("intercepts in-preview hash link clicks and updates location hash", async () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    const wrapper = mount(Preview, {
      props: {
        markdown: "# demo",
        theme: "light",
      },
    });

    await flushPromises();

    const container = wrapper.get(".w-full.h-full.overflow-y-auto")
      .element as HTMLDivElement;
    const target = wrapper.get("#user-content-fn-md-note").element as HTMLElement;

    const containerScrollTo = vi.fn();
    const scrollIntoView = vi.fn();

    container.scrollTo = containerScrollTo;
    target.scrollIntoView = scrollIntoView;

    Object.defineProperty(container, "scrollTop", {
      value: 12,
      writable: true,
      configurable: true,
    });

    vi.spyOn(container, "getBoundingClientRect").mockReturnValue(makeRect(100, 500));
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(makeRect(300, 24));

    await wrapper.get("#jump-link").trigger("click");

    expect(containerScrollTo).toHaveBeenCalledWith({
      top: 212,
      behavior: "smooth",
    });
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("#user-content-fn-md-note");
    expect(replaceStateSpy).toHaveBeenCalledWith(
      null,
      "",
      "#user-content-fn-md-note",
    );
  });
});
