import React, { useState } from "react";

import {
  Copy,
  Check,
  FileCode,
  FileJson,
  Braces,
  Boxes,
  Globe,
  Code2,
  FileCode2,
  Palette,
  TerminalSquare,
  Atom,
  Trash2,
} from "lucide-react";

import Editor from "@monaco-editor/react";

import { Select } from "@neuctra/ui";

/* =========================================
   CODE BLOCK EDITOR
========================================= */

interface CodeBlockEditorProps {
  value?: string;
  language?: string;
  onChange?: (value: string) => void;
  onLanguageChange?: (language: string) => void;
  onDelete?: () => void;
}

const CodeBlockEditor = ({
  value = "",
  language = "javascript",
  onChange,
  onLanguageChange,
  onDelete,
}: CodeBlockEditorProps) => {
  const [copied, setCopied] = useState(false);

  /* =========================================
     COPY
  ========================================= */

  const copyToClipboard = async () => {
    if (!value?.trim()) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================================
     LANGUAGES
  ========================================= */

  const languages = [
    "javascript",
    "typescript",
    "python",
    "html",
    "css",
    "json",
    "shell",
  ];

  /* =========================================
     ICONS
  ========================================= */

  const getLanguageIcon = (lang: string) => {
    const icons: Record<string, React.ReactNode> = {
      javascript: <Braces className="h-4 w-4 text-yellow-400" />,

      typescript: <Boxes className="h-4 w-4 text-sky-400" />,

      react: <Atom className="h-4 w-4 text-cyan-400" />,

      vue: <Globe className="h-4 w-4 text-green-400" />,

      python: <Code2 className="h-4 w-4 text-blue-400" />,

      html: <FileCode2 className="h-4 w-4 text-orange-400" />,

      css: <Palette className="h-4 w-4 text-pink-400" />,

      shell: <TerminalSquare className="h-4 w-4 text-zinc-300" />,

      json: <FileJson className="h-4 w-4 text-amber-300" />,
    };

    return icons[lang] || <FileCode className="h-4 w-4 text-zinc-400" />;
  };

  /* =========================================
     MONACO LANGUAGE FIX
  ========================================= */

  const monacoLanguageMap: Record<string, string> = {
    react: "javascript",
    vue: "html",
    shell: "shell",
  };

  const editorLanguage = monacoLanguageMap[language] || language;

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-linear-to-b
        from-white/3
        to-transparent
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between bg-[#1E1E1E] px-5 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg px-2 py-2.5">
            {getLanguageIcon(language)}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* LANGUAGE */}
          <div className="w-32">
            <Select
              value={language}
              showCheckIcon={false}
              onValueChange={(value) => {
                const selectedLanguage = Array.isArray(value)
                  ? value[0]
                  : value;

                onLanguageChange?.(selectedLanguage);
              }}
              options={languages.map((lang) => ({
                label: lang.charAt(0).toUpperCase() + lang.slice(1),
                value: lang,
                icon: getLanguageIcon(lang),
              }))}
            />
          </div>

          {/* COPY */}
          <button
            type="button"
            onClick={copyToClipboard}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs leading-none transition-all duration-200 ${
              copied
                ? "bg-green-500/10 text-green-300"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
              </>
            ) : (
              <>
                <Copy size={14} />
              </>
            )}
          </button>

          {/* DELETE */}
          <button
            onClick={onDelete}
            className="flex items-center justify-center rounded-lg bg-red-600/5 px-4 py-2.5 text-red-600 transition-all duration-200 hover:scale-105 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* EDITOR */}
      <Editor
        height="400px"
        language={editorLanguage}
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange?.(val || "")}
        options={{
          minimap: {
            enabled: false,
          },

          fontSize: 14,

          fontFamily: '"Fira Code", monospace',

          lineHeight: 24,

          padding: {
            top: 20,
          },

          scrollBeyondLastLine: false,

          automaticLayout: true,

          tabSize: 2,

          wordWrap: "on",

          roundedSelection: true,

          smoothScrolling: true,
        }}
      />
    </div>
  );
};

export default CodeBlockEditor;
