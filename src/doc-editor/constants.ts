import type { PageMetrics } from "./extensions/pagination";

export const FONTS = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Jameel Noori", value: "'JameelNoori', serif" },
  { label: "Quran Font", value: "'QuranFont', serif" },
  { label: "Quran Surah", value: "'QuranSurah', serif" },
  { label: "Hafs", value: "'Hafs', serif" },
];

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72];
export const DEFAULT_FONT_SIZE = 11;
/** .ndoc-content--web text is 1.0625rem, about 13pt. */
export const WEB_FONT_SIZE = 13;

export const LINE_SPACINGS = [
  { label: "Single", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "Double", value: "2" },
  { label: "Triple", value: "3" },
];

export const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#cccccc", "#ffffff",
  "#c00000", "#e06666", "#e69138", "#f1c232", "#6aa84f", "#00a912",
  "#45818e", "#3c78d8", "#1155cc", "#674ea7", "#a64d79", "#85200c",
];

export const HIGHLIGHT_COLORS = [
  "#fff2a8", "#fce5cd", "#f4cccc", "#ead1dc", "#d9d2e9", "#cfe2f3",
  "#d0e0e3", "#d9ead3", "#ffe599", "#f9cb9c", "#b6d7a8", "#a2c4c9",
];

export const STYLE_OPTIONS = [
  { label: "Normal text", level: 0 },
  { label: "Heading 1", level: 1 },
  { label: "Heading 2", level: 2 },
  { label: "Heading 3", level: 3 },
  { label: "Heading 4", level: 4 },
  { label: "Heading 5", level: 5 },
  { label: "Heading 6", level: 6 },
] as const;

export type PageSizeName = "A4" | "Letter" | "Legal";
export type MarginName = "Normal" | "Narrow" | "Wide";

export interface PageSetup {
  size: PageSizeName;
  landscape: boolean;
  margins: MarginName;
}

export const DEFAULT_PAGE_SETUP: PageSetup = {
  size: "A4",
  landscape: false,
  margins: "Normal",
};

// CSS px at 96dpi.
export const PAGE_SIZES: Record<PageSizeName, { width: number; height: number }> = {
  A4: { width: 794, height: 1123 },
  Letter: { width: 816, height: 1056 },
  Legal: { width: 816, height: 1344 },
};

export const MARGINS: Record<MarginName, { y: number; x: number }> = {
  Normal: { y: 96, x: 96 },
  Narrow: { y: 48, x: 48 },
  Wide: { y: 96, x: 144 },
};

export const PAGE_GAP = 16;

export const ZOOM_LEVELS = [50, 75, 90, 100, 125, 150, 200];

export const pageMetrics = (setup: PageSetup): PageMetrics & { marginX: number } => {
  const size = PAGE_SIZES[setup.size];
  const margin = MARGINS[setup.margins];
  return {
    width: setup.landscape ? size.height : size.width,
    height: setup.landscape ? size.width : size.height,
    marginTop: margin.y,
    marginBottom: margin.y,
    marginX: margin.x,
    gap: PAGE_GAP,
  };
};

/** "14pt" -> 14, "16px" -> 12, nothing -> the base size. */
export const toPoints = (size: string | null | undefined, base: number) => {
  const value = parseFloat(size ?? "");
  if (!value) return base;
  return size?.endsWith("px") ? Math.round(value * 0.75 * 10) / 10 : value;
};
