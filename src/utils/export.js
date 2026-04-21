/**
 * Export the preview element as a PDF file with selectable text.
 * Opens a styled print window and triggers the browser's native print dialog,
 * which allows saving as PDF with real, searchable, copy-able text.
 * @param {HTMLElement} el  - The preview container element
 * @param {string} filename - Output filename (used as window title)
 */
export async function exportPDF(el, filename = "document") {
  const inlineStyles = Array.from(document.querySelectorAll("style"))
    .map((s) => s.outerHTML)
    .join("\n");

  const linkNodes = Array.from(
    document.querySelectorAll('link[rel="stylesheet"]'),
  );
  const fetchedStyles = await Promise.all(
    linkNodes.map(async (link) => {
      try {
        const res = await fetch(link.href);
        const css = await res.text();
        return `<style>${css}</style>`;
      } catch {
        return "";
      }
    }),
  );
  const linkedStyles = fetchedStyles.join("\n");

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${filename}</title>
  ${inlineStyles}
  ${linkedStyles}
  <style>
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
${el.innerHTML}
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
 * @param {string} htmlContent  - Inner HTML of the preview element
 * @param {string} filename     - Output filename (without extension)
 */
export async function exportHTML(htmlContent, filename = "document") {
  const styleNodes = Array.from(document.querySelectorAll("style"));
  const inlineStyles = styleNodes.map((s) => s.outerHTML).join("\n");

  const linkNodes = Array.from(
    document.querySelectorAll('link[rel="stylesheet"]'),
  );
  const fetchedStyles = await Promise.all(
    linkNodes.map(async (link) => {
      try {
        const res = await fetch(link.href);
        const css = await res.text();
        return `<style>${css}</style>`;
      } catch {
        return `<!-- could not inline stylesheet: ${link.href} -->`;
      }
    }),
  );
  const linkedStyles = fetchedStyles.join("\n");

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${filename}</title>
  ${inlineStyles}
  ${linkedStyles}
  <style>
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
${htmlContent}
</body>
</html>`;

  const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export the raw Markdown source as a .md file.
 * Opens in any text editor; rendered natively by GitHub, VS Code, Obsidian, etc.
 * @param {string} markdown - Raw Markdown string
 * @param {string} filename - Output filename (without extension)
 */
export function exportMarkdown(markdown, filename = "document") {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
