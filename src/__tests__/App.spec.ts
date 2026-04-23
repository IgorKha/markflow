import { mount, flushPromises } from "@vue/test-utils";
import { computed, defineComponent, h, ref } from "vue";
import type { Theme, ViewMode } from "../types/ui";
import { beforeEach, describe, expect, it, vi } from "vitest";

const appState = vi.hoisted(() => ({
  initialViewMode: "split" as ViewMode,
  markdownSource: null as ReturnType<typeof ref<string>> | null,
  theme: null as ReturnType<typeof ref<Theme>> | null,
  shareCopied: null as ReturnType<typeof ref<boolean>> | null,
  viewMode: null as ReturnType<typeof ref<ViewMode>> | null,
  splitScrollEnabled: null as ReturnType<typeof ref<boolean>> | null,
  splitContainerRef: null as ReturnType<typeof ref<HTMLElement | null>> | null,
  isWideLayout: null as ReturnType<typeof ref<boolean>> | null,
  splitRatio: null as ReturnType<typeof ref<number>> | null,
  editorPaneStyle: null as { value: { flex: string } } | null,
  previewPaneStyle: null as { value: { flex: string } } | null,
  splitterOrientation: null as { value: "vertical" | "horizontal" } | null,
  tocItems: null as ReturnType<typeof ref<Array<{ id: string; level: number; text: string }>>> | null,
  tocActiveId: null as ReturnType<typeof ref<string>> | null,
  toggleThemeMock: vi.fn(),
  onShareMock: vi.fn().mockResolvedValue(undefined),
  onSplitterPointerDownMock: vi.fn(),
  onSplitterKeydownMock: vi.fn(),
  useSplitScrollSyncMock: vi.fn(),
  tocNavigateToMock: vi.fn(),
  exportPdfMock: vi.fn().mockResolvedValue(undefined),
  exportHtmlMock: vi.fn().mockResolvedValue(undefined),
  exportMarkdownMock: vi.fn(),
}));

function ensureReactiveState(): void {
  if (appState.markdownSource) {
    return;
  }

  appState.markdownSource = ref("# Initial markdown");
  appState.theme = ref<Theme>("light");
  appState.shareCopied = ref(false);
  appState.viewMode = ref<ViewMode>("split");
  appState.splitScrollEnabled = ref(false);
  appState.splitContainerRef = ref<HTMLElement | null>(null);
  appState.isWideLayout = ref(true);
  appState.splitRatio = ref(50);
  appState.editorPaneStyle = computed(() => ({ flex: "0 0 50%" }));
  appState.previewPaneStyle = computed(() => ({ flex: "1 1 50%" }));
  appState.splitterOrientation = computed(() => "vertical" as const);
  appState.tocItems = ref([{ id: "intro", level: 1, text: "Intro" }]);
  appState.tocActiveId = ref("intro");
}

vi.mock("../components/Toolbar.vue", () => ({
  default: defineComponent({
    name: "ToolbarStub",
    props: {
      splitScrollEnabled: { type: Boolean, default: false },
      onShareAction: { type: Function, required: false },
    },
    emits: [
      "toggle-theme",
      "change-view-mode",
      "toggle-split-scroll",
      "export-md",
      "export-html",
      "export-pdf",
      "share-link",
      "toggle-toc",
    ],
    template: `
      <div>
        <button data-test="toggle-theme" @click="$emit('toggle-theme')" />
        <button data-test="mode-editor" @click="$emit('change-view-mode', 'editor')" />
        <button data-test="mode-preview" @click="$emit('change-view-mode', 'preview')" />
        <button data-test="mode-split" @click="$emit('change-view-mode', 'split')" />
        <button data-test="toggle-split-scroll" @click="$emit('toggle-split-scroll')" />
        <button data-test="export-md" @click="$emit('export-md')" />
        <button data-test="export-html" @click="$emit('export-html')" />
        <button data-test="export-pdf" @click="$emit('export-pdf')" />
        <button data-test="share-action" @click="onShareAction?.()" />
        <button data-test="share-link" @click="$emit('share-link')" />
        <button data-test="toggle-toc" @click="$emit('toggle-toc')" />
        <span data-test="split-scroll-state">{{ splitScrollEnabled ? 'on' : 'off' }}</span>
      </div>
    `,
  }),
}));

vi.mock("../components/toc/TocDrawer.vue", () => ({
  default: defineComponent({
    name: "TocDrawerStub",
    props: {
      open: { type: Boolean, default: false },
    },
    emits: ["close", "navigate"],
    template: `
      <div>
        <span data-test="toc-open-state">{{ open ? 'open' : 'closed' }}</span>
        <button data-test="toc-close" @click="$emit('close')" />
        <button data-test="toc-navigate" @click="$emit('navigate', 'heading-2')" />
      </div>
    `,
  }),
}));

const EditorStub = defineComponent({
  name: "Editor",
  props: {
    modelValue: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  template: `<div data-test="editor-stub">{{ modelValue }}</div>`,
});

const PreviewStub = defineComponent({
  name: "Preview",
  setup(_, { expose }) {
    const previewEl = document.createElement("div");
    previewEl.innerHTML = "<p>Rendered preview</p>";

    expose({
      previewEl,
      getScrollRatio: () => 0,
      setScrollRatio: () => { },
      onScrollChange: () => () => { },
    });

    return () => h("div", { "data-test": "preview-stub" });
  },
});

vi.mock("../composables/useTheme", () => ({
  useTheme: () => {
    ensureReactiveState();

    return {
      theme: appState.theme!,
      toggleTheme: appState.toggleThemeMock,
    };
  },
}));

vi.mock("../composables/useMarkdownSource", () => ({
  useMarkdownSource: () => {
    ensureReactiveState();

    return {
      markdownSource: appState.markdownSource!,
    };
  },
}));

vi.mock("../composables/useShareActions", () => ({
  useShareActions: () => {
    ensureReactiveState();

    return {
      shareCopied: appState.shareCopied!,
      onShare: appState.onShareMock,
    };
  },
}));

vi.mock("../composables/useSplitLayout", () => ({
  useSplitLayout: () => {
    ensureReactiveState();
    appState.viewMode!.value = appState.initialViewMode;

    return {
      viewMode: appState.viewMode!,
      splitScrollEnabled: appState.splitScrollEnabled!,
      splitContainerRef: appState.splitContainerRef!,
      isWideLayout: appState.isWideLayout!,
      splitRatio: appState.splitRatio!,
      editorPaneStyle: appState.editorPaneStyle!,
      previewPaneStyle: appState.previewPaneStyle!,
      splitterOrientation: appState.splitterOrientation!,
      onSplitterPointerDown: appState.onSplitterPointerDownMock,
      onSplitterKeydown: appState.onSplitterKeydownMock,
      minSplitRatio: 20,
      maxSplitRatio: 80,
    };
  },
}));

vi.mock("../composables/useSplitScrollSync", () => ({
  useSplitScrollSync: appState.useSplitScrollSyncMock,
}));

vi.mock("../composables/useToc", () => ({
  useToc: () => {
    ensureReactiveState();

    return {
      tocItems: appState.tocItems!,
      activeId: appState.tocActiveId!,
      navigateTo: appState.tocNavigateToMock,
    };
  },
}));

vi.mock("../utils/export", () => ({
  exportPDF: appState.exportPdfMock,
  exportHTML: appState.exportHtmlMock,
  exportMarkdown: appState.exportMarkdownMock,
}));

import App from "../App.vue";

function mountApp() {
  return mount(App, {
    global: {
      stubs: {
        Editor: EditorStub,
        Preview: PreviewStub,
      },
    },
  });
}

describe("App", () => {
  beforeEach(() => {
    ensureReactiveState();

    appState.initialViewMode = "split";
    appState.markdownSource!.value = "# Initial markdown";
    appState.theme!.value = "light";
    appState.shareCopied!.value = false;
    appState.viewMode!.value = "split";
    appState.splitScrollEnabled!.value = false;
    appState.tocActiveId!.value = "intro";

    vi.clearAllMocks();
  });

  it("wires toolbar actions to exports/share and split-scroll toggle", async () => {
    const wrapper = mountApp();
    await flushPromises();

    await wrapper.get('[data-test="toggle-theme"]').trigger("click");
    await wrapper.get('[data-test="toggle-split-scroll"]').trigger("click");
    await wrapper.get('[data-test="export-md"]').trigger("click");
    await wrapper.get('[data-test="export-html"]').trigger("click");
    await wrapper.get('[data-test="export-pdf"]').trigger("click");
    await wrapper.get('[data-test="share-action"]').trigger("click");
    await wrapper.get('[data-test="share-link"]').trigger("click");

    expect(appState.toggleThemeMock).toHaveBeenCalledTimes(1);
    expect(appState.splitScrollEnabled!.value).toBe(true);
    expect(wrapper.get('[data-test="split-scroll-state"]').text()).toBe("on");

    expect(appState.exportMarkdownMock).toHaveBeenCalledWith(
      "# Initial markdown",
      "markflow-export",
    );
    expect(appState.exportHtmlMock).toHaveBeenCalledWith(
      "<p>Rendered preview</p>",
      "markflow-export",
    );
    expect(appState.exportPdfMock).toHaveBeenCalledTimes(1);

    const [pdfElementArg, pdfNameArg] = appState.exportPdfMock.mock.calls[0] ?? [];
    expect(pdfElementArg).toBeInstanceOf(HTMLDivElement);
    expect(pdfNameArg).toBe("markflow-export");

    expect(appState.onShareMock).toHaveBeenCalledTimes(2);
  });

  it("switches panes by view mode and forwards splitter events", async () => {
    const wrapper = mountApp();
    await flushPromises();

    expect(wrapper.find('[data-test="editor-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="preview-stub"]').exists()).toBe(true);
    expect(wrapper.find('[role="separator"]').exists()).toBe(true);

    await wrapper.get('[data-test="mode-editor"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-test="editor-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="preview-stub"]').exists()).toBe(false);
    expect(wrapper.find('[role="separator"]').exists()).toBe(false);

    await wrapper.get('[data-test="mode-preview"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-test="editor-stub"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="preview-stub"]').exists()).toBe(true);

    await wrapper.get('[data-test="mode-split"]').trigger("click");
    await flushPromises();

    const separator = wrapper.get('[role="separator"]');
    await separator.trigger("pointerdown");
    await separator.trigger("keydown", { key: "ArrowRight" });

    expect(appState.onSplitterPointerDownMock).toHaveBeenCalledTimes(1);
    expect(appState.onSplitterKeydownMock).toHaveBeenCalledTimes(1);
  });

  it("opens and closes TOC and navigates to heading", async () => {
    const wrapper = mountApp();
    await flushPromises();

    expect(wrapper.get('[data-test="toc-open-state"]').text()).toBe("closed");

    await wrapper.get('[data-test="toggle-toc"]').trigger("click");
    await flushPromises();
    expect(wrapper.get('[data-test="toc-open-state"]').text()).toBe("open");

    await wrapper.get('[data-test="toc-navigate"]').trigger("click");
    await flushPromises();

    expect(appState.tocNavigateToMock).toHaveBeenCalledWith("heading-2");
    expect(wrapper.get('[data-test="toc-open-state"]').text()).toBe("closed");

    await wrapper.get('[data-test="toggle-toc"]').trigger("click");
    await wrapper.get('[data-test="toc-close"]').trigger("click");
    await flushPromises();

    expect(wrapper.get('[data-test="toc-open-state"]').text()).toBe("closed");
  });

  it("skips HTML/PDF export when preview is not rendered", async () => {
    appState.initialViewMode = "editor";

    const wrapper = mountApp();
    await flushPromises();

    await wrapper.get('[data-test="export-html"]').trigger("click");
    await wrapper.get('[data-test="export-pdf"]').trigger("click");

    expect(wrapper.find('[data-test="preview-stub"]').exists()).toBe(false);
    expect(appState.exportHtmlMock).not.toHaveBeenCalled();
    expect(appState.exportPdfMock).not.toHaveBeenCalled();
  });
});
