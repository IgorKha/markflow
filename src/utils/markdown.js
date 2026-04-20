import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeKatex)
  .use(rehypeHighlight, { ignoreMissing: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

/**
 * Render Markdown string to HTML string.
 * Mermaid code blocks are left as <pre><code class="language-mermaid">
 * and are processed client-side by Preview.vue.
 * @param {string} markdown
 * @returns {Promise<string>}
 */
export async function renderMarkdown(markdown) {
  const file = await processor.process(markdown);
  return String(file);
}
