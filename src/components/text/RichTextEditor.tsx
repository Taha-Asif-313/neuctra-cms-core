import { useState } from "react";
import { EditorContent } from "@tiptap/react";
import { Eye, PenSquare, Trash2 } from "lucide-react";

import type { DialogKind } from "../../doc-editor/commands";
import type { UploadImage } from "../../doc-editor/extensions";
import { DocToolbar } from "../../doc-editor/ui/DocToolbar";
import {
  EditorOverlays,
  handleSharedShortcuts,
} from "../../doc-editor/ui/EditorOverlays";
import { useDocEditor } from "../../doc-editor/useDocEditor";
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
  uploadImage?: UploadImage;
}

const RichTextEditor = ({
  value = "",
  onChange,
  onDelete,
  placeholder = "Write...",
  className = "",
  uploadImage,
}: RichTextEditorProps) => {
  const [preview, setPreview] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);

  const { editor } = useDocEditor({
    value,
    onChange,
    placeholder,
    uploadImage,
    openDialog: setDialog,
    contentClass: `ndoc-prose ndoc-content--web ${className}`,
  });

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-zinc-300/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg px-4 py-2.5 bg-zinc-900">
            <PenSquare size={14} className="text-white" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={preview ? "Back to editing" : "Preview"}
            aria-pressed={preview}
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm bg-zinc-900 text-zinc-200 transition-all duration-200 hover:bg-zinc-800"
          >
            <Eye size={14} />
          </button>

          {onDelete && (
            <button
              type="button"
              aria-label="Delete block"
              onClick={onDelete}
              className="flex px-4 py-2.5 items-center justify-center rounded-lg bg-red-600/5 text-red-600 transition-all duration-200 hover:scale-105"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div
        className="ndoc-scope ndoc-compact"
        data-theme="dark"
        onKeyDown={(e) => editor && handleSharedShortcuts(e, editor, setDialog)}
      >
        {editor && !preview && (
          <DocToolbar editor={editor} compact theme="dark" openDialog={setDialog} />
        )}

        <div hidden={preview}>
          <EditorContent editor={editor} />
        </div>

        {editor && (
          <EditorOverlays
            editor={editor}
            dialog={dialog}
            setDialog={setDialog}
            uploadImage={uploadImage}
          />
        )}
      </div>

      {preview && (
        <div className="px-5 py-4">
          <RichTextPreview value={editor?.isEmpty ? "" : editor?.getHTML()} />
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
