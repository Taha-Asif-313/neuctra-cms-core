/* =========================================
   HEADING PREVIEW
========================================= */

interface HeadingPreviewProps {
  value?: string;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  theme?: "light" | "dark";
}

const HeadingPreview = ({
  value = "",
  level = "h1",
  theme = "dark",
}: HeadingPreviewProps) => {
  const levels: Record<string, string> = {
    h1: "text-5xl font-black",
    h2: "text-4xl font-bold",
    h3: "text-3xl font-bold",
    h4: "text-2xl font-semibold",
    h5: "text-xl font-semibold",
    h6: "text-lg font-medium",
  };

  const className = levels[level] || levels.h1;

  if (!value?.trim()) return null;

  return (
    <div
      className={`
        ${className}
        ${theme === "dark" ? "!text-white" : "!text-zinc-900"}
      `}
    >
      {value}
    </div>
  );
};

export default HeadingPreview;
