function collectInlineStyles(): string {
  return Array.from(document.querySelectorAll("style"))
    .map((styleNode) => styleNode.outerHTML)
    .join("\n");
}

async function collectLinkedStyles(
  onFetchError: (href: string) => string,
): Promise<string> {
  const linkNodes = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  );

  const fetchedStyles = await Promise.all(
    linkNodes.map(async (linkNode) => {
      try {
        const response = await fetch(linkNode.href);
        const css = await response.text();
        return `<style>${css}</style>`;
      } catch {
        return onFetchError(linkNode.href);
      }
    }),
  );

  return fetchedStyles.join("\n");
}

function downloadTextFile(
  content: string,
  mimeType: string,
  filenameWithExtension: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filenameWithExtension;
  link.click();

  URL.revokeObjectURL(objectUrl);
}

function expandCollapsibleSections(htmlContent: string): string {
  const container = document.createElement("div");
  container.innerHTML = htmlContent;

  container.querySelectorAll("details").forEach((detailsEl) => {
    detailsEl.setAttribute("open", "");
  });

  return container.innerHTML;
}

/**
 * Export the preview element as a PDF file with selectable text.
 * Opens a styled print window and triggers the browser's native print dialog,
 * which allows saving as PDF with real, searchable, copy-able text.
 */
export async function exportPDF(
  el: HTMLElement,
  filename = "document",
): Promise<void> {
  const inlineStyles = collectInlineStyles();
  const linkedStyles = await collectLinkedStyles(() => "");
  const expandedHtmlContent = expandCollapsibleSections(el.innerHTML);

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${filename}</title>
  ${inlineStyles}
  ${linkedStyles}
  <style>
    html,
    body,
    #app {
      height: auto !important;
      overflow: auto !important;
    }

    body {
      max-width: 860px;
      margin: 40px auto;
      padding: 0 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292e;
      background: #ffffff;
    }
    pre { white-space: pre-wrap; word-break: break-word; }
    img, svg { max-width: 100%; height: auto; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @media print {
      body { margin: 0; padding: 16px 24px; }
    }
  </style>
</head>
<body class="markdown-body">
${expandedHtmlContent}
<script>window.onload = function () { window.focus(); window.print(); }<\/script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Please allow pop-ups in your browser to export PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(doc);
  printWindow.document.close();
}

/**
 * Export the rendered HTML as a self-contained .html file.
 * Inlines KaTeX and highlight.js CSS from the document's stylesheets.
 */
export async function exportHTML(
  htmlContent: string,
  filename = "document",
): Promise<void> {
  const inlineStyles = collectInlineStyles();
  const linkedStyles = await collectLinkedStyles(
    (href) => `<!-- could not inline stylesheet: ${href} -->`,
  );
  const expandedHtmlContent = expandCollapsibleSections(htmlContent);

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${filename}</title>
  ${inlineStyles}
  ${linkedStyles}
  <style>
    html,
    body,
    #app {
      height: auto !important;
      overflow: auto !important;
    }

    body {
      max-width: 860px;
      margin: 40px auto;
      padding: 0 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #24292e;
    }
  </style>
</head>
<body class="markdown-body">
${expandedHtmlContent}
</body>
</html>`;

  downloadTextFile(doc, "text/html;charset=utf-8", `${filename}.html`);
}

/**
 * Export the raw Markdown source as a .md file.
 * Opens in any text editor; rendered natively by GitHub, VS Code, Obsidian, etc.
 */
export function exportMarkdown(markdown: string, filename = "document"): void {
  downloadTextFile(markdown, "text/markdown;charset=utf-8", `${filename}.md`);
}
