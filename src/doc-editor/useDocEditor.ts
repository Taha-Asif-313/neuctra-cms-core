import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, type Editor } from "@tiptap/react";

import { createSlashItems, type DialogKind } from "./commands";
import { buildExtensions, type UploadImage } from "./extensions";
import type { PageMetrics } from "./extensions/pagination";

export interface DocHeading {
  level: number;
  text: string;
  pos: number;
}

export interface DocStats {
  words: number;
  characters: number;
  headings: DocHeading[];
}

interface Options {
  value?: string;
  onChange?: (html: string) => void;
  /** Runs once typing pauses. getHTML() and word counts walk the whole doc. */
  debounceMs?: number;
  /** Fires whenever the document changes, before the debounce. */
  onDirty?: () => void;
  placeholder?: string;
  editable?: boolean;
  metrics?: PageMetrics | null;
  uploadImage?: UploadImage;
  contentClass: string;
  openDialog: (kind: DialogKind) => void;
}

const readHtml = (editor: Editor) => (editor.isEmpty ? "" : editor.getHTML());

const readStats = (editor: Editor): DocStats => {
  const headings: DocHeading[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      headings.push({ level: node.attrs.level, text: node.textContent, pos });
    }
    return node.isBlock && !node.isTextblock;
  });
  const counter = editor.storage.characterCount;
  return { words: counter.words(), characters: counter.characters(), headings };
};

export const useDocEditor = ({
  value = "",
  onChange,
  debounceMs = 250,
  onDirty,
  placeholder,
  editable = true,
  metrics = null,
  uploadImage,
  contentClass,
  openDialog,
}: Options) => {
  // Extensions are built once; everything they call reads through this ref.
  const latest = useRef({ onChange, onDirty, uploadImage, openDialog });
  latest.current = { onChange, onDirty, uploadImage, openDialog };

  const emitted = useRef(value);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const editorRef = useRef<Editor | null>(null);

  const [stats, setStats] = useState<DocStats>({
    words: 0,
    characters: 0,
    headings: [],
  });

  const extensions = useMemo(
    () =>
      buildExtensions({
        placeholder,
        metrics,
        upload: () => latest.current.uploadImage,
        slashItems: () =>
          createSlashItems((kind) => latest.current.openDialog(kind)),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;

    const editor = editorRef.current;
    if (!dirty.current || !editor || editor.isDestroyed) return;

    dirty.current = false;
    const html = readHtml(editor);
    emitted.current = html;
    latest.current.onChange?.(html);
    setStats(readStats(editor));
  }, []);

  const editor = useEditor(
    {
      extensions,
      content: value,
      editable,
      textDirection: "auto",
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: { class: `ndoc-content ${contentClass}`, spellcheck: "true" },
      },
      onCreate: ({ editor }) => {
        editorRef.current = editor;
        setStats(readStats(editor));
      },
      onUpdate: () => {
        dirty.current = true;
        latest.current.onDirty?.();
        clearTimeout(timer.current);
        timer.current = setTimeout(flush, debounceMs);
      },
      onBlur: flush,
    },
    [],
  );

  editorRef.current = editor;

  // Pick up documents replaced from outside; ignore echoes of our own output.
  useEffect(() => {
    if (!editor || dirty.current || value === emitted.current) return;
    emitted.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
    setStats(readStats(editor));
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(editable, false);
  }, [editor, editable]);

  useEffect(() => flush, [flush]);

  return { editor, stats, flush };
};
