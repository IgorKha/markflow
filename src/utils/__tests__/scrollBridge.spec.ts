import { describe, expect, it, vi } from "vitest";
import { createScrollBridge } from "../scrollBridge";

describe("createScrollBridge", () => {
  it("returns 0 scroll ratio when metrics are unavailable", () => {
    const bridge = createScrollBridge({
      getMetrics: () => null,
      setScrollTop: vi.fn(),
      subscribe: () => () => { },
    });

    expect(bridge.getScrollRatio()).toBe(0);
  });

  it("calculates scroll ratio from metrics", () => {
    const bridge = createScrollBridge({
      getMetrics: () => ({
        scrollTop: 120,
        scrollHeight: 600,
        viewportSize: 300,
      }),
      setScrollTop: vi.fn(),
      subscribe: () => () => { },
    });

    expect(bridge.getScrollRatio()).toBeCloseTo(0.4);
  });

  it("clamps ratio while setting scroll position", () => {
    const setScrollTop = vi.fn();

    const bridge = createScrollBridge({
      getMetrics: () => ({
        scrollTop: 0,
        scrollHeight: 1000,
        viewportSize: 200,
      }),
      setScrollTop,
      subscribe: () => () => { },
    });

    bridge.setScrollRatio(-10);
    bridge.setScrollRatio(0.5);
    bridge.setScrollRatio(10);

    expect(setScrollTop).toHaveBeenNthCalledWith(1, 0);
    expect(setScrollTop).toHaveBeenNthCalledWith(2, 400);
    expect(setScrollTop).toHaveBeenNthCalledWith(3, 800);
  });

  it("forwards ratio updates through onScrollChange", () => {
    const state: { subscriber?: () => void } = {};
    const unsubscribe = vi.fn();

    const bridge = createScrollBridge({
      getMetrics: () => ({
        scrollTop: 250,
        scrollHeight: 1000,
        viewportSize: 500,
      }),
      setScrollTop: vi.fn(),
      subscribe: (handler) => {
        state.subscriber = handler;
        return unsubscribe;
      },
    });

    const callback = vi.fn();
    const stop = bridge.onScrollChange(callback);

    state.subscriber?.();

    expect(callback).toHaveBeenCalledWith(0.5);

    stop();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
