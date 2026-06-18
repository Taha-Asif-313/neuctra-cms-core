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
  Link,
  LucideIcon,
  RemoveFormatting,
} from "lucide-react";
import { Select } from "@neuctra/ui";
import { useRef, useEffect, useState } from "react";
import RichTextPreview from "./RichTextPreview";

const FONTS = [
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Jameel Noori", value: "'JameelNoori', serif" },
  { label: "Quran Font", value: "'QuranFont', serif" },
  { label: "Quran Surah", value: "'QuranSurah', serif" },
  { label: "Hafs", value: "'Hafs', serif" },
];

const FONT_SIZES = [
  { label: "Small", value: "14px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "18px" },
  { label: "XL", value: "20px" },
  { label: "2XL", value: "24px" },
  { label: "3XL", value: "30px" },
];

/* =========================================
   RICH TEXT EDITOR
========================================= */

interface RichTextEditorProps {
  value?: string;
  onChange: (html: string) => void;
  onDelete?: () => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({
  value = "",
  onChange,
  onDelete,
  placeholder = "Write...",
  className = "",
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);
  const [linkModal, setLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [preview, setPreview] = useState(false);

  const fontOptions = FONTS.map((font) => ({
    label: font.label,
    value: font.value,
  }));

  const fontSizeOptions = FONT_SIZES.map((fontSize) => ({
    label: fontSize.label,
    value: fontSize.value,
  }));

  const [fontFamily, setFontFamily] = useState("");
  const [fontSize, setFontSize] = useState("");

  const isSelectionInsideEditor = (range: Range) => {
    const el = editorRef.current;
    if (!el) return false;

    const container = range.commonAncestorContainer;
    return el.contains(
      container.nodeType === Node.ELEMENT_NODE
        ? container
        : container.parentElement
    );
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (isSelectionInsideEditor(range)) {
      savedSelection.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedSelection.current;

    if (!selection || !range) return false;

    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  /* INIT SYNC */
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if (!el.innerHTML) {
      el.innerHTML = value || "";
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        clearFormat();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* EXEC COMMAND */
  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value);

    onChange(editorRef.current?.innerHTML || "");
  };

  const insertLink = () => {
    saveSelection();
    setLinkUrl("");
    setLinkModal(true);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;

    const el = editorRef.current;
    if (!el) return;

    el.focus();

    // Restore the saved selection so we insert at the right place
    const selection = window.getSelection();
    if (!selection) return;

    if (savedSelection.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelection.current);
    }

    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    const finalUrl = linkUrl.startsWith("http")
      ? linkUrl
      : `https://${linkUrl}`;

    const a = document.createElement("a");
    a.href = finalUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    // IMPORTANT: force styling class
    a.className = "text-primary underline hover:underline";

    const selectedText = range.toString() || finalUrl;

    a.textContent = selectedText;

    range.deleteContents();
    range.insertNode(a);

    // move cursor after link
    range.setStartAfter(a);
    range.setEndAfter(a);
    selection.removeAllRanges();
    selection.addRange(range);

    onChange(el.innerHTML);

    savedSelection.current = null;
    setLinkModal(false);
    setLinkUrl("");
  };

  const clearFormat = () => {
    const el = editorRef.current;
    const selection = window.getSelection();

    if (!el || !selection || selection.rangeCount === 0) return;

    // Walk up from the cursor node to find the nearest block element
    // that is a direct child of the editor
    let node: Node | null = selection.getRangeAt(0).startContainer;

    // If it's a text node, start from its parent element
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    // Walk up until we find a direct child of the editor root
    while (node && node.parentElement !== el) {
      node = node.parentElement;
    }

    // Nothing found inside the editor
    if (!node || node.parentElement !== el) return;

    const block = node as HTMLElement;

    // Extract plain text, preserving line breaks from <br> elements
    const extractText = (n: Node): string => {
      if (n.nodeType === Node.TEXT_NODE) return n.textContent ?? "";
      if ((n as HTMLElement).tagName === "BR") return "\n";
      return Array.from(n.childNodes).map(extractText).join("");
    };

    const plainText = extractText(block);

    // Rebuild as a clean <p> with no inline styles or nested tags
    const clean = document.createElement("p");
    clean.textContent = plainText;

    block.replaceWith(clean);

    // Restore cursor to end of the cleaned element
    const newRange = document.createRange();
    newRange.selectNodeContents(clean);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);

    onChange(el.innerHTML);
  };

  /* INPUT */
  const handleInput = () => {
    saveSelection();
    onChange(editorRef.current?.innerHTML || "");
  };

  const applyFontFamily = (font: string) => {
    const el = editorRef.current;
    if (!el) return;

    el.focus();
    restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!isSelectionInsideEditor(range)) return;

    if (range.collapsed) {
      document.execCommand("fontName", false, font);
      savedSelection.current = range.cloneRange();
      onChange(el.innerHTML);
      return;
    }

    const span = document.createElement("span");

    span.style.fontFamily = font;

    span.appendChild(range.extractContents());
    range.insertNode(span);

    selection.removeAllRanges();

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    newRange.collapse(false);
    selection.addRange(newRange);
    savedSelection.current = newRange.cloneRange();

    onChange(el.innerHTML);
  };

  const applyFontSize = (size: string) => {
    const el = editorRef.current;
    if (!el) return;

    el.focus();
    restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!isSelectionInsideEditor(range) || range.collapsed) return;

    const span = document.createElement("span");

    span.style.fontSize = size;

    span.appendChild(range.extractContents());
    range.insertNode(span);

    selection.removeAllRanges();

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    newRange.collapse(false);
    selection.addRange(newRange);
    savedSelection.current = newRange.cloneRange();

    onChange(el.innerHTML);
  };

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-300/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg px-4 py-2.5 bg-zinc-900">
              <PenSquare size={14} className="text-white" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* PREVIEW TOGGLE */}
            <button
              onClick={() => setPreview((p) => !p)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                preview
                  ? "bg-zinc-900 text-zinc-200"
                  : "bg-zinc-900 text-zinc-200 hover:bg-zinc-900/10 hover:text-zinc-900"
              }`}
            >
              <Eye size={14} />
            </button>

            {/* DELETE */}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex px-4 py-2.5 items-center justify-center rounded-lg bg-red-600/5 text-red-600 transition-all duration-200 hover:scale-105"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-300/20 bg-zinc-900/40 p-4">
          <Btn icon={Bold} onClick={() => exec("bold")} />
          <Btn icon={Italic} onClick={() => exec("italic")} />
          <Btn icon={Underline} onClick={() => exec("underline")} />
          <Btn icon={Link} onClick={insertLink} />

          <div className="mx-1 h-6 w-px bg-zinc-300/20" />

          <Btn icon={AlignLeft} onClick={() => exec("justifyLeft")} />
          <Btn icon={AlignCenter} onClick={() => exec("justifyCenter")} />
          <Btn icon={AlignRight} onClick={() => exec("justifyRight")} />

          <div className="mx-1 h-6 w-px bg-zinc-300/20" />

          <Btn icon={List} onClick={() => exec("insertUnorderedList")} />
          <Btn icon={ListOrdered} onClick={() => exec("insertOrderedList")} />
          <Btn icon={Quote} onClick={() => exec("formatBlock", "blockquote")} />

          <div className="mx-1 h-6 w-px bg-zinc-300/20" />

          <div onMouseDownCapture={saveSelection} onFocusCapture={saveSelection}>
            <Select
              options={fontOptions}
              value={fontFamily}
              onValueChange={(value) => {
                const font = Array.isArray(value) ? value[0] : value;

                if (typeof font !== "string") return;

                setFontFamily(font);
                applyFontFamily(font);
              }}
              placeholder="Font"
              size="sm"
              triggerClassName="
    h-10 rounded-lg border border-zinc-800
    bg-zinc-900 text-sm text-white
  "
              dropdownClassName="
    bg-zinc-950 border border-zinc-800
  "
              itemClassName="
    text-zinc-200 hover:bg-zinc-900
  "
            />
          </div>

          <div onMouseDownCapture={saveSelection} onFocusCapture={saveSelection}>
            <Select
              options={fontSizeOptions}
              value={fontSize}
              onValueChange={(value) => {
                const size = Array.isArray(value) ? value[0] : value;

                if (typeof size !== "string") return;

                setFontSize(size);
                applyFontSize(size);
              }}
              placeholder="Size"
              size="sm"
              triggerClassName="
    h-10 rounded-lg border border-zinc-800
    bg-zinc-900 text-sm text-white
  "
              dropdownClassName="
    bg-zinc-950 border border-zinc-800
  "
              itemClassName="
    text-zinc-200 hover:bg-zinc-900
  "
            />
          </div>

          <Btn icon={RemoveFormatting} onClick={clearFormat} />
        </div>

        {/* EDITOR */}
        <div
          ref={editorRef}
          contentEditable
          aria-placeholder="Start Writing...."
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onBlur={saveSelection}
          style={{ display: preview ? "none" : "block" }}
          className={`
    min-h-55 px-5 py-2 outline-none leading-8
    prose max-w-none

    prose-p:text-zinc-300
    prose-p:leading-8
    prose-p:text-lg

    prose-strong:text-white
    prose-em:text-zinc-400

    prose-a:text-cyan-400
    prose-a:no-underline
    prose-a:hover:underline

    prose-headings:text-white
    prose-h1:text-3xl
    prose-h2:text-2xl
    prose-h3:text-xl

    [&_ul]:list-disc
    [&_ol]:list-decimal
    [&_li]:list-item

    [&_ul]:pl-6
    [&_ol]:pl-6

    prose-li:text-zinc-300
    prose-li:leading-7

    [&_blockquote]:border-l-4
    [&_blockquote]:border-[#00C214]
    [&_blockquote]:pl-3
    [&_blockquote]:italic
    [&_blockquote]:my-5
    [&_blockquote]:text-zinc-200

    [&_p]:mb-3

    ${className}
  `}
          data-placeholder={placeholder}
        />

        {/* PREVIEW COMPONENT */}
        {preview && <RichTextPreview value={value} />}
      </div>

      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[420px] rounded-2xl border border-zinc-300/30 bg-zinc-50 p-5 shadow-2xl">
            <h2 className="mb-3 text-sm font-medium text-zinc-700">
              Insert Link
            </h2>

            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInsertLink()}
              placeholder="https://example.com"
              autoFocus
              className="w-full rounded-xl border border-zinc-300/40 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-900/50"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  savedSelection.current = null;
                  setLinkModal(false);
                }}
                className="rounded-xl px-3 py-2 text-sm text-zinc-900 hover:text-zinc-900"
              >
                Cancel
              </button>

              <button
                onClick={handleInsertLink}
                className="rounded-xl bg-zinc-800/10 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-800/20"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
      className="
        flex h-10 w-10 items-center justify-center rounded-lg
        border border-zinc-800
        bg-zinc-900
        text-white
        transition-all duration-200
        hover:bg-zinc-900/10
        hover:text-zinc-200
      "
    >
      <Icon size={15} />
    </button>
  );
};

export default RichTextEditor;
