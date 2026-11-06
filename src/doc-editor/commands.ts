import type { Editor } from "@tiptap/core";
import type { SlashItem } from "./extensions/slashCommand";

export type DialogKind =
  | "link"
  | "image"
  | "pageSetup"
  | "shortcuts"
  | "wordCount"
  | null;

export const insertTable = (editor: Editor, rows = 3, cols = 3) =>
  editor
    .chain()
    .focus()
    .insertTable({ rows, cols, withHeaderRow: true })
    .run();

export const clearFormatting = (editor: Editor) =>
  editor
    .chain()
    .focus()
    .unsetAllMarks()
    .clearNodes()
    .unsetTextAlign()
    .run();

export const setBlockStyle = (editor: Editor, level: number) => {
  const chain = editor.chain().focus();
  if (level === 0) chain.setParagraph().run();
  else chain.setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
};

export const normalizeUrl = (raw: string) => {
  const url = raw.trim();
  if (!url) return "";
  return /^(https?:|mailto:|tel:|#|\/)/i.test(url) ? url : `https://${url}`;
};

export const createSlashItems = (
  openDialog: (kind: DialogKind) => void,
): SlashItem[] => [
  {
    title: "Text",
    hint: "Plain paragraph",
    keywords: "paragraph normal",
    run: (e) => e.chain().focus().setParagraph().run(),
  },
  ...[1, 2, 3].map((level) => ({
    title: `Heading ${level}`,
    hint: ["Page section", "Sub-section", "Small heading"][level - 1],
    keywords: `h${level} title`,
    run: (e: Editor) => setBlockStyle(e, level),
  })),
  {
    title: "Bulleted list",
    hint: "Simple list",
    keywords: "ul unordered",
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    hint: "Ordered steps",
    keywords: "ol ordered",
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Checklist",
    hint: "Tasks with checkboxes",
    keywords: "todo task",
    run: (e) => e.chain().focus().toggleTaskList().run(),
  },
  {
    title: "Quote",
    hint: "Call out a passage",
    keywords: "blockquote",
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Code block",
    hint: "Monospaced code",
    keywords: "pre snippet",
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Table",
    hint: "3 × 3 grid",
    keywords: "grid rows columns",
    run: (e) => insertTable(e),
  },
  {
    title: "Image",
    hint: "Upload or paste a link",
    keywords: "picture photo",
    run: () => openDialog("image"),
  },
  {
    title: "Divider",
    hint: "Horizontal line",
    keywords: "hr rule line",
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Page break",
    hint: "Start a new page",
    keywords: "pagebreak new page",
    run: (e) => e.chain().focus().setPageBreak().run(),
  },
];
