import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CONTENT, STORAGE_KEY } from "../../constants/editor";

vi.mock("../../utils/share", () => ({
  readSharedContent: vi.fn(),
}));

import { readSharedContent } from "../../utils/share";
import { useMarkdownSource } from "../useMarkdownSource";

const readSharedContentMock = vi.mocked(readSharedContent);

const Harness = defineComponent({
  template: "<div />",
  setup() {
    return useMarkdownSource();
  },
});

async function flushUpdates(): Promise<void> {
  await Promise.resolve();
  await nextTick();
}

describe("useMarkdownSource", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    readSharedContentMock.mockResolvedValue(null);
    window.history.replaceState(null, "", "/");
  });

  it("loads initial markdown from localStorage", async () => {
    window.localStorage.setItem(STORAGE_KEY, "Saved note");

    const wrapper = mount(Harness);
    await flushUpdates();

    expect((wrapper.vm as { markdownSource: string }).markdownSource).toBe("Saved note");
  });

  it("falls back to default content when storage is empty", async () => {
    const wrapper = mount(Harness);
    await flushUpdates();

    expect((wrapper.vm as { markdownSource: string }).markdownSource).toBe(DEFAULT_CONTENT);
  });

  it("persists changes to localStorage", async () => {
    const wrapper = mount(Harness);

    (wrapper.vm as { markdownSource: string }).markdownSource = "Updated";
    await nextTick();

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("Updated");
  });

  it("applies shared content and clears hash on mount", async () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");
    readSharedContentMock.mockResolvedValue("Shared markdown");
    window.history.replaceState(null, "", "/doc#s=u.payload");

    const wrapper = mount(Harness);
    await flushUpdates();

    expect((wrapper.vm as { markdownSource: string }).markdownSource).toBe("Shared markdown");
    expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "/doc");
  });
});
