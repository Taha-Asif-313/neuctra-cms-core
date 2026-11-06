import { Type, Trash2, Heading } from "lucide-react";

/* =========================================
   HEADING EDITOR
========================================= */

interface HeadingEditorProps {
  value?: string;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  onChange?: (value: string) => void;
  onLevelChange?: (level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => void;
  onDelete?: () => void;
  placeholder?: string;
}

const HeadingEditor = ({
  value = "",
  level = "h3",
  onChange,
  onLevelChange,
  onDelete,
  placeholder = "Heading...",
}: HeadingEditorProps) => {
  const levels = [
    {
      value: "h1" as const,
      label: "H1",
      className: "text-5xl font-bold",
    },

    {
      value: "h2" as const,
      label: "H2",
      className: "text-4xl font-semibold",
    },

    {
      value: "h3" as const,
      label: "H3",
      className: "text-3xl font-semibold",
    },

    {
      value: "h4" as const,
      label: "H4",
      className: "text-2xl font-semibold",
    },

    {
      value: "h5" as const,
      label: "H5",
      className: "text-xl font-semibold",
    },

    {
      value: "h6" as const,
      label: "H6",
      className: "text-lg font-medium",
    },
  ];

  const current = levels.find((item) => item.value === level) || levels[0];

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-zinc-300/20 px-5 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg px-4 py-2.5 bg-zinc-900">
            <Heading size={14} className="text-white" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* LEVEL BADGE */}
          <div
            className="
          flex items-center
          rounded-lg
          px-4 py-2.5
          text-xs
          leading-none
          bg-zinc-900
          text-zinc-200
        "
          >
            {current.label}
          </div>

          {/* DELETE */}
          <button
            onClick={onDelete}
            className="
          flex items-center justify-center
          rounded-lg
          px-4 py-2.5
          bg-red-600/5
          text-red-600
          transition-all duration-200
          hover:scale-105
        "
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* LEVEL SELECTOR */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-300/20 bg-zinc-900/40 p-4">
        {levels.map((item) => {
          const active = level === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onLevelChange?.(item.value)}
              className={`
            flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs
            transition-all duration-200

            ${
              active
                ? "bg-zinc-900 text-zinc-200"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }
          `}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="px-5 py-4">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`
        w-full
        bg-transparent
        outline-none
        text-white
        placeholder:text-white/30
        transition-all

        ${current.className}
      `}
        />
      </div>
    </div>
  );
};

export default HeadingEditor;
