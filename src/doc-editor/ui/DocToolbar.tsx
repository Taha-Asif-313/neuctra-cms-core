import { useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import type { DropdownItem } from "@neuctra/ui";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  ChevronDown,
  Code,
  Columns3,
  Highlighter,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Merge,
  Minus,
  PilcrowLeft,
  PilcrowRight,
  Plus,
  Printer,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows3,
  Split,
  Strikethrough,
  Subscript,
  Superscript,
  Table as TableIcon,
  TableProperties,
  Trash2,
  Underline,
  Undo2,
  UnfoldVertical,
} from "lucide-react";

import {
  clearFormatting,
  insertTable,
  setBlockStyle,
  type DialogKind,
} from "../commands";
import {
  DEFAULT_FONT_SIZE,
  FONTS,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  LINE_SPACINGS,
  STYLE_OPTIONS,
  TEXT_COLORS,
  WEB_FONT_SIZE,
  ZOOM_LEVELS,
  toPoints,
} from "../constants";
import {
  ColorPanel,
  IconButton,
  Separator,
  ToolMenu,
  ToolPopover,
  ToolSelect,
  type EditorTheme,
} from "./primitives";

const firstFamily = (value?: string) =>
  value?.split(",")[0].replace(/['"]/g, "").trim();

const useFormatState = (editor: Editor, baseSize: number) =>
  useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const style = e.getAttributes("textStyle");
      const level = STYLE_OPTIONS.find(
        (s) => s.level && e.isActive("heading", { level: s.level }),
      )?.level;

      return {
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        code: e.isActive("code"),
        subscript: e.isActive("subscript"),
        superscript: e.isActive("superscript"),
        link: e.isActive("link"),
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        taskList: e.isActive("taskList"),
        blockquote: e.isActive("blockquote"),
        table: e.isActive("table"),
        level: level ?? 0,
        align:
          (["center", "right", "justify"] as const).find((value) =>
            e.isActive({ textAlign: value }),
          ) ?? "left",
        fontFamily: firstFamily(style.fontFamily as string | undefined),
        fontSize: toPoints(style.fontSize as string | undefined, baseSize),
        color: style.color as string | undefined,
        highlight: e.getAttributes("highlight").color as string | undefined,
        lineSpacing: (e.getAttributes("paragraph").lineSpacing ??
          e.getAttributes("heading").lineSpacing) as string | null | undefined,
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      };
    },
  });

interface DocToolbarProps {
  editor: Editor;
  compact?: boolean;
  openDialog: (kind: DialogKind) => void;
  onPrint?: () => void;
  zoom?: number;
  onZoom?: (zoom: number) => void;
  theme?: EditorTheme;
}

const DEFAULT_FONT = "default";

const fontOptions = [
  { label: "Default", value: DEFAULT_FONT },
  ...FONTS.map((font) => ({
    label: font.label,
    value: firstFamily(font.value) as string,
    icon: <span style={{ fontFamily: font.value }}>Aa</span>,
  })),
];

const styleOptions = STYLE_OPTIONS.map((option) => ({
  label: option.label,
  value: String(option.level),
}));

const zoomOptions = ZOOM_LEVELS.map((level) => ({
  label: `${level}%`,
  value: String(level),
}));

export const DocToolbar = ({
  editor,
  compact,
  openDialog,
  onPrint,
  zoom,
  onZoom,
  theme = "light",
}: DocToolbarProps) => {
  const baseSize = compact ? WEB_FONT_SIZE : DEFAULT_FONT_SIZE;
  const state = useFormatState(editor, baseSize);
  const chain = () => editor.chain().focus();

  const applyFontSize = (points: number) => {
    const clamped = Math.max(1, Math.min(400, points));
    if (clamped === baseSize) chain().unsetFontSize().run();
    else chain().setFontSize(`${clamped}pt`).run();
  };

  const stepFontSize = (delta: 1 | -1) => {
    const current = state.fontSize;
    const next =
      delta > 0
        ? FONT_SIZES.find((s) => s > current)
        : [...FONT_SIZES].reverse().find((s) => s < current);
    applyFontSize(next ?? current);
  };

  const AlignIcon = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
    justify: AlignJustify,
  }[state.align as "left" | "center" | "right" | "justify"];

  return (
    <div
      className="ndoc-toolbar"
      role="toolbar"
      aria-label="Formatting"
      data-compact={compact || undefined}
    >
      <IconButton
        icon={Undo2}
        label="Undo (Ctrl+Z)"
        disabled={!state.canUndo}
        onClick={() => chain().undo().run()}
      />
      <IconButton
        icon={Redo2}
        label="Redo (Ctrl+Y)"
        disabled={!state.canRedo}
        onClick={() => chain().redo().run()}
      />
      {onPrint && <IconButton icon={Printer} label="Print (Ctrl+P)" onClick={onPrint} />}

      {onZoom && zoom !== undefined && (
        <ToolSelect
          label="Zoom"
          width={72}
          value={String(zoom)}
          options={zoomOptions}
          onPick={(level) => onZoom(Number(level))}
        />
      )}

      <Separator />

      <ToolSelect
        label="Paragraph style"
        width={118}
        value={String(state.level)}
        options={styleOptions}
        onPick={(level) => setBlockStyle(editor, Number(level))}
      />

      <ToolSelect
        label="Font"
        width={104}
        panelWidth={210}
        searchable
        value={state.fontFamily ?? (compact ? DEFAULT_FONT : "Arial")}
        options={fontOptions}
        onPick={(family) => {
          const font = FONTS.find((f) => firstFamily(f.value) === family);
          if (font) chain().setFontFamily(font.value).run();
          else chain().unsetFontFamily().run();
        }}
      />

      <div className="ndoc-font-size">
        <IconButton
          icon={Minus}
          label="Decrease font size"
          onClick={() => stepFontSize(-1)}
        />
        <FontSizeInput value={state.fontSize} onCommit={applyFontSize} />
        <IconButton
          icon={Plus}
          label="Increase font size"
          onClick={() => stepFontSize(1)}
        />
      </div>

      <Separator />

      <IconButton
        icon={Bold}
        label="Bold (Ctrl+B)"
        active={state.bold}
        onClick={() => chain().toggleBold().run()}
      />
      <IconButton
        icon={Italic}
        label="Italic (Ctrl+I)"
        active={state.italic}
        onClick={() => chain().toggleItalic().run()}
      />
      <IconButton
        icon={Underline}
        label="Underline (Ctrl+U)"
        active={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      />
      <IconButton
        icon={Strikethrough}
        label="Strikethrough"
        active={state.strike}
        onClick={() => chain().toggleStrike().run()}
      />

      <ToolPopover
        label="Text color"
        trigger={
          <span className="ndoc-color-trigger">
            <Baseline size={15} />
            <i style={{ background: state.color ?? "currentColor" }} />
          </span>
        }
      >
        {(close) => (
          <ColorPanel
            colors={TEXT_COLORS}
            current={state.color}
            resetLabel="Default color"
            onPick={(color) => {
              if (color) chain().setColor(color).run();
              else chain().unsetColor().run();
              close();
            }}
          />
        )}
      </ToolPopover>

      <ToolPopover
        label="Highlight color"
        trigger={
          <span className="ndoc-color-trigger">
            <Highlighter size={15} />
            <i style={{ background: state.highlight ?? "transparent" }} />
          </span>
        }
      >
        {(close) => (
          <ColorPanel
            colors={HIGHLIGHT_COLORS}
            current={state.highlight}
            resetLabel="No highlight"
            onPick={(color) => {
              if (color) chain().setHighlight({ color }).run();
              else chain().unsetHighlight().run();
              close();
            }}
          />
        )}
      </ToolPopover>

      <Separator />

      <IconButton
        icon={LinkIcon}
        label="Insert link (Ctrl+K)"
        active={state.link}
        onClick={() => openDialog("link")}
      />
      <IconButton
        icon={ImagePlus}
        label="Insert image"
        onClick={() => openDialog("image")}
      />
      <TableMenu editor={editor} inTable={state.table} theme={theme} />

      <Separator />

      <ToolMenu
        label="Align"
        theme={theme}
        width={160}
        trigger={
          <>
            <AlignIcon size={16} />
            <ChevronDown size={12} />
          </>
        }
        items={(
          [
            ["left", AlignLeft, "Left"],
            ["center", AlignCenter, "Center"],
            ["right", AlignRight, "Right"],
            ["justify", AlignJustify, "Justify"],
          ] as const
        ).map(([value, Icon, label]) => ({
          label,
          icon: <Icon size={15} />,
          className: state.align === value ? "ndoc-menu-active" : undefined,
          onClick: () => chain().setTextAlign(value).run(),
        }))}
      />

      <ToolMenu
        label="Line spacing"
        theme={theme}
        width={160}
        trigger={
          <>
            <UnfoldVertical size={15} />
            <ChevronDown size={12} />
          </>
        }
        items={[
          ...LINE_SPACINGS.map((option) => ({
            label: option.label,
            className:
              state.lineSpacing === option.value ? "ndoc-menu-active" : undefined,
            onClick: () => chain().setLineSpacing(option.value).run(),
          })),
          { separator: true },
          {
            label: "Default",
            className: state.lineSpacing ? undefined : "ndoc-menu-active",
            onClick: () => chain().setLineSpacing(null).run(),
          },
        ]}
      />

      <IconButton
        icon={List}
        label="Bulleted list"
        active={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      />
      <IconButton
        icon={ListOrdered}
        label="Numbered list"
        active={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      />
      <IconButton
        icon={ListChecks}
        label="Checklist"
        active={state.taskList}
        onClick={() => chain().toggleTaskList().run()}
      />
      <IconButton
        icon={Quote}
        label="Quote"
        active={state.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      />
      <IconButton
        icon={IndentDecrease}
        label="Decrease indent (Ctrl+[)"
        onClick={() => {
          if (state.bulletList || state.orderedList) {
            chain().liftListItem("listItem").run();
          } else if (state.taskList) {
            chain().liftListItem("taskItem").run();
          } else chain().outdent().run();
        }}
      />
      <IconButton
        icon={IndentIncrease}
        label="Increase indent (Ctrl+])"
        onClick={() => {
          if (state.bulletList || state.orderedList) {
            chain().sinkListItem("listItem").run();
          } else if (state.taskList) {
            chain().sinkListItem("taskItem").run();
          } else chain().indent().run();
        }}
      />

      <Separator />

      <IconButton
        icon={Subscript}
        label="Subscript"
        active={state.subscript}
        onClick={() => chain().toggleSubscript().run()}
      />
      <IconButton
        icon={Superscript}
        label="Superscript"
        active={state.superscript}
        onClick={() => chain().toggleSuperscript().run()}
      />
      <IconButton
        icon={Code}
        label="Inline code"
        active={state.code}
        onClick={() => chain().toggleCode().run()}
      />
      <IconButton
        icon={PilcrowRight}
        label="Left-to-right text"
        onClick={() => chain().setTextDirection("ltr").run()}
      />
      <IconButton
        icon={PilcrowLeft}
        label="Right-to-left text"
        onClick={() => chain().setTextDirection("rtl").run()}
      />
      <IconButton
        icon={RemoveFormatting}
        label="Clear formatting (Ctrl+\)"
        onClick={() => clearFormatting(editor)}
      />
    </div>
  );
};

/* =========================================
   FONT SIZE FIELD
========================================= */

const FontSizeInput = ({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (points: number) => void;
}) => {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    const points = parseFloat(draft ?? "");
    setDraft(null);
    if (points > 0 && points !== value) onCommit(points);
  };

  return (
    <input
      className="ndoc-size-input"
      aria-label="Font size"
      inputMode="decimal"
      value={draft ?? value}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") setDraft(null);
      }}
    />
  );
};

/* =========================================
   TABLE MENU
========================================= */

const GRID_SIZE = 8;

const TableGrid = ({ onPick }: { onPick: (rows: number, cols: number) => void }) => {
  const [hover, setHover] = useState({ rows: 0, cols: 0 });

  return (
    <div className="ndoc-table-grid-wrap">
      <div className="ndoc-table-grid" onMouseLeave={() => setHover({ rows: 0, cols: 0 })}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const rows = Math.floor(i / GRID_SIZE) + 1;
          const cols = (i % GRID_SIZE) + 1;
          return (
            <button
              key={i}
              type="button"
              aria-label={`${rows} by ${cols} table`}
              data-active={(rows <= hover.rows && cols <= hover.cols) || undefined}
              onMouseEnter={() => setHover({ rows, cols })}
              onClick={() => onPick(rows, cols)}
            />
          );
        })}
      </div>
      <span>
        {hover.rows ? `${hover.rows} × ${hover.cols}` : "Choose a size"}
      </span>
    </div>
  );
};

interface TableMenuProps {
  editor: Editor;
  inTable: boolean;
  theme: EditorTheme;
}

const TableMenu = ({ editor, inTable, theme }: TableMenuProps) => {
  const chain = () => editor.chain().focus();

  if (!inTable) {
    return (
      <ToolPopover label="Table" trigger={<TableIcon size={16} />}>
        {(close) => (
          <TableGrid
            onPick={(rows, cols) => {
              insertTable(editor, rows, cols);
              close();
            }}
          />
        )}
      </ToolPopover>
    );
  }

  const items: DropdownItem[] = [
    {
      label: "Insert row above",
      icon: <Rows3 size={15} />,
      onClick: () => chain().addRowBefore().run(),
    },
    {
      label: "Insert row below",
      icon: <Rows3 size={15} />,
      onClick: () => chain().addRowAfter().run(),
    },
    {
      label: "Insert column left",
      icon: <Columns3 size={15} />,
      onClick: () => chain().addColumnBefore().run(),
    },
    {
      label: "Insert column right",
      icon: <Columns3 size={15} />,
      onClick: () => chain().addColumnAfter().run(),
    },
    { separator: true },
    {
      label: "Merge cells",
      icon: <Merge size={15} />,
      disabled: !editor.can().mergeCells(),
      onClick: () => chain().mergeCells().run(),
    },
    {
      label: "Split cell",
      icon: <Split size={15} />,
      disabled: !editor.can().splitCell(),
      onClick: () => chain().splitCell().run(),
    },
    {
      label: "Toggle header row",
      icon: <TableProperties size={15} />,
      onClick: () => chain().toggleHeaderRow().run(),
    },
    { separator: true },
    {
      label: "Delete row",
      icon: <Trash2 size={15} />,
      onClick: () => chain().deleteRow().run(),
    },
    {
      label: "Delete column",
      icon: <Trash2 size={15} />,
      onClick: () => chain().deleteColumn().run(),
    },
    {
      label: "Delete table",
      icon: <Trash2 size={15} />,
      danger: true,
      onClick: () => chain().deleteTable().run(),
    },
  ];

  return (
    <ToolMenu
      label="Table"
      active
      theme={theme}
      width={210}
      trigger={<TableIcon size={16} />}
      items={items}
    />
  );
};
