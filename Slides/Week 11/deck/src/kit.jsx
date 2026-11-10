import { createContext, useContext, useEffect, useState, useCallback } from "react";

/* ------------------------------------------------------------------
   Deck shell: 1280x720 canvas scaled to the window.
   Right / Space: next build step, then next slide.   Left: back.
   N: instructor notes.   G: slide overview.   F: fullscreen.
   The slide number lives in the URL (#7), so a refresh stays put.
------------------------------------------------------------------- */

const StepCtx = createContext({ step: 0, reveal: () => {} });
export const useStep = () => useContext(StepCtx);

const PARTS = {
  intro: { label: "Today", color: "var(--navy)" },
  setup: { label: "Setup", color: "var(--slate)" },
  api: { label: "Part 1: The API goes live", color: "var(--teal)" },
  web: { label: "Part 2: React talks to the API", color: "var(--indigo)" },
  fix: { label: "When it breaks", color: "var(--red)" },
  p4: { label: "Part 3: Your Project 4", color: "var(--amber)" },
};
export const partColor = (p) => PARTS[p]?.color ?? "var(--navy)";

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
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const k = e.key;
      if (k === "ArrowRight" || k === " " || k === "PageDown") { e.preventDefault(); next(); }
      else if (k === "ArrowLeft" || k === "PageUp" || k === "Backspace") { e.preventDefault(); prev(); }
      else if (k === "n" || k === "N") setNotes((v) => !v);
      else if (k === "g" || k === "G") setGrid((v) => !v);
      else if (k === "f" || k === "F") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      } else if (k === "Home") go(0);
      else if (k === "End") go(slides.length - 1);
      else if (k === "Escape") { setGrid(false); setNotes(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, slides.length]);

  useEffect(() => {
    function fit() {
      const barH = 34;
      setScale(Math.min(window.innerWidth / 1280, (window.innerHeight - barH) / 720));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const reveal = useCallback((at) => setStep((s) => Math.max(s, at)), []);
  const part = PARTS[slide.part] ?? PARTS.intro;

  return (
    <div className="stage">
      <div className="canvas-wrap" style={{ width: 1280 * scale, height: 720 * scale }}>
        <div className="canvas" style={{ transform: `scale(${scale})` }} data-part={slide.part}>
          <StepCtx.Provider value={{ step, reveal }}>{slide.render()}</StepCtx.Provider>
        </div>
      </div>

      <div className="bar">
        <span className="bar-part" style={{ color: part.color }}>{part.label}</span>
        <div className="bar-progress">
          <div style={{ width: `${((idx + 1) / slides.length) * 100}%`, background: part.color }} />
        </div>
        <span className="bar-count">{idx + 1} / {slides.length}</span>
        <span className="bar-keys">Right: next &nbsp; N: notes &nbsp; G: all slides &nbsp; F: fullscreen</span>
      </div>

      {notes && <Notes slide={slide} idx={idx} total={slides.length} onClose={() => setNotes(false)} />}
      {grid && (
        <div className="grid-overlay" onClick={() => setGrid(false)}>
          <div className="grid-inner" onClick={(e) => e.stopPropagation()}>
            {slides.map((s, i) => (
              <button key={s.id} className={`grid-item ${i === idx ? "on" : ""}`} onClick={() => { go(i); setGrid(false); }}>
                <span className="grid-num" style={{ background: partColor(s.part) }}>{i + 1}</span>
                <span>{s.title}</span>
              </button>
            ))}
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
          const m = line.match(/^(TIME|SAY|ASK|WATCH|CHECK|DO|IF BEHIND):\s*(.*)$/);
          if (!m) return <p key={i}>{line}</p>;
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

/* ------------------------------------------------------------------
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

/* ------------------------------------------------------------------
   Reveal: hidden until its build step (Right arrow) or a click.
------------------------------------------------------------------- */

export function Reveal({ at = 1, children, label = "Press Right (or click) to reveal", block = true }) {
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

/* ------------------------------------------------------------------
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
    <ol className="steps" start={start}>
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

/* ------------------------------------------------------------------
   Code with a tiny highlighter (js, json, env, bash)
------------------------------------------------------------------- */

const RULES = {
  js: [
    ["com", /\/\/.*$/],
    ["str", /`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/],
    ["kw", /\b(?:import|from|export|default|const|let|function|return|if|else|async|await|new|throw|try|catch|of)\b/],
    ["lit", /\b(?:true|false|null|undefined)\b|\b\d+\b/],
    ["fn", /\b[A-Za-z_$][\w$]*(?=\()/],
    ["prop", /(?<=\.)[A-Za-z_$][\w$]*/],
  ],
  json: [
    ["key", /"(?:[^"\\]|\\.)*"(?=\s*:)/],
    ["str", /"(?:[^"\\]|\\.)*"/],
    ["lit", /\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?\b/],
  ],
  env: [
    ["com", /^\s*#.*$/],
    ["key", /^[A-Z0-9_]+(?==)/],
    ["str", /(?<==).+$/],
  ],
  bash: [
    ["com", /#.*$/],
    ["str", /"[^"]*"|'[^']*'/],
  ],
  text: [],
};

function tokenize(line, lang) {
  const rules = RULES[lang] ?? [];
  if (!rules.length) return [["", line]];
  const big = new RegExp(rules.map(([, r]) => `(${r.source})`).join("|"), "g");
  const out = [];
  let last = 0;
  let m;
  while ((m = big.exec(line))) {
    if (m[0] === "") { big.lastIndex++; continue; }
    if (m.index > last) out.push(["", line.slice(last, m.index)]);
    const gi = m.slice(1).findIndex((g) => g !== undefined);
    out.push([rules[gi][0], m[0]]);
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(["", line.slice(last)]);
  return out;
}

export function Code({ children, lang = "js", title, hl = [], size, numbers = true, maxH }) {
  const lines = String(children).replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");
  const dim = hl.length > 0;
  return (
    <div className="code" style={{ fontSize: size, maxHeight: maxH }}>
      {title && <div className="code-title">{title}</div>}
      <pre>
        {lines.map((line, i) => {
          const n = i + 1;
          const on = hl.includes(n);
          return (
            <div key={i} className={`ln ${dim ? (on ? "ln-on" : "ln-dim") : ""}`}>
              {numbers && <span className="ln-n">{n}</span>}
              <span className="ln-t">
                {tokenize(line, lang).map(([t, s], j) => (
                  <span key={j} className={t ? `t-${t}` : undefined}>{s}</span>
                ))}
                {line === "" && " "}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

/* Terminal: lines starting with "$ " are commands, the rest is output.
   Lines starting with "# " are comments (dimmed). */
export function Term({ children, title = "Terminal", size }) {
  const lines = String(children).replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");
  return (
    <div className="term" style={{ fontSize: size }}>
      <div className="term-bar">
        <span className="dots"><i /><i /><i /></span>
        <span className="term-title">{title}</span>
      </div>
      <pre>
        {lines.map((l, i) => {
          if (l.startsWith("$ ")) return <div key={i} className="term-cmd"><span className="term-prompt">$</span>{l.slice(2)}</div>;
          if (l.startsWith("# ")) return <div key={i} className="term-com">{l}</div>;
          if (l.startsWith("! ")) return <div key={i} className="term-hi">{l.slice(2)}</div>;
          return <div key={i} className="term-out">{l || " "}</div>;
        })}
      </pre>
    </div>
  );
}

/* Screenshot inside a browser frame */
export function Shot({ src, url, height, caption }) {
  return (
    <figure className="shot">
      <div className="shot-bar">
        <span className="dots"><i /><i /><i /></span>
        <span className="shot-url">{url}</span>
      </div>
      <div className="shot-img" style={height ? { height } : undefined}>
        <img src={src} alt={caption ?? url} />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/* A browser tab showing raw JSON (like Chrome does) */
export function JsonTab({ url, json, size }) {
  return (
    <div className="shot jsontab">
      <div className="shot-bar">
        <span className="dots"><i /><i /><i /></span>
        <span className="shot-url">{url}</span>
      </div>
      <Code lang="json" numbers={false} size={size}>{json}</Code>
    </div>
  );
}

/* Simple diagram node */
export function Node({ title, sub, color = "var(--navy)", tag, w, children }) {
  return (
    <div className="node" style={{ borderColor: color, width: w }}>
      {tag && <span className="node-tag" style={{ background: color }}>{tag}</span>}
      <div className="node-title" style={{ color }}>{title}</div>
      {sub && <div className="node-sub">{sub}</div>}
      {children}
    </div>
  );
}

export function Arrow({ label, dir = "right", color = "var(--muted)" }) {
  return (
    <div className={`arrow arrow-${dir}`} style={{ color }}>
      {label && <span className="arrow-label">{label}</span>}
      <span className="arrow-line" />
    </div>
  );
}

export function Table({ head, rows, widths, size }) {
  return (
    <table className="tbl" style={{ fontSize: size }}>
      {widths && <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>}
      <thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
      </tbody>
    </table>
  );
}

export function K({ children }) {
  return <code className="k">{children}</code>;
}
