import { effectScope, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSplitScrollSync } from "../useSplitScrollSync";
import type { EditorExpose, PreviewExpose, ScrollRatioHandler } from "../../types/scroll";

interface ScrollStub {
  api: EditorExpose | PreviewExpose;
  emit: (ratio: number) => void;
  stopSpy: ReturnType<typeof vi.fn>;
  setRatioSpy: ReturnType<typeof vi.fn>;
}

function createScrollStub(initialRatio = 0): ScrollStub {
  let listener: ScrollRatioHandler | null = null;
  const stopSpy = vi.fn();
  const setRatioSpy = vi.fn();

  const api: EditorExpose = {
    getScrollRatio: vi.fn(() => initialRatio),
    setScrollRatio: setRatioSpy,
    onScrollChange: vi.fn((callback: ScrollRatioHandler) => {
      listener = callback;
      return stopSpy;
    }),
  };

  return {
    api,
    emit: (ratio: number) => listener?.(ratio),
    stopSpy,
    setRatioSpy,
  };
}

describe("useSplitScrollSync", () => {
  it("syncs scroll ratio both ways when split sync is enabled", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    const editor = createScrollStub(0.42);
    const preview = createScrollStub(0);

    const splitScrollEnabled = ref(true);
    const viewMode = ref<"editor" | "split" | "preview">("split");
    const editorRef = ref(editor.api);
    const previewRef = ref(preview.api as PreviewExpose);

    const scope = effectScope();
    scope.run(() => {
      useSplitScrollSync({
        splitScrollEnabled,
        viewMode,
        editorRef,
        previewRef,
      });
    });

    expect(preview.setRatioSpy).toHaveBeenCalledWith(0.42);

    editor.emit(0.8);
    preview.emit(0.3);

    expect(preview.setRatioSpy).toHaveBeenLastCalledWith(0.8);
    expect(editor.setRatioSpy).toHaveBeenLastCalledWith(0.3);

    scope.stop();
    await nextTick();

    expect(editor.stopSpy).toHaveBeenCalledTimes(1);
    expect(preview.stopSpy).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("does not subscribe when not in split mode or disabled", () => {
    const editor = createScrollStub(0.5);
    const preview = createScrollStub(0.1);

    const splitScrollEnabled = ref(false);
    const viewMode = ref<"editor" | "split" | "preview">("editor");

    const scope = effectScope();
    scope.run(() => {
      useSplitScrollSync({
        splitScrollEnabled,
        viewMode,
        editorRef: ref(editor.api),
        previewRef: ref(preview.api as PreviewExpose),
      });
    });

    expect((editor.api.onScrollChange as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
    expect((preview.api.onScrollChange as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();

    scope.stop();
  });

  it("cleans up listeners when sync is toggled off", async () => {
    const editor = createScrollStub(0.5);
    const preview = createScrollStub(0.1);

    const splitScrollEnabled = ref(true);
    const viewMode = ref<"editor" | "split" | "preview">("split");

    const scope = effectScope();
    scope.run(() => {
      useSplitScrollSync({
        splitScrollEnabled,
        viewMode,
        editorRef: ref(editor.api),
        previewRef: ref(preview.api as PreviewExpose),
      });
    });

    splitScrollEnabled.value = false;
    await nextTick();

    expect(editor.stopSpy).toHaveBeenCalledTimes(1);
    expect(preview.stopSpy).toHaveBeenCalledTimes(1);

    scope.stop();
  });
});
