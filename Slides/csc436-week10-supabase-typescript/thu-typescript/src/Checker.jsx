import { useEffect, useRef, useState } from "react";
import { T, highlight } from "./ui.jsx";

/* ------------------------------------------------------------------
   Live TypeScript checker for the slides.
   Type in the editor: red lines and squiggles come from the real
   TypeScript compiler (version 6, running in the browser).
------------------------------------------------------------------- */

let enginePromise = null;
export function loadEngine() {
  if (!enginePromise) enginePromise = import("./tsengine.js").then((m) => m.getChecker());
  return enginePromise;
}

export function useEngine() {
  const [engine, setEngine] = useState(null);
  useEffect(() => {
    let live = true;
    loadEngine().then((e) => live && setEngine(e));
    return () => { live = false; };
  }, []);
  return engine;
}

function Editor({ code, setCode, diags, size, height }) {
  const lines = code.split("\n");
  const lh = Math.round(size * 1.6);
  const taRef = useRef(null);

  // which characters to squiggle
  const marks = new Array(code.length + 1).fill(false);
  for (const d of diags) {
    const end = Math.min(code.length, d.start + Math.max(1, d.length));
    for (let i = d.start; i < end; i++) marks[i] = true;
  }
  const bad = new Set();
  diags.forEach((d) => { for (let l = d.line; l <= d.endLine; l++) bad.add(l); });

  let offset = 0;
  const under = lines.map((l, i) => {
    const start = offset;
    offset += l.length + 1;
    const parts = [];
    let run = "";
    let on = false;
    for (let c = 0; c < l.length; c++) {
      const m = marks[start + c];
      if (m !== on && run) { parts.push(on ? <span key={c} className="squig">{run}</span> : run); run = ""; }
      on = m;
      run += l[c];
    }
    if (run) parts.push(on ? <span key="end" className="squig">{run}</span> : run);
    return <div key={i} style={{ height: lh }}>{parts.length ? parts : " "}</div>;
  });

  const longest = Math.max(20, ...lines.map((l) => l.length));
  const onKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.target;
      const s = ta.selectionStart;
      const next = code.slice(0, s) + "  " + code.slice(ta.selectionEnd);
      setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
    }
  };

  return (
    <div className="ed" style={{ height, fontSize: size, lineHeight: `${lh}px` }} onClick={() => taRef.current?.focus()}>
      <div className="ed-inner" style={{ minWidth: "100%", width: `calc(${longest + 3}ch + 70px)` }}>
        <div className="ed-gutter">
          {lines.map((_, i) => <div key={i} className={bad.has(i + 1) ? "bad" : ""} style={{ height: lh }}>{i + 1}</div>)}
        </div>
        <div className="ed-body" style={{ height: lines.length * lh }}>
          <div className="ed-lines">
            {lines.map((l, i) => (
              <div key={i} className={bad.has(i + 1) ? "ed-l bad" : "ed-l"} style={{ height: lh }}>{highlight(l, "ts")}{l === "" ? " " : ""}</div>
            ))}
          </div>
          <div className="ed-under">{under}</div>
          <textarea ref={taRef} value={code} spellCheck={false} wrap="off" aria-label="TypeScript editor"
            onChange={(e) => setCode(e.target.value)} onKeyDown={onKeyDown} />
        </div>
      </div>
    </div>
  );
}

export function Problems({ result, max = 4, height }) {
  if (!result) return <div className="note">Starting the TypeScript checker...</div>;
  const d = result.diagnostics;
  if (d.length === 0) {
    return <div className="callout good" style={{ padding: "8px 14px" }}><div className="h" style={{ marginBottom: 0 }}>No problems. TypeScript is happy.</div></div>;
  }
  return (
    <div className="probs" style={{ maxHeight: height }}>
      {d.slice(0, max).map((x, i) => (
        <div key={i} className="prob pop">
          <span className="where">line {x.line}</span>
          <span style={{ whiteSpace: "pre-wrap" }}>{x.message}</span>
          <span className="tscode">TS{x.code}</span>
        </div>
      ))}
      {d.length > max && <div className="note">...and {d.length - max} more</div>}
    </div>
  );
}

export function TypesPanel({ result, title = "What TypeScript thinks (hover in VS Code)", only }) {
  const rows = result ? result.types.filter((t) => !only || only.includes(t.name)) : [];
  return (
    <div className="panel" style={{ padding: "10px 12px" }}>
      <div className="note" style={{ marginBottom: 6 }}>{title}</div>
      {!result && <div className="note">...</div>}
      {result && rows.length === 0 && <div className="note">Nothing declared yet.</div>}
      {rows.map((t) => (
        <div key={t.name} className="types-row">
          <span className="tname">{t.name}</span>
          <span className="tval">{t.type}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * <Checker presets={[{ label, code }]} prelude="declare ..." onResult={fn} />
 * Renders preset buttons, the live editor, and the problem list.
 */
export function Checker({ presets, prelude = "", size = 14, height = "auto", probsHeight = 150, maxProbs = 4, onResult, showProblems = true }) {
  const engine = useEngine();
  const [active, setActive] = useState(0);
  const clean = (c) => c.replace(/\n+$/, "");
  const [code, setCode] = useState(clean(presets[0].code));
  // "auto": grow with the code (at least 8 lines) so nothing scrolls on the projector
  const lh = Math.round(size * 1.6);
  const edHeight = height === "auto" ? Math.max(8, code.split("\n").length) * lh + 26 : height;
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!engine) return;
    const t = setTimeout(() => {
      const r = engine.check(code, prelude);
      setResult(r);
      onResult?.(r);
    }, 120);
    return () => clearTimeout(t);
  }, [engine, code, prelude]); // eslint-disable-line react-hooks/exhaustive-deps

  const n = result ? result.diagnostics.length : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {presets.map((p, i) => (
          <button key={p.label} className={"btn small" + (i === active ? " on" : "")} onClick={() => { setActive(i); setCode(clean(p.code)); }}>{p.label}</button>
        ))}
        <span style={{ marginLeft: "auto" }}>
          {n === null ? <span className="chip gray">loading checker</span>
            : n === 0 ? <span className="chip good">0 problems</span>
            : <span className="chip warn">{n} problem{n === 1 ? "" : "s"}</span>}
        </span>
      </div>
      <Editor code={code} setCode={setCode} diags={result ? result.diagnostics : []} size={size} height={edHeight} />
      {showProblems && <Problems result={result} max={maxProbs} height={probsHeight} />}
    </div>
  );
}

export { T };
