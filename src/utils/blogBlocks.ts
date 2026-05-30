export interface TextBlock {
  id: string;
  type: "text";
  content: string;
}

export interface HeadingBlock {
  id: string;
  type: "heading";
  content: string;
  level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export interface ImageBlock {
  id: string;
  type: "image";
  url: string;
  caption: string;
  width: string | number;
  height: number;
  radius: number;
  opacity: number;
  objectFit: "cover" | "contain" | "fill" | "scale-down";
  shadow?: boolean;
  clickable?: boolean;
  bordered?: boolean;
  showOverlay?: boolean;
  overlayText?: string;
}

export interface CodeBlock {
  id: string;
  type: "code";
  language: string;
  content: string;
}

export interface TableBlock {
  id: string;
  type: "table";
  headers: string[];
  rows: string[][];
}

export type Block = TextBlock | HeadingBlock | ImageBlock | CodeBlock | TableBlock;

export const createBlock = (type: string): Block | null => {
  switch (type) {
    case "text":
      return {
        id: crypto.randomUUID(),
        type: "text",
        content: "",
      };

    case "heading":
      return {
        id: crypto.randomUUID(),
        type: "heading",
        content: "",
        level: "h2",
      };

    case "image":
      return {
        id: crypto.randomUUID(),
        type: "image",
        url: "",
        caption: "",
        width: "100%",
        height: 400,
        radius: 24,
        opacity: 1,
        objectFit: "cover",
      };

    case "code":
      return {
        id: crypto.randomUUID(),
        type: "code",
        language: "javascript",
        content: "",
      };

    case "table":
      return {
        id: crypto.randomUUID(),
        type: "table",
        headers: ["Column 1", "Column 2"],
        rows: [
          ["", ""],
          ["", ""],
        ],
      };

    default:
      return null;
  }
};
