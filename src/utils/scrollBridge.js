function clampRatio(ratio) {
  return Math.min(Math.max(ratio, 0), 1);
}

function getMaxScrollTop(scrollHeight, viewportSize) {
  return Math.max(scrollHeight - viewportSize, 0);
}

export function createScrollBridge({ getMetrics, setScrollTop, subscribe }) {
  function getScrollRatio() {
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

  function setScrollRatio(ratio) {
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

  function onScrollChange(callback) {
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
