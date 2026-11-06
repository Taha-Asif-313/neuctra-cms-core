import type { Block } from "../utils/blogBlocks";
import { escapeHtml } from "./importExport";

const paragraph = (text: string) => `<p>${escapeHtml(text)}</p>`;

/** Converts block-editor content so it can be opened in NeuctraDocEditor. */
export const blocksToHtml = (blocks: Block[]) =>
  blocks
    .map((block) => {
      switch (block.type) {
        case "text":
          return block.content;
        case "heading":
          return `<${block.level}>${escapeHtml(block.content)}</${block.level}>`;
        case "code":
          return `<pre><code class="language-${escapeHtml(block.language)}">${escapeHtml(block.content)}</code></pre>`;
        case "image":
          return `<img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.caption)}">${block.caption ? paragraph(block.caption) : ""}`;
        case "table": {
          const head = block.headers.map((h) => `<th>${paragraph(h)}</th>`).join("");
          const body = block.rows
            .map(
              (row) =>
                `<tr>${row.map((cell) => `<td>${paragraph(cell)}</td>`).join("")}</tr>`,
            )
            .join("");
          return `<table><tr>${head}</tr>${body}</table>`;
        }
      }
    })
    .join("");
