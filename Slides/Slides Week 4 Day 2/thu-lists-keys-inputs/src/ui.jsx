import { useState, useEffect } from "react";

export const T = {
  bg: "#F6F7F5",
  surface: "#FFFFFF",
  ink: "#111418",
  text: "#2A3038",
  muted: "#6B7280",
  line: "#E4E7EB",
  accent: "#0E9F6E",
  accentSoft: "#E3F5EC",
  warn: "#E8590C",
  warnSoft: "#FDEDE4",
  blue: "#2563EB",
  blueSoft: "#E8EFFF",
  codeBg: "#111827",
};

export const CSS = `
  .deck * { box-sizing: border-box; }
  .deck { font-family: Inter, "Segoe UI", system-ui, -apple-system, sans-serif; color: ${T.text}; background: ${T.bg}; }
  .deck h1, .deck h2, .deck h3 { color: ${T.ink}; letter-spacing: -0.02em; margin: 0; }
  .mono { font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace; }
  .btn { background: ${T.surface}; border: 1px solid ${T.line}; color: ${T.ink}; padding: 10px 16px; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; font-family: inherit; }
  .btn:hover { border-color: #C9CED6; background: #FAFAFA; }
  .btn:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn.primary { background: ${T.ink}; border-color: ${T.ink}; color: #fff; }
  .btn.primary:hover { background: #2A3038; }
  .btn.accent { background: ${T.accent}; border-color: ${T.accent}; color: #fff; }
  .btn.small { padding: 6px 12px; font-size: 14px; border-radius: 8px; }
  .btn.round { width: 34px; height: 34px; padding: 0; border-radius: 999px; font-size: 18px; line-height: 1; }
  .input { background: ${T.surface}; border: 1px solid ${T.line}; color: ${T.ink}; padding: 11px 14px; border-radius: 10px; font-size: 16px; width: 100%; font-family: inherit; }
  .input:focus { outline: none; border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.accentSoft}; }
  .panel { background: ${T.surface}; border: 1px solid ${T.line}; border-radius: 14px; padding: 20px; }
  .code { background: ${T.codeBg}; color: #E5E7EB; border-radius: 12px; padding: 18px 20px; font-size: 14.5px; line-height: 1.6; overflow: auto; white-space: pre; margin: 0; }
  .kw { color: #93C5FD; } .str { color: #FCD34D; } .cm { color: #9CA3AF; font-style: italic; } .tag { color: #F9A8D4; } .num { color: #FDBA74; } .fn { color: #A7F3D0; }
  .tab { background: transparent; border: 1px solid ${T.line}; color: ${T.muted}; padding: 7px 14px; border-radius: 999px; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; }
  .tab.on { color: ${T.ink}; border-color: ${T.ink}; background: ${T.surface}; }
  .chip { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 500; background: ${T.accentSoft}; color: ${T.accent}; }
  .chip.blue { background: ${T.blueSoft}; color: ${T.blue}; }
  .chip.warn { background: ${T.warnSoft}; color: ${T.warn}; }
  .kicker { color: ${T.accent}; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .note { color: ${T.muted}; font-size: 14px; line-height: 1.5; }
  .callout { background: ${T.warnSoft}; border: 1px solid #F6C7AC; border-radius: 12px; padding: 14px 16px; font-size: 15px; line-height: 1.55; }
  .callout .h { color: ${T.warn}; font-weight: 600; margin-bottom: 4px; }
  .callout.good { background: ${T.accentSoft}; border-color: #A9E0C8; }
  .callout.good .h { color: ${T.accent}; }
  .bar { height: 8px; background: ${T.line}; border-radius: 999px; overflow: hidden; }
  .bar > div { height: 100%; background: ${T.accent}; transition: width 160ms ease; }
  @media (prefers-reduced-motion: reduce) { .bar > div { transition: none; } }
  .check { display: flex; gap: 12px; align-items: flex-start; padding: 9px 10px; border-radius: 8px; cursor: pointer; }
  .check:hover { background: ${T.bg}; }
  .check input { margin-top: 4px; accent-color: ${T.accent}; }
  .big { font-size: 104px; line-height: 1; font-weight: 700; letter-spacing: -0.04em; color: ${T.ink}; }
  .num-display { font-weight: 700; letter-spacing: -0.03em; color: ${T.ink}; }
  .row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${T.line}; }
  .hot { border: 2px dashed transparent; border-radius: 10px; padding: 8px; cursor: pointer; }
  .hot:hover, .hot.on { border-color: ${T.blue}; background: ${T.blueSoft}; }
`;

/* ------------------------- code highlighter ------------------------ */
const TOKEN =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:const|let|var|function|return|if|else|import|from|export|default|true|false|null|new)\b)|(<\/?[A-Za-z][\w.]*|\/?>)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*)(?=\()/gm;

export function Code({ children, style }) {
  const lines = String(children).replace(/^\n/, "").split("\n");
  return (
    <pre className="code mono" style={style}>
      {lines.map((line, li) => {
        const out = [];
        let last = 0;
        for (const m of line.matchAll(TOKEN)) {
          if (m.index > last) out.push(line.slice(last, m.index));
          const cls = m[1] ? "cm" : m[2] ? "str" : m[3] ? "kw" : m[4] ? "tag" : m[5] ? "num" : "fn";
          out.push(<span key={li + "-" + m.index} className={cls}>{m[0]}</span>);
          last = m.index + m[0].length;
        }
        if (last < line.length) out.push(line.slice(last));
        return (
          <span key={li}>
            {out}
            {li < lines.length - 1 ? "\n" : ""}
          </span>
        );
      })}
    </pre>
  );
}

/* ------------------------- layout helpers -------------------------- */
export function Slide({ kicker, title, children, wide, cols }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "36px 64px 24px" }}>
      <div style={{ marginBottom: 22 }}>
        {kicker && <div className="kicker">{kicker}</div>}
        <h2 style={{ fontSize: 36, fontWeight: 700 }}>{title}</h2>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: cols || (wide ? "1fr" : "1.05fr 1fr"), gap: 28 }}>{children}</div>
    </div>
  );
}
export function Col({ children, style }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0, overflow: "auto", ...style }}>{children}</div>;
}
export function Qty({ value, onDec, onInc, decOff, incOff }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button className="btn round" onClick={onDec} disabled={decOff} aria-label="decrease">-</button>
      <span className="mono num-display" style={{ width: 28, textAlign: "center", fontSize: 20 }}>{value}</span>
      <button className="btn round" onClick={onInc} disabled={incOff} aria-label="increase">+</button>
    </div>
  );
}

/* Reveal: hides an answer until clicked */
export function Reveal({ label = "Reveal", children }) {
  const [on, setOn] = useState(false);
  if (!on) return <button className="btn accent" onClick={() => setOn(true)}>{label}</button>;
  return <div className="callout good">{children}</div>;
}

/* Milestone tiers block for assignment slides */
export function Tiers({ tiers }) {
  const colors = { Bronze: "#B87333", Silver: "#8D9AA5", Gold: "#D4A017", Bonus: T.accent };
  return tiers.map((t) => (
    <div key={t.name} className="panel" style={{ borderLeft: `4px solid ${colors[t.name]}`, padding: "12px 16px" }}>
      <div style={{ color: colors[t.name], fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.name}</div>
      <div style={{ fontSize: 15, lineHeight: 1.5 }}>{t.text}</div>
    </div>
  ));
}

/* Checklist with local checked state */
export function Checklist({ items }) {
  const [done, setDone] = useState(items.map(() => false));
  return (
    <div className="panel" style={{ padding: 8 }}>
      {items.map((s, i) => (
        <label key={i} className="check">
          <input type="checkbox" checked={done[i]} onChange={() => setDone(done.map((d, j) => (j === i ? !d : d)))} />
          <span className={s.m ? "mono" : ""} style={{ fontSize: s.m ? 14 : 15, textDecoration: done[i] ? "line-through" : "none", opacity: done[i] ? 0.5 : 1 }}>{s.t}</span>
        </label>
      ))}
    </div>
  );
}

/* Quiz grid used on close slides */
export function Quiz({ qs, footer }) {
  const [picked, setPicked] = useState(qs.map(() => null));
  const score = picked.filter((p, i) => p === qs[i].c).length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${qs.length}, 1fr)`, gap: 18, alignContent: "start" }}>
      {qs.map((item, i) => (
        <div key={i} className="panel">
          <div style={{ fontSize: 16, lineHeight: 1.45, marginBottom: 12, minHeight: 70, fontWeight: 500, color: T.ink }}>{item.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {item.a.map((opt, j) => {
              const on = picked[i] === j;
              const right = picked[i] !== null && j === item.c;
              const wrong = on && j !== item.c;
              return (
                <button key={j} className="btn mono" style={{ textAlign: "left", fontSize: 14, borderColor: right ? T.accent : wrong ? T.warn : T.line, background: right ? T.accentSoft : wrong ? T.warnSoft : T.surface }} onClick={() => setPicked(picked.map((p, k) => (k === i ? j : p)))}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="panel" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>{footer}</div>
        <div className="num-display" style={{ fontSize: 40, color: score === qs.length ? T.accent : T.ink }}>{score} / {qs.length}</div>
      </div>
    </div>
  );
}

/* ------------------------------ deck shell ------------------------- */
export function DeckShell({ slides }) {
  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);
  const n = slides.length;
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") setI((x) => Math.min(n - 1, x + 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp") setI((x) => Math.max(0, x - 1));
      if (e.key.toLowerCase() === "n") setNotes((v) => !v);
      if (e.key === "Home") setI(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  return (
    <div className="deck" style={{ position: "relative", width: "100%", height: "100vh", minHeight: 720, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{CSS}</style>
      <div style={{ flex: 1, minHeight: 0 }} key={i}>{slides[i].el}</div>
      {notes && (
        <div style={{ margin: "0 64px 10px", padding: "10px 16px", background: "#FFF8E1", border: "1px solid #F3D98A", borderRadius: 10, fontSize: 15, lineHeight: 1.5 }}>
          <span style={{ color: "#9A6B00", fontWeight: 600 }}>Instructor note: </span>{slides[i].notes}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 64px 18px", borderTop: `1px solid ${T.line}`, background: T.surface }}>
        <button className="btn small" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>Back</button>
        <div style={{ flex: 1, display: "flex", gap: 6 }}>
          {slides.map((_, k) => (
            <button key={k} aria-label={`Go to slide ${k + 1}`} onClick={() => setI(k)} style={{ flex: 1, height: 6, border: "none", borderRadius: 3, cursor: "pointer", background: k <= i ? T.ink : T.line, padding: 0 }} />
          ))}
        </div>
        <span className="mono note">{i + 1} / {n}</span>
        <button className="btn small primary" onClick={() => setI(Math.min(n - 1, i + 1))} disabled={i === n - 1}>Next</button>
        <span className="note" style={{ fontSize: 12, marginLeft: 8 }}>Arrows to move, N for notes</span>
      </div>
    </div>
  );
}
