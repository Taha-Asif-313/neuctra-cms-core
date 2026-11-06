import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";

export interface PageMetrics {
  /** Sheet width and height in CSS px at 100% zoom. */
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  gap: number;
}

interface Gap {
  pos: number;
  /** Unused height left on the page that ends at this gap. */
  spare: number;
  /** Bottom margin of the block above, cancelled so it isn't counted twice. */
  pull: number;
  page: number;
}

interface PaginationState {
  gaps: Gap[];
  pageCount: number;
  decorations: DecorationSet;
}

interface PaginationStorage {
  metrics: PageMetrics | null;
  refresh: () => void;
}

declare module "@tiptap/core" {
  interface Storage {
    pagination: PaginationStorage;
  }
}

export const paginationKey = new PluginKey<PaginationState>("ndocPagination");

const EMPTY: PaginationState = {
  gaps: [],
  pageCount: 1,
  decorations: DecorationSet.empty,
};

/** Page the given document position sits on, 1-based. */
export const pageAtPos = (state: PaginationState | undefined, pos: number) => {
  if (!state) return 1;
  let page = 1;
  for (const gap of state.gaps) {
    if (gap.pos > pos) break;
    page = gap.page + 1;
  }
  return page;
};

const measure = (view: EditorView, metrics: PageMetrics) => {
  const contentHeight = metrics.height - metrics.marginTop - metrics.marginBottom;
  const sheet = view.dom.closest<HTMLElement>(".ndoc-page");
  const sheetWidth = sheet?.getBoundingClientRect().width;
  // Rects are scaled by the zoom level; metrics are not.
  const zoom = sheetWidth ? sheetWidth / metrics.width : 1;

  const gaps: Gap[] = [];
  let used = 0;
  let page = 1;
  let previousMarginBottom = 0;

  view.state.doc.forEach((node, offset) => {
    const dom = view.nodeDOM(offset);
    if (!(dom instanceof HTMLElement)) return;

    if (node.type.name === "pageBreak") {
      gaps.push({
        pos: offset + node.nodeSize,
        spare: Math.max(0, contentHeight - used),
        pull: parseFloat(getComputedStyle(dom).marginBottom) || 0,
        page,
      });
      page += 1;
      used = 0;
      previousMarginBottom = 0;
      return;
    }

    const style = getComputedStyle(dom);
    const height = dom.getBoundingClientRect().height / zoom;
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    let spacing = used ? Math.max(previousMarginBottom, marginTop) : marginTop;

    if (used && used + spacing + height > contentHeight) {
      gaps.push({
        pos: offset,
        spare: Math.max(0, contentHeight - used),
        pull: previousMarginBottom,
        page,
      });
      page += 1;
      used = 0;
      spacing = marginTop;
    }

    used += spacing + height;

    // A single block taller than a page cannot be split, it runs on.
    while (used > contentHeight) {
      used -= contentHeight;
      page += 1;
    }

    previousMarginBottom = marginBottom;
  });

  return { gaps, pageCount: page, tail: Math.max(0, contentHeight - used) };
};

const gapWidget = (gap: Gap, metrics: PageMetrics) => () => {
  const el = document.createElement("div");
  el.className = "ndoc-page-gap";
  el.contentEditable = "false";
  el.style.marginTop = `${-gap.pull}px`;

  const bottom = document.createElement("div");
  bottom.className = "ndoc-page-gap-sheet";
  bottom.style.height = `${gap.spare + metrics.marginBottom}px`;

  const label = document.createElement("span");
  label.className = "ndoc-page-number";
  label.textContent = String(gap.page);
  bottom.appendChild(label);

  const band = document.createElement("div");
  band.className = "ndoc-page-gap-band";
  band.style.height = `${metrics.gap}px`;

  const top = document.createElement("div");
  top.className = "ndoc-page-gap-sheet";
  top.style.height = `${metrics.marginTop}px`;

  el.append(bottom, band, top);
  return el;
};

export const Pagination = Extension.create<
  { metrics: PageMetrics | null },
  PaginationStorage
>({
  name: "pagination",

  addOptions() {
    return { metrics: null };
  },

  addStorage() {
    return { metrics: null, refresh: () => {} };
  },

  onCreate() {
    this.storage.metrics = this.options.metrics;
  },

  addProseMirrorPlugins() {
    const storage = this.storage;

    return [
      new Plugin<PaginationState>({
        key: paginationKey,
        state: {
          init: () => EMPTY,
          apply(tr, value) {
            const meta = tr.getMeta(paginationKey) as PaginationState | undefined;
            if (meta) return meta;
            if (!tr.docChanged) return value;
            return {
              ...value,
              decorations: value.decorations.map(tr.mapping, tr.doc),
            };
          },
        },
        props: {
          decorations: (state) => paginationKey.getState(state)?.decorations,
        },
        view: (view) => {
          let timer: ReturnType<typeof setTimeout> | undefined;
          let signature = "";
          let destroyed = false;

          const run = () => {
            timer = undefined;
            if (destroyed) return;
            const metrics: PageMetrics | null = storage.metrics;

            if (!metrics) {
              if (signature) {
                signature = "";
                view.dom.style.paddingBottom = "";
                view.dispatch(view.state.tr.setMeta(paginationKey, EMPTY));
              }
              return;
            }

            const { gaps, pageCount, tail } = measure(view, metrics);
            view.dom.style.paddingBottom = `${tail}px`;

            const next =
              JSON.stringify(metrics) +
              gaps.map((g) => `${g.pos}:${Math.round(g.spare)}:${g.pull}`).join();
            if (next === signature) return;
            signature = next;

            view.dispatch(
              view.state.tr.setMeta(paginationKey, {
                gaps,
                pageCount,
                decorations: DecorationSet.create(
                  view.state.doc,
                  gaps.map((gap) =>
                    Decoration.widget(gap.pos, gapWidget(gap, metrics), {
                      side: -1,
                      ignoreSelection: true,
                      key: `gap-${gap.page}-${Math.round(gap.spare)}-${gap.pull}-${metrics.gap}-${metrics.marginTop}-${metrics.marginBottom}`,
                    }),
                  ),
                ),
              } satisfies PaginationState),
            );
          };

          const schedule = (delay = 120) => {
            if (destroyed) return;
            clearTimeout(timer);
            timer = setTimeout(run, delay);
          };

          storage.refresh = () => schedule(0);

          // Images finishing loading and web fonts both change block heights.
          const observer =
            typeof ResizeObserver === "undefined"
              ? null
              : new ResizeObserver(() => schedule());
          observer?.observe(view.dom);
          document.fonts?.ready.then(() => schedule());
          schedule(0);

          return {
            update: (_, previous) => {
              if (!previous.doc.eq(view.state.doc)) schedule();
            },
            destroy: () => {
              destroyed = true;
              clearTimeout(timer);
              observer?.disconnect();
              storage.refresh = () => {};
            },
          };
        },
      }),
    ];
  },
});
