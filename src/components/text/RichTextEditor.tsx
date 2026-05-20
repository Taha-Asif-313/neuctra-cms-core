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
    document.execCommand(command, false, value);

    const html = editorRef.current?.innerHTML;
    if (html) onChange(html);
  };

  const insertLink = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0).cloneRange();
    }

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
    const html = editorRef.current?.innerHTML;
    if (html) onChange(html);
  };

  return (
    <>
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
          <Btn icon={Link} onClick={insertLink} />

          <div className="mx-1 h-6 w-px bg-white/10" />

          <Btn icon={AlignLeft} onClick={() => exec("justifyLeft")} />
          <Btn icon={AlignCenter} onClick={() => exec("justifyCenter")} />
          <Btn icon={AlignRight} onClick={() => exec("justifyRight")} />

          <div className="mx-1 h-6 w-px bg-white/10" />

          <Btn icon={List} onClick={() => exec("insertUnorderedList")} />
          <Btn icon={ListOrdered} onClick={() => exec("insertOrderedList")} />
          <Btn icon={Quote} onClick={() => exec("formatBlock", "blockquote")} />

          <div className="mx-1 h-6 w-px bg-white/10" />

          <Btn icon={RemoveFormatting} onClick={clearFormat} />
        </div>

        {/* EDITOR */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          style={{ display: preview ? "none" : "block" }}
          className={`
        min-h-55 px-5 py-2 outline-none text-white/80 leading-8
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
        prose-code:text-primary
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
        [&_blockquote]:pl-6
        [&_blockquote]:italic
        [&_blockquote]:text-white/70
        [&_blockquote]:text-xl
        [&_blockquote]:my-6

        [&_ul]:space-y-2
        [&_ul]:pl-6
        [&_ol]:space-y-2
        [&_ol]:pl-6
        ${className}
      `}
          data-placeholder={placeholder}
        />

        {/* PREVIEW COMPONENT */}
        {preview && <RichTextPreview value={value} />}
      </div>

      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[420px] rounded-2xl border border-white/10 bg-[#0f0f12] p-5 shadow-2xl">
            <h2 className="mb-3 text-sm font-medium text-white/80">
              Insert Link
            </h2>

            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInsertLink()}
              placeholder="https://example.com"
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  savedSelection.current = null;
                  setLinkModal(false);
                }}
                className="rounded-xl px-3 py-2 text-sm text-white/60 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleInsertLink}
                className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/30"
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
      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
    >
      <Icon size={15} />
    </button>
  );
};

export default RichTextEditor;