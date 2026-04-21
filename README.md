# MarkFlow

MarkFlow is a local Markdown editor with live preview, Mermaid/LaTeX support, and PDF/HTML export.

## Current Capabilities

- Three UI modes: `Editor`, `Split`, `Preview`.
- Live preview powered by a `remark/rehype` pipeline.
- Support for `GFM` (tables, task lists, etc.), `KaTeX`, `Mermaid`, and `highlight.js`.
- GitHub-style Alerts such as `> [!NOTE]` and `> [!WARNING]`.
- HTML sanitization via `DOMPurify` (including `svg` and `mathML`).
- Synced scroll between editor and preview (only in `Split` mode).
- Export to `MD`, `HTML`, and `PDF`.
- Share link with content stored in hash URL (`deflate-raw` compression with uncompressed fallback).
- Autosave to `localStorage`.
- Light/Dark theme with system theme detection.

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Docker

```bash
docker compose up --build -d
```

The app will be available at `http://localhost:8080`.

## Important Caveats

- There is no backend: all data stays in the user's browser.
- Share links are not encrypted: content can be reconstructed from the URL.
- Very long notes may exceed URL length limits in some browsers.
- PDF export opens the system print dialog (popup permissions are required).
