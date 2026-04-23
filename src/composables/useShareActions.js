import { onBeforeUnmount, ref } from "vue";
import { buildShareUrl } from "../utils/share.js";

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to a hidden textarea for browsers without clipboard permissions.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}

export function useShareActions(markdownSource) {
  const shareCopied = ref(false);
  let resetCopiedTimeoutId = null;

  onBeforeUnmount(() => {
    if (resetCopiedTimeoutId !== null) {
      window.clearTimeout(resetCopiedTimeoutId);
    }
  });

  async function onShare() {
    try {
      const url = await buildShareUrl(markdownSource.value);
      const copied = await copyText(url);

      if (!copied) {
        window.prompt("Copy this link:", url);
        return;
      }

      shareCopied.value = true;

      if (resetCopiedTimeoutId !== null) {
        window.clearTimeout(resetCopiedTimeoutId);
      }

      resetCopiedTimeoutId = window.setTimeout(() => {
        shareCopied.value = false;
        resetCopiedTimeoutId = null;
      }, 2000);
    } catch (error) {
      console.warn("Share failed:", error);
    }
  }

  return {
    shareCopied,
    onShare,
  };
}
