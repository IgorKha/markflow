export const STORAGE_KEY = "markflow_content";
export const SPLIT_RATIO_STORAGE_KEY = "markflow_split_ratio";
export const THEME_STORAGE_KEY = "markflow_theme";
export const VIEW_MODE_STORAGE_KEY = "markflow_view_mode";
export const SPLIT_SCROLL_ENABLED_STORAGE_KEY = "markflow_split_scroll_enabled";

export const DEFAULT_SPLIT_RATIO = 50;
export const MIN_SPLIT_RATIO = 20;
export const MAX_SPLIT_RATIO = 80;

export const SPLIT_KEYBOARD_STEP = 2;
export const SPLIT_KEYBOARD_STEP_LARGE = 5;

export const DEFAULT_CONTENT = `# Welcome to MarkFlow

A live Markdown editor with **GFM**, LaTeX math, Mermaid diagrams, and code highlighting.

---

## Math (KaTeX)

Inline: $E = mc^2$

Block:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

## Code

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`
console.log(greet('MarkFlow'))
\`\`\`

## Mermaid Diagram

\`\`\`mermaid
flowchart LR
  A[Write Markdown] --> B{Preview}
  B --> C[Export PDF]
  B --> D[Export HTML]
\`\`\`

## Alerts


> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

## GFM Tables

| Feature       | Status |
|---------------|--------|
| GFM           | \u2705     |
| LaTeX / KaTeX | \u2705     |
| Mermaid       | \u2705     |
| PDF Export    | \u2705     |
| HTML Export   | \u2705     |
| Dark Mode     | \u2705     |

## Task List

- [x] Set up project
- [x] Markdown pipeline
- [ ] Deploy to GitHub Pages
`;
