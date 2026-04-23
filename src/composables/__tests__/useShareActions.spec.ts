import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../utils/share", () => ({
  buildShareUrl: vi.fn(),
}));

import { buildShareUrl } from "../../utils/share";
import { useShareActions } from "../useShareActions";

const buildShareUrlMock = vi.mocked(buildShareUrl);

const Harness = defineComponent({
  template: "<div />",
  setup() {
    const markdownSource = ref("# Test");
    return useShareActions(markdownSource);
  },
});

function setClipboardWriteText(
  writeText:
    | ((text: string) => Promise<void>)
    | ReturnType<typeof vi.fn>
    | undefined,
): void {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

function setExecCommand(result: boolean): ReturnType<typeof vi.fn> {
  const execCommandMock = vi.fn(() => result);

  Object.defineProperty(document, "execCommand", {
    configurable: true,
    value: execCommandMock,
  });

  return execCommandMock;
}

describe("useShareActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    setClipboardWriteText(undefined);
    setExecCommand(false);
    buildShareUrlMock.mockResolvedValue("https://example.com/doc#s=u.payload");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("copies URL via Clipboard API and resets copied state after timeout", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboardWriteText(writeText);

    const wrapper = mount(Harness);
    const vm = wrapper.vm as {
      shareCopied: boolean;
      onShare: () => Promise<void>;
    };

    await vm.onShare();

    expect(buildShareUrlMock).toHaveBeenCalledWith("# Test");
    expect(writeText).toHaveBeenCalledWith("https://example.com/doc#s=u.payload");
    expect(vm.shareCopied).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(vm.shareCopied).toBe(false);

    wrapper.unmount();
  });

  it("falls back to document.execCommand when clipboard API write fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard blocked"));
    const execCommandMock = setExecCommand(true);
    setClipboardWriteText(writeText);

    const wrapper = mount(Harness);
    const vm = wrapper.vm as {
      shareCopied: boolean;
      onShare: () => Promise<void>;
    };

    await vm.onShare();

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(execCommandMock).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
    expect(vm.shareCopied).toBe(true);

    wrapper.unmount();
  });

  it("prompts user when both clipboard and execCommand copy fail", async () => {
    const promptSpy = vi.spyOn(window, "prompt").mockReturnValue(null);
    const execCommandMock = setExecCommand(false);
    setClipboardWriteText(undefined);

    const wrapper = mount(Harness);
    const vm = wrapper.vm as {
      shareCopied: boolean;
      onShare: () => Promise<void>;
    };

    await vm.onShare();

    expect(execCommandMock).toHaveBeenCalledWith("copy");
    expect(promptSpy).toHaveBeenCalledWith(
      "Copy this link:",
      "https://example.com/doc#s=u.payload",
    );
    expect(vm.shareCopied).toBe(false);

    wrapper.unmount();
  });

  it("logs warning when share URL creation throws", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
    buildShareUrlMock.mockRejectedValue(new Error("encoding failed"));

    const wrapper = mount(Harness);
    const vm = wrapper.vm as {
      shareCopied: boolean;
      onShare: () => Promise<void>;
    };

    await vm.onShare();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toBe("Share failed:");
    expect(vm.shareCopied).toBe(false);

    wrapper.unmount();
  });

  it("clears pending timeout on unmount", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    setClipboardWriteText(vi.fn().mockResolvedValue(undefined));

    const wrapper = mount(Harness);
    const vm = wrapper.vm as {
      onShare: () => Promise<void>;
    };

    await vm.onShare();
    wrapper.unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
