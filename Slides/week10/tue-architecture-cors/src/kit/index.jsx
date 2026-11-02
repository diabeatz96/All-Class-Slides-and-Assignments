import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import "./theme.css";

/* ==================================================================
   CSC 436 Week 11 deck kit: pirate voyage edition
   Keys: arrows/space = move, N = notes, B = bounty board, P = pick a crew,
         T = timer, R = reveal (Call It! slides), F = fullscreen
   ================================================================== */

/* ---------------- safe storage (browser storage can throw) ---------------- */
const BOUNTY_KEY = "csc436-w11-bounty-v1";
function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the board still works for this session */
  }
}

const DEFAULT_CREWS = [
  { name: "Galley Gulls", bounty: 0, color: "#e0533c" },
  { name: "Iron Anchors", bounty: 0, color: "#24609a" },
  { name: "Salt Dogs", bounty: 0, color: "#19a7a0" },
  { name: "Storm Chasers", bounty: 0, color: "#8a5cd6" },
  { name: "Red Lanterns", bounty: 0, color: "#c98a12" },
  { name: "Sea Biscuits", bounty: 0, color: "#46b873" },
];
const STEP = 1_000_000;
export const fmt = (n) => n.toLocaleString("en-US");

const BountyCtx = createContext(null);
export const useBounty = () => useContext(BountyCtx);

function useBountyStore() {
  const [crews, setCrews] = useState(() => {
    const saved = load(BOUNTY_KEY, null);
    if (Array.isArray(saved) && saved.length === DEFAULT_CREWS.length) {
      return saved.map((c, i) => ({ ...DEFAULT_CREWS[i], ...c }));
    }
    return DEFAULT_CREWS;
  });
  useEffect(() => save(BOUNTY_KEY, crews), [crews]);
  const award = useCallback((i, amount = STEP) => {
    setCrews((cs) => cs.map((c, j) => (j === i ? { ...c, bounty: Math.max(0, c.bounty + amount) } : c)));
  }, []);
  const rename = useCallback((i, name) => {
    setCrews((cs) => cs.map((c, j) => (j === i ? { ...c, name } : c)));
  }, []);
  const reset = useCallback(() => setCrews((cs) => cs.map((c) => ({ ...c, bounty: 0 }))), []);
  return { crews, award, rename, reset };
}

/* ---------------- tiny event bus for the R key ---------------- */
const REVEAL_EVENT = "deck:reveal";
function useRevealKey(fn) {
  useEffect(() => {
    const h = () => fn();
    window.addEventListener(REVEAL_EVENT, h);
    return () => window.removeEventListener(REVEAL_EVENT, h);
  }, [fn]);
}

/* ======================= DeckShell ======================= */
export function DeckShell({ slides, label }) {
  const total = slides.length;
  const initial = () => {
    const n = parseInt(window.location.hash.replace("#", ""), 10);
    return Number.isInteger(n) && n >= 1 && n <= total ? n - 1 : 0;
  };
  const [i, setI] = useState(initial);
  const [scale, setScale] = useState(1);
  const [panel, setPanel] = useState(null); // "notes" | "bounty" | "pick" | "timer" | null
  const bounty = useBountyStore();

  useEffect(() => {
    window.history.replaceState(null, "", `#${i + 1}`);
  }, [i]);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1280, window.innerHeight / 720) * 0.985);
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const go = useCallback((d) => setI((x) => Math.min(total - 1, Math.max(0, x + d))), [total]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      const k = e.key;
      if (k === "ArrowRight" || k === "PageDown" || k === " ") { e.preventDefault(); go(1); }
      else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); go(-1); }
      else if (k === "Home") setI(0);
      else if (k === "End") setI(total - 1);
      else if (k === "n" || k === "N") setPanel((p) => (p === "notes" ? null : "notes"));
      else if (k === "b" || k === "B") setPanel((p) => (p === "bounty" ? null : "bounty"));
      else if (k === "p" || k === "P") setPanel((p) => (p === "pick" ? null : "pick"));
      else if (k === "t" || k === "T") setPanel((p) => (p === "timer" ? null : "timer"));
      else if (k === "r" || k === "R") window.dispatchEvent(new Event(REVEAL_EVENT));
      else if (k === "Escape") setPanel(null);
      else if (k === "f" || k === "F") {
        try {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
        } catch { /* fullscreen not allowed here */ }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, total]);

  const s = slides[i];
  const Render = s.render;
  return (
    <BountyCtx.Provider value={bounty}>
      <div className="stage">
        <div className="canvas" style={{ transform: `scale(${scale})` }}>
          <div className="progress" style={{ width: `${((i + 1) / total) * 100}%` }} />
          <div key={s.id} className="fade" style={{ position: "absolute", inset: 0 }}>
            <Render />
          </div>
          {panel === "notes" && (
            <div className="notes pop">
              <b>Instructor notes, slide {i + 1}:</b> {s.notes || "No notes for this slide."}
            </div>
          )}
          {panel === "bounty" && <BountyBoard onClose={() => setPanel(null)} />}
          {panel === "pick" && <CrewPicker onClose={() => setPanel(null)} />}
          {panel === "timer" && <Timer onClose={() => setPanel(null)} />}
          <div className="footer">
            <span>{label}</span>
            <span className="keys">
              <span><kbd>N</kbd> notes</span>
              <span><kbd>B</kbd> bounty</span>
              <span><kbd>P</kbd> pick crew</span>
              <span><kbd>T</kbd> timer</span>
            </span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="navbtn" onClick={() => go(-1)} aria-label="Previous slide">Prev</button>
              <span>{i + 1} / {total}</span>
              <button className="navbtn" onClick={() => go(1)} aria-label="Next slide">Next</button>
            </span>
          </div>
        </div>
      </div>
    </BountyCtx.Provider>
  );
}

/* ======================= Overlays ======================= */
function Flag({ color, letter, size = 54 }) {
  return (
    <svg width={size * 1.3} height={size} viewBox="0 0 65 50" aria-hidden="true">
      <rect x="4" y="2" width="3" height="46" rx="1.5" fill="#5b4630" />
      <path d="M7 4 H58 L50 15 L58 26 H7 Z" fill={color} stroke="#2a1d10" strokeWidth="1.5" />
      <text x="30" y="21" textAnchor="middle" fontFamily="Pirata One, serif" fontSize="17" fill="#fff">{letter}</text>
    </svg>
  );
}

function Crown() {
  return (
    <svg width="54" height="40" viewBox="0 0 54 40" aria-label="Leading crew">
      <path d="M4 34 L8 10 L19 22 L27 4 L35 22 L46 10 L50 34 Z" fill="#f2c14e" stroke="#7a5200" strokeWidth="2" />
      <rect x="4" y="32" width="46" height="6" rx="2" fill="#c98a12" stroke="#7a5200" strokeWidth="2" />
    </svg>
  );
}

export function BountyBoard({ onClose }) {
  const { crews, award, rename, reset } = useBounty();
  const [armed, setArmed] = useState(false);
  const top = Math.max(...crews.map((c) => c.bounty));
  return (
    <div className="overlay pop">
      <button className="btn sm ghost close" onClick={onClose}>Close (B)</button>
      <h2 className="otitle">Crew Bounty Board</h2>
      <div className="note">Bounties carry over from Tuesday to Thursday. Click a crew name to rename it.</div>
      <div className="posters">
        {crews.map((c, idx) => (
          <div key={idx} className={`poster ${top > 0 && c.bounty === top ? "leader" : ""}`}>
            {top > 0 && c.bounty === top && <div className="crown"><Crown /></div>}
            <div className="w">WANTED</div>
            <div className="flag"><Flag color={c.color} letter={c.name.slice(0, 1)} /></div>
            <input value={c.name} onChange={(e) => rename(idx, e.target.value)} aria-label="Crew name" />
            <div className="amt">{fmt(c.bounty)} <small>BERRIES</small></div>
            <div className="ctl">
              <button className="btn sm red" onClick={() => award(idx, -STEP)}>-1M</button>
              <button className="btn sm" onClick={() => award(idx, STEP)}>+1M</button>
              <button className="btn sm teal" onClick={() => award(idx, 5 * STEP)}>+5M</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "auto", display: "flex", gap: 10, alignItems: "center" }}>
        <button className={`btn sm ${armed ? "red" : "ghost"}`} onClick={() => (armed ? (reset(), setArmed(false)) : setArmed(true))}>
          {armed ? "Click again to wipe all bounties" : "Reset bounties"}
        </button>
        {armed && <button className="btn sm ghost" onClick={() => setArmed(false)}>Never mind</button>}
      </div>
    </div>
  );
}

export function CrewPicker({ onClose }) {
  const { crews } = useBounty();
  const [idx, setIdx] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef(null);
  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const target = Math.floor(Math.random() * crews.length);
    const steps = 20 + target;
    let n = 0;
    const tick = () => {
      setIdx(n % crews.length);
      n += 1;
      if (n > steps) { setIdx(target); setSpinning(false); return; }
      timer.current = setTimeout(tick, 40 + n * n * 0.35);
    };
    tick();
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const c = idx === null ? null : crews[idx];
  return (
    <div className="overlay pop" style={{ alignItems: "center", justifyContent: "center" }}>
      <button className="btn sm ghost close" onClick={onClose}>Close (P)</button>
      <h2 className="otitle">Who answers?</h2>
      <div style={{ height: 300, display: "grid", placeItems: "center" }}>
        {c ? (
          <div className="poster" style={{ width: 300, transform: spinning ? "rotate(-2deg)" : "none" }}>
            <div className="w">WANTED</div>
            <div className="flag"><Flag color={c.color} letter={c.name.slice(0, 1)} size={70} /></div>
            <div style={{ fontFamily: "var(--display)", fontSize: 34, color: "var(--red-deep)" }}>{c.name}</div>
            {!spinning && <div className="pop" style={{ fontWeight: 900, marginTop: 6 }}>This crew answers.</div>}
          </div>
        ) : (
          <div className="lead">Press spin and the sea decides.</div>
        )}
      </div>
      <button className="btn" onClick={spin} disabled={spinning}>{spinning ? "Spinning..." : "Spin"}</button>
    </div>
  );
}

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 660;
    g.gain.value = 0.08;
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch { /* no audio, no problem */ }
}

export function Timer({ onClose }) {
  const [len, setLen] = useState(90);
  const [left, setLeft] = useState(90);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    if (left <= 0) { setRun(false); beep(); return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [run, left]);
  const pick = (s) => { setLen(s); setLeft(s); setRun(false); };
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="overlay pop" style={{ alignItems: "center" }}>
      <button className="btn sm ghost close" onClick={onClose}>Close (T)</button>
      <h2 className="otitle">Crew huddle</h2>
      <div style={{ display: "flex", gap: 10, margin: "12px 0" }}>
        {[60, 90, 120, 180].map((s) => (
          <button key={s} className={`chipbtn ${len === s ? "on" : ""}`} onClick={() => pick(s)}>{s} s</button>
        ))}
      </div>
      <div className={`timer-big ${left <= 10 ? "low" : ""}`}>{left > 0 ? `${mm}:${ss}` : "Time!"}</div>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn" onClick={() => setRun((r) => !r)} disabled={left <= 0}>{run ? "Pause" : "Start"}</button>
        <button className="btn ghost" onClick={() => pick(len)}>Reset</button>
      </div>
    </div>
  );
}

/* ======================= Slide primitives ======================= */
export function Slide({ kicker, q, sm, children, style }) {
  return (
    <div className="slide" style={style}>
      {kicker && <div className="kicker">{kicker}</div>}
      {q && <h1 className={`qtitle ${sm ? "sm" : ""}`}>{q}</h1>}
      {children}
    </div>
  );
}

export function Split({ cols = "1fr 1fr", children, style, stretch }) {
  return <div className={`split ${stretch ? "stretch" : ""}`} style={{ gridTemplateColumns: cols, ...style }}>{children}</div>;
}

export function Reveal({ label = "Show the answer", children, btn = "btn", style, onShow }) {
  const [open, setOpen] = useState(false);
  if (open) return <div className="pop" style={style}>{children}</div>;
  return (
    <div style={style}>
      <button className={btn} onClick={() => { setOpen(true); onShow && onShow(); }}>{label}</button>
    </div>
  );
}

/* Several answers revealed one at a time, in order. */
export function Steps({ items, label = "Next", render }) {
  const [n, setN] = useState(0);
  return (
    <div className="col">
      {items.slice(0, n).map((it, k) => (
        <div key={k} className="pop">{render ? render(it, k) : it}</div>
      ))}
      {n < items.length && (
        <div><button className="btn sm" onClick={() => setN(n + 1)}>{label} ({n}/{items.length})</button></div>
      )}
    </div>
  );
}

/* ---------------- screencap slot ---------------- */
const EXTS = ["jpg", "png", "webp", "gif"];
export function Cap({ id, hint, caption, style, fit = "cover" }) {
  const [k, setK] = useState(0);
  const base = import.meta.env.BASE_URL || "/";
  const src = k < EXTS.length ? `${base}caps/${id}.${EXTS[k]}` : null;
  return (
    <div className="cap" style={style}>
      {src && (
        <img src={src} alt={caption || hint} style={{ objectFit: fit }} onError={() => setK((x) => x + 1)} />
      )}
      {!src && (
        <div className="ph">
          <div>
            <div className="t">Screencap goes here</div>
            <div className="h">{hint}</div>
            <div className="id">public/caps/{id}.jpg</div>
          </div>
        </div>
      )}
      {src && caption && <div className="caption">{caption}</div>}
    </div>
  );
}

/* ---------------- code highlighting ---------------- */
const KW = new Set("import from export default const let var function return if else await async new throw try catch finally for of in typeof null undefined true false this class extends while break continue switch case".split(" "));
const RE = /(\/\/.*$)|(\/\*.*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;

function jsTokens(line) {
  const out = [];
  let m;
  RE.lastIndex = 0;
  while ((m = RE.exec(line)) !== null) {
    const [t, com, bcom, str, num, id] = m;
    if (com || bcom) out.push(["tk-com", t]);
    else if (str) out.push(["tk-str", t]);
    else if (num) out.push(["tk-num", t]);
    else if (id) {
      const rest = line.slice(RE.lastIndex);
      const prev = line.slice(0, m.index);
      if (KW.has(t)) out.push(["tk-kw", t]);
      else if (/^\s*\(/.test(rest)) out.push(["tk-fn", t]);
      else if (/\.\s*$/.test(prev)) out.push(["tk-prop", t]);
      else out.push(["", t]);
    } else if (/^\s+$/.test(t)) out.push(["", t]);
    else out.push(["tk-pun", t]);
    if (t === "") break;
  }
  return out;
}

function hlLine(line, lang) {
  if (lang === "js" || lang === "ts") {
    return jsTokens(line).map(([c, t], k) => (c ? <span key={k} className={c}>{t}</span> : t));
  }
  if (lang === "bash") {
    if (/^\s*#/.test(line)) return <span className="tk-com">{line}</span>;
    const m = line.match(/^(\$ )(.*)$/);
    if (m) return [<span key="p" className="tk-kw">{m[1]}</span>, m[2]];
    return line;
  }
  if (lang === "env") {
    if (/^\s*#/.test(line)) return <span className="tk-com">{line}</span>;
    const m = line.match(/^([A-Z0-9_]+)(=)(.*)$/);
    if (m) return [<span key="k" className="tk-key">{m[1]}</span>, m[2], <span key="v" className="tk-str">{m[3]}</span>];
    return line;
  }
  if (lang === "json") {
    return line.split(/("(?:[^"\\]|\\.)*")(\s*:)?/g).map((part, k) => {
      if (part === undefined) return null;
      if (/^".*"$/.test(part)) return <span key={k} className="tk-str">{part}</span>;
      if (/^\s*-?\d/.test(part)) return <span key={k} className="tk-num">{part}</span>;
      return part;
    });
  }
  if (lang === "http") {
    const m = line.match(/^([A-Za-z-]+)(:)(.*)$/);
    if (m) return [<span key="k" className="tk-key">{m[1]}</span>, m[2], <span key="v" className="tk-str">{m[3]}</span>];
    const r = line.match(/^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HTTP\/1\.1)(.*)$/);
    if (r) return [<span key="m" className="tk-kw">{r[1]}</span>, r[2]];
    return line;
  }
  return line;
}

export function Code({ code, lang = "js", title, hl = [], dim = [], bad = [], good = [], size = 15, style, pins = [], activePin, onPin, start = 1 }) {
  const lines = code.replace(/\n$/, "").split("\n");
  const has = (arr, n) => arr.includes(n);
  return (
    <div className="code" style={{ fontSize: size, ...style }}>
      {title && <div className="codetitle">{title}</div>}
      {lines.map((ln, k) => {
        const n = k + start;
        const pin = pins.find((p) => p.line === n);
        const cls = ["ln", has(hl, n) && "hl", has(dim, n) && "dim", has(bad, n) && "bad", has(good, n) && "good"].filter(Boolean).join(" ");
        return (
          <div key={k} className={cls}>
            <span className="num">{n}</span>
            <span className="txt">{hlLine(ln, lang)}</span>
            {pin && (
              <button className={`pin ${activePin === pin.n ? "on" : ""}`} onClick={() => onPin && onPin(pin.n)} aria-label={`Question ${pin.n}`}>
                {pin.n}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Dissect: pins on code, each pin is a question ---------------- */
export function Dissect({ code, lang = "js", title, pins, size = 15, cols = "1.25fr 1fr", codeStyle }) {
  const [active, setActive] = useState(null);
  const [shown, setShown] = useState({});
  const p = pins.find((x) => x.n === active);
  return (
    <Split cols={cols} stretch>
      <Code code={code} lang={lang} title={title} size={size} pins={pins} activePin={active} onPin={setActive} hl={p ? [p.line] : []} style={codeStyle} />
      <div className="col">
        {!p && (
          <div className="parch">
            <h3>Dissect it</h3>
            <div className="muted" style={{ fontSize: 17 }}>Click a red pin. Each pin is a question for your crew. Argue first, then reveal.</div>
          </div>
        )}
        {p && (
          <div className="parch pop" key={p.n}>
            <div className="tag" style={{ background: "rgba(168,50,31,.12)", color: "var(--red-deep)", borderColor: "var(--red-deep)" }}>Pin {p.n}</div>
            <h3 style={{ marginTop: 8, fontSize: 23, lineHeight: 1.25 }}>{p.q}</h3>
            {shown[p.n] ? (
              <div className="pop" style={{ fontSize: 17, lineHeight: 1.45, marginTop: 8 }}>{p.a}</div>
            ) : (
              <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setShown({ ...shown, [p.n]: true })}>Show answer</button>
            )}
          </div>
        )}
        <div className="note">{pins.length} pins. {Object.keys(shown).length} answered.</div>
      </div>
    </Split>
  );
}

/* ---------------- Call It!: predict, vote, reveal ---------------- */
export function CallIt({ options, answer, why, cols = 1, size }) {
  const [open, setOpen] = useState(false);
  const reveal = useCallback(() => setOpen(true), []);
  useRevealKey(reveal);
  const { crews, award } = useBounty();
  const [paid, setPaid] = useState({});
  return (
    <div className="col">
      <div className="choices" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {options.map((o, k) => (
          <div key={k} className={`choice ${open ? (k === answer ? "right" : "wrong") : ""}`} style={size ? { fontSize: size } : undefined}>
            <span className="letter">{"ABCD"[k]}</span>
            <span>{o}</span>
          </div>
        ))}
      </div>
      {!open && (
        <div className="row" style={{ alignItems: "center" }}>
          <button className="btn" onClick={reveal}>Reveal (R)</button>
          <span className="note">Crews: hold up your letter first. No changing after the reveal.</span>
        </div>
      )}
      {open && (
        <div className="pop col" style={{ gap: 10 }}>
          {why && <div className="parch" style={{ fontSize: 17, lineHeight: 1.45 }}>{why}</div>}
          <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className="note">Pay the crews that called it:</span>
            {crews.map((c, k) => (
              <button key={k} className={`chipbtn ${paid[k] ? "on" : ""}`} disabled={paid[k]} onClick={() => { award(k); setPaid({ ...paid, [k]: true }); }}>
                {paid[k] ? `${c.name} +1M` : c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- terminal ---------------- */
export function Term({ lines, title = "terminal", style, size = 14 }) {
  return (
    <div className="term" style={{ fontSize: size, ...style }}>
      <div className="bar"><i /><i /><i /><span className="dim" style={{ marginLeft: 6, fontSize: 12 }}>{title}</span></div>
      {lines.map((l, k) => {
        if (typeof l === "string") return <div key={k}>{l}</div>;
        return <div key={k} className={l.c}>{l.c === "prompt" ? `$ ${l.t}` : l.t}</div>;
      })}
    </div>
  );
}

/* ---------------- checklist ---------------- */
export function Checklist({ items, size = 18 }) {
  const [done, setDone] = useState({});
  return (
    <div className="col" style={{ gap: 8 }}>
      {items.map((it, k) => (
        <button key={k} onClick={() => setDone({ ...done, [k]: !done[k] })}
          style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", background: done[k] ? "rgba(70,184,115,.14)" : "rgba(7,26,47,.7)", border: `1px solid ${done[k] ? "var(--good)" : "rgba(143,227,220,.2)"}`, borderRadius: 10, padding: "8px 12px", color: "var(--white)", fontSize: size, cursor: "pointer" }}>
          <span style={{ width: 24, height: 24, flex: "none", borderRadius: 6, border: "2px solid var(--gold)", display: "grid", placeItems: "center", color: "var(--gold)", fontWeight: 900 }}>{done[k] ? "X" : ""}</span>
          <span className={done[k] ? "strike" : ""}>{it}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- tiers ---------------- */
const TIER_COLORS = { Bronze: "#c47a3a", Silver: "#b8c4d0", Gold: "#f2c14e", Bonus: "#8fe3dc" };
export function Tiers({ tiers, size = 16 }) {
  return (
    <div className="grid2" style={{ gridTemplateColumns: `repeat(${tiers.length}, 1fr)`, gap: 14 }}>
      {tiers.map((t) => (
        <div key={t.name} className="panel" style={{ borderTop: `6px solid ${TIER_COLORS[t.name] || "var(--gold)"}`, fontSize: size }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 30, color: TIER_COLORS[t.name] }}>{t.name}</div>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18, lineHeight: 1.45 }}>
            {t.items.map((x, k) => <li key={k}>{x}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ---------------- a big question card ---------------- */
export function Ask({ children, n }) {
  return (
    <div className="parch" style={{ display: "flex", gap: 14, alignItems: "flex-start", fontSize: 21, lineHeight: 1.35 }}>
      {n !== undefined && (
        <span style={{ fontFamily: "var(--display)", fontSize: 34, color: "var(--red-deep)", lineHeight: 1 }}>{n}</span>
      )}
      <span style={{ fontWeight: 800 }}>{children}</span>
    </div>
  );
}

export { useMemo };
