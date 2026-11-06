import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { marked } from "marked";

import contentCss from "./content.css?inline";
import { PAGE_SIZES, MARGINS, type PageSetup } from "./constants";

/* =========================================
   HELPERS
========================================= */

export const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const safeFileName = (title: string) =>
  title.trim().replace(/[\\/:*?"<>|]+/g, "-") || "Untitled document";

const download = (name: string, type: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const pageRule = ({ size, landscape, margins }: PageSetup) => {
  const { width, height } = PAGE_SIZES[size];
  const margin = MARGINS[margins];
  const [w, h] = landscape ? [height, width] : [width, height];
  return `@page { size: ${w}px ${h}px; margin: ${margin.y}px ${margin.x}px; }`;
};

const htmlDocument = (title: string, body: string, setup: PageSetup, attrs = "") =>
  `<!DOCTYPE html>
<html ${attrs}>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>${pageRule(setup)}
body { margin: 0; }
${contentCss}</style>
</head>
<body><div class="ndoc-content">${body}</div></body>
</html>`;

/* =========================================
   EXPORT
========================================= */

const createTurndown = () => {
  const service = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
  });
  service.use(gfm);

  service.addRule("taskItem", {
    filter: (node) => node.getAttribute("data-type") === "taskItem",
    replacement: (content, node) => {
      const checked = (node as HTMLElement).getAttribute("data-checked") === "true";
      return `- [${checked ? "x" : " "}] ${content.trim()}\n`;
    },
  });

  service.addRule("pageBreak", {
    filter: (node) => node.hasAttribute("data-page-break"),
    replacement: () => "\n\n---\n\n",
  });

  return service;
};

export const htmlToMarkdown = (html: string) => {
  const dom = new DOMParser().parseFromString(html, "text/html");
  // GFM cells must stay on one line.
  dom.querySelectorAll("th > p, td > p").forEach((p) => {
    p.replaceWith(...Array.from(p.childNodes));
  });
  dom.querySelectorAll("colgroup, li[data-type='taskItem'] > label").forEach((el) =>
    el.remove(),
  );
  return createTurndown().turndown(dom.body.innerHTML);
};

export const exportHtml = (title: string, html: string, setup: PageSetup) =>
  download(
    `${safeFileName(title)}.html`,
    "text/html",
    htmlDocument(title, html, setup),
  );

export const exportMarkdown = (title: string, html: string) =>
  download(
    `${safeFileName(title)}.md`,
    "text/markdown",
    htmlToMarkdown(html),
  );

/** Word-compatible HTML saved as .doc. Word, Pages and Google Docs all open it. */
export const exportWord = (title: string, html: string, setup: PageSetup) =>
  download(
    `${safeFileName(title)}.doc`,
    "application/msword",
    htmlDocument(
      title,
      html,
      setup,
      `xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"`,
    ),
  );

export const exportText = (title: string, text: string) =>
  download(`${safeFileName(title)}.txt`, "text/plain", text);

/** Opens the print dialog on a clean copy; "Save as PDF" lives there too. */
export const printDocument = (title: string, html: string, setup: PageSetup) => {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;left:-9999px";
  document.body.appendChild(frame);

  const target = frame.contentWindow;
  const doc = frame.contentDocument;
  if (!target || !doc) {
    frame.remove();
    return;
  }

  doc.open();
  doc.write(htmlDocument(title, html, setup));
  doc.close();

  const images = Array.from(doc.images).map((img) =>
    img.complete
      ? Promise.resolve()
      : new Promise((done) => {
          img.onload = img.onerror = done;
        }),
  );

  Promise.all(images).then(() => {
    target.addEventListener("afterprint", () => frame.remove(), { once: true });
    target.focus();
    target.print();
  });
};

/* =========================================
   IMPORT
========================================= */

const markTaskLists = (html: string) => {
  const dom = new DOMParser().parseFromString(html, "text/html");
  dom.querySelectorAll("li > input[type='checkbox'], li > p > input[type='checkbox']")
    .forEach((box) => {
      const item = box.closest("li") as HTMLElement;
      item.setAttribute("data-type", "taskItem");
      item.setAttribute("data-checked", String((box as HTMLInputElement).checked));
      item.parentElement?.setAttribute("data-type", "taskList");
      box.remove();
    });
  return dom.body.innerHTML;
};

export const markdownToHtml = (markdown: string) =>
  markTaskLists(marked.parse(markdown, { async: false }) as string);

const textToHtml = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

export const DOCUMENT_FILE_TYPES = ".html,.htm,.md,.markdown,.txt";

export const readDocumentFile = async (file: File) => {
  const name = file.name.toLowerCase();
  const raw = await file.text();
  const title = file.name.replace(/\.[^.]+$/, "");

  if (/\.(md|markdown)$/.test(name)) return { title, html: markdownToHtml(raw) };
  if (/\.html?$/.test(name)) {
    const dom = new DOMParser().parseFromString(raw, "text/html");
    return { title, html: dom.body.innerHTML };
  }
  return { title, html: textToHtml(raw) };
};
