"use client";

import { useMemo, useSyncExternalStore } from "react";

import { sanitizeHtml, stripTags } from "./sanitize";

const noSubscribe = () => () => {};

interface NeuctraDocPreviewProps {
  value?: string;
  className?: string;
  theme?: "light" | "dark";
  /** "document" keeps page typography, "web" inherits the host page's font. */
  variant?: "document" | "web";
}

export const NeuctraDocPreview = ({
  value = "",
  className = "",
  theme = "light",
  variant = "document",
}: NeuctraDocPreviewProps) => {
  // Server and first hydration render get plain text, the browser the real HTML.
  const isBrowser = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

  const html = useMemo(
    () => (isBrowser ? sanitizeHtml(value) : ""),
    [isBrowser, value],
  );

  const scope = `ndoc-scope ndoc-content ${
    variant === "web" ? "ndoc-content--web" : ""
  } ${className}`;

  if (!isBrowser) {
    return (
      <div className={scope} data-theme={theme}>
        {stripTags(value)}
      </div>
    );
  }

  return (
    <div
      className={scope}
      data-theme={theme}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default NeuctraDocPreview;
