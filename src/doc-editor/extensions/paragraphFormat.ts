import { Extension } from "@tiptap/core";

const MAX_INDENT = 8;
const INDENT_STEP_PT = 36; // 0.5in, the same step Google Docs uses
const BLOCK_TYPES = ["paragraph", "heading"];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    paragraphFormat: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
      setLineSpacing: (value: string | null) => ReturnType;
    };
  }
}

/**
 * Paragraph-level formatting: indentation and line spacing.
 * Tab / Shift-Tab fall through to lists, tables and code blocks first.
 */
export const ParagraphFormat = Extension.create({
  name: "paragraphFormat",

  addGlobalAttributes() {
    return [
      {
        types: BLOCK_TYPES,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (el) => {
              const value = parseFloat(el.style.marginLeft);
              if (!value) return 0;
              const pt = el.style.marginLeft.endsWith("px") ? value * 0.75 : value;
              return Math.min(MAX_INDENT, Math.round(pt / INDENT_STEP_PT));
            },
            renderHTML: (attrs) =>
              attrs.indent
                ? { style: `margin-left: ${attrs.indent * INDENT_STEP_PT}pt` }
                : {},
          },
          lineSpacing: {
            default: null,
            parseHTML: (el) => el.style.lineHeight || null,
            renderHTML: (attrs) =>
              attrs.lineSpacing
                ? { style: `line-height: ${attrs.lineSpacing}` }
                : {},
          },
        },
      },
    ];
  },

  addCommands() {
    const shiftIndent =
      (delta: number) =>
      () =>
      ({ tr, state, dispatch }: any) => {
        const { from, to } = state.selection;
        let changed = false;

        state.doc.nodesBetween(from, to, (node: any, pos: number) => {
          if (!BLOCK_TYPES.includes(node.type.name)) return true;
          const indent = Math.max(
            0,
            Math.min(MAX_INDENT, (node.attrs.indent || 0) + delta),
          );
          if (indent !== node.attrs.indent) {
            tr.setNodeAttribute(pos, "indent", indent);
            changed = true;
          }
          return false;
        });

        if (changed) dispatch?.(tr);
        return changed;
      };

    return {
      indent: shiftIndent(1),
      outdent: shiftIndent(-1),
      setLineSpacing:
        (value) =>
        ({ commands }) =>
          BLOCK_TYPES.map((type) =>
            commands.updateAttributes(type, { lineSpacing: value }),
          ).some(Boolean),
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (editor.isActive("codeBlock")) {
          return editor.commands.insertContent("  ");
        }
        if (editor.isActive("listItem") || editor.isActive("taskItem")) {
          return false;
        }
        if (editor.isActive("table")) return false;
        editor.commands.indent();
        return true; // keep focus inside the document
      },
      "Shift-Tab": ({ editor }) => {
        if (
          editor.isActive("listItem") ||
          editor.isActive("taskItem") ||
          editor.isActive("table")
        ) {
          return false;
        }
        editor.commands.outdent();
        return true;
      },
      "Mod-]": ({ editor }) => editor.commands.indent(),
      "Mod-[": ({ editor }) => editor.commands.outdent(),
    };
  },
});
