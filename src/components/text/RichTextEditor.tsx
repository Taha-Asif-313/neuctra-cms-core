import {
  List,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  Trash2,
  Eye,
  PenSquare,
  Quote,
  LucideIcon,
} from "lucide-react";

import { useRef, useEffect, useState } from "react";
import RichTextPreview from "./RichTextPreview";

/* =========================================
   RICH TEXT EDITOR
========================================= */

interface RichTextEditorProps {
  value?: string;
  onChange: (html: string) => void;
  onDelete?: () => void;
  placeholder?: string;
}

const RichTextEditor = ({
  value = "",
  onChange,
  onDelete,
  placeholder = "Write...",
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);
  const [preview, setPreview] = useState(false);

  /* INIT SYNC */
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if (!el.innerHTML) {
      el.innerHTML = value || "";
    }
  }, []);

  /* EXEC COMMAND */
  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);

    const html = editorRef.current?.innerHTML;
    if (html) onChange(html);
  };

  /* INPUT */
  const handleInput = () => {
    const html = editorRef.current?.innerHTML;
    if (html) onChange(html);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-white/3 to-transparent">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg px-4 py-2.5 bg-cyan-400/5">
            <PenSquare size={14} className="text-cyan-400" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* PREVIEW TOGGLE */}
          <button
            onClick={() => setPreview((p) => !p)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
              preview
                ? "bg-cyan-500/10 text-cyan-300"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Eye size={14} />
          </button>

          {/* DELETE */}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex px-4 py-2.5 items-center justify-center rounded-lg bg-red-600/5 text-red-600 transition-all duration-200 hover:scale-105 hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/2 p-4">
        <Btn icon={Bold} onClick={() => exec("bold")} />
        <Btn icon={Italic} onClick={() => exec("italic")} />
        <Btn icon={Underline} onClick={() => exec("underline")} />

        <div className="mx-1 h-6 w-px bg-white/10" />

        <Btn icon={AlignLeft} onClick={() => exec("justifyLeft")} />
        <Btn icon={AlignCenter} onClick={() => exec("justifyCenter")} />
        <Btn icon={AlignRight} onClick={() => exec("justifyRight")} />

        <div className="mx-1 h-6 w-px bg-white/10" />

        <Btn icon={List} onClick={() => exec("insertUnorderedList")} />
        <Btn icon={ListOrdered} onClick={() => exec("insertOrderedList")} />

        <Btn icon={Quote} onClick={() => exec("formatBlock", "blockquote")} />
      </div>

      {/* EDITOR */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        style={{ display: preview ? "none" : "block" }}
        className="
    min-h-55 px-5 py-2 outline-none text-white/80 leading-8

    [&_ul]:list-disc
    [&_ol]:list-decimal
    [&_ul]:pl-6
    [&_ol]:pl-6
    [&_li]:ml-2

    /* QUOTE STYLE */
    [&_blockquote]:border-l-4
    [&_blockquote]:border-primary/60
    [&_blockquote]:pl-4
    [&_blockquote]:italic
    [&_blockquote]:py-2
    [&_blockquote]:rounded-r-lg
    [&_blockquote]:my-2

    [&:empty:before]:content-[attr(data-placeholder)]
    [&:empty:before]:text-white/30
    [&:empty:before]:pointer-events-none
  "
        data-placeholder={placeholder}
      />

      {/* PREVIEW COMPONENT */}
      {preview && <RichTextPreview value={value} />}
    </div>
  );
};

/* =========================================
   BUTTON
========================================= */

interface BtnProps {
  icon: LucideIcon;
  onClick: () => void;
}

const Btn = ({ icon: Icon, onClick }: BtnProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
    >
      <Icon size={15} />
    </button>
  );
};

export default RichTextEditor;
