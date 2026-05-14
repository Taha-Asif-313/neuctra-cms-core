import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Copy,
  Check,
  FileCode,
  FileJson,
  Braces,
  Boxes,
  Cpu,
  Globe,
  Code2,
  FileCode2,
  Palette,
  TerminalSquare,
  Atom,
} from "lucide-react";

interface CodeTab {
  name: string;
  code: string;
  language: string;
}

interface CodeBlockProps {
  code?: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  tabs?: CodeTab[] | null;
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

const CodeBlock = ({
  code = "",
  language = "javascript",
  showLineNumbers = true,
  className = "",
  tabs = null,
  activeTab: externalActiveTab,
  onTabChange,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [internalActiveTab, setInternalActiveTab] = useState(0);

  // External tab control support
  const activeTab =
    externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  const setActiveTab = (index: number) => {
    if (onTabChange) {
      onTabChange(index);
    } else {
      setInternalActiveTab(index);
    }
  };

  const currentCode = tabs ? tabs[activeTab]?.code : code;
  const currentLanguage = tabs ? tabs[activeTab]?.language : language;

  const copyToClipboard = async () => {
    const text = currentCode?.trim?.();

    if (!text) return;

    try {
      // Modern clipboard API (secure context)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setCopied(false);
    }
  };

  const getLanguageIcon = (lang: string) => {
    const icons: Record<string, React.ReactNode> = {
      javascript: <Braces className="w-5 h-5 text-yellow-400" />,
      typescript: <Boxes className="w-5 h-5 text-sky-400" />,
      react: <Atom className="w-5 h-5 text-cyan-400" />,
      vue: <Globe className="w-5 h-5 text-green-400" />,
      python: <Code2 className="w-5 h-5 text-blue-400" />,
      html: <FileCode2 className="w-5 h-5 text-orange-400" />,
      css: <Palette className="w-5 h-5 text-pink-400" />,
      shell: <TerminalSquare className="w-5 h-5 text-zinc-300" />,
      json: <FileJson className="w-5 h-5 text-amber-300" />,
    };
    return icons[lang] || <FileCode className="w-5 h-5 text-zinc-400" />;
  };

  return (
    <div
      className={`relative group rounded-xl overflow-hidden bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/60 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800/80">
        {/* Tabs or Language Display */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Traffic lights */}
          <div className="flex gap-1.5 px-4 py-2 border-r border-zinc-800/60">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>

          {tabs ? (
            <div className="flex space-x-1 px-2 overflow-x-auto scrollbar-none">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === index
                      ? "text-[#00c420] "
                      : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/40"
                    }`}
                >
                  <FileCode size={14} />
                  {tab.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2">
              {getLanguageIcon(currentLanguage)}
              <span className="text-sm font-medium capitalize text-zinc-200">
                {currentLanguage}
              </span>
            </div>
          )}
        </div>

        {/* Copy Button */}
        <div className="flex items-center gap-2 px-4 py-2">
          <button
            onClick={copyToClipboard}
            disabled={!currentCode}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg 
  bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white 
  transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check size={12} className="text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        <SyntaxHighlighter
          language={currentLanguage}
          style={nightOwl}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          customStyle={{
            margin: 0,
            padding: "20px 16px",
            fontSize: "14px",
            lineHeight: "1.5",
            background: "transparent",
            border: "none",
          }}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            textAlign: "right",
            color: "#6B7280",
            userSelect: "none",
          }}
          codeTagProps={{
            style: {
              fontFamily: '"Fira Code", "Monaco", "Cascadia Code", monospace',
              fontWeight: 400,
            },
          }}
        >
          {currentCode?.trim?.() || ""}
        </SyntaxHighlighter>

        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-linear-to-r from-transparent via-transparent to-zinc-900/20 opacity-50"></div>
      </div>

      {/* Hover border animation */}
      <div className="absolute inset-0 pointer-events-none border-2 border-transparent  rounded-xl transition-all duration-300"></div>
    </div>
  );
};

export default CodeBlock;
