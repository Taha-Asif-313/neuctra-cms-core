"use client";

import React, { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";

import {
  Type,
  Image,
  Code2,
  Table,
  Heading1,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Save,
  Pencil,
} from "lucide-react";

import { createBlock, Block } from "../utils/blogBlocks";
import RichTextEditor from "../components/text/RichTextEditor";
import HeadingEditor from "../components/heading/HeadingEditor";
import CodeBlockEditor from "../components/code/CodeBlockEditor";
import TableEditor from "../components/table/TableEditor";
import ImageEditor from "../components/image/ImageEditor";
import { Editor } from "@monaco-editor/react";

interface NeuctraEditorProps {
  blocks?: Block[];
  setBlocks?: React.Dispatch<React.SetStateAction<Block[]>>;
  className?: string;
  showToolbar?: boolean;
  theme?: "light" | "dark";
}

export const NeuctraEditor = ({
  blocks = [],
  setBlocks,
  className = "",
  showToolbar = true,
  theme = "dark",
}: NeuctraEditorProps) => {
  const isDark = theme === "dark";

  const [showBlocksPreview, setShowBlocksPreview] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [jsonValue, setJsonValue] = useState(JSON.stringify(blocks, null, 2));

  const [jsonError, setJsonError] = useState("");

  /* =========================================================
     REFS
  ========================================================= */

  const lastBlockRef = useRef<HTMLDivElement>(null);

  const previousBlocksLengthRef = useRef(blocks.length);

  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  useEffect(() => {
    if (blocks.length > previousBlocksLengthRef.current) {
      lastBlockRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    previousBlocksLengthRef.current = blocks.length;
  }, [blocks]);

  useEffect(() => {
    if (!editMode) {
      setJsonValue(JSON.stringify(blocks, null, 2));
    }
  }, [blocks, editMode]);

  /* =========================================================
     ADD BLOCK
  ========================================================= */

  const addBlock = (type: string) => {
    const newBlock = createBlock(type);
    if (newBlock && setBlocks) {
      setBlocks((prev) => [...prev, newBlock]);
    }
  };

  /* =========================================================
     UPDATE BLOCK
  ========================================================= */

  const updateBlock = (id: string, data: Partial<Block>): void => {
    if (!setBlocks) return;

    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? ({ ...block, ...data } as Block) : block,
      ),
    );
  };

  /* =========================================================
     DELETE BLOCK
  ========================================================= */

  const deleteBlock = (id: string) => {
    if (setBlocks) {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  /* =========================================================
     COPY BLOCKS JSON
  ========================================================= */

  const copyBlocks = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(blocks, null, 2));
    } catch (err) {
      console.error(err);
    }
  };

  const saveEditedBlocks = () => {
    try {
      const parsed = JSON.parse(jsonValue);

      if (!Array.isArray(parsed)) {
        setJsonError("Blocks must be an array");
        return;
      }

      if (setBlocks) {
        setBlocks(parsed);
      }

      setJsonError("");

      setEditMode(false);
    } catch (error) {
      setJsonError((error as Error).message);
    }
  };

  return (
    <div className={`${className} py-6 px-4 rounded-lg`}>
      {/* TOOLBAR */}
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          {/* LEFT TITLE */}
          <div className="flex items-center gap-3 px-1">
            <div
              className={`
      h-8 w-1 rounded-full
      ${isDark ? "!bg-zinc-50" : "!bg-zinc-950"}
    `}
            />

            <div className="flex flex-col">
              <h3
                className={`
        text-sm font-black leading-tight
        ${isDark ? "!text-zinc-50" : "!text-zinc-950"}
      `}
              >
                Add Blocks
              </h3>

              {/* SUBLINE */}
              <p
                className={`
        text-xs
        leading-none
        ${isDark ? "!text-zinc-400" : "!text-zinc-500"}
      `}
              >
                Build your content
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-wrap items-center gap-3">
            <ToolbarButton
              icon={Type}
              label="Text"
              onClick={() => addBlock("text")}
            />

            <ToolbarButton
              icon={Heading1}
              label="Heading"
              onClick={() => addBlock("heading")}
            />

            <ToolbarButton
              icon={Image}
              label="Image"
              onClick={() => addBlock("image")}
            />

            <ToolbarButton
              icon={Code2}
              label="Code"
              onClick={() => addBlock("code")}
            />

            <ToolbarButton
              icon={Table}
              label="Table"
              onClick={() => addBlock("table")}
            />

            <ToolbarButton
              icon={showBlocksPreview ? EyeOff : Eye}
              label={showBlocksPreview ? "Hide Blocks" : "Show Blocks"}
              onClick={() => setShowBlocksPreview((prev) => !prev)}
            />
          </div>
        </div>
      )}

      {/* BLOCKS PREVIEW */}
      {showBlocksPreview && (
        <div
          className="
      mb-6
      overflow-hidden
      rounded-3xl
      border
      border-zinc-900
      bg-zinc-950
    "
        >
          {/* HEADER */}

          <div
            className="
        flex
        items-center
        justify-between
        border-b
        border-zinc-900
        px-5
        py-4
      "
          >
            <div>
              <h3 className="text-sm font-semibold text-white">
                Blocks Manager
              </h3>

              <p className="text-xs text-white/40">
                View, edit, import & update blog blocks
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* EDIT BUTTON */}

              <button
                onClick={() => setEditMode((prev) => !prev)}
                className="
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-zinc-800
            bg-zinc-900
            px-4
            py-2
            text-xs
            text-white
            transition
            hover:bg-white/10
            hover:text-white
          "
              >
                <Pencil size={14} />

                {editMode ? "Cancel" : "Edit JSON"}
              </button>

              {/* COPY */}

              <button
                onClick={copyBlocks}
                className="
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-zinc-800
            bg-zinc-900
            px-4
            py-2
            text-xs
            text-white/70
            transition
            hover:bg-white/10
            hover:text-white
          "
              >
                <Copy size={14} />
                Copy
              </button>

              {/* SAVE */}

              {editMode && (
                <button
                  onClick={saveEditedBlocks}
                  className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-green-600
              px-4
              py-2
              text-xs
              font-medium
              text-white
              transition
              hover:opacity-90
            "
                >
                  <Save size={14} />
                  Save Changes
                </button>
              )}
            </div>
          </div>

          {/* ERROR */}

          {jsonError && (
            <div
              className="
          flex
          items-center
          gap-2
          border-b
          border-red-500/20
          bg-red-500/10
          px-4
          py-3
          text-sm
          text-red-300
        "
            >
              <AlertCircle size={15} />

              {jsonError}
            </div>
          )}

          {/* JSON CONTENT */}

          {editMode ? (
            <Editor
              height="500px"
              defaultLanguage="json"
              value={jsonValue}
              theme="vs-dark"
              onChange={(value) => {
                setJsonValue(value || "");

                if (jsonError) {
                  setJsonError("");
                }
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          ) : (
            <pre
              className="
          max-h-150
          overflow-auto
          p-5
          font-mono
          text-sm
          leading-7
          text-white
        "
            >
              {JSON.stringify(blocks, null, 2)}
            </pre>
          )}

          {/* FOOTER */}

          <div
            className="
        flex
        items-center
        justify-between
        border-t
        border-white/10
        px-5
        py-3
        text-xs
        text-white/40
      "
          >
            <span>Total Blocks: {blocks.length}</span>

            <div className="flex items-center gap-2">
              <Check size={13} />
              Live Synced Editor
            </div>
          </div>
        </div>
      )}

      {/* BLOCKS */}
      {!showBlocksPreview && (
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              ref={index === blocks.length - 1 ? lastBlockRef : null}
            >
              {/* CONTENT */}

              <div className="pt-2">
                {/* TEXT */}
                {block.type === "text" && (
                  <RichTextEditor
                    value={block.content}
                    onChange={(value) =>
                      updateBlock(block.id, {
                        content: value,
                      })
                    }
                    onDelete={() => deleteBlock(block.id)}
                    placeholder="Write paragraph..."
                  />
                )}

                {/* HEADING */}
                {block.type === "heading" && (
                  <HeadingEditor
                    value={block.content}
                    level={block.level || "h1"}
                    onChange={(content) =>
                      updateBlock(block.id, {
                        content,
                      })
                    }
                    onLevelChange={(level) =>
                      updateBlock(block.id, {
                        level,
                      })
                    }
                    onDelete={() => deleteBlock(block.id)}
                  />
                )}

                {/* IMAGE */}
                {block.type === "image" && (
                  <ImageEditor
                    value={block}
                    onChange={(data) => updateBlock(block.id, data)}
                    onDelete={() => deleteBlock(block.id)}
                  />
                )}

                {/* CODE */}
                {block.type === "code" && (
                  <CodeBlockEditor
                    value={block.content}
                    language={block.language || "javascript"}
                    onChange={(content) =>
                      updateBlock(block.id, {
                        content,
                      })
                    }
                    onLanguageChange={(language) =>
                      updateBlock(block.id, {
                        language,
                      })
                    }
                    onDelete={() => deleteBlock(block.id)}
                  />
                )}

                {/* TABLE */}
                {block.type === "table" && (
                  <TableEditor
                    headers={block.headers}
                    rows={block.rows}
                    onChange={({ headers, rows }) =>
                      updateBlock(block.id, {
                        headers,
                        rows,
                      })
                    }
                    onDelete={() => deleteBlock(block.id)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

const ToolbarButton = ({ icon: Icon, label, onClick }: ToolbarButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="
        flex
        items-center
        gap-2
        px-4
        py-2
        rounded-xl
        border
        border-zinc-900
        bg-zinc-950
        hover:bg-zinc-900
        transition
        text-white
      "
    >
      <Icon size={15} />

      <span className="text-sm leading-0">{label}</span>
    </button>
  );
};
