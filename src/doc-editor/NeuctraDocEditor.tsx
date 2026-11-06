"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  EditorContent,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FilePlus2,
  FileText,
  FolderOpen,
  Heading1,
  Image as ImageIcon,
  Keyboard,
  Link as LinkIcon,
  ListTree,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Minus,
  PanelLeftClose,
  Printer,
  Redo2,
  ScissorsLineDashed,
  Search,
  Settings2,
  SquareCode,
  Table as TableIcon,
  Type,
  Undo2,
} from "lucide-react";

import {
  clearFormatting,
  insertTable,
  setBlockStyle,
  type DialogKind,
} from "./commands";
import {
  DEFAULT_PAGE_SETUP,
  LINE_SPACINGS,
  STYLE_OPTIONS,
  pageMetrics,
  type PageSetup,
} from "./constants";
import type { UploadImage } from "./extensions";
import { pageAtPos, paginationKey } from "./extensions/pagination";
import {
  DOCUMENT_FILE_TYPES,
  exportHtml,
  exportMarkdown,
  exportText,
  exportWord,
  printDocument,
  readDocumentFile,
} from "./importExport";
import { DocToolbar } from "./ui/DocToolbar";
import { EditorOverlays, handleSharedShortcuts } from "./ui/EditorOverlays";
import { FindBar } from "./ui/FindBar";
import { MenuBar, type Menu } from "./ui/MenuBar";
import { IconButton } from "./ui/primitives";
import { useDocEditor, type DocHeading, type DocStats } from "./useDocEditor";

export interface SavedDocument {
  title: string;
  html: string;
  json: JSONContent;
  text: string;
}

export interface NeuctraDocEditorProps {
  /** Document HTML. Replacing it from outside reloads the editor. */
  value?: string;
  onChange?: (html: string) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  /** Called on Ctrl+S and, with autoSave, a moment after typing stops. */
  onSave?: (doc: SavedDocument) => void | Promise<void>;
  autoSave?: boolean;
  /** Return a hosted URL. Without it images are embedded as data URLs. */
  uploadImage?: UploadImage;
  onReady?: (editor: Editor) => void;
  readOnly?: boolean;
  placeholder?: string;
  theme?: "light" | "dark";
  /** CSS height of the whole editor. */
  height?: string;
  className?: string;
  pageSetup?: Partial<PageSetup>;
  /** Rendered at the end of the title bar, e.g. a Share button. */
  headerActions?: ReactNode;
}

const AUTOSAVE_DELAY = 1500;

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const SAVE_LABEL: Record<SaveState, string> = {
  idle: "",
  dirty: "Unsaved changes",
  saving: "Saving…",
  saved: "All changes saved",
  error: "Couldn't save",
};

const SaveIndicator = ({ state }: { state: SaveState }) => {
  if (state === "idle") return null;
  const Icon =
    state === "saving" ? LoaderCircle : state === "error" ? AlertCircle : Check;

  return (
    <span className="ndoc-save" data-state={state} role="status">
      {state !== "dirty" && <Icon size={14} />}
      {SAVE_LABEL[state]}
    </span>
  );
};

const StatusBar = ({
  editor,
  stats,
  paged,
  onWordCount,
}: {
  editor: Editor;
  stats: DocStats;
  paged: boolean;
  onWordCount: () => void;
}) => {
  const page = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const pagination = paginationKey.getState(e.state);
      return {
        count: pagination?.pageCount ?? 1,
        current: pageAtPos(pagination, e.state.selection.from),
      };
    },
  });

  return (
    <footer className="ndoc-status">
      {paged && (
        <span>
          Page {page.current} of {page.count}
        </span>
      )}
      <button type="button" onClick={onWordCount}>
        {stats.words.toLocaleString()} {stats.words === 1 ? "word" : "words"}
      </button>
      <span>{stats.characters.toLocaleString()} characters</span>
    </footer>
  );
};

const Outline = ({
  headings,
  onJump,
  onClose,
}: {
  headings: DocHeading[];
  onJump: (heading: DocHeading) => void;
  onClose: () => void;
}) => (
  <aside className="ndoc-outline" aria-label="Document outline">
    <header>
      <h2>Outline</h2>
      <IconButton icon={PanelLeftClose} label="Hide outline" onClick={onClose} />
    </header>
    {headings.length ? (
      <ul>
        {headings.map((heading) => (
          <li key={heading.pos} style={{ paddingInlineStart: (heading.level - 1) * 12 }}>
            <button
              type="button"
              data-level={heading.level}
              onClick={() => onJump(heading)}
            >
              {heading.text || "Untitled heading"}
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p>Headings you add will appear here.</p>
    )}
  </aside>
);

export const NeuctraDocEditor = ({
  value,
  onChange,
  title: titleProp,
  onTitleChange,
  onSave,
  autoSave = true,
  uploadImage,
  onReady,
  readOnly = false,
  placeholder,
  theme = "light",
  height = "100dvh",
  className = "",
  pageSetup: initialSetup,
  headerActions,
}: NeuctraDocEditorProps) => {
  const [titleDraft, setTitleDraft] = useState("Untitled document");
  const title = titleProp ?? titleDraft;

  const [setup, setSetup] = useState<PageSetup>({
    ...DEFAULT_PAGE_SETUP,
    ...initialSetup,
  });
  const [paged, setPaged] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [showOutline, setShowOutline] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [find, setFind] = useState<"find" | "replace" | null>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const fileInput = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveRef = useRef<() => Promise<void>>(async () => {});

  const metrics = useMemo(() => pageMetrics(setup), [setup]);
  const liveMetrics = paged ? metrics : null;
  const editable = !readOnly && !viewing;

  const { editor, stats, flush } = useDocEditor({
    value,
    onChange,
    onDirty: () => {
      if (!onSave) return;
      setSaveState("dirty");
      clearTimeout(saveTimer.current);
      if (autoSave) {
        saveTimer.current = setTimeout(() => saveRef.current(), AUTOSAVE_DELAY);
      }
    },
    placeholder,
    editable,
    metrics: liveMetrics,
    uploadImage,
    contentClass: "ndoc-prose",
    openDialog: setDialog,
    debounceMs: 300,
  });

  const save = useCallback(async () => {
    if (!editor || !onSave) return;
    clearTimeout(saveTimer.current);
    flush();
    setSaveState("saving");
    try {
      await onSave({
        title,
        html: editor.getHTML(),
        json: editor.getJSON(),
        text: editor.getText(),
      });
      setSaveState("saved");
    } catch (error) {
      console.error("Document save failed", error);
      setSaveState("error");
    }
  }, [editor, flush, onSave, title]);

  saveRef.current = save;

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  useEffect(() => {
    if (editor) onReady?.(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const pagination = editor.storage.pagination;
    pagination.metrics = liveMetrics;
    pagination.refresh();
  }, [editor, liveMetrics, zoom]);

  const setTitle = (next: string) => {
    setTitleDraft(next);
    onTitleChange?.(next);
    if (onSave) {
      setSaveState("dirty");
      clearTimeout(saveTimer.current);
      if (autoSave) {
        saveTimer.current = setTimeout(() => saveRef.current(), AUTOSAVE_DELAY);
      }
    }
  };

  const print = () => editor && printDocument(title, editor.getHTML(), setup);

  const openFile = async (file?: File) => {
    if (!file || !editor) return;
    try {
      const doc = await readDocumentFile(file);
      editor.commands.setContent(doc.html, { emitUpdate: true });
      setTitle(doc.title);
    } catch (error) {
      console.error("Could not open file", error);
      window.alert(`Could not open ${file.name}.`);
    }
  };

  const onKeyDownCapture = (e: React.KeyboardEvent) => {
    if (!editor || !(e.ctrlKey || e.metaKey) || e.altKey) return;
    const key = e.key.toLowerCase();

    if (key === "s") {
      e.preventDefault();
      save();
    } else if (key === "f") {
      e.preventDefault();
      setFind("find");
    } else if (key === "h") {
      e.preventDefault();
      setFind("replace");
    } else if (key === "p") {
      e.preventDefault();
      print();
    } else if (editable) {
      handleSharedShortcuts(e, editor, setDialog);
    }
  };

  const jumpTo = (heading: DocHeading) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection(heading.pos + 1).run();
    (editor.view.nodeDOM(heading.pos) as HTMLElement | null)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const buildMenus = (): Menu[] => {
    if (!editor) return [];
    const chain = () => editor.chain().focus();

    const file: Menu = {
      label: "File",
      items: [
        {
          label: "New",
          icon: FilePlus2,
          disabled: !editable,
          onSelect: () => {
            editor.commands.clearContent(true);
            setTitle("Untitled document");
          },
        },
        {
          label: "Open…",
          icon: FolderOpen,
          disabled: !editable,
          onSelect: () => fileInput.current?.click(),
        },
        null,
        {
          label: "Download",
          icon: Download,
          children: [
            {
              label: "Word (.doc)",
              onSelect: () => exportWord(title, editor.getHTML(), setup),
            },
            {
              label: "PDF (print dialog)",
              onSelect: print,
            },
            {
              label: "Web page (.html)",
              onSelect: () => exportHtml(title, editor.getHTML(), setup),
            },
            {
              label: "Markdown (.md)",
              onSelect: () => exportMarkdown(title, editor.getHTML()),
            },
            {
              label: "Plain text (.txt)",
              onSelect: () => exportText(title, editor.getText()),
            },
          ],
        },
        {
          label: "Page setup…",
          icon: Settings2,
          onSelect: () => setDialog("pageSetup"),
        },
        null,
        { label: "Print", icon: Printer, shortcut: "Ctrl+P", onSelect: print },
      ],
    };

    const edit: Menu = {
      label: "Edit",
      items: [
        {
          label: "Undo",
          icon: Undo2,
          shortcut: "Ctrl+Z",
          disabled: !editor.can().undo(),
          onSelect: () => chain().undo().run(),
        },
        {
          label: "Redo",
          icon: Redo2,
          shortcut: "Ctrl+Y",
          disabled: !editor.can().redo(),
          onSelect: () => chain().redo().run(),
        },
        null,
        {
          label: "Select all",
          shortcut: "Ctrl+A",
          onSelect: () => chain().selectAll().run(),
        },
        {
          label: "Copy document text",
          icon: Copy,
          onSelect: () => navigator.clipboard?.writeText(editor.getText()),
        },
        null,
        {
          label: "Find",
          icon: Search,
          shortcut: "Ctrl+F",
          onSelect: () => setFind("find"),
        },
        {
          label: "Find and replace",
          shortcut: "Ctrl+H",
          onSelect: () => setFind("replace"),
        },
      ],
    };

    const view: Menu = {
      label: "View",
      items: [
        {
          label: "Show outline",
          icon: ListTree,
          active: showOutline,
          onSelect: () => setShowOutline((v) => !v),
        },
        {
          label: "Page layout",
          icon: FileText,
          active: paged,
          onSelect: () => setPaged((v) => !v),
        },
        {
          label: "Viewing mode",
          active: viewing,
          disabled: readOnly,
          onSelect: () => setViewing((v) => !v),
        },
        null,
        {
          label: "Full screen",
          icon: fullscreen ? Minimize2 : Maximize2,
          active: fullscreen,
          onSelect: () => setFullscreen((v) => !v),
        },
      ],
    };

    const insert: Menu = {
      label: "Insert",
      items: [
        { label: "Image…", icon: ImageIcon, onSelect: () => setDialog("image") },
        { label: "Table", icon: TableIcon, onSelect: () => insertTable(editor) },
        {
          label: "Link…",
          icon: LinkIcon,
          shortcut: "Ctrl+K",
          onSelect: () => setDialog("link"),
        },
        null,
        {
          label: "Horizontal line",
          icon: Minus,
          onSelect: () => chain().setHorizontalRule().run(),
        },
        {
          label: "Page break",
          icon: ScissorsLineDashed,
          shortcut: "Ctrl+Enter",
          onSelect: () => chain().setPageBreak().run(),
        },
        {
          label: "Code block",
          icon: SquareCode,
          onSelect: () => chain().toggleCodeBlock().run(),
        },
      ],
    };

    const format: Menu = {
      label: "Format",
      items: [
        {
          label: "Paragraph style",
          icon: Heading1,
          children: STYLE_OPTIONS.map((option) => ({
            label: option.label,
            active: option.level
              ? editor.isActive("heading", { level: option.level })
              : editor.isActive("paragraph"),
            onSelect: () => setBlockStyle(editor, option.level),
          })),
        },
        {
          label: "Line spacing",
          children: LINE_SPACINGS.map((option) => ({
            label: option.label,
            onSelect: () => chain().setLineSpacing(option.value).run(),
          })),
        },
        {
          label: "Text direction",
          children: [
            {
              label: "Left to right",
              onSelect: () => chain().setTextDirection("ltr").run(),
            },
            {
              label: "Right to left",
              onSelect: () => chain().setTextDirection("rtl").run(),
            },
          ],
        },
        null,
        {
          label: "Clear formatting",
          icon: Type,
          shortcut: "Ctrl+\\",
          onSelect: () => clearFormatting(editor),
        },
      ],
    };

    const tools: Menu = {
      label: "Tools",
      items: [
        { label: "Word count", onSelect: () => setDialog("wordCount") },
        {
          label: "Keyboard shortcuts",
          icon: Keyboard,
          onSelect: () => setDialog("shortcuts"),
        },
      ],
    };

    return editable
      ? [file, edit, view, insert, format, tools]
      : [file, view, tools];
  };

  return (
    <div
      className={`ndoc-scope ndoc-root ${className}`}
      data-theme={theme}
      data-fullscreen={fullscreen || undefined}
      style={{ height: fullscreen ? "100dvh" : height }}
      onKeyDownCapture={onKeyDownCapture}
    >
      <header className="ndoc-titlebar">
        <FileText size={22} className="ndoc-logo" aria-hidden="true" />
        <div className="ndoc-titlebar-main">
          <div className="ndoc-title-row">
            <input
              className="ndoc-title"
              aria-label="Document title"
              value={title}
              readOnly={readOnly}
              onChange={(e) => setTitle(e.target.value)}
            />
            <SaveIndicator state={saveState} />
          </div>
          {editor && <MenuBar build={buildMenus} />}
        </div>
        {headerActions && <div className="ndoc-actions">{headerActions}</div>}
      </header>

      {editor && editable && (
        <DocToolbar
          editor={editor}
          openDialog={setDialog}
          onPrint={print}
          zoom={zoom}
          onZoom={setZoom}
          theme={theme}
        />
      )}

      <div className="ndoc-body">
        {showOutline && (
          <Outline
            headings={stats.headings}
            onJump={jumpTo}
            onClose={() => setShowOutline(false)}
          />
        )}

        <main className="ndoc-canvas">
          {editor && find && (
            <FindBar
              editor={editor}
              showReplace={find === "replace"}
              onClose={() => setFind(null)}
            />
          )}

          <div
            className="ndoc-page"
            data-paged={paged || undefined}
            style={
              {
                zoom: zoom / 100,
                "--ndoc-page-w": `${metrics.width}px`,
                "--ndoc-page-h": `${metrics.height}px`,
                "--ndoc-mt": `${metrics.marginTop}px`,
                "--ndoc-mb": `${metrics.marginBottom}px`,
                "--ndoc-mx": `${metrics.marginX}px`,
              } as React.CSSProperties
            }
          >
            <EditorContent editor={editor} />
          </div>
        </main>
      </div>

      {editor && (
        <StatusBar
          editor={editor}
          stats={stats}
          paged={paged}
          onWordCount={() => setDialog("wordCount")}
        />
      )}

      {editor && (
        <EditorOverlays
          editor={editor}
          dialog={dialog}
          setDialog={setDialog}
          uploadImage={uploadImage}
          pageSetup={setup}
          onPageSetup={setSetup}
        />
      )}

      <input
        ref={fileInput}
        type="file"
        hidden
        accept={DOCUMENT_FILE_TYPES}
        onChange={(e) => {
          openFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default NeuctraDocEditor;
