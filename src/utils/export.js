import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Export the preview element as a PDF file.
 * Uses html2canvas to render the DOM to a canvas, then embeds it in jsPDF.
 * @param {HTMLElement} el  - The preview container element
 * @param {string} filename - Output filename (without extension)
 */
export async function exportPDF(el, filename = "document") {
  // Clone the element so we can remove scroll/height constraints and capture
  // the full document content — not just what's visible in the viewport.
  const clone = el.cloneNode(true);
  const bg = getComputedStyle(el).backgroundColor || "#ffffff";

  Object.assign(clone.style, {
    position: "fixed",
    top: "0",
    left: "-9999px",
    width: el.offsetWidth + "px",
    height: "auto",
    maxHeight: "none",
    overflow: "visible",
    backgroundColor: bg,
    zIndex: "-1",
  });

  document.body.appendChild(clone);

  // Wait one tick for layout to settle
  await new Promise((r) => requestAnimationFrame(r));

  let canvas;
  try {
    canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: bg,
      width: clone.offsetWidth,
      height: clone.scrollHeight,
      windowWidth: clone.offsetWidth,
      windowHeight: clone.scrollHeight,
    });
  } finally {
    document.body.removeChild(clone);
  }

  const imgData = canvas.toDataURL("image/png");
  const pageW = 210; // A4 mm width
  const pageH = 297; // A4 mm height
  const margin = 10;

  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  // px → mm ratio based on canvas width
  const pxToMm = usableW / canvas.width;
  const imgHeightMm = canvas.height * pxToMm;

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  let remainingHeight = imgHeightMm;
  let offsetY = 0;

  while (remainingHeight > 0) {
    if (offsetY > 0) pdf.addPage();

    const sliceH = Math.min(usableH, remainingHeight);
    const sourceY = (offsetY / imgHeightMm) * canvas.height;
    const sourceH = (sliceH / imgHeightMm) * canvas.height;

    // Create a slice canvas for this page
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sourceH;
    const ctx = pageCanvas.getContext("2d");
    ctx.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      sourceH,
      0,
      0,
      canvas.width,
      sourceH,
    );

    const pageImg = pageCanvas.toDataURL("image/png");
    pdf.addImage(pageImg, "PNG", margin, margin, usableW, sliceH);

    offsetY += usableH;
    remainingHeight -= usableH;
  }

  pdf.save(`${filename}.pdf`);
}

/**
 * Export the rendered HTML as a self-contained .html file.
 * Inlines KaTeX and highlight.js CSS from the document's stylesheets.
 * @param {string} htmlContent  - Inner HTML of the preview element
 * @param {string} filename     - Output filename (without extension)
 */
export function exportHTML(htmlContent, filename = "document") {
  // Collect all <style> and <link rel=stylesheet> content from the page
  const styleNodes = Array.from(document.querySelectorAll("style"));
  const inlineStyles = styleNodes.map((s) => s.outerHTML).join("\n");

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${filename}</title>
  ${inlineStyles}
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
