import type {
  ScrollBridge,
  ScrollMetrics,
  ScrollRatioHandler,
  Unsubscribe,
} from "../types/scroll";

interface CreateScrollBridgeOptions {
  getMetrics: () => ScrollMetrics | null;
  setScrollTop: (nextScrollTop: number) => void;
  subscribe: (handler: () => void) => Unsubscribe;
}

function clampRatio(ratio: number): number {
  return Math.min(Math.max(ratio, 0), 1);
}

function getMaxScrollTop(scrollHeight: number, viewportSize: number): number {
  return Math.max(scrollHeight - viewportSize, 0);
}

export function createScrollBridge({
  getMetrics,
  setScrollTop,
  subscribe,
}: CreateScrollBridgeOptions): ScrollBridge {
  function getScrollRatio(): number {
    const metrics = getMetrics();
    if (!metrics) {
      return 0;
    }

    const maxScrollTop = getMaxScrollTop(
      metrics.scrollHeight,
      metrics.viewportSize,
    );

    if (maxScrollTop === 0) {
      return 0;
    }

    return metrics.scrollTop / maxScrollTop;
  }

  function setScrollRatio(ratio: number): void {
    const metrics = getMetrics();
    if (!metrics) {
      return;
    }

    const maxScrollTop = getMaxScrollTop(
      metrics.scrollHeight,
      metrics.viewportSize,
    );

    setScrollTop(maxScrollTop * clampRatio(ratio));
  }

  function onScrollChange(callback: ScrollRatioHandler): Unsubscribe {
    return subscribe(() => {
      callback(getScrollRatio());
    });
  }

  return {
    getScrollRatio,
    setScrollRatio,
    onScrollChange,
  };
}
