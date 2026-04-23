import { nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import TocDrawer from "../TocDrawer.vue";
import type { TocItem } from "../../../composables/useToc";

function makeItem(overrides: Partial<TocItem> = {}): TocItem {
  return {
    id: "h1",
    text: "Section",
    level: 1,
    children: [],
    ...overrides,
  };
}

// TocDrawer uses <Teleport to="body">, so teleported content lives in document.body.
function mountDrawer(
  props: InstanceType<typeof TocDrawer>["$props"],
): VueWrapper {
  return mount(TocDrawer, { attachTo: document.body, props });
}

function getAside(): HTMLElement | null {
  return document.body.querySelector('aside[role="dialog"]');
}

describe("TocDrawer", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does not render aside when closed", () => {
    mountDrawer({ open: false, items: [] });
    expect(getAside()).toBeNull();
  });

  it("renders aside when open", () => {
    mountDrawer({ open: true, items: [] });
    expect(getAside()).not.toBeNull();
  });

  it("has role=dialog and aria-modal when open", () => {
    mountDrawer({ open: true, items: [] });
    const aside = getAside()!;
    expect(aside.getAttribute("role")).toBe("dialog");
    expect(aside.getAttribute("aria-modal")).toBe("true");
  });

  it("shows empty state when items is empty", () => {
    mountDrawer({ open: true, items: [] });
    expect(document.body.textContent).toContain("No headings found");
  });

  it("does not show empty state when items are present", () => {
    mountDrawer({ open: true, items: [makeItem()] });
    expect(document.body.textContent).not.toContain("No headings found");
  });

  it("renders nav with headings when items provided", () => {
    mountDrawer({ open: true, items: [makeItem({ text: "My Section" })] });
    expect(document.body.querySelector("nav")).not.toBeNull();
    expect(document.body.textContent).toContain("My Section");
  });

  it("emits close when close button is clicked", async () => {
    const wrapper = mountDrawer({ open: true, items: [] });
    const btn = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Close table of contents"]',
    )!;
    btn.click();
    await nextTick();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("emits close when backdrop is clicked", async () => {
    const wrapper = mountDrawer({ open: true, items: [] });
    const backdrop = document.body.querySelector<HTMLElement>(
      'div[aria-hidden="true"]',
    )!;
    backdrop.click();
    await nextTick();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("emits close when Escape key is pressed", async () => {
    const wrapper = mountDrawer({ open: true, items: [] });
    await nextTick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("emits navigate and close when tree node triggers navigate", async () => {
    const item = makeItem({ id: "intro", text: "Intro" });
    const wrapper = mountDrawer({ open: true, items: [item] });

    const buttons = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("aside button"),
    );
    const textBtn = buttons.find((b) => b.textContent?.trim() === "Intro");
    expect(textBtn).toBeTruthy();
    textBtn!.click();
    await nextTick();

    expect(wrapper.emitted("navigate")).toEqual([["intro"]]);
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("sets data-theme on aside to match theme prop", () => {
    mountDrawer({ open: true, items: [], theme: "dark" });
    expect(getAside()?.getAttribute("data-theme")).toBe("dark");
  });

  it("defaults data-theme to light", () => {
    mountDrawer({ open: true, items: [] });
    expect(getAside()?.getAttribute("data-theme")).toBe("light");
  });

  it("does not add keydown listener when closed", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    mountDrawer({ open: false, items: [] });
    const calls = addSpy.mock.calls.filter(([ev]) => ev === "keydown");
    expect(calls).toHaveLength(0);
    addSpy.mockRestore();
  });

  it("removes keydown listener when drawer closes", async () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const wrapper = mountDrawer({ open: true, items: [] });

    await wrapper.setProps({ open: false });
    await nextTick();

    const calls = removeSpy.mock.calls.filter(([ev]) => ev === "keydown");
    expect(calls.length).toBeGreaterThan(0);
    removeSpy.mockRestore();
  });

  it("shows Esc keyboard hint in footer", () => {
    mountDrawer({ open: true, items: [] });
    const kbd = document.body.querySelector("kbd");
    expect(kbd?.textContent).toBe("Esc");
  });
});
