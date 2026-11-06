



# @neuctra/cms-core

A powerful, modular CMS core engine for building modern content editors, blogs, notes, and structured content systems with **React** and **Tailwind CSS**.

Built for developers who want a **flexible block-based editor system** with a clean API and production-ready architecture.

---

## ✨ Features

-  Block-based content system
-  Fast & lightweight React components
-  Tailwind CSS ready (zero-config styling integration)
-  Fully customizable editor UI
-  Live preview support
-  Structured JSON content model
-  Easy integration into any React app
-  Headless CMS-style architecture
-  Extendable block system (text, code, quote, tables, etc.)

---

##  Installation

```bash
npm install @neuctra/cms-core@latest
````

or

```bash
yarn add @neuctra/cms-core
```

---

##  Peer Dependencies

Make sure you already have these installed:

```bash
react >= 18
react-dom >= 18
```

---

##  Quick Start

```jsx
import React, { useState } from "react";
import { NeuctraEditor, NeuctraEditorPreview } from "@neuctra/cms-core";

const App = () => {
  const [blocks, setBlocks] = useState([]);

  return (
    <div>
      <NeuctraEditor
        blocks={blocks}
        setBlocks={setBlocks}
      />

      <NeuctraEditorPreview
        blocks={blocks}
      />
    </div>
  );
};

export default App;
```

---

## Document Editor (Google Docs style)

`<NeuctraDocEditor />` is a full page-based word processor. It works on HTML, so
saving a document is saving a string.

```jsx
import { useState } from "react";
import { NeuctraDocEditor, NeuctraDocPreview } from "@neuctra/cms-core";
import "@neuctra/cms-core/style.css";

const App = () => {
  const [html, setHtml] = useState("");

  return (
    <NeuctraDocEditor
      value={html}
      onChange={setHtml}
      onSave={async ({ title, html }) => {
        await fetch("/api/docs/1", {
          method: "PUT",
          body: JSON.stringify({ title, html }),
        });
      }}
      uploadImage={async (file) => {
        // Upload the file and return its URL.
        return "https://cdn.example.com/photo.png";
      }}
    />
  );
};

// Render a saved document anywhere. The HTML is sanitized first.
<NeuctraDocPreview value={html} />;
```

**Editing:** paragraph styles, fonts, sizes, colors, highlight, alignment, line
spacing, indent, lists, checklists, quotes, code, sub/superscript, links, resizable
images, tables with merge and resize, right-to-left text, `/` commands and a
selection toolbar.

**Document:** pages with A4, Letter or Legal sizes, margins, landscape, page breaks,
zoom, outline, find and replace, word count, autosave, undo history, viewing mode,
dark theme and full screen.

**Files:** open `.html`, `.md`, `.txt`. Download Word (`.doc`), PDF (through the print
dialog), `.html`, `.md`, `.txt`.

### Props

| Prop          | Type                               | Description                                                          |
| ------------- | ---------------------------------- | -------------------------------------------------------------------- |
| value         | `string`                           | Document HTML. Replacing it from outside reloads the editor          |
| onChange      | `(html) => void`                   | Runs when typing pauses                                              |
| title         | `string`                           | Controlled title (optional)                                          |
| onTitleChange | `(title) => void`                  | Title changed                                                        |
| onSave        | `(doc) => void \| Promise<void>`   | Receives `{ title, html, json, text }`. Enables the save indicator   |
| autoSave      | `boolean`                          | Call `onSave` shortly after changes. Default `true`                  |
| uploadImage   | `(file) => Promise<string>`        | Return a URL. Without it images are embedded as data URLs            |
| onReady       | `(editor) => void`                 | Gives access to the Tiptap editor instance                           |
| readOnly      | `boolean`                          | Disable editing                                                      |
| placeholder   | `string`                           | Empty document hint                                                  |
| theme         | `"light" \| "dark"`                | Color theme                                                          |
| height        | `string`                           | CSS height. Default `100dvh`                                         |
| pageSetup     | `Partial<PageSetup>`               | Starting `{ size, margins, landscape }`                              |
| headerActions | `ReactNode`                        | Rendered in the title bar, e.g. a Share button                       |

### Theming

Controls are built on [`@neuctra/ui`](https://www.npmjs.com/package/@neuctra/ui). Inside
the editor its tokens (`--background`, `--border`, `--primary` and so on) follow the
`theme` prop. Elsewhere, a theme your app defines on `:root` takes priority over the
package's fallbacks.

### Moving existing content over

```js
import { blocksToHtml } from "@neuctra/cms-core";

const html = blocksToHtml(blocks);
```

`htmlToMarkdown` and `markdownToHtml` are exported too.

### Limits

- Pages break between blocks. A paragraph or table taller than a page runs on
  instead of splitting, so printed page breaks can differ slightly from the screen.
- Word export is Word-compatible HTML saved as `.doc`. Images need hosted URLs to show
  in Word, so pass `uploadImage` if you rely on it.
- Real-time collaboration, comments and `.docx` import are not included.

---

## Styling Setup (Tailwind CSS)

This package is built with Tailwind CSS in mind.

Add this to your **global CSS**:

```css
@source "../node_modules/@neuctra/cms-core";
```

If you're using Tailwind v4+, this ensures all internal styles are included in your build.

---

## Core Concept

This CMS is based on a **block system**.

Each content unit is stored as a block:

```json
[
  {
    "id": "blk_1",
    "type": "heading",
    "content": "Hello World",
    "level": "h1"
  },
  {
    "id": "blk_2",
    "type": "paragraph",
    "content": "This is a paragraph block."
  }
]
```

---

## Components

### `<NeuctraEditor />`

Main editor component for creating and editing content blocks.

#### Props

| Prop      | Type       | Description            |
| --------- | ---------- | ---------------------- |
| blocks    | `Block[]`  | Current content state  |
| setBlocks | `function` | State updater function |
| className | `string`   | Custom styles          |
| uploadImage | `(file) => Promise<string>` | Image uploads in text blocks |

---

### `<NeuctraEditorPreview />`

Renders a read-only preview of blocks.

#### Props

| Prop      | Type      | Description       |
| --------- | --------- | ----------------- |
| blocks    | `Block[]` | Content to render |
| className | `string`  | Custom styles     |

---

## Block Types (Example)

| Type      | Description               |
| --------- | ------------------------- |
| heading   | Title / headings          |
| paragraph | Text content              |
| quote     | Blockquotes               |
| code      | Code blocks               |
| list      | Ordered / unordered lists |
| image     | Media blocks              |
| table     | Structured data           |

---

## Development Scripts

```bash
npm run dev       # Start the playground (demo/main.tsx)
npm run build     # Build production package
npm run clean     # Remove dist folder
```

---

## Build Output

```
dist/
 ├── index.es.js
 ├── index.cjs.js
 └── types/
```

---

## Usage in Real Projects

Perfect for:

*  Blogging platforms
*  Documentation systems
*  Note-taking apps
*  Custom CMS dashboards
*  SaaS content editors

---

##  Roadmap

* [ ] Drag & drop block reordering
* [ ] Plugin system for custom blocks
* [ ] Markdown import/export
* [ ] AI writing assistant integration
* [ ] Collaboration mode (multi-user editing)
* [ ] Version history system

---

## 🤝 Contributing

Contributions are welcome!

```bash
git clone https://github.com/Taha-Asif-313/neuctra-cms-core.git
cd neuctra-cms-core
npm install
npm run dev
```

---

## 🐛 Issues

If you find bugs or want features:

👉 [https://github.com/Taha-Asif-313/neuctra-cms-core/issues](https://github.com/Taha-Asif-313/neuctra-cms-core/issues)

---

## 📜 License

MIT © 2026 Neuctra

---

## 🌐 Author

**Neuctra CMS Core**
Built by Taha Asif
 [tahaasifaqwe@gmail.com](mailto:tahaasifaqwe@gmail.com)

---

## ⭐ Show Your Support

If you like this project, consider giving it a ⭐ on GitHub to support development.