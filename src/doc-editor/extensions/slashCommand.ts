import { Extension, type Editor, type Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion";

export interface SlashItem {
  title: string;
  hint: string;
  keywords: string;
  run: (editor: Editor) => void;
}

export interface SlashHandlers {
  onOpen: (props: SuggestionProps<SlashItem>) => void;
  onChange: (props: SuggestionProps<SlashItem>) => void;
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
  onClose: () => void;
}

interface SlashOptions {
  items: () => SlashItem[];
}

declare module "@tiptap/core" {
  interface Storage {
    slashCommand: { handlers: SlashHandlers | null };
  }
}

/** "/" command palette. The React side registers its handlers on storage. */
export const SlashCommand = Extension.create<
  SlashOptions,
  { handlers: SlashHandlers | null }
>({
  name: "slashCommand",

  addOptions() {
    return { items: () => [] };
  },

  addStorage() {
    return { handlers: null };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;
    const allItems = this.options.items;

    return [
      Suggestion<SlashItem, SlashItem>({
        editor: this.editor,
        pluginKey: new PluginKey("ndocSlash"),
        char: "/",
        startOfLine: false,
        allow: ({ editor }) => !editor.isActive("codeBlock"),
        items: ({ query }) => {
          const q = query.toLowerCase();
          return allItems()
            .filter((item) =>
              `${item.title} ${item.keywords}`.toLowerCase().includes(q),
            )
            .slice(0, 10);
        },
        command: ({ editor, range, props }: {
          editor: Editor;
          range: Range;
          props: SlashItem;
        }) => {
          editor.chain().focus().deleteRange(range).run();
          props.run(editor);
        },
        render: () => ({
          onStart: (props) => storage.handlers?.onOpen(props),
          onUpdate: (props) => storage.handlers?.onChange(props),
          onKeyDown: (props) => storage.handlers?.onKeyDown(props) ?? false,
          onExit: () => storage.handlers?.onClose(),
        }),
      }),
    ];
  },
});
