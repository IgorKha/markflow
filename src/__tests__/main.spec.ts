import { beforeEach, describe, expect, it, vi } from "vitest";

const { mountMock, createAppMock } = vi.hoisted(() => {
  const mountMock = vi.fn();
  const createAppMock = vi.fn(() => ({
    mount: mountMock,
  }));

  return {
    mountMock,
    createAppMock,
  };
});

vi.mock("vue", () => ({
  createApp: createAppMock,
}));

vi.mock("../App.vue", () => ({
  default: { name: "AppMock" },
}));

describe("main.ts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("creates and mounts app to #app", async () => {
    await import("../main");

    expect(createAppMock).toHaveBeenCalledTimes(1);
    expect(mountMock).toHaveBeenCalledWith("#app");
  });
});
