import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  DEFAULT_SPLIT_RATIO,
  MAX_SPLIT_RATIO,
  MIN_SPLIT_RATIO,
  SPLIT_KEYBOARD_STEP,
  SPLIT_KEYBOARD_STEP_LARGE,
  SPLIT_RATIO_STORAGE_KEY,
} from "../constants/editor.js";

const SPLIT_LAYOUT_MEDIA_QUERY = "(min-width: 640px)";

function clampSplitRatio(value) {
  return Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, value));
}

function loadSplitRatio() {
  if (typeof window === "undefined") {
    return DEFAULT_SPLIT_RATIO;
  }

  const raw = Number.parseFloat(
    window.localStorage.getItem(SPLIT_RATIO_STORAGE_KEY),
  );

  if (!Number.isFinite(raw)) {
    return DEFAULT_SPLIT_RATIO;
  }

  return clampSplitRatio(raw);
}

export function useSplitLayout() {
  const viewMode = ref("split");
  const splitScrollEnabled = ref(false);
  const splitContainerRef = ref(null);

  const mediaQuery =
    typeof window !== "undefined"
      ? window.matchMedia(SPLIT_LAYOUT_MEDIA_QUERY)
      : null;

  const isWideLayout = ref(mediaQuery ? mediaQuery.matches : true);
  const splitRatio = ref(loadSplitRatio());

  const editorPaneStyle = computed(() =>
    viewMode.value === "split"
      ? { flex: `0 0 ${splitRatio.value}%` }
      : undefined,
  );

  const previewPaneStyle = computed(() =>
    viewMode.value === "split"
      ? { flex: `1 1 ${100 - splitRatio.value}%` }
      : undefined,
  );

  const splitterOrientation = computed(() =>
    isWideLayout.value ? "vertical" : "horizontal",
  );

  let isDraggingSplitter = false;
  let cleanupSplitterDragListeners = null;
  let cleanupViewportListener = () => {};
  let previousBodyUserSelect = "";
  let previousBodyCursor = "";

  function setSplitRatio(nextRatio) {
    splitRatio.value = clampSplitRatio(nextRatio);
  }

  function updateSplitRatioFromPointer(clientX, clientY) {
    const container = splitContainerRef.value;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    if (isWideLayout.value) {
      if (rect.width <= 0) {
        return;
      }

      setSplitRatio(((clientX - rect.left) / rect.width) * 100);
      return;
    }

    if (rect.height <= 0) {
      return;
    }

    setSplitRatio(((clientY - rect.top) / rect.height) * 100);
  }

  function stopSplitterDrag() {
    if (!isDraggingSplitter && !cleanupSplitterDragListeners) {
      return;
    }

    isDraggingSplitter = false;
    cleanupSplitterDragListeners?.();
    cleanupSplitterDragListeners = null;

    if (typeof document === "undefined") {
      return;
    }

    document.body.style.userSelect = previousBodyUserSelect;
    document.body.style.cursor = previousBodyCursor;
  }

  function onSplitterPointerDown(event) {
    if (event.button !== 0 || typeof document === "undefined") {
      return;
    }

    event.preventDefault();
    isDraggingSplitter = true;
    updateSplitRatioFromPointer(event.clientX, event.clientY);

    previousBodyUserSelect = document.body.style.userSelect;
    previousBodyCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = isWideLayout.value
      ? "col-resize"
      : "row-resize";

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingSplitter) {
        return;
      }

      updateSplitRatioFromPointer(moveEvent.clientX, moveEvent.clientY);
    };

    const handlePointerUp = () => {
      stopSplitterDrag();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    cleanupSplitterDragListeners = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }

  function onSplitterKeydown(event) {
    const step = event.shiftKey
      ? SPLIT_KEYBOARD_STEP_LARGE
      : SPLIT_KEYBOARD_STEP;

    let nextRatio = splitRatio.value;

    if (event.key === "Home") {
      nextRatio = MIN_SPLIT_RATIO;
    } else if (event.key === "End") {
      nextRatio = MAX_SPLIT_RATIO;
    } else if (isWideLayout.value) {
      if (event.key === "ArrowLeft") {
        nextRatio -= step;
      } else if (event.key === "ArrowRight") {
        nextRatio += step;
      } else {
        return;
      }
    } else if (event.key === "ArrowUp") {
      nextRatio -= step;
    } else if (event.key === "ArrowDown") {
      nextRatio += step;
    } else {
      return;
    }

    event.preventDefault();
    setSplitRatio(nextRatio);
  }

  watch(splitRatio, (value) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SPLIT_RATIO_STORAGE_KEY, value.toFixed(2));
  });

  watch(viewMode, (mode) => {
    if (mode !== "split") {
      stopSplitterDrag();
    }
  });

  onMounted(() => {
    if (!mediaQuery) {
      return;
    }

    const handleViewportChange = (event) => {
      isWideLayout.value = event.matches;
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleViewportChange);
      cleanupViewportListener = () => {
        mediaQuery.removeEventListener("change", handleViewportChange);
      };
      return;
    }

    mediaQuery.addListener(handleViewportChange);
    cleanupViewportListener = () => {
      mediaQuery.removeListener(handleViewportChange);
    };
  });

  onBeforeUnmount(() => {
    stopSplitterDrag();
    cleanupViewportListener();
  });

  return {
    viewMode,
    splitScrollEnabled,
    splitContainerRef,
    isWideLayout,
    splitRatio,
    editorPaneStyle,
    previewPaneStyle,
    splitterOrientation,
    onSplitterPointerDown,
    onSplitterKeydown,
    minSplitRatio: MIN_SPLIT_RATIO,
    maxSplitRatio: MAX_SPLIT_RATIO,
  };
}
