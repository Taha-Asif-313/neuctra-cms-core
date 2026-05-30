import { Type } from "lucide-react";

interface RichTextPreviewProps {
  value?: string;
  className?: string;
}

const RichTextPreview = ({
  value = "",
  className = "",
}: RichTextPreviewProps) => {
  const hasContent =
    value && value.replace(/<p><br><\/p>|<p><\/p>|<br>/gi, "").trim();

  if (!hasContent) return null;

  return (
    <div
      className={`
        prose prose-invert max-w-none
        prose-p:text-white/75
        prose-p:leading-8
        prose-p:text-lg
        prose-strong:text-white
        prose-em:text-white/60
        prose-a:text-cyan-400
        prose-a:no-underline
        prose-a:hover:underline
        prose-headings:text-white
        prose-h1:text-3xl
        prose-h2:text-2xl
        prose-h3:text-xl
        prose-ul:list-disc
        prose-ol:list-decimal
        prose-li:text-white/75
        prose-li:text-lg
        prose-li:leading-7
        prose-li:pl-2
        prose-li:my-2
        prose-code:text-cyan-400
        prose-code:bg-white/5
        prose-code:px-1.5
        prose-code:py-0.5
        prose-code:rounded
        prose-pre:bg-black/40
        prose-pre:border
        prose-pre:border-white/10
        prose-pre:rounded-xl

        [&_blockquote]:border-l-4
        [&_blockquote]:border-primary/60
        [&_blockquote]:pl-3
        [&_blockquote]:italic
        [&_blockquote]:text-white/90
        [&_blockquote]:my-6

        [&_ul]:space-y-2
        [&_ul]:pl-6
        [&_ol]:space-y-2
        [&_ol]:pl-6
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: value || "" }}
    />
  );
};

export default RichTextPreview;
