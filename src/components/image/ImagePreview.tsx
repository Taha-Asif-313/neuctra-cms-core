"use client";

import React from "react";
import { Box } from "lucide-react";
import { Image } from "@neuctra/ui";
import { ImageBlock } from "../../utils/blogBlocks";

/* =========================================
   IMAGE PREVIEW
========================================= */

interface ImagePreviewProps {
  value?: Partial<ImageBlock>;
}

const ImagePreview = ({ value = {} }: ImagePreviewProps) => {
  if (!value?.url) {
    return (
      <div className="flex h-40 items-center justify-center text-white/40">
        No Image Available
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
      "
    >
      {/* IMAGE */}
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
        border={value.bordered ? "1px solid rgba(255,255,255,0.1)" : undefined}
        className="w-full"
        loading="lazy"
        overlay={
          value.showOverlay ? (
            <div className="flex h-full flex-col items-start justify-end p-6 text-white">
              <h3 className="text-2xl font-semibold">
                {value.caption || "Overlay Title"}
              </h3>

              {value.overlayText && (
                <p className="mt-2 text-sm text-white/80">
                  {value.overlayText}
                </p>
              )}
            </div>
          ) : null
        }
        fallback={
          <div className="flex h-40 items-center justify-center text-white/40">
            No Image Available
          </div>
        }
      />

      {/* CAPTION */}
      {value.caption && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-sm text-white/60">{value.caption}</p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
