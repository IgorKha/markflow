import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Toolbar from "../Toolbar.vue";

describe("Toolbar share event", () => {
  it("emits share-link when share button is clicked", async () => {
    const wrapper = mount(Toolbar, {
      props: {
        theme: "light",
        viewMode: "split",
        splitScrollEnabled: false,
        splitScrollAvailable: true,
        shareCopied: false,
      },
    });

    const shareButton = wrapper.find('button[aria-label="Copy shareable link"]');
    expect(shareButton.exists()).toBe(true);

    await shareButton.trigger("click");

    expect(wrapper.emitted("share-link")).toBeTruthy();
  });
});
