import React from "react";

interface RichTextPreviewProps {
  value?: string;
  className?: string;
  theme?: "light" | "dark";
}

const RichTextPreview = ({
  value = "",
  className = "",
  theme = "dark",
}: RichTextPreviewProps) => {
  const hasContent =
    value && value.replace(/<p><br><\/p>|<p><\/p>|<br>/gi, "").trim();

  if (!hasContent) return null;

  const isDark = theme === "dark";

  return (
    <div
      className={`
        prose max-w-none
        ${isDark ? "prose-invert" : ""}

        ${
          isDark
            ? `
              prose-p:text-zinc-300
              prose-strong:text-white
              prose-em:text-zinc-400
              prose-headings:text-white
              prose-li:text-zinc-300
              prose-code:text-cyan-400
              prose-code:bg-white/5
              prose-pre:bg-black/40
              prose-pre:border-white/10
              [&_blockquote]:text-zinc-200
            `
            : `
              prose-p:text-zinc-700
              prose-strong:text-zinc-900
              prose-em:text-zinc-600
              prose-headings:text-zinc-900
              prose-li:text-zinc-700
              prose-code:text-cyan-700
              prose-code:bg-zinc-100
              prose-pre:bg-zinc-100
              prose-pre:border-zinc-200
              [&_blockquote]:text-zinc-800
            `
        }

        prose-p:leading-8
        prose-p:text-lg

        prose-a:text-cyan-500
        prose-a:no-underline
        prose-a:hover:underline

        prose-h1:text-3xl
        prose-h2:text-2xl
        prose-h3:text-xl

        prose-ul:list-disc
        prose-ol:list-decimal

        prose-li:text-lg
        prose-li:leading-7
        prose-li:pl-2
        prose-li:my-2

        prose-code:px-1.5
        prose-code:py-0.5
        prose-code:rounded-md

        prose-pre:border
        prose-pre:rounded-xl

        [&_blockquote]:border-l-4
        [&_blockquote]:border-[#00C214]
        [&_blockquote]:pl-2
        [&_blockquote]:italic
        [&_blockquote]:my-5

        [&_ul]:space-y-2
        [&_ul]:pl-6
        [&_ol]:space-y-2
        [&_ol]:pl-6

        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};

export default RichTextPreview;
