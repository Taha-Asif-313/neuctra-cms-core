import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      outDir: "dist/types",
      insertTypesEntry: true,
    }),
  ],

  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "NeuctraUi",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"],
    },

    rollupOptions: {
      // jsx-runtime must come from the host's React. The editor engine stays
      // external so a host that also uses ProseMirror gets a single copy.
      external: [
        /^react(-dom)?(\/.*)?$/,
        /^@tiptap\//,
        "dompurify",
        "marked",
        "turndown",
        "turndown-plugin-gfm",
      ],
    },

    assetsInlineLimit: 0,
    sourcemap: true,
    emptyOutDir: true,
  },
});
