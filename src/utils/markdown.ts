import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

interface HastNode {
  type: string;
  tagName?: string;
  children?: HastNode[];
  value?: string;
  properties?: Record<string, unknown>;
}

interface HastParent extends HastNode {
  children: HastNode[];
}

interface HastText extends HastNode {
  type: "text";
  value: string;
}

// GitHub Alerts (> [!NOTE] / TIP / IMPORTANT / WARNING / CAUTION)
const ALERT_LABELS = {
  NOTE: "Note",
  TIP: "Tip",
  IMPORTANT: "Important",
  WARNING: "Warning",
  CAUTION: "Caution",
} as const;

// Octicon SVG icons matching what GitHub renders for each alert type.
const ALERT_ICONS = {
  NOTE: '<svg class="octicon octicon-info mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>',
  TIP: '<svg class="octicon octicon-light-bulb mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 14.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>',
  IMPORTANT:
    '<svg class="octicon octicon-report mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>',
  WARNING:
    '<svg class="octicon octicon-alert mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>',
  CAUTION:
    '<svg class="octicon octicon-stop mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>',
} as const;

const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n?/;

type AlertType = keyof typeof ALERT_LABELS;

function isElement(node: HastNode, tagName?: string): node is HastParent {
  if (node.type !== "element") {
    return false;
  }

  if (tagName && node.tagName !== tagName) {
    return false;
  }

  return Array.isArray(node.children);
}

function isText(node: HastNode | undefined): node is HastText {
  return Boolean(node && node.type === "text" && typeof node.value === "string");
}

/**
 * Rehype plugin: converts GitHub-style alert blockquotes into
 * <div class="markdown-alert markdown-alert-{type}"> elements that
 * github-markdown-css already styles correctly.
 */
function rehypeGitHubAlerts() {
  return (tree: HastNode) => {
    walkBlockquotes(tree, (node, index, parent) => {
      const firstPIdx = node.children.findIndex((child) =>
        isElement(child, "p"),
      );

      if (firstPIdx === -1) return;

      const firstP = node.children[firstPIdx] as HastParent;
      const firstText = firstP.children[0];
      if (!isText(firstText)) return;

      const match = firstText.value.match(ALERT_RE);
      if (!match) return;

      const type = match[1] as AlertType;

      firstText.value = firstText.value.slice(match[0].length);

      const contentChildren = [...node.children];
      const firstPEmpty = firstP.children.every(
        (child) => isText(child) && !child.value.trim(),
      );

      if (firstPEmpty) {
        contentChildren.splice(firstPIdx, 1);
      }

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["markdown-alert", `markdown-alert-${type.toLowerCase()}`],
        },
        children: [
          {
            type: "element",
            tagName: "p",
            properties: { className: ["markdown-alert-title"] },
            children: [
              { type: "raw", value: ALERT_ICONS[type] },
              { type: "text", value: ALERT_LABELS[type] },
            ],
          },
          ...contentChildren,
        ],
      };
    });
  };
}

/** Depth-first walk that calls `visitor` for every blockquote element. */
function walkBlockquotes(
  node: HastNode,
  visitor: (node: HastParent, index: number, parent: HastParent) => void,
  index = -1,
  parent?: HastParent,
): void {
  if (isElement(node, "blockquote") && parent) {
    visitor(node, index, parent);

    const target = parent.children[index];
    if (target && isElement(target)) {
      target.children.forEach((child, childIndex) =>
        walkBlockquotes(child, visitor, childIndex, target),
      );
    }

    return;
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child, childIndex) =>
      walkBlockquotes(child, visitor, childIndex, node as HastParent),
    );
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeKatex)
  .use(rehypeHighlight, { plainText: ["mermaid"] })
  .use(rehypeGitHubAlerts)
  .use(rehypeStringify, { allowDangerousHtml: true });

/**
 * Render Markdown string to HTML string.
 * Mermaid code blocks are left as <pre><code class="language-mermaid">
 * and are processed client-side by Preview.vue.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}
