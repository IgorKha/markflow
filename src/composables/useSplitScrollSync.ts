import { watchEffect } from "vue";
import type { Ref } from "vue";
import type { EditorExpose, PreviewExpose } from "../types/scroll";
import type { ViewMode } from "../types/ui";

interface UseSplitScrollSyncOptions {
  splitScrollEnabled: Ref<boolean>;
  viewMode: Ref<ViewMode>;
  editorRef: Ref<EditorExpose | null>;
  previewRef: Ref<PreviewExpose | null>;
}

export function useSplitScrollSync({
  splitScrollEnabled,
  viewMode,
  editorRef,
  previewRef,
}: UseSplitScrollSyncOptions): void {
  let isSyncingScroll = false;

  watchEffect((onCleanup) => {
    if (
      !splitScrollEnabled.value ||
      viewMode.value !== "split" ||
      !editorRef.value ||
      !previewRef.value
    ) {
      return;
    }

    const releaseSyncLock = () => {
      requestAnimationFrame(() => {
        isSyncingScroll = false;
      });
    };

    const syncToPreview = (ratio: number) => {
      if (isSyncingScroll) {
        return;
      }

      isSyncingScroll = true;
      previewRef.value?.setScrollRatio(ratio);
      releaseSyncLock();
    };

    const syncToEditor = (ratio: number) => {
      if (isSyncingScroll) {
        return;
      }

      isSyncingScroll = true;
      editorRef.value?.setScrollRatio(ratio);
      releaseSyncLock();
    };

    syncToPreview(editorRef.value.getScrollRatio());

    const stopEditorScroll = editorRef.value.onScrollChange(syncToPreview);
    const stopPreviewScroll = previewRef.value.onScrollChange(syncToEditor);

    onCleanup(() => {
      stopEditorScroll?.();
      stopPreviewScroll?.();
      isSyncingScroll = false;
    });
  });
}
