import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  NeuctraDocEditor,
  NeuctraDocPreview,
  NeuctraEditor,
  NeuctraEditorPreview,
  type Block,
} from "../src";

const SAMPLE = `
<h1>Project brief</h1>
<p>Select text for the <strong>quick toolbar</strong>, or type <code>/</code> on a new line for commands.</p>
<h2>Goals</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Draft the outline</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Share with the team</p></div></li>
</ul>
<table><tr><th><p>Owner</p></th><th><p>Status</p></th></tr><tr><td><p>Design</p></td><td><p>In review</p></td></tr></table>
`;

const App = () => {
  const [tab, setTab] = useState<"doc" | "preview" | "blocks">("doc");
  const [html, setHtml] = useState(SAMPLE);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [dark, setDark] = useState(false);
  const theme = dark ? "dark" : "light";

  const tabs = (
    <>
      {(["doc", "preview", "blocks"] as const).map((name) => (
        <button key={name} data-tab={name} onClick={() => setTab(name)}>
          {name}
        </button>
      ))}
      <button onClick={() => setDark((d) => !d)}>theme</button>
    </>
  );

  if (tab === "doc") {
    return (
      <NeuctraDocEditor
        value={html}
        onChange={setHtml}
        theme={theme}
        onSave={async (doc) => {
          (window as any).__lastSave = doc;
        }}
        onReady={(editor) => {
          (window as any).__editor = editor;
        }}
        headerActions={tabs}
      />
    );
  }

  if (tab === "preview") {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        {tabs}
        <NeuctraDocPreview value={html} theme={theme} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {tabs}
      <NeuctraEditor blocks={blocks} setBlocks={setBlocks} theme={theme} />
      <NeuctraEditorPreview blocks={blocks} theme={theme} />
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
