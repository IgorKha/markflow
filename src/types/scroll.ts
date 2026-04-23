export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  viewportSize: number;
}

export type Unsubscribe = () => void;
export type ScrollRatioHandler = (ratio: number) => void;

export interface ScrollBridge {
  getScrollRatio: () => number;
  setScrollRatio: (ratio: number) => void;
  onScrollChange: (callback: ScrollRatioHandler) => Unsubscribe;
}

export interface EditorExpose extends ScrollBridge { }

export interface PreviewExpose extends ScrollBridge {
  previewEl: HTMLDivElement | null;
}
