import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

const cssPath = resolve(root, "dist/cms-core.css");
const distFontsDir = resolve(root, "dist/fonts");

const fonts = [
  {
    family: "JameelNoori",
    fileName: "JameelNoori.ttf",
    format: "truetype",
  },
  {
    family: "QuranFont",
    fileName: "QuranFont.ttf",
    format: "truetype",
  },
  {
    family: "QuranSurah",
    fileName: "QuranSurah.ttf",
    format: "truetype",
  },
  {
    family: "Hafs",
    fileName: "hafs.woff2",
    format: "woff2",
  },
];

mkdirSync(distFontsDir, { recursive: true });

let css = readFileSync(cssPath, "utf8");

for (const font of fonts) {
  copyFileSync(
    resolve(root, "src/fonts", font.fileName),
    resolve(distFontsDir, font.fileName)
  );

  const fontFacePattern = new RegExp(
    `@font-face\\{font-family:${font.family};src:url\\(data:font\\/[^)]*\\)format\\("[^"]+"\\);font-weight:[^;]+;font-style:[^;]+;font-display:swap\\}`,
    "g"
  );

  css = css.replace(
    fontFacePattern,
    `@font-face{font-family:${font.family};src:url("./fonts/${font.fileName}") format("${font.format}");font-weight:400;font-style:normal;font-display:swap}`
  );
}

writeFileSync(cssPath, css);
