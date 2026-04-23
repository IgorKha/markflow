import { onMounted, ref, watch } from "vue";
import { DEFAULT_CONTENT, STORAGE_KEY } from "../constants/editor";
import { readSharedContent } from "../utils/share";

function readInitialMarkdown(): string {
  if (typeof window === "undefined") {
    return DEFAULT_CONTENT;
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CONTENT;
}

export function useMarkdownSource() {
  const markdownSource = ref<string>(readInitialMarkdown());

  watch(markdownSource, (value) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, value);
  });

  onMounted(async () => {
    const shared = await readSharedContent();
    if (shared === null || typeof window === "undefined") {
      return;
    }

    markdownSource.value = shared;
    window.history.replaceState(null, "", window.location.pathname);
  });

  return {
    markdownSource,
  };
}
