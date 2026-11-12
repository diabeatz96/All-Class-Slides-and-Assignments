import { createContext, useCallback, useContext, useEffect, useState } from "react";

/* -------------------------------------------------------------------
   Deck kit.
   Right / Space: next build step, then next slide.   Left: back.
   N: instructor notes.   G: slide overview.   F: fullscreen.
   The slide number lives in the URL (#7), so a refresh stays put.
------------------------------------------------------------------- */

const StepCtx = createContext({ step: 0, reveal: () => {} });
export const useStep = () => useContext(StepCtx);

export const PARTS = {
  intro: { label: "Today", color: "var(--navy)" },
  idea: { label: "The idea", color: "var(--slate)" },
  setup: { label: "Setup", color: "var(--slate)" },
  p1: { label: "Part 1: Sign up and log in", color: "var(--teal)" },
  p2: { label: "Part 2: Hide what needs a login", color: "var(--indigo)" },
  p3: { label: "Part 3: Protect the API", color: "var(--amber)" },
  p4: { label: "Part 4: Whose recipe is it?", color: "var(--plum)" },
  fix: { label: "When it breaks", color: "var(--red)" },
  wrap: { label: "Wrap up", color: "var(--navy)" },
};
export const partColor = (p) => PARTS[p]?.color ?? "var(--navy)";

const W = 1280;
const H = 720;

function readHash(max) {
  const n = parseInt(window.location.hash.replace("#", ""), 10);
  return Number.isInteger(n) && n >= 1 && n <= max ? n - 1 : 0;
}

export function DeckShell({ slides }) {
  const [idx, setIdx] = useState(() => readHash(slides.length));
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState(false);
  const [grid, setGrid] = useState(false);
  const [scale, setScale] = useState(1);

  const slide = slides[idx];
  const maxStep = slide.steps ?? 0;

  const go = useCallback(
    (i, s = 0) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, i));
      setIdx(clamped);
      setStep(s);
      window.history.replaceState(null, "", `#${clamped + 1}`);
    },
    [slides.length]
  );

  const next = useCallback(() => {
    if (step < maxStep) setStep(step + 1);
    else if (idx < slides.length - 1) go(idx + 1, 0);
  }, [step, maxStep, idx, slides.length, go]);

  const prev = useCallback(() => {
    if (step > 0) setStep(step - 1);
    else if (idx > 0) go(idx - 1, slides[idx - 1].steps ?? 0);
  }, [step, idx, slides, go]);

  useEffect(() => {
    function onKey(e) {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const k = e.key;
      if (k === "ArrowRight" || k === " " || k === "PageDown") { e.preventDefault(); next(); }
      else if (k === "ArrowLeft" || k === "PageUp" || k === "Backspace") { e.preventDefault(); prev(); }
      else if (k === "n" || k === "N") setNotes((v) => !v);
      else if (k === "g" || k === "G") setGrid((v) => !v);
      else if (k === "Escape") setGrid(false);
      else if (k === "f" || k === "F") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    function fit() {
      setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const reveal = useCallback((at) => setStep((s) => Math.max(s, at)), []);
  const Body = slide.body;
  const part = PARTS[slide.part] ?? PARTS.intro;

  return (
    <div className="viewport">
      <div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div className="part-bar" style={{ background: part.color }}>
          <span>{part.label}</span>
          <span className="part-course">CSC 436 | Supabase Auth</span>
        </div>
        <StepCtx.Provider value={{ step, reveal }}>
          <Body key={idx} />
        </StepCtx.Provider>
        <div className="foot">
          <span className="foot-keys">Right: next | Left: back | N: notes | G: all slides | F: fullscreen</span>
          <span className="foot-num">{idx + 1} / {slides.length}</span>
        </div>
        <div className="progress"><div style={{ width: `${((idx + 1) / slides.length) * 100}%`, background: part.color }} /></div>
      </div>

      {notes && <Notes slide={slide} idx={idx} total={slides.length} onClose={() => setNotes(false)} />}

      {grid && (
        <div className="grid-overlay" onClick={() => setGrid(false)}>
          <div className="grid-inner" onClick={(e) => e.stopPropagation()}>
            <div className="grid-head">
              <b>All slides</b>
              <button onClick={() => setGrid(false)}>Close (G)</button>
            </div>
            <div className="grid-list">
              {slides.map((s, i) => (
                <button
                  key={i}
                  className={`grid-item ${i === idx ? "current" : ""}`}
                  style={{ borderLeftColor: partColor(s.part) }}
                  onClick={() => { go(i); setGrid(false); }}
                >
                  <span className="grid-num">{i + 1}</span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Notes({ slide, idx, total, onClose }) {
  const lines = (slide.notes ?? "").trim().split("\n").filter((l) => l.trim());
  return (
    <div className="notes">
      <div className="notes-head">
        <b>Slide {idx + 1} of {total}: {slide.title}</b>
        <button onClick={onClose}>Close (N)</button>
      </div>
      <div className="notes-body">
        {lines.map((line, i) => {
          const m = line.trim().match(/^(TIME|SAY|ASK|WATCH|CHECK|DO|IF BEHIND):\s*(.*)$/);
          if (!m) return <p key={i}>{line.trim()}</p>;
          return (
            <p key={i} className={`note-line note-${m[1].replace(" ", "-").toLowerCase()}`}>
              <span className="note-tag">{m[1]}</span>
              <span>{m[2]}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------
   Slide frame and layout
------------------------------------------------------------------- */

export function S({ kicker, title, children, className = "" }) {
  return (
    <div className={`slide ${className}`}>
      {(kicker || title) && (
        <header className="s-head">
          {kicker && <div className="kicker">{kicker}</div>}
          {title && <h1 className="s-title">{title}</h1>}
        </header>
      )}
      <div className="s-body">{children}</div>
    </div>
  );
}

export function Cols({ children, split = "1fr 1fr", gap = 32, align = "start" }) {
  return <div className="cols" style={{ gridTemplateColumns: split, gap, alignItems: align }}>{children}</div>;
}

export function Stack({ children, gap = 16, tight = false }) {
  return <div className={`stack ${tight ? "tight" : ""}`} style={tight ? undefined : { gap }}>{children}</div>;
}

/* -------------------------------------------------------------------
   Reveal: hidden until its build step (Right arrow) or a click.
------------------------------------------------------------------- */

export function Reveal({ at = 1, children, label = "Talk first. Then press Right (or click).", block = true }) {
  const { step, reveal } = useStep();
  const shown = step >= at;
  const Tag = block ? "div" : "span";
  return (
    <Tag className={`reveal ${shown ? "shown" : "hidden"}`} onClick={() => !shown && reveal(at)}>
      <Tag className="reveal-content">{children}</Tag>
      {!shown && <span className="reveal-cover">{label}</span>}
    </Tag>
  );
}

/* -------------------------------------------------------------------
   Text pieces
------------------------------------------------------------------- */

export function Ask({ children, n }) {
  return (
    <div className="ask">
      <span className="ask-tag">{n ? `Question ${n}` : "Question"}</span>
      <div>{children}</div>
    </div>
  );
}

export function Predict({ children }) {
  return (
    <div className="ask predict">
      <span className="ask-tag">Predict first</span>
      <div>{children}</div>
    </div>
  );
}

export function Check({ children, title = "Checkpoint" }) {
  return (
    <div className="check">
      <span className="check-box">&#10003;</span>
      <div>
        <div className="check-title">{title}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Callout({ kind = "info", title, children }) {
  return (
    <div className={`callout callout-${kind}`}>
      {title && <div className="callout-title">{title}</div>}
      <div>{children}</div>
    </div>
  );
}

export function Steps({ items, start = 1 }) {
  return (
    <ol className="steps">
      {items.map((it, i) => (
        <li key={i}>
          <span className="step-num">{start + i}</span>
          <span className="step-text">{it}</span>
        </li>
      ))}
    </ol>
  );
}

export function Pill({ children, color }) {
  return <span className="pill" style={color ? { background: color } : undefined}>{children}</span>;
}

export function Table({ head, rows, widths }) {
  return (
    <table className="tbl">
      {widths && <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>}
      <thead>
        <tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

/* -------------------------------------------------------------------
   Code with a tiny highlighter (js, json, env, bash, sql)
------------------------------------------------------------------- */

const RULES = {
  js: [
    ["com", /\/\/.*$/y],
    ["str", /`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y],
    ["kw", /\b(?:import|from|export|default|const|let|function|return|if|else|async|await|new|throw|try|catch|of)\b/y],
    ["lit", /\b(?:true|false|null|undefined)\b|\b\d+\b/y],
    ["tag", /<\/?[A-Za-z][\w.]*/y],
    ["fn", /\b[A-Za-z_$][\w$]*(?=\()/y],
    ["prop", /(?<=\.)[A-Za-z_$][\w$]*/y],
  ],
  json: [
    ["key", /"(?:[^"\\]|\\.)*"(?=\s*:)/y],
    ["str", /"(?:[^"\\]|\\.)*"/y],
    ["lit", /\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?\b/y],
  ],
  env: [
    ["com", /#.*$/y],
    ["key", /^[A-Z0-9_]+(?==)/y],
    ["str", /(?<==).+$/y],
  ],
  bash: [
    ["com", /#.*$/y],
    ["str", /"[^"]*"|'[^']*'/y],
    ["kw", /^\$/y],
  ],
  sql: [
    ["com", /--.*$/y],
    ["str", /'[^']*'/y],
    ["kw", /\b(?:alter|table|add|column|references|select|from|where|insert|into|values|update|set|delete|create|policy|on|for|to|using|with|check|enable|row|level|security|default|not|null|and)\b/y],
  ],
  text: [],
};

function tokenize(line, lang) {
  const rules = RULES[lang] ?? [];
  const out = [];
  let i = 0;
  let plain = "";
  while (i < line.length) {
    let hit = null;
    for (const [cls, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(line);
      if (m && m[0].length > 0) { hit = [cls, m[0]]; break; }
    }
    if (hit) {
      if (plain) { out.push([null, plain]); plain = ""; }
      out.push(hit);
      i += hit[1].length;
    } else {
      plain += line[i];
      i += 1;
    }
  }
  if (plain) out.push([null, plain]);
  return out;
}

/* mark: line numbers (1-based) to highlight. dim: everything else fades. */
export function Code({ children, lang = "js", title, mark = [], size, nums = false }) {
  const lines = String(children).replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");
  const marked = new Set(mark);
  return (
    <div className="code">
      {title && <div className="code-title">{title}</div>}
      <pre style={size ? { fontSize: size } : undefined}>
        {lines.map((line, i) => (
          <div key={i} className={`code-line ${marked.has(i + 1) ? "marked" : ""} ${marked.size && !marked.has(i + 1) ? "unmarked" : ""}`}>
            {nums && <span className="ln">{i + 1}</span>}
            {line === "" ? " " : tokenize(line, lang).map(([cls, text], j) =>
              cls ? <span key={j} className={`t-${cls}`}>{text}</span> : <span key={j}>{text}</span>
            )}
          </div>
        ))}
      </pre>
    </div>
  );
}

export function C({ children }) {
  return <code className="ic">{children}</code>;
}
