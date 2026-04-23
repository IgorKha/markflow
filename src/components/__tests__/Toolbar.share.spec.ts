import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Toolbar from "../Toolbar.vue";

describe("Toolbar", () => {
  it("emits share-link and calls onShareAction on desktop share click", async () => {
    const onShareAction = vi.fn();

    const wrapper = mount(Toolbar, {
      props: {
        theme: "light",
        viewMode: "split",
        splitScrollEnabled: false,
        splitScrollAvailable: true,
        shareCopied: false,
        onShareAction,
      },
    });

    const shareButton = wrapper.find('button[aria-label="Copy shareable link"]');
    expect(shareButton.exists()).toBe(true);

    await shareButton.trigger("click");

    expect(onShareAction).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("share-link")).toBeTruthy();
  });

  it("emits toggle-split-scroll when desktop sync button is clicked", async () => {
    const wrapper = mount(Toolbar, {
      props: {
        splitScrollAvailable: true,
        splitScrollEnabled: false,
      },
    });

    const syncButton = wrapper.find('button[aria-label="Enable split scroll sync"]');
    expect(syncButton.exists()).toBe(true);

    await syncButton.trigger("click");

    expect(wrapper.emitted("toggle-split-scroll")).toBeTruthy();
  });

  it("runs mobile share action and closes mobile panel", async () => {
    const onShareAction = vi.fn();

    const wrapper = mount(Toolbar, {
      props: {
        splitScrollAvailable: true,
        onShareAction,
      },
    });

    const menuButton = wrapper.find(
      'button[aria-label="Open additional editor actions"]',
    );
    expect(menuButton.exists()).toBe(true);

    await menuButton.trigger("click");

    const mobilePanel = wrapper.get("#mobile-toolbar-actions");
    const mobileShareButton = mobilePanel.get(
      'button[aria-label="Copy shareable link"]',
    );
    await mobileShareButton.trigger("click");

    expect(onShareAction).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("share-link")).toBeTruthy();
    expect(wrapper.find("#mobile-toolbar-actions").exists()).toBe(false);
  });

  it("emits mobile export event and closes mobile panel", async () => {
    const wrapper = mount(Toolbar, {
      props: {
        splitScrollAvailable: true,
      },
    });

    await wrapper
      .find('button[aria-label="Open additional editor actions"]')
      .trigger("click");

    const mobilePanel = wrapper.get("#mobile-toolbar-actions");
    const exportHtmlButton = mobilePanel.get(
      'button[aria-label="Export as HTML file"]',
    );

    await exportHtmlButton.trigger("click");

    expect(wrapper.emitted("export-html")).toBeTruthy();
    expect(wrapper.find("#mobile-toolbar-actions").exists()).toBe(false);
  });
});
