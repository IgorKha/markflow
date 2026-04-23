import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TocTreeNode from "../TocTreeNode.vue";
import type { TocItem } from "../../../composables/useToc";

function makeItem(overrides: Partial<TocItem> = {}): TocItem {
  return {
    id: "heading-1",
    text: "Heading 1",
    level: 1,
    children: [],
    ...overrides,
  };
}

describe("TocTreeNode", () => {
  it("renders the heading text", () => {
    const wrapper = mount(TocTreeNode, {
      props: { item: makeItem({ text: "My Heading" }), activeId: "" },
    });
    expect(wrapper.text()).toContain("My Heading");
  });

  it("does not show expand button for leaf node", () => {
    const wrapper = mount(TocTreeNode, {
      props: { item: makeItem({ children: [] }), activeId: "" },
    });
    const expandBtn = wrapper.find("button[aria-expanded]");
    expect(expandBtn.exists()).toBe(false);
  });

  it("shows expand button when item has children", () => {
    const child = makeItem({ id: "child", text: "Child", level: 2 });
    const parent = makeItem({ children: [child] });

    const wrapper = mount(TocTreeNode, {
      props: { item: parent, activeId: "" },
    });
    expect(wrapper.find("button[aria-expanded]").exists()).toBe(true);
  });

  it("children list is visible initially", () => {
    const child = makeItem({ id: "child", text: "Child", level: 2 });
    const parent = makeItem({ children: [child] });

    const wrapper = mount(TocTreeNode, {
      props: { item: parent, activeId: "" },
    });
    expect(wrapper.find("ul").exists()).toBe(true);
    expect(wrapper.text()).toContain("Child");
  });

  it("collapses children when expand button is clicked", async () => {
    const child = makeItem({ id: "child", text: "Child", level: 2 });
    const parent = makeItem({ children: [child] });

    const wrapper = mount(TocTreeNode, {
      props: { item: parent, activeId: "" },
    });

    await wrapper.find("button[aria-expanded]").trigger("click");

    expect(wrapper.find("ul").exists()).toBe(false);
  });

  it("expands children again after second toggle click", async () => {
    const child = makeItem({ id: "child", text: "Child", level: 2 });
    const parent = makeItem({ children: [child] });

    const wrapper = mount(TocTreeNode, {
      props: { item: parent, activeId: "" },
    });

    const btn = wrapper.find("button[aria-expanded]");
    await btn.trigger("click");
    await btn.trigger("click");

    expect(wrapper.find("ul").exists()).toBe(true);
  });

  it("emits navigate with item id when text button is clicked", async () => {
    const item = makeItem({ id: "target-id", text: "Click me" });

    const wrapper = mount(TocTreeNode, {
      props: { item, activeId: "" },
    });

    // The text button is the last button (not the expand toggle)
    const buttons = wrapper.findAll("button");
    await buttons[buttons.length - 1]!.trigger("click");

    expect(wrapper.emitted("navigate")).toEqual([["target-id"]]);
  });

  it("applies accent class when item is active", () => {
    const item = makeItem({ id: "active-id" });

    const wrapper = mount(TocTreeNode, {
      props: { item, activeId: "active-id" },
    });

    const row = wrapper.find("div.group");
    expect(row.classes()).toContain("text-accent");
  });

  it("does not apply accent class when item is not active", () => {
    const item = makeItem({ id: "some-id" });

    const wrapper = mount(TocTreeNode, {
      props: { item, activeId: "other-id" },
    });

    const row = wrapper.find("div.group");
    expect(row.classes()).not.toContain("text-accent");
  });

  it("applies font-semibold for h1 level", () => {
    const item = makeItem({ level: 1 });

    const wrapper = mount(TocTreeNode, {
      props: { item, activeId: "" },
    });

    const buttons = wrapper.findAll("button");
    const textBtn = buttons[buttons.length - 1]!;
    expect(textBtn.classes()).toContain("font-semibold");
  });

  it("applies font-medium for h2 level", () => {
    const item = makeItem({ level: 2 });

    const wrapper = mount(TocTreeNode, {
      props: { item, activeId: "" },
    });

    const buttons = wrapper.findAll("button");
    const textBtn = buttons[buttons.length - 1]!;
    expect(textBtn.classes()).toContain("font-medium");
  });

  it("applies correct paddingLeft based on depth", () => {
    const item = makeItem();

    const wrapper = mount(TocTreeNode, {
      props: { item, activeId: "", depth: 2 },
    });

    const row = wrapper.find("div.group");
    expect(row.attributes("style")).toContain("padding-left: 36px"); // 2*14+8
  });

  it("shows vertical guide line span when expanded with children", () => {
    const child = makeItem({ id: "child", text: "Child", level: 2 });
    const parent = makeItem({ children: [child] });

    const wrapper = mount(TocTreeNode, {
      props: { item: parent, activeId: "", depth: 0 },
    });

    const guideLine = wrapper.find("ul > span[aria-hidden]");
    expect(guideLine.exists()).toBe(true);
    expect(guideLine.attributes("style")).toContain("left: 16px"); // 0*14+16
  });

  it("guide line offset follows depth", () => {
    const child = makeItem({ id: "child", text: "Child", level: 3 });
    const parent = makeItem({ id: "parent", text: "Parent", level: 2, children: [child] });

    const wrapper = mount(TocTreeNode, {
      props: { item: parent, activeId: "", depth: 1 },
    });

    const guideLine = wrapper.find("ul > span[aria-hidden]");
    expect(guideLine.attributes("style")).toContain("left: 30px"); // 1*14+16
  });

  it("hides guide line when collapsed", async () => {
    const child = makeItem({ id: "child", text: "Child", level: 2 });
    const parent = makeItem({ children: [child] });

    const wrapper = mount(TocTreeNode, {
      props: { item: parent, activeId: "" },
    });

    await wrapper.find("button[aria-expanded]").trigger("click");

    expect(wrapper.find("ul > span[aria-hidden]").exists()).toBe(false);
  });

  it("bubbles navigate event from nested child", async () => {
    const grandchild = makeItem({ id: "gc", text: "GC", level: 3, children: [] });
    const child = makeItem({ id: "child", level: 2, children: [grandchild] });
    const parent = makeItem({ children: [child] });

    const wrapper = mount(TocTreeNode, {
      props: { item: parent, activeId: "" },
    });

    // Click grandchild's text button (deepest)
    const allButtons = wrapper.findAll("button:not([aria-expanded])");
    await allButtons[allButtons.length - 1]!.trigger("click");

    expect(wrapper.emitted("navigate")).toBeTruthy();
  });
});
