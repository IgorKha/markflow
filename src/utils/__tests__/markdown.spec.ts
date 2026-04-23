import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../markdown";

describe("renderMarkdown", () => {
  it("renders a GitHub alert block", async () => {
    const html = await renderMarkdown(
      "> [!NOTE]\n>\n> Use this carefully.",
    );

    expect(html).toContain("markdown-alert");
    expect(html).toContain("markdown-alert-note");
    expect(html).toContain("markdown-alert-title");
    expect(html).toContain("Use this carefully.");
  });

  it("keeps mermaid code block class for client-side render", async () => {
    const html = await renderMarkdown("```mermaid\nflowchart LR\nA --> B\n```");

    expect(html).toContain("language-mermaid");
    expect(html).toContain("flowchart LR");
  });

  it("renders math through KaTeX", async () => {
    const html = await renderMarkdown("$E = mc^2$");

    expect(html).toContain("katex");
  });
});
