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
  level = "h1",
  onChange,
  onLevelChange,
  onDelete,
  placeholder = "Heading...",
}: HeadingEditorProps) => {
  const levels = [
    {
      value: "h1" as const,
      label: "H1",
      className: "text-5xl font-black",
    },

    {
      value: "h2" as const,
      label: "H2",
      className: "text-4xl font-bold",
    },

    {
      value: "h3" as const,
      label: "H3",
      className: "text-3xl font-bold",
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
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-linear-to-b
        from-white/3
        to-transparent
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg px-4 py-2.5 bg-violet-400/5">
            <Heading size={14} className="text-violet-400" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* LEVEL BADGE (matched to preview style) */}
          <div
            className="
        flex items-center
        rounded-lg
        px-4 py-2.5
        text-xs
        leading-none
        bg-white/5
        text-white/60
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
        text-red-500
        transition-all duration-200
        hover:bg-red-500/10
        hover:text-red-400
        hover:scale-105
      "
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* LEVEL SELECTOR */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
          border-b
          border-white/10
          bg-white/2
          p-4
        "
      >
        {levels.map((item) => {
          const active = level === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onLevelChange?.(item.value)}
              className={`
                flex
                items-center
                gap-2
                rounded-lg
                border
                px-4
                py-2.5
                text-xs
                transition-all
                duration-200

                ${
                  active
                    ? `
                      border-violet-500/30
                      bg-violet-500/10
                      text-violet-300
                    `
                    : `
                      border-white/10
                      bg-white/5
                      text-white/60
                      hover:bg-white/10
                      hover:text-white
                    `
                }
              `}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="p-5">
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
