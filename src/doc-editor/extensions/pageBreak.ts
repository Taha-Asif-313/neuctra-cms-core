import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: { setPageBreak: () => ReturnType };
  }
}

export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  selectable: true,
  priority: 1000,

  parseHTML() {
    return [{ tag: "div[data-page-break]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-page-break": "true",
        class: "ndoc-page-break",
      }),
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ chain }) =>
          chain()
            .insertContent([{ type: this.name }, { type: "paragraph" }])
            .run(),
    };
  },

  addKeyboardShortcuts() {
    return { "Mod-Enter": () => this.editor.commands.setPageBreak() };
  },
});
