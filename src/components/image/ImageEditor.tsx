"use client";

import React from "react";

import {
  ImageIcon,
  LayoutTemplate,
  Box,
  MousePointer,
  Sparkles,
  Shield,
  Trash2,
} from "lucide-react";

import { Input, Textarea, Select, Image } from "@neuctra/ui";
import { ImageBlock } from "../../utils/blogBlocks";

const toggleClass = (active: boolean, color: string) => `
  rounded-2xl
  border
  px-4
  py-3
  text-sm
  transition-all
  duration-200

  ${
    active
      ? `border-${color}-500 bg-${color}-500/10 text-${color}-300`
      : "border-white/10 bg-zinc-900 text-white/90 hover:bg-white/10"
  }
`;

interface ImageEditorProps {
  value?: Partial<ImageBlock>;
  onChange?: (data: Partial<ImageBlock>) => void;
  onDelete?: () => void;
}

const ImageEditor = ({ value = {}, onChange, onDelete }: ImageEditorProps) => {
  const update = (data: Partial<ImageBlock>) => {
    onChange?.({
      ...value,
      ...data,
    });
  };

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-900
        bg-zinc-950
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg px-4 py-2.5 bg-sky-400/5">
            <ImageIcon size={14} className="text-sky-400" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* OBJECT FIT BADGE */}
          <div
            className="
        flex items-center
        rounded-lg
        px-4 py-2.5
        text-xs
        leading-none
        bg-zinc-900
        text-white/90
        capitalize
      "
          >
            {value.objectFit || "cover"}
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

      {/* BODY */}

      <div className="space-y-6 p-5">
        {/* URL */}

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/90">Image URL</label>

          <Input
            value={value.url || ""}
            onChange={(e) =>
              update({
                url: e.target.value,
              })
            }
            placeholder="https://example.com/image.png"
          />
        </div>

        {/* CAPTION */}

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/90">Caption</label>

          <Input
            value={value.caption || ""}
            onChange={(e) =>
              update({
                caption: e.target.value,
              })
            }
            placeholder="Beautiful image caption..."
          />
        </div>

        {/* SETTINGS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-white/90">Width</label>

            <Input
              type="number"
              value={`${value.width || 100}`}
              onChange={(e) =>
                update({
                  width: Number(e.target.value),
                })
              }
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/90">Height</label>

            <Input
              type="number"
              value={`${value.height || ""}`}
              onChange={(e) =>
                update({
                  height: Number(e.target.value),
                })
              }
              placeholder="400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/90">Radius</label>

            <Input
              type="number"
              value={`${value.radius || 24}`}
              onChange={(e) =>
                update({
                  radius: Number(e.target.value),
                })
              }
              placeholder="24"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/90">Opacity</label>

            <Input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={`${value.opacity || 1}`}
              onChange={(e) =>
                update({
                  opacity: Number(e.target.value),
                })
              }
              placeholder="1"
            />
          </div>
        </div>

        {/* OBJECT FIT */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/90">
            Object Fit
          </label>

          <Select
            value={value.objectFit || "cover"}
            onValueChange={(value) =>
              update({
                objectFit: value as "cover" | "contain" | "fill" | "scale-down",
              })
            }
            options={[
              {
                value: "cover",
                label: "Cover",
              },
              {
                value: "contain",
                label: "Contain",
              },
              {
                value: "fill",
                label: "Fill",
              },
              {
                value: "scale-down",
                label: "Scale Down",
              },
            ]}
          />
        </div>

        {/* OVERLAY TEXT */}

        {value.showOverlay && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">
              Overlay Content
            </label>

            <Textarea
              value={value.overlayText || ""}
              onChange={(e) =>
                update({
                  overlayText: e.target.value,
                })
              }
              rows={3}
              placeholder="Overlay text..."
            />
          </div>
        )}

        {/* LIVE PREVIEW */}

        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            border-zinc-900
            bg-zinc-950
            p-4
          "
        >
          <div className="mb-4 flex items-center gap-2">
            <Box size={15} className="text-white/40" />

            <span className="text-sm text-white/90">Live Preview</span>
          </div>

          <Image
            src={value.url}
            alt={value.caption || "Image"}
            width={value.width || "100%"}
            height={value.height || 400}
            radius={value.radius || 24}
            opacity={value.opacity || 1}
            objectFit={value.objectFit || "cover"}
            className="w-full"
            loading="lazy"
            fallback={
              <div
                className="
                  flex
                  h-87.5
                  items-center
                  justify-center
                  text-white/40
                "
              >
                No Image Available
              </div>
            }
          />

          {value.caption && (
            <div
              className="
                mt-4
                border-t
                border-zinc-900
                pt-4
              "
            >
              <p className="text-sm text-white/90">{value.caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
