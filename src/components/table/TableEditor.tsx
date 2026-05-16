"use client";

import React from "react";

import { Plus, Trash2, Rows3, Columns3, Table2 } from "lucide-react";

import { Input, Button } from "@neuctra/ui";

/* =========================================
   TABLE EDITOR
========================================= */

interface TableEditorProps {
  headers?: string[];
  rows?: string[][];
  onChange?: (data: { headers: string[]; rows: string[][] }) => void;
  onDelete?: () => void;
}

const TableEditor = ({
  headers = [],
  rows = [],
  onChange,
  onDelete,
}: TableEditorProps) => {
  /* =========================================
     UPDATE HEADER
  ========================================= */

  const updateHeader = (index: number, value: string) => {
    const updatedHeaders = [...headers];

    updatedHeaders[index] = value;

    onChange?.({
      headers: updatedHeaders,
      rows,
    });
  };

  /* =========================================
     UPDATE CELL
  ========================================= */

  const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
    const updatedRows = [...rows];

    updatedRows[rowIndex][cellIndex] = value;

    onChange?.({
      headers,
      rows: updatedRows,
    });
  };

  /* =========================================
     ADD COLUMN
  ========================================= */

  const addColumn = () => {
    const updatedHeaders = [...headers, `Column ${headers.length + 1}`];

    const updatedRows = rows.map((row) => [...row, ""]);

    onChange?.({
      headers: updatedHeaders,
      rows: updatedRows,
    });
  };

  /* =========================================
     REMOVE COLUMN
  ========================================= */

  const removeColumn = (index: number) => {
    if (headers.length <= 1) return;

    const updatedHeaders = headers.filter((_, i) => i !== index);

    const updatedRows = rows.map((row) => row.filter((_, i) => i !== index));

    onChange?.({
      headers: updatedHeaders,
      rows: updatedRows,
    });
  };

  /* =========================================
     ADD ROW
  ========================================= */

  const addRow = () => {
    const newRow = headers.map(() => "");

    onChange?.({
      headers,
      rows: [...rows, newRow],
    });
  };

  /* =========================================
     REMOVE ROW
  ========================================= */

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;

    const updatedRows = rows.filter((_, i) => i !== index);

    onChange?.({
      headers,
      rows: updatedRows,
    });
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg px-4 py-2.5 bg-cyan-400/5">
            <Table2 size={14} className="text-cyan-400" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* ADD ROW */}
          <button
            onClick={addRow}
            className="
        flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs leading-none
        bg-white/5 text-white/60
        hover:bg-white/10 hover:text-white
        transition-all duration-200
      "
          >
            <Rows3 size={14} />
          </button>

          {/* ADD COLUMN */}
          <button
            onClick={addColumn}
            className="
        flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs leading-none
        bg-white/5 text-white/60
        hover:bg-white/10 hover:text-white
        transition-all duration-200
      "
          >
            <Columns3 size={14} />
          </button>

          {/* DELETE */}
          <button
            onClick={onDelete}
            className="
              flex px-4 py-2.5 items-center justify-center rounded-lg
              bg-red-600/5 text-red-600 transition-all duration-200
              hover:scale-105 hover:bg-red-500/10
            "
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-auto">
        <table className="w-full border-collapse">
          {/* HEADERS */}
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="
                    min-w-40 sm:min-w-[200px]
                    border-b
                    border-r
                    border-white/10
                    bg-white/2
                    p-3
                    last:border-r-0
                  "
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      placeholder={`Column ${index + 1}`}
                      inputClassName="font-medium"
                    />

                    <button
                      type="button"
                      onClick={() => removeColumn(index)}
                      className="
                        flex
                        items-center
                        justify-center
                        w-10
                        h-10
                        rounded-xl
                        border
                        border-white/10
                        bg-white/3
                        text-white/40
                        hover:text-red-400
                        hover:bg-red-500/10
                        transition-all
                      "
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/10">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="
                      min-w-40 sm:min-w-[200px]
                      border-r
                      border-white/10
                      p-3
                      last:border-r-0
                    "
                  >
                    <Input
                      value={cell}
                      onChange={(e) =>
                        updateCell(rowIndex, cellIndex, e.target.value)
                      }
                      placeholder="Cell value..."
                    />
                  </td>
                ))}

                {/* ROW DELETE */}
                <td className="w-17.5 p-3">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="
                      flex
                      items-center
                      justify-center
                      w-10
                      h-10
                      rounded-xl
                      border
                      border-white/10
                      bg-white/3
                      text-white/40
                      hover:text-red-400
                      hover:bg-red-500/10
                      transition-all
                    "
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableEditor;
