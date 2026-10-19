import { useState, useEffect, useCallback, useRef, Fragment } from "react";

/* ------------------------------------------------------------------
   Shared deck kit for CSC 436 interactive decks.
   Color code used across the backend unit:
     blue  = browser / frontend
     teal  = server / Express
     amber = database / storage
------------------------------------------------------------------- */

export const T = {
  ink: "#12161d",
  muted: "#5f6773",
  line: "#e2e5ea",
  card: "#ffffff",
  bg: "#f4f5f7",
  accent: "#0f766e",
  accentSoft: "#e3f3f1",
  blue: "#2563eb",
  blueSoft: "#e8efff",
  amber: "#b45309",
  amberSoft: "#fdf1e1",
  warn: "#c2410c",
  warnSoft: "#fdece4",
  good: "#15803d",
  goodSoft: "#e5f5ea",
};

/* ---------------- Code panel with light syntax highlighting ---------------- */

const KW = new Set([
  "import", "from", "export", "default", "const", "let", "var", "function", "return", "if", "else",
  "async", "await", "new", "throw", "try", "catch", "finally", "true", "false", "null", "undefined",
  "for", "of", "in", "typeof", "require", "module", "exports",
]);

function highlight(line) {
  const out = [];
  let i = 0;
  let buf = "";
  const flush = () => { if (buf) { out.push(buf); buf = ""; } };
  while (i < line.length) {
    const ch = line[i];
    const rest = line.slice(i);
    if ((rest.startsWith("//") && line[i - 1] !== ":") || (rest.startsWith("#") && /^\s*$/.test(line.slice(0, i)))) {
      flush();
      out.push(<span key={i} className="tk-c">{rest}</span>);
      break;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      flush();
      let j = i + 1;
      while (j < line.length && line[j] !== ch) { if (line[j] === "\\") j++; j++; }
      out.push(<span key={i} className="tk-s">{line.slice(i, j + 1)}</span>);
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(ch) && !/[A-Za-z_$]/.test(line[i - 1] || "")) {
      flush();
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      out.push(<span key={i} className="tk-n">{line.slice(i, j)}</span>);
      i = j;
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      flush();
      if (KW.has(word)) out.push(<span key={i} className="tk-k">{word}</span>);
      else if (line[j] === "(") out.push(<span key={i} className="tk-f">{word}</span>);
      else out.push(word);
      i = j;
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

/**
 * <Code hl={[3,4]} dim onLine={(n)=>...} active={n}>{`code`}</Code>
 * hl: 1-based line numbers to highlight. dim: fade the non-highlighted lines.
 */
export function Code({ children, hl = [], dim = false, onLine, style, size, numbers = true }) {
  const lines = String(children).replace(/\n$/, "").split("\n");
  return (
    <div className="code" style={{ fontSize: size, ...style }}>
      {lines.map((l, idx) => {
        const n = idx + 1;
        const on = hl.includes(n);
        const cls = ["ln", on ? "hl" : "", dim && hl.length && !on ? "dim" : "", onLine ? "click" : ""].join(" ");
        return (
          <div key={idx} className={cls} onClick={onLine ? () => onLine(n) : undefined}>
            {numbers && <span className="n">{n}</span>}
            <span>{highlight(l)}{l === "" ? " " : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Layout ---------------- */

export function Slide({ kicker, title, children, sub }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "44px 60px 40px" }}>
      {kicker && <div className="kicker">{kicker}</div>}
      {title && <h2 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1 }}>{title}</h2>}
      {sub && <p className="lead" style={{ marginTop: 10, maxWidth: 980 }}>{sub}</p>}
      <div style={{ flex: 1, minHeight: 0, marginTop: 24, display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

export function Col({ children, gap = 14, style }) {
  return <div style={{ display: "flex", flexDirection: "column", gap, minHeight: 0, ...style }}>{children}</div>;
}

export function Split({ children, cols = "1fr 1fr", gap = 28, style }) {
  // minmax(0, Nfr) so long code lines scroll inside their panel instead of widening the slide
  const safe = cols.replace(/(\d*\.?\d+)fr/g, "minmax(0, $1fr)");
  return <div style={{ display: "grid", gridTemplateColumns: safe, gap, flex: 1, minHeight: 0, alignItems: "start", ...style }}>{children}</div>;
}

export function Reveal({ label = "Reveal", children }) {
  const [open, setOpen] = useState(false);
  if (!open) return <button className="btn" onClick={() => setOpen(true)}>{label}</button>;
  return <div className="pop">{children}</div>;
}

/* ---------------- Fake terminal ---------------- */

/**
 * commands: { "node -v": "v22.11.0", ... } or functions returning { out, err }.
 * script: array of { cmd, out, err } played by clicking "Next command".
 */
export function Term({ script = [], commands = {}, height = 300, title, interactive = false, placeholder = "type a command" }) {
  const [shown, setShown] = useState(interactive ? [] : []);
  const [step, setStep] = useState(0);
  const [cmd, setCmd] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [shown]);

  const next = () => {
    if (step >= script.length) return;
    setShown((s) => [...s, script[step]]);
    setStep(step + 1);
  };
  const run = (e) => {
    e.preventDefault();
    const c = cmd.trim();
    if (!c) return;
    let entry = { cmd: c, out: `command not found: ${c.split(" ")[0]}`, err: true };
    const hit = commands[c];
    if (typeof hit === "string") entry = { cmd: c, out: hit };
    else if (hit) entry = { cmd: c, ...hit };
    if (c === "clear") { setShown([]); setCmd(""); return; }
    setShown((s) => [...s, entry]);
    setCmd("");
  };
  return (
    <div>
      <div className="term" style={{ height }}>
        <div className="bar"><i /><i /><i />{title && <span className="dim" style={{ marginLeft: 8, fontSize: 12 }}>{title}</span>}</div>
        {shown.map((s, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <div><span className="prompt">$ </span>{s.cmd}</div>
            {s.out && <div className={s.err ? "err" : ""} style={{ whiteSpace: "pre-wrap" }}>{s.out}</div>}
          </div>
        ))}
        {interactive && (
          <form onSubmit={run}><span className="prompt">$ </span><input value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder={placeholder} spellCheck={false} /></form>
        )}
        <div ref={endRef} />
      </div>
      {!interactive && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="btn small primary" onClick={next} disabled={step >= script.length}>
            {step >= script.length ? "Done" : `Run: ${script[step].cmd}`}
          </button>
          <button className="btn small" onClick={() => { setShown([]); setStep(0); }}>Reset</button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Assignment pieces ---------------- */

const TIER = {
  Bronze: { c: "#9a5b2b", bg: "#f6ebe1" },
  Silver: { c: "#5b6573", bg: "#eef0f3" },
  Gold: { c: "#a16207", bg: "#fbf3d5" },
  Bonus: { c: T.accent, bg: T.accentSoft },
};

export function Tiers({ tiers }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${tiers.length}, 1fr)`, gap: 12 }}>
      {tiers.map((t) => (
        <div key={t.name} className="panel" style={{ padding: 14, borderTop: `4px solid ${TIER[t.name].c}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontWeight: 800, color: TIER[t.name].c }}>{t.name}</span>
            {t.tag && <span className="chip gray" style={{ fontSize: 11 }}>{t.tag}</span>}
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: T.ink }}>
            {t.items.map((it, i) => <li key={i} style={{ marginBottom: 4 }}>{it}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Checklist({ items }) {
  const [done, setDone] = useState([]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, i) => {
        const on = done.includes(i);
        return (
          <button key={i} className="row" style={{ cursor: "pointer", textAlign: "left", justifyContent: "flex-start", background: on ? T.goodSoft : T.card }}
            onClick={() => setDone(on ? done.filter((d) => d !== i) : [...done, i])}>
            <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${on ? T.good : T.line}`, background: on ? T.good : "#fff", color: "#fff", display: "grid", placeItems: "center", fontSize: 13, flex: "none" }}>{on ? "✓" : ""}</span>
            <span style={{ fontSize: 15, color: T.ink, textDecoration: on ? "line-through" : "none" }}>{it}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Quiz({ questions }) {
  const [picked, setPicked] = useState({});
  const score = questions.filter((q, i) => picked[i] === q.answer).length;
  const answered = Object.keys(picked).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {questions.map((q, i) => (
        <div key={i} className="panel" style={{ padding: "9px 14px" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{i + 1}. {q.q}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {q.options.map((o, j) => {
              const chosen = picked[i] === j;
              const show = picked[i] !== undefined;
              const right = j === q.answer;
              let bg = "#fff", bc = T.line, col = T.ink;
              if (show && right) { bg = T.goodSoft; bc = T.good; col = T.good; }
              else if (chosen && !right) { bg = T.warnSoft; bc = T.warn; col = T.warn; }
              return (
                <button key={j} className="btn small" style={{ background: bg, borderColor: bc, color: col, fontFamily: o.mono ? "JetBrains Mono, monospace" : undefined }}
                  onClick={() => setPicked({ ...picked, [i]: j })}>{o.text ?? o}</button>
              );
            })}
          </div>
          {picked[i] !== undefined && <div className="note pop" style={{ marginTop: 5, fontSize: 13 }}>{q.why}</div>}
        </div>
      ))}
      {answered === questions.length && <div className="chip good" style={{ position: "absolute", top: 50, right: 60 }}>{score} / {questions.length} correct</div>}
    </div>
  );
}

/* ---------------- Deck shell ---------------- */

const W = 1280, H = 720;

export function DeckShell({ slides }) {
  const initial = () => {
    const n = parseInt(window.location.hash.replace("#", ""), 10);
    return Number.isFinite(n) && n >= 1 && n <= slides.length ? n - 1 : 0;
  };
  const [i, setI] = useState(initial);
  const [notes, setNotes] = useState(false);
  const [scale, setScale] = useState(1);

  const go = useCallback((n) => setI(() => Math.max(0, Math.min(slides.length - 1, n))), [slides.length]);

  useEffect(() => { window.history.replaceState(null, "", `#${i + 1}`); }, [i]);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, (window.innerHeight - 6) / H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(i + 1); }
      else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(i - 1); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(slides.length - 1);
      else if (e.key === "n" || e.key === "N") setNotes((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go, slides.length]);

  const s = slides[i];
  return (
    <div style={{ width: "100vw", height: "100vh", display: "grid", placeItems: "center", background: "#0b0e13", overflow: "hidden" }}>
      <div style={{ width: W * scale, height: H * scale, position: "relative" }}>
        <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", background: T.bg, position: "relative", overflow: "hidden", borderRadius: 4 }}>
          {/* progress */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", gap: 3, padding: "10px 14px 0", zIndex: 5 }}>
            {slides.map((_, k) => (
              <button key={k} aria-label={`Go to slide ${k + 1}`} onClick={() => go(k)}
                style={{ flex: 1, height: 5, border: 0, padding: 0, borderRadius: 3, cursor: "pointer", background: k <= i ? T.accent : "#d6dae0" }} />
            ))}
          </div>
          <div key={i} style={{ height: "100%" }}>{s.el}</div>
          {/* nav */}
          <div style={{ position: "absolute", right: 16, bottom: 12, display: "flex", gap: 6, alignItems: "center", zIndex: 6 }}>
            <span className="note" style={{ fontSize: 12, marginRight: 4 }}>{i + 1} / {slides.length}</span>
            <button className="btn small" onClick={() => go(i - 1)} aria-label="Previous slide">{"←"}</button>
            <button className="btn small" onClick={() => go(i + 1)} aria-label="Next slide">{"→"}</button>
            <button className={"btn small" + (notes ? " on" : "")} onClick={() => setNotes(!notes)} title="Instructor notes (N)">N</button>
          </div>
          {notes && s.notes && (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "rgba(18,22,29,.94)", color: "#e5e9ef", padding: "14px 200px 14px 24px", fontSize: 15, lineHeight: 1.5, zIndex: 5 }}>
              <span style={{ color: "#5eead4", fontWeight: 700, marginRight: 8 }}>INSTRUCTOR</span>{s.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { Fragment };
