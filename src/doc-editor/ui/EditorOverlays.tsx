import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Button, Checkbox, FileUpload, Input, Kbd, Select } from "@neuctra/ui";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  ExternalLink,
  Italic,
  Link as LinkIcon,
  Pencil,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Unlink,
} from "lucide-react";
import type { SuggestionProps } from "@tiptap/suggestion";

import {
  clearFormatting,
  normalizeUrl,
  type DialogKind,
} from "../commands";
import {
  MARGINS,
  PAGE_SIZES,
  type MarginName,
  type PageSetup,
  type PageSizeName,
} from "../constants";
import { insertImageFile, type UploadImage } from "../extensions";
import type { SlashItem } from "../extensions/slashCommand";
import { IconButton, Modal } from "./primitives";

/* =========================================
   LINK DIALOG
========================================= */

const LinkDialog = ({ editor, onClose }: { editor: Editor; onClose: () => void }) => {
  const { from, to, empty } = editor.state.selection;
  const [url, setUrl] = useState<string>(editor.getAttributes("link").href ?? "");
  const [text, setText] = useState(
    empty ? "" : editor.state.doc.textBetween(from, to, " "),
  );
  const urlInput = useRef<HTMLInputElement>(null);

  // Modal focuses its first control on the next frame, so go one frame later.
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => urlInput.current?.focus());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const apply = () => {
    const href = normalizeUrl(url);
    const chain = editor.chain().focus().extendMarkRange("link");

    if (!href) chain.unsetLink().run();
    else if (empty && !editor.isActive("link")) {
      chain
        .insertContent({
          type: "text",
          text: text.trim() || href,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    } else chain.setLink({ href }).run();

    onClose();
  };

  return (
    <Modal
      title="Insert link"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={apply}>
            Apply
          </Button>
        </>
      }
    >
      <form
        className="ndoc-form"
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        {empty && !editor.isActive("link") && (
          <Input
            label="Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}
        <Input
          ref={urlInput}
          label="Link"
          value={url}
          placeholder="https://example.com"
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" hidden />
      </form>
    </Modal>
  );
};

/* =========================================
   IMAGE DIALOG
========================================= */

const ImageDialog = ({
  editor,
  uploadImage,
  onClose,
}: {
  editor: Editor;
  uploadImage?: UploadImage;
  onClose: () => void;
}) => {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const insertUrl = () => {
    const src = normalizeUrl(url);
    if (!src) return;
    editor.chain().focus().setImage({ src, alt }).run();
    onClose();
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await insertImageFile(editor, file, uploadImage);
      onClose();
    } catch (err) {
      setError((err as Error).message || "Upload failed");
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Insert image"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            loading={busy}
            disabled={!url.trim()}
            onClick={insertUrl}
          >
            Insert
          </Button>
        </>
      }
    >
      <form
        className="ndoc-form"
        onSubmit={(e) => {
          e.preventDefault();
          insertUrl();
        }}
      >
        <FileUpload
          accept="image/*"
          label="Upload from computer"
          description="Choose or drop an image"
          disabled={busy}
          hideFileList
          onError={(message) => setError(message)}
          onFilesChange={(files) => onFile(files[0])}
        />
        <Input
          label="Or paste an image link"
          value={url}
          placeholder="https://example.com/photo.png"
          onChange={(e) => setUrl(e.target.value)}
        />
        <Input
          label="Alt text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />
        {error && <p className="ndoc-error">{error}</p>}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
};

/* =========================================
   INFO DIALOGS
========================================= */

const SHORTCUTS: [string, string][] = [
  ["Bold / Italic / Underline", "Ctrl+B / I / U"],
  ["Undo / Redo", "Ctrl+Z / Ctrl+Y"],
  ["Save", "Ctrl+S"],
  ["Print", "Ctrl+P"],
  ["Find / Replace", "Ctrl+F / Ctrl+H"],
  ["Insert link", "Ctrl+K"],
  ["Heading 1 to 6", "Ctrl+Alt+1 to 6"],
  ["Normal text", "Ctrl+Alt+0"],
  ["Bulleted / Numbered list", "Ctrl+Shift+8 / 7"],
  ["Checklist", "Ctrl+Shift+9"],
  ["Align left / center / right", "Ctrl+Shift+L / E / R"],
  ["Indent / Outdent", "Tab / Shift+Tab"],
  ["Clear formatting", "Ctrl+\\"],
  ["Page break", "Ctrl+Enter"],
  ["Command menu", "/"],
];

const ShortcutsDialog = ({ onClose }: { onClose: () => void }) => (
  <Modal title="Keyboard shortcuts" onClose={onClose}>
    <dl className="ndoc-shortcuts">
      {SHORTCUTS.map(([label, keys]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            <Kbd size="sm">{keys}</Kbd>
          </dd>
        </div>
      ))}
    </dl>
  </Modal>
);

const WordCountDialog = ({ editor, onClose }: { editor: Editor; onClose: () => void }) => {
  const counter = editor.storage.characterCount;
  const { from, to, empty } = editor.state.selection;
  const selected = empty ? null : editor.state.doc.textBetween(from, to, " ");
  const rows: [string, number][] = [
    ["Words", counter.words()],
    ["Characters", counter.characters()],
    ["Reading time (minutes)", Math.max(1, Math.ceil(counter.words() / 220))],
  ];
  if (selected !== null) {
    rows.unshift([
      "Words selected",
      selected.split(/\s+/).filter(Boolean).length,
    ]);
  }

  return (
    <Modal title="Word count" onClose={onClose}>
      <dl className="ndoc-shortcuts">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
};

const PageSetupDialog = ({
  setup,
  onApply,
  onClose,
}: {
  setup: PageSetup;
  onApply: (setup: PageSetup) => void;
  onClose: () => void;
}) => {
  const [draft, setDraft] = useState(setup);

  return (
    <Modal
      title="Page setup"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Apply
          </Button>
        </>
      }
    >
      <div className="ndoc-form">
        <Select
          label="Paper size"
          value={draft.size}
          options={Object.keys(PAGE_SIZES).map((size) => ({
            label: size,
            value: size,
          }))}
          onValueChange={(size) =>
            setDraft({ ...draft, size: size as PageSizeName })
          }
        />
        <Select
          label="Margins"
          value={draft.margins}
          options={Object.keys(MARGINS).map((margin) => ({
            label: margin,
            value: margin,
          }))}
          onValueChange={(margins) =>
            setDraft({ ...draft, margins: margins as MarginName })
          }
        />
        <Checkbox
          mode="single"
          label="Landscape"
          checked={draft.landscape}
          onCheckedChange={(landscape) => setDraft({ ...draft, landscape })}
        />
      </div>
    </Modal>
  );
};

/* =========================================
   BUBBLE MENUS
========================================= */

const TextBubble = ({
  editor,
  openDialog,
}: {
  editor: Editor;
  openDialog: (kind: DialogKind) => void;
}) => (
  <BubbleMenu
    editor={editor}
    pluginKey="ndocTextBubble"
    className="ndoc-bubble"
    shouldShow={({ editor: e, state }) =>
      e.isEditable &&
      !state.selection.empty &&
      !e.isActive("image") &&
      !e.isActive("codeBlock") &&
      !e.isActive("pageBreak")
    }
  >
    <IconButton
      icon={Bold}
      label="Bold"
      onClick={() => editor.chain().focus().toggleBold().run()}
    />
    <IconButton
      icon={Italic}
      label="Italic"
      onClick={() => editor.chain().focus().toggleItalic().run()}
    />
    <IconButton
      icon={Underline}
      label="Underline"
      onClick={() => editor.chain().focus().toggleUnderline().run()}
    />
    <IconButton
      icon={Strikethrough}
      label="Strikethrough"
      onClick={() => editor.chain().focus().toggleStrike().run()}
    />
    <IconButton icon={LinkIcon} label="Link" onClick={() => openDialog("link")} />
    <IconButton
      icon={RemoveFormatting}
      label="Clear formatting"
      onClick={() => clearFormatting(editor)}
    />
  </BubbleMenu>
);

const LinkBubble = ({
  editor,
  openDialog,
}: {
  editor: Editor;
  openDialog: (kind: DialogKind) => void;
}) => (
  <BubbleMenu
    editor={editor}
    pluginKey="ndocLinkBubble"
    className="ndoc-bubble"
    shouldShow={({ editor: e, state }) =>
      state.selection.empty && e.isActive("link")
    }
  >
    <IconButton
      icon={ExternalLink}
      label="Open link"
      onClick={() =>
        window.open(
          editor.getAttributes("link").href,
          "_blank",
          "noopener,noreferrer",
        )
      }
    />
    <IconButton icon={Pencil} label="Edit link" onClick={() => openDialog("link")} />
    <IconButton
      icon={Unlink}
      label="Remove link"
      onClick={() =>
        editor.chain().focus().extendMarkRange("link").unsetLink().run()
      }
    />
  </BubbleMenu>
);

/* =========================================
   SLASH MENU
========================================= */

const SlashMenu = ({ editor }: { editor: Editor }) => {
  const [menu, setMenu] = useState<SuggestionProps<SlashItem> | null>(null);
  const [index, setIndex] = useState(0);
  const live = useRef({ menu, index });
  live.current = { menu, index };

  useEffect(() => {
    const show = (props: SuggestionProps<SlashItem>) => {
      setMenu(props);
      setIndex(0);
    };

    editor.storage.slashCommand.handlers = {
      onOpen: show,
      onChange: show,
      onClose: () => setMenu(null),
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        const { menu: current, index: at } = live.current;
        const count = current?.items.length ?? 0;
        if (!current) return false;
        if (event.key === "Escape") {
          setMenu(null);
          return true;
        }
        if (!count) return false;
        if (event.key === "ArrowDown") {
          setIndex((at + 1) % count);
          return true;
        }
        if (event.key === "ArrowUp") {
          setIndex((at - 1 + count) % count);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          current.command(current.items[at]);
          return true;
        }
        return false;
      },
    };

    return () => {
      editor.storage.slashCommand.handlers = null;
    };
  }, [editor]);

  const position = useMemo(() => {
    const rect = menu?.clientRect?.();
    if (!rect) return null;
    const below = rect.bottom + 340 < window.innerHeight;
    return below
      ? { left: rect.left, top: rect.bottom + 6 }
      : { left: rect.left, bottom: window.innerHeight - rect.top + 6 };
  }, [menu]);

  if (!menu || !position || !menu.items.length) return null;

  return (
    <div className="ndoc-panel ndoc-slash" role="listbox" style={position}>
      {menu.items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          role="option"
          aria-selected={i === index}
          className="ndoc-slash-item"
          data-active={i === index || undefined}
          onMouseEnter={() => setIndex(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            menu.command(item);
          }}
        >
          <strong>{item.title}</strong>
          <span>{item.hint}</span>
        </button>
      ))}
    </div>
  );
};

/* =========================================
   OVERLAYS
========================================= */

interface EditorOverlaysProps {
  editor: Editor;
  dialog: DialogKind;
  setDialog: (kind: DialogKind) => void;
  uploadImage?: UploadImage;
  pageSetup?: PageSetup;
  onPageSetup?: (setup: PageSetup) => void;
}

export const EditorOverlays = ({
  editor,
  dialog,
  setDialog,
  uploadImage,
  pageSetup,
  onPageSetup,
}: EditorOverlaysProps) => {
  const close = () => setDialog(null);

  return (
    <>
      <TextBubble editor={editor} openDialog={setDialog} />
      <LinkBubble editor={editor} openDialog={setDialog} />
      <SlashMenu editor={editor} />

      {dialog === "link" && <LinkDialog editor={editor} onClose={close} />}
      {dialog === "image" && (
        <ImageDialog editor={editor} uploadImage={uploadImage} onClose={close} />
      )}
      {dialog === "shortcuts" && <ShortcutsDialog onClose={close} />}
      {dialog === "wordCount" && <WordCountDialog editor={editor} onClose={close} />}
      {dialog === "pageSetup" && pageSetup && onPageSetup && (
        <PageSetupDialog setup={pageSetup} onApply={onPageSetup} onClose={close} />
      )}
    </>
  );
};

/** Ctrl+K and Ctrl+\ work in both the full editor and the compact block. */
export const handleSharedShortcuts = (
  e: React.KeyboardEvent,
  editor: Editor,
  setDialog: (kind: DialogKind) => void,
) => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return false;

  if (e.key.toLowerCase() === "k") {
    e.preventDefault();
    setDialog("link");
    return true;
  }
  if (e.key === "\\") {
    e.preventDefault();
    clearFormatting(editor);
    return true;
  }
  return false;
};
