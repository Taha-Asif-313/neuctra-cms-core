import type { Editor, Extensions } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import { Paragraph } from "@tiptap/extension-paragraph";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Image } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { CharacterCount, Placeholder } from "@tiptap/extensions";

import { PageBreak } from "./pageBreak";
import { ParagraphFormat } from "./paragraphFormat";
import { Pagination, type PageMetrics } from "./pagination";
import { SearchReplace } from "./searchReplace";
import { SlashCommand, type SlashItem } from "./slashCommand";

export type UploadImage = (file: File) => Promise<string>;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Uploads through the host app when it can, otherwise embeds the image. */
export const insertImageFile = async (
  editor: Editor,
  file: File,
  upload?: UploadImage,
  position?: number,
) => {
  const src = await (upload ?? readAsDataUrl)(file);
  const image = { type: "image", attrs: { src, alt: file.name } };
  const chain = editor.chain().focus();
  (position === undefined
    ? chain.insertContent(image)
    : chain.insertContentAt(position, image)
  ).run();
};

const imageFiles = (files?: FileList | null) =>
  Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));

const ImageDrop = Extension.create<{ upload?: () => UploadImage | undefined }>({
  name: "imageDrop",

  addOptions() {
    return { upload: undefined };
  },

  onCreate() {
    const { editor, options } = this;
    const fail = (error: unknown) => console.error("Image insert failed", error);

    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        handlePaste: (_view, event) => {
          const files = imageFiles(event.clipboardData?.files);
          if (!files.length) return false;
          files.forEach((f) =>
            insertImageFile(editor, f, options.upload?.()).catch(fail),
          );
          return true;
        },
        handleDrop: (view, event, _slice, moved) => {
          const files = imageFiles(event.dataTransfer?.files);
          if (moved || !files.length) return false;
          const pos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          })?.pos;
          files.forEach((f) =>
            insertImageFile(editor, f, options.upload?.(), pos).catch(fail),
          );
          return true;
        },
      },
    });
  },
});

/** `execCommand` content stored by older versions aligns with a bare div. */
const LegacyParagraph = Paragraph.extend({
  parseHTML() {
    return [
      { tag: "p" },
      {
        tag: "div",
        getAttrs: (el) => (el.style.textAlign ? null : false),
      },
    ];
  },
});

export interface ExtensionOptions {
  placeholder?: string;
  metrics?: PageMetrics | null;
  slashItems: () => SlashItem[];
  upload: () => UploadImage | undefined;
}

export const buildExtensions = ({
  placeholder,
  metrics = null,
  slashItems,
  upload,
}: ExtensionOptions): Extensions => [
  StarterKit.configure({
    paragraph: false,
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    link: {
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    },
  }),
  LegacyParagraph,
  TextStyleKit.configure({ backgroundColor: false, lineHeight: false }),
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Subscript,
  Superscript,
  Image.configure({
    allowBase64: true,
    resize: {
      enabled: true,
      directions: ["bottom-right", "bottom-left", "top-right", "top-left"],
      minWidth: 48,
      minHeight: 48,
      alwaysPreserveAspectRatio: true,
    },
  }),
  TableKit.configure({ table: { resizable: true, cellMinWidth: 48 } }),
  TaskList,
  TaskItem.configure({ nested: true }),
  CharacterCount,
  Placeholder.configure({
    placeholder: placeholder ?? "Type / for commands",
  }),
  ParagraphFormat,
  PageBreak,
  SearchReplace,
  Pagination.configure({ metrics }),
  SlashCommand.configure({ items: slashItems }),
  ImageDrop.configure({ upload }),
];
