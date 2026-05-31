"use client";

import React from "react";
import { Table, THead, TBody, TRow, TH, TD } from "@neuctra/ui";

interface TablePreviewProps {
  headers?: string[];
  rows?: (string | null | undefined)[][];
  theme?: "light" | "dark";
}

const TablePreview = ({
  headers = [],
  rows = [],
  theme = "dark",
}: TablePreviewProps) => {
  const isDark = theme === "dark";

  if (!headers.length || !rows.length) {
    return (
      <div
        className={`
          rounded-2xl p-6 text-center border
          ${
            isDark
              ? "!border-zinc-800 !bg-zinc-900/40 !text-zinc-500"
              : "!border-zinc-200 !bg-white !text-zinc-500"
          }
        `}
      >
        No table data available
      </div>
    );
  }

  return (
    <Table
      bordered={false}
      responsive
      tableClassName={`
        min-w-full text-sm
        ${isDark ? "!text-zinc-300" : "!text-zinc-700"}
      `}
    >
      {/* HEADER */}
      <THead>
        <TRow
          className={
            isDark
              ? "!bg-zinc-900 !border-zinc-800"
              : "!bg-zinc-100 !border-zinc-200"
          }
        >
          {headers.map((header, i) => (
            <TH
              key={i}
              className={
                isDark
                  ? "!text-zinc-100 !border-zinc-800"
                  : "!text-zinc-900 !border-zinc-200"
              }
            >
              {header || `Column ${i + 1}`}
            </TH>
          ))}
        </TRow>
      </THead>

      {/* BODY */}
      <TBody>
        {rows.map((row, rowIndex) => {
          const baseRowBg = isDark
            ? rowIndex % 2 === 0
              ? "!bg-zinc-900/40"
              : "!bg-zinc-900/20"
            : rowIndex % 2 === 0
              ? "!bg-white"
              : "!bg-zinc-50";

          const hoverBg = isDark
            ? "hover:!bg-zinc-800/60"
            : "hover:!bg-zinc-100";

          return (
            <TRow
              key={rowIndex}
              index={rowIndex}
              className={`
                ${baseRowBg}
                ${hoverBg}
                ${isDark ? "!border-zinc-800" : "!border-zinc-200"}
              `}
            >
              {headers.map((_, cellIndex) => (
                <TD
                  key={cellIndex}
                  className={`
                    px-3 py-2
                    ${
                      isDark
                        ? "!text-zinc-300 !border-zinc-800"
                        : "!text-zinc-700 !border-zinc-200"
                    }
                    ${isDark ? "!bg-transparent" : "!bg-transparent"}
                  `}
                >
                  {row?.[cellIndex] ?? ""}
                </TD>
              ))}
            </TRow>
          );
        })}
      </TBody>
    </Table>
  );
};

export default TablePreview;
