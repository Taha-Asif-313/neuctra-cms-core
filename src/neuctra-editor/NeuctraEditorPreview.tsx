"use client";

import React from "react";
import CodeBlock from "../components/code/CodeBlock";
import RichTextPreview from "../components/text/RichTextPreview";
import HeadingPreview from "../components/heading/HeadingPreview";
import ImagePreview from "../components/image/ImagePreview";
import TablePreview from "../components/table/TablePreview";
import { Block } from "../utils/blogBlocks";

interface NeuctraBlogPreviewProps {
  blocks?: Block[];
  className?: string;
  theme?: "light" | "dark";
}

export const NeuctraEditorPreview = ({
  blocks = [],
  className = "",
  theme = "dark",
}: NeuctraBlogPreviewProps) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`
        space-y-6
        py-6
        px-4
        rounded-lg
        transition-colors
        ${isDark ? " !text-white" : "!text-zinc-900"}
        ${className}
      `}
    >
      {blocks.map((block) => {
        // TEXT
        if (block.type === "text") {
          return (
            <RichTextPreview
              key={block.id}
              value={block.content}
              theme={theme}
            />
          );
        }

        // HEADING
        if (block.type === "heading") {
          return (
            <HeadingPreview
              key={block.id}
              value={block.content}
              level={block.level}
              theme={theme}
            />
          );
        }

        // IMAGE
        if (block.type === "image") {
          return <ImagePreview key={block.id} value={block} theme={theme} />;
        }

        // CODE
        if (block.type === "code") {
          return (
            <CodeBlock
              key={block.id}
              language={block.language}
              code={block.content}
            />
          );
        }

        // TABLE
        if (block.type === "table") {
          return (
            <div
              key={block.id}
              className={`
                rounded-2xl border overflow-hidden
                ${isDark ? "!border-white/10" : "!border-zinc-200"}
              `}
            >
              <TablePreview
                headers={block.headers}
                rows={block.rows}
                theme={theme}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default NeuctraEditorPreview;
