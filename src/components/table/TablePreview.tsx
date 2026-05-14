"use client";

import React from "react";
import { Table, THead, TBody, TRow, TH, TD } from "@neuctra/ui";

/* =========================================
   TABLE PREVIEW
========================================= */

interface TablePreviewProps {
  headers?: string[];
  rows?: (string | null | undefined)[][];
  striped?: boolean;
  hoverable?: boolean;
}

const TablePreview = ({
  headers = [],
  rows = [],
  striped = true,
  hoverable = true,
}: TablePreviewProps) => {
  if (!headers.length || !rows.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/40">
        No table data available
      </div>
    );
  }

  return (
    <Table
      striped={striped}
      bordered={false}
      hoverable={hoverable}
      responsive
      tableClassName="min-w-full"
    >
      {/* HEAD */}
      <THead>
        <TRow>
          {headers.map((header, i) => (
            <TH key={i}>{header || `Column ${i + 1}`}</TH>
          ))}
        </TRow>
      </THead>

      {/* BODY */}
      <TBody>
        {rows.map((row, rowIndex) => (
          <TRow key={rowIndex} index={rowIndex}>
            {headers.map((_, cellIndex) => (
              <TD key={cellIndex}>{row?.[cellIndex] ?? ""}</TD>
            ))}
          </TRow>
        ))}
      </TBody>
    </Table>
  );
};

export default TablePreview;
