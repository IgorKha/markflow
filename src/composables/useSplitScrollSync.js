import { watchEffect } from "vue";

export function useSplitScrollSync({
  splitScrollEnabled,
  viewMode,
  editorRef,
  previewRef,
}) {
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

    const syncToPreview = (ratio) => {
      if (isSyncingScroll) {
        return;
      }

      isSyncingScroll = true;
      previewRef.value?.setScrollRatio(ratio);
      releaseSyncLock();
    };

    const syncToEditor = (ratio) => {
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
