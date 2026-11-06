import { Extension } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

interface Match {
  from: number;
  to: number;
}

export interface SearchState {
  term: string;
  caseSensitive: boolean;
  matches: Match[];
  index: number;
  decorations: DecorationSet;
}

export const searchKey = new PluginKey<SearchState>("ndocSearch");

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    search: {
      setSearch: (term: string, caseSensitive?: boolean) => ReturnType;
      searchStep: (delta: 1 | -1) => ReturnType;
      replaceCurrent: (replacement: string) => ReturnType;
      replaceAll: (replacement: string) => ReturnType;
    };
  }
}

const findMatches = (doc: PMNode, term: string, caseSensitive: boolean) => {
  const matches: Match[] = [];
  if (!term) return matches;
  const needle = caseSensitive ? term : term.toLowerCase();

  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    // One placeholder per inline leaf keeps string offsets equal to doc offsets.
    const raw = node.textBetween(0, node.content.size, undefined, "￼");
    const text = caseSensitive ? raw : raw.toLowerCase();
    let at = text.indexOf(needle);
    while (at !== -1) {
      matches.push({ from: pos + 1 + at, to: pos + 1 + at + needle.length });
      at = text.indexOf(needle, at + needle.length);
    }
    return false;
  });

  return matches;
};

const buildDecorations = (doc: PMNode, matches: Match[], index: number) =>
  DecorationSet.create(
    doc,
    matches.map((m, i) =>
      Decoration.inline(m.from, m.to, {
        class: i === index ? "ndoc-match ndoc-match-current" : "ndoc-match",
      }),
    ),
  );

const withResults = (
  doc: PMNode,
  term: string,
  caseSensitive: boolean,
  index: number,
): SearchState => {
  const matches = findMatches(doc, term, caseSensitive);
  const clamped = matches.length ? Math.min(index, matches.length - 1) : -1;
  return {
    term,
    caseSensitive,
    matches,
    index: clamped,
    decorations: buildDecorations(doc, matches, clamped),
  };
};

export const SearchReplace = Extension.create({
  name: "searchReplace",

  addCommands() {
    const reveal = (tr: any, match?: Match) => {
      if (!match) return tr;
      return tr
        .setSelection(TextSelection.create(tr.doc, match.from, match.to))
        .scrollIntoView();
    };

    return {
      setSearch:
        (term, caseSensitive = false) =>
        ({ state, tr, dispatch }) => {
          const next = withResults(state.doc, term, caseSensitive, 0);
          if (dispatch) {
            tr.setMeta(searchKey, next);
            reveal(tr, next.matches[0]);
            dispatch(tr);
          }
          return true;
        },

      searchStep:
        (delta) =>
        ({ state, tr, dispatch }) => {
          const search = searchKey.getState(state);
          if (!search?.matches.length) return false;
          const count = search.matches.length;
          const index = (search.index + delta + count) % count;
          if (dispatch) {
            tr.setMeta(searchKey, {
              ...search,
              index,
              decorations: buildDecorations(state.doc, search.matches, index),
            });
            reveal(tr, search.matches[index]);
            dispatch(tr);
          }
          return true;
        },

      replaceCurrent:
        (replacement) =>
        ({ state, tr, dispatch }) => {
          const search = searchKey.getState(state);
          const match = search?.matches[search.index];
          if (!search || !match) return false;
          if (dispatch) {
            tr.insertText(replacement, match.from, match.to);
            const next = withResults(
              tr.doc,
              search.term,
              search.caseSensitive,
              search.index,
            );
            tr.setMeta(searchKey, next);
            reveal(tr, next.matches[next.index]);
            dispatch(tr);
          }
          return true;
        },

      replaceAll:
        (replacement) =>
        ({ state, tr, dispatch }) => {
          const search = searchKey.getState(state);
          if (!search?.matches.length) return false;
          if (dispatch) {
            // Back to front so earlier positions stay valid.
            [...search.matches]
              .reverse()
              .forEach((m) => tr.insertText(replacement, m.from, m.to));
            dispatch(tr);
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<SearchState>({
        key: searchKey,
        state: {
          init: () => ({
            term: "",
            caseSensitive: false,
            matches: [],
            index: -1,
            decorations: DecorationSet.empty,
          }),
          apply(tr, value) {
            const meta = tr.getMeta(searchKey) as SearchState | undefined;
            if (meta) return meta;
            if (tr.docChanged && value.term) {
              return withResults(
                tr.doc,
                value.term,
                value.caseSensitive,
                Math.max(0, value.index),
              );
            }
            return value;
          },
        },
        props: {
          decorations(state) {
            return searchKey.getState(state)?.decorations;
          },
        },
      }),
    ];
  },
});
