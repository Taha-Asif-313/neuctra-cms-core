"use client";

import React from "react";
import { Image } from "@neuctra/ui";
import { ImageBlock } from "../../utils/blogBlocks";

/* =========================================
   IMAGE PREVIEW
========================================= */

interface ImagePreviewProps {
  value?: Partial<ImageBlock>;
  theme?: "light" | "dark";
}

const ImagePreview = ({ value = {}, theme = "dark" }: ImagePreviewProps) => {
  const isDark = theme === "dark";

  if (!value?.url) {
    return (
      <div
        className={`
          flex h-40 items-center justify-center
          ${isDark ? "!text-white/40" : "!text-zinc-500"}
        `}
      >
        No Image Available
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Image
        src={value.url}
        alt={value.caption || "Image"}
        width={value.width || "100%"}
        height={value.height || 400}
        radius={value.radius || 24}
        opacity={value.opacity || 1}
        objectFit={value.objectFit || "cover"}
        shadow={value.shadow || false}
        clickable={value.clickable || false}
        border={
          value.bordered
            ? isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.08)"
            : undefined
        }
        className="w-full"
        loading="lazy"
        overlay={
          value.showOverlay ? (
            <div className="flex h-full flex-col items-start justify-end p-6">
              <h3 className="!text-2xl !font-semibold !text-white">
                {value.caption || "Overlay Title"}
              </h3>

              {value.overlayText && (
                <p className="mt-2 !text-sm !text-white/80">
                  {value.overlayText}
                </p>
              )}
            </div>
          ) : null
        }
        fallback={
          <div
            className={`
              flex h-40 items-center justify-center
              ${isDark ? "!text-white/40" : "!text-zinc-500"}
            `}
          >
            No Image Available
          </div>
        }
      />

      {value.caption && (
        <div
          className={`
            mt-4 pt-4 border-t
            ${isDark ? "!border-white/10" : "!border-zinc-200"}
          `}
        >
          <p
            className={
              isDark ? "!text-sm !text-white/60" : "!text-sm !text-zinc-500"
            }
          >
            {value.caption}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
