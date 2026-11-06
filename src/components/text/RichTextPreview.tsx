import { NeuctraDocPreview } from "../../doc-editor/NeuctraDocPreview";

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
  const hasContent = value.replace(/<p><br><\/p>|<p><\/p>|<br>/gi, "").trim();

  if (!hasContent) return null;

  return (
    <NeuctraDocPreview
      value={value}
      theme={theme}
      variant="web"
      className={className}
    />
  );
};

export default RichTextPreview;
