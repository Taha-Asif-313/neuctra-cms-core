



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
npm install @neuctra/cms-core
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
npm run dev       # Start development server
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