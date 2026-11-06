import { useEffect, useRef, useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { Button, Input } from "@neuctra/ui";
import { CaseSensitive, ChevronDown, ChevronUp, X } from "lucide-react";

import { searchKey } from "../extensions/searchReplace";
import { IconButton } from "./primitives";

interface FindBarProps {
  editor: Editor;
  showReplace: boolean;
  onClose: () => void;
}

export const FindBar = ({ editor, showReplace, onClose }: FindBarProps) => {
  const [term, setTerm] = useState("");
  const [replacement, setReplacement] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(showReplace);
  const input = useRef<HTMLInputElement>(null);

  const result = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const search = searchKey.getState(e.state);
      return { count: search?.matches.length ?? 0, index: search?.index ?? -1 };
    },
  });

  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, [showReplace]);

  useEffect(() => setReplaceOpen((v) => v || showReplace), [showReplace]);

  useEffect(() => {
    editor.commands.setSearch(term, caseSensitive);
  }, [editor, term, caseSensitive]);

  useEffect(
    () => () => {
      if (!editor.isDestroyed) editor.commands.setSearch("");
    },
    [editor],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      editor.commands.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      editor.commands.searchStep(e.shiftKey ? -1 : 1);
    }
  };

  return (
    <div className="ndoc-find" role="search" onKeyDown={onKeyDown}>
      <div className="ndoc-find-row">
        <Input
          ref={input}
          size="xs"
          label="Find"
          labelClassName="ndoc-sr-only"
          wrapperClassName="ndoc-find-field"
          value={term}
          placeholder="Find in document"
          onChange={(e) => setTerm(e.target.value)}
        />
        <span className="ndoc-find-count" aria-live="polite">
          {term ? `${result.count ? result.index + 1 : 0} of ${result.count}` : ""}
        </span>
        <IconButton
          icon={CaseSensitive}
          label="Match case"
          active={caseSensitive}
          onClick={() => setCaseSensitive((v) => !v)}
        />
        <IconButton
          icon={ChevronUp}
          label="Previous (Shift+Enter)"
          disabled={!result.count}
          onClick={() => editor.commands.searchStep(-1)}
        />
        <IconButton
          icon={ChevronDown}
          label="Next (Enter)"
          disabled={!result.count}
          onClick={() => editor.commands.searchStep(1)}
        />
        <IconButton icon={X} label="Close" onClick={onClose} />
      </div>

      {replaceOpen ? (
        <div className="ndoc-find-row">
          <Input
            size="xs"
            label="Replace with"
            labelClassName="ndoc-sr-only"
            wrapperClassName="ndoc-find-field"
            value={replacement}
            placeholder="Replace with"
            onChange={(e) => setReplacement(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={!result.count}
            onClick={() => editor.commands.replaceCurrent(replacement)}
          >
            Replace
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={!result.count}
            onClick={() => editor.commands.replaceAll(replacement)}
          >
            All
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="ndoc-find-toggle"
          onClick={() => setReplaceOpen(true)}
        >
          Replace…
        </Button>
      )}
    </div>
  );
};
