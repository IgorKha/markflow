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

export const DEFAULT_CONTENT = `# MarkFlow Markdown Showcase

This starter note demonstrates most Markdown features supported in MarkFlow.

## Headings

### H3 Example
#### H4 Example

## Text Formatting

- *Italic*, **bold**, ***bold italic***, ~~strikethrough~~
- Inline code: \`npm run dev\`
- Superscript with HTML: 2<sup>10</sup>
- Subscript with HTML: H<sub>2</sub>O
- Escaped characters: \\*not italic\\* and \\[not a link\](#)

## Links, Anchors, and Footnotes

- Link: [Example website](https://example.com)
- Auto-link: https://example.com/docs
- Jump to [Math section](#math-katex)
- Footnote reference[^md-note]

## Lists

1. Ordered item
2. Ordered item with nested bullets
   - Nested bullet A
   - Nested bullet B
3. Third item

- [x] Task done
- [ ] Task pending
- [ ] Task with \`inline code\`

## Blockquotes

> Markdown can also express quoted text.
>
> > Nested quote level two.
>
> Back to level one.

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

## Horizontal Rule

---

## Math (KaTeX)

Inline: $E = mc^2$

Block:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

## Code Blocks

\`\`\`ts
type User = { id: number; name: string };

const greet = (user: User): string => {
  return \`Hello, \${user.name}!\`;
};

console.log(greet({ id: 1, name: "MarkFlow" }));
\`\`\`

\`\`\`diff
- old title
+ new title
\`\`\`

## Mermaid Diagram

\`\`\`mermaid
flowchart LR
  A[Write Markdown] --> B{Preview}
  B --> C[Export PDF]
  B --> D[Export HTML]
\`\`\`

## GFM Table

| Feature | Support | Notes |
|:--|:--:|--:|
| GFM | Yes | Core syntax |
| KaTeX | Yes | Inline and block math |
| Mermaid | Yes | Rendered in preview |
| Alerts | Yes | GitHub callout style |

## Inline HTML

<details>
  <summary>Collapsible section</summary>

You can mix HTML in Markdown when you need richer layout.

</details>

[^md-note]: Footnotes are part of GFM and useful for references.
`;
