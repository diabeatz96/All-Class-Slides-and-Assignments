import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------
   CSC 436  |  Week 4, Mission 2  |  useState + Events
   Theme: building a food order (everyone has used one of these apps).
   Arrow keys or on-screen buttons to move. Press N for instructor notes.
------------------------------------------------------------------- */

const T = {
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
  codeBg: "#111827",
};

const CSS = `
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
  .kicker { color: ${T.accent}; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .note { color: ${T.muted}; font-size: 14px; line-height: 1.5; }
  .callout { background: ${T.warnSoft}; border: 1px solid #F6C7AC; border-radius: 12px; padding: 14px 16px; font-size: 15px; line-height: 1.55; }
  .callout .h { color: ${T.warn}; font-weight: 600; margin-bottom: 4px; }
  .bar { height: 8px; background: ${T.line}; border-radius: 999px; overflow: hidden; }
  .bar > div { height: 100%; background: ${T.accent}; transition: width 160ms ease; }
  @media (prefers-reduced-motion: reduce) { .bar > div { transition: none; } }
  .check { display: flex; gap: 12px; align-items: flex-start; padding: 9px 10px; border-radius: 8px; cursor: pointer; }
  .check:hover { background: ${T.bg}; }
  .check input { margin-top: 4px; accent-color: ${T.accent}; }
  .big { font-size: 104px; line-height: 1; font-weight: 700; letter-spacing: -0.04em; color: ${T.ink}; }
  .num-display { font-weight: 700; letter-spacing: -0.03em; color: ${T.ink}; }
`;

/* ------------------------- code highlighter ------------------------ */
const TOKEN =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:const|let|var|function|return|if|else|import|from|export|default|true|false|null|new)\b)|(<\/?[A-Za-z][\w.]*|\/?>)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*)(?=\()/gm;

function Code({ children }) {
  const lines = String(children).replace(/^\n/, "").split("\n");
  return (
    <pre className="code mono">
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
function Slide({ kicker, title, children, wide }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "36px 64px 24px" }}>
      <div style={{ marginBottom: 22 }}>
        {kicker && <div className="kicker">{kicker}</div>}
        <h2 style={{ fontSize: 36, fontWeight: 700 }}>{title}</h2>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: wide ? "1fr" : "1.05fr 1fr", gap: 28 }}>{children}</div>
    </div>
  );
}
function Col({ children, style }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0, overflow: "auto", ...style }}>{children}</div>;
}
function Qty({ value, onDec, onInc, decOff, incOff }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button className="btn round" onClick={onDec} disabled={decOff} aria-label="decrease">-</button>
      <span className="mono num-display" style={{ width: 28, textAlign: "center", fontSize: 20 }}>{value}</span>
      <button className="btn round" onClick={onInc} disabled={incOff} aria-label="increase">+</button>
    </div>
  );
}
function ItemRow({ label, sub, value, onDec, onInc, decOff, incOff }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.line}` }}>
      <div>
        <div style={{ fontWeight: 600, color: T.ink }}>{label}</div>
        {sub && <div className="note">{sub}</div>}
      </div>
      <Qty value={value} onDec={onDec} onInc={onInc} decOff={decOff} incOff={incOff} />
    </div>
  );
}

/* ============================ SLIDES ============================== */

/* 1. Title */
function TitleSlide() {
  const [qty, setQty] = useState(0);
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "center", padding: "0 80px", gap: 40 }}>
      <div>
        <div className="kicker">CSC 436, Week 4, Mission 2, Thursday Sep 17</div>
        <h1 style={{ fontSize: 72, lineHeight: 1.0, fontWeight: 800 }}>useState + Events</h1>
        <p style={{ fontSize: 21, color: T.muted, marginTop: 22, maxWidth: 520, lineHeight: 1.5 }}>
          State as the source of truth. Conditional rendering. From a single quantity button to a full order builder.
        </p>
      </div>
      <div className="panel" style={{ textAlign: "center", padding: "40px 32px" }}>
        <div className="note" style={{ marginBottom: 8 }}>Iced coffee</div>
        <div className="big">{qty}</div>
        <div className="note" style={{ margin: "12px 0 22px" }}>This number is state. Everything today is about it.</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <button className="btn primary" onClick={() => setQty(qty + 1)}>Add to cart</button>
          <button className="btn" onClick={() => setQty(0)}>Clear</button>
        </div>
      </div>
    </div>
  );
}

/* 2. Warm-up: the plain variable bug */
function BugSlide() {
  const qty = useRef(0);
  const [log, setLog] = useState([]);
  const [revealed, setRevealed] = useState(false);
  return (
    <Slide kicker="Warm-up: predict before you run" title="Why does this cart refuse to update?">
      <Col>
        <Code>{`let qty = 0

function AddToCart() {
  return (
    <button onClick={() => {
      qty = qty + 1
      console.log("qty is now", qty)
    }}>
      In cart: {qty}
    </button>
  )
}`}</Code>
        <div className="note">Prediction: what does the button show after 3 clicks? What shows in the console?</div>
      </Col>
      <Col>
        <div className="panel">
          <button
            className="btn primary"
            onClick={() => {
              qty.current += 1;
              setLog((l) => [...l, `qty is now ${qty.current}`].slice(-6));
            }}
          >
            In cart: 0
          </button>
          <div className="mono" style={{ marginTop: 16, fontSize: 14, color: T.muted, minHeight: 130, background: T.bg, padding: 12, borderRadius: 10 }}>
            <div style={{ color: T.accent, marginBottom: 6, fontWeight: 600 }}>console</div>
            {log.length === 0 ? <div>(nothing yet)</div> : log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
        {!revealed ? (
          <button className="btn accent" onClick={() => setRevealed(true)}>Reveal the answer</button>
        ) : (
          <div className="panel" style={{ borderColor: T.accent }}>
            <p style={{ margin: 0, lineHeight: 1.55 }}>
              The variable changes. The console proves it. But React only redraws a component when you change <b>state</b> through React.
              A plain variable is invisible to React, so the screen stays frozen at 0.
            </p>
            <p style={{ margin: "10px 0 0", color: T.accent, fontWeight: 600 }}>Fix: give React a value it can watch. That is useState.</p>
          </div>
        )}
      </Col>
    </Slide>
  );
}

/* 3. Anatomy of useState */
function AnatomySlide() {
  const [pick, setPick] = useState(null);
  const parts = [
    { id: "qty", label: "qty", color: "#FCD34D", text: "The current value for this render. Read it, never assign to it." },
    { id: "set", label: "setQty", color: "#A7F3D0", text: "The only way to change it. Calling it tells React: re-render me with the new value." },
    { id: "hook", label: "useState", color: "#93C5FD", text: "A hook. Call it at the top level of a component, every render, in the same order. Never inside an if or a loop." },
    { id: "init", label: "0", color: "#FDBA74", text: "The initial value. Used on the very first render only. After that React remembers the real value." },
  ];
  const cur = parts.find((p) => p.id === pick);
  return (
    <Slide kicker="Anatomy" title="One line to learn today" wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ fontSize: 42, background: T.codeBg, color: "#E5E7EB", padding: "28px 40px", borderRadius: 16 }}>
          <span className="kw">const</span> [
          <Part p={parts[0]} pick={pick} setPick={setPick} />, <Part p={parts[1]} pick={pick} setPick={setPick} />] ={" "}
          <Part p={parts[2]} pick={pick} setPick={setPick} />(<Part p={parts[3]} pick={pick} setPick={setPick} />)
        </div>
        <div className="note">Click any piece of the line.</div>
        <div className="panel" style={{ width: 720, minHeight: 110 }}>
          {cur ? (
            <>
              <div className="mono" style={{ color: T.accent, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{cur.label}</div>
              <div style={{ fontSize: 18, lineHeight: 1.5 }}>{cur.text}</div>
            </>
          ) : (
            <div className="note" style={{ fontSize: 17 }}>
              Array destructuring, same as week 2. useState returns a pair: [value, setter]. You name both halves.
            </div>
          )}
        </div>
      </div>
    </Slide>
  );
}
function Part({ p, pick, setPick }) {
  const on = pick === p.id;
  return (
    <button
      onClick={() => setPick(p.id)}
      className="mono"
      style={{ background: on ? p.color + "33" : "transparent", border: `1px solid ${on ? p.color : "transparent"}`, color: p.color, fontSize: "inherit", borderRadius: 8, padding: "0 6px", cursor: "pointer" }}
    >
      {p.label}
    </button>
  );
}

/* 4. Working counter with render log */
function CounterSlide() {
  const [qty, setQty] = useState(0);
  const renders = useRef(0);
  const [log, setLog] = useState([]);
  useEffect(() => {
    renders.current += 1;
    setLog((l) => [...l, `render #${renders.current}: qty = ${qty}`].slice(-7));
  }, [qty]);
  return (
    <Slide kicker="First working state" title="setQty changes the value AND redraws the screen">
      <Col>
        <Code>{`import { useState } from "react"

function AddToCart() {
  const [qty, setQty] = useState(0)

  return (
    <div>
      <p>In cart: {qty}</p>
      <button onClick={() => setQty(qty + 1)}>+</button>
      <button onClick={() => setQty(qty - 1)}>-</button>
      <button onClick={() => setQty(0)}>Clear</button>
    </div>
  )
}`}</Code>
        <div className="note">Every setQty call is a request: "React, run my function again with this new value." That run is a render.</div>
      </Col>
      <Col>
        <div className="panel" style={{ textAlign: "center" }}>
          <div className="note">Iced coffee in cart</div>
          <div className="num-display" style={{ fontSize: 64 }}>{qty}</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
            <button className="btn primary" onClick={() => setQty(qty + 1)}>+</button>
            <button className="btn" onClick={() => setQty(qty - 1)}>-</button>
            <button className="btn" onClick={() => setQty(0)}>Clear</button>
          </div>
        </div>
        <div className="panel mono" style={{ fontSize: 14, color: T.muted, flex: 1 }}>
          <div style={{ color: T.accent, marginBottom: 6, fontWeight: 600 }}>render log</div>
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </Col>
    </Slide>
  );
}

/* 5. Events */
function EventsSlide() {
  const [name, setName] = useState("");
  const [last, setLast] = useState(null);
  return (
    <Slide kicker="Events" title="Events feed state, state feeds the screen">
      <Col>
        <Code>{`function Checkout() {
  const [name, setName] = useState("")

  function handleChange(e) {
    // e is the event, e.target is the <input>
    setName(e.target.value)
  }

  return (
    <>
      <input value={name} onChange={handleChange} />
      <p>Order for {name || "guest"}</p>
    </>
  )
}`}</Code>
        <div className="callout">
          <div className="h">Two rules that bite every semester</div>
          <span className="mono">onClick={"{"}handle{"}"}</span> passes the function. <span className="mono">onClick={"{"}handle(){"}"}</span> calls it immediately on every render.
          <div style={{ marginTop: 6 }}>An input with <span className="mono">value=</span> is controlled. Its text lives in state, not in the DOM. Forget onChange and it locks up.</div>
        </div>
      </Col>
      <Col>
        <div className="panel">
          <label className="note" style={{ display: "block", marginBottom: 6 }}>Name for the order</label>
          <input className="input" value={name} onChange={(e) => { setName(e.target.value); setLast({ type: e.type, value: e.target.value }); }} placeholder="Type here" />
          <p style={{ fontSize: 22, margin: "16px 0 0", fontWeight: 600, color: T.ink }}>Order for {name || "guest"}</p>
        </div>
        <div className="panel">
          <button className="btn primary" onClick={(e) => setLast({ type: e.type, value: `clicked at x=${e.clientX}` })}>Notify me when ready</button>
          <div className="mono" style={{ fontSize: 14, color: T.muted, marginTop: 12, minHeight: 44 }}>
            <div style={{ color: T.accent, fontWeight: 600 }}>last event object</div>
            {last ? <div>e.type = "{last.type}"  |  {last.value}</div> : <div>(interact with something)</div>}
          </div>
        </div>
      </Col>
    </Slide>
  );
}

/* 6. Source of truth */
function TruthSlide() {
  const [qty, setQty] = useState(2);
  const price = 4.5;
  const subtotal = qty * price;
  const freeShip = subtotal >= 20;
  const tier = qty >= 6 ? "Party size" : qty >= 3 ? "Group" : "Solo";
  return (
    <Slide kicker="State as the source of truth" title="Store one fact. Compute everything else from it.">
      <Col>
        <Code>{`const [qty, setQty] = useState(2)

// derived during render, NOT stored in state
const subtotal = qty * 4.5
const freeShip = subtotal >= 20
const tier = qty >= 6 ? "Party size"
           : qty >= 3 ? "Group"
           : "Solo"`}</Code>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.55 }}>
          If you also stored <span className="mono">subtotal</span> and <span className="mono">freeShip</span> in state, you would have three things that can disagree.
          One source of truth means one thing changes and nothing drifts out of sync.
        </div>
      </Col>
      <Col>
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: T.ink }}>Quantity</span>
            <span className="mono num-display" style={{ fontSize: 22 }}>{qty}</span>
          </div>
          <input type="range" min="1" max="10" value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ width: "100%", accentColor: T.accent, marginTop: 10 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="panel"><div className="note">Subtotal</div><div className="num-display" style={{ fontSize: 30 }}>${subtotal.toFixed(2)}</div></div>
          <div className="panel"><div className="note">Order size</div><div className="num-display" style={{ fontSize: 30 }}>{tier}</div></div>
        </div>
        <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, color: T.ink }}>Delivery</span>
          {freeShip ? <span className="chip">Free, over $20</span> : <span className="note">${(20 - subtotal).toFixed(2)} more for free delivery</span>}
        </div>
        <div className="note">Move the slider. Three displays, zero extra state.</div>
      </Col>
    </Slide>
  );
}

/* 7. Conditional rendering */
function ConditionalSlide() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("ternary");
  const [items, setItems] = useState(2);
  const snippets = {
    ternary: `{open
  ? <p>We're open. Order away.</p>
  : <p>Closed. Opens at 7am.</p>}`,
    and: `{open && <p>We're open. Order away.</p>}
{!open && <p>Closed. Opens at 7am.</p>}`,
    early: `function StoreStatus({ open }) {
  if (!open) return <p>Closed. Opens at 7am.</p>
  return <p>We're open. Order away.</p>
}`,
  };
  return (
    <Slide kicker="Conditional rendering" title="JSX is just JavaScript, so use JavaScript to decide what shows">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          {[["ternary", "? : ternary"], ["and", "&& guard"], ["early", "early return"]].map(([k, l]) => (
            <button key={k} className={"tab" + (mode === k ? " on" : "")} onClick={() => setMode(k)}>{l}</button>
          ))}
        </div>
        <Code>{snippets[mode]}</Code>
        <div className="callout">
          <div className="h">The 0 trap</div>
          <span className="mono">{"{items && <p>Cart has items</p>}"}</span> renders a stray <b>0</b> when items is 0, because 0 is falsy and React prints numbers.
          Use <span className="mono">{"items > 0 &&"}</span> instead. Try it on the right.
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: T.ink, minHeight: 34 }}>{open ? "We're open. Order away." : "Closed. Opens at 7am."}</div>
          <button className="btn primary" style={{ marginTop: 14 }} onClick={() => setOpen(!open)}>{open ? "Close store" : "Open store"}</button>
        </div>
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: T.ink }}>items in cart</span>
            <Qty value={items} onDec={() => setItems(Math.max(0, items - 1))} onInc={() => setItems(items + 1)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <div style={{ background: T.bg, padding: 12, borderRadius: 10, minHeight: 64 }}>
              <div className="note mono" style={{ fontSize: 12 }}>{"{items && ...}"}</div>
              <div style={{ marginTop: 6, fontWeight: 500 }}>{items && <span>Cart has items</span>}</div>
            </div>
            <div style={{ background: T.bg, padding: 12, borderRadius: 10, minHeight: 64 }}>
              <div className="note mono" style={{ fontSize: 12 }}>{"{items > 0 && ...}"}</div>
              <div style={{ marginTop: 6, fontWeight: 500 }}>{items > 0 && <span>Cart has items</span>}</div>
            </div>
          </div>
        </div>
      </Col>
    </Slide>
  );
}

/* 8. Functional updates */
function StaleSlide() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  return (
    <Slide kicker="The snapshot rule" title="qty is a photo of this render, not a live wire">
      <Col>
        <Code>{`// "Add 3" button
function addThreeStale() {
  setQty(qty + 1)   // qty is 1, asks for 2
  setQty(qty + 1)   // qty is STILL 1, asks for 2
  setQty(qty + 1)   // still 1, asks for 2
}

function addThreeSafe() {
  setQty(q => q + 1)  // "take whatever is latest, add 1"
  setQty(q => q + 1)
  setQty(q => q + 1)
}`}</Code>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.55 }}>
          Inside one render, <span className="mono">qty</span> never changes. React batches the three requests and applies them after your function finishes.
          When the new value depends on the old value, pass a function.
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ textAlign: "center" }}>
          <div className="note">setQty(qty + 1) three times</div>
          <div className="num-display" style={{ fontSize: 56, color: T.warn }}>{a}</div>
          <button className="btn" onClick={() => { setA(a + 1); setA(a + 1); setA(a + 1); }}>Add 3 (stale)</button>
        </div>
        <div className="panel" style={{ textAlign: "center" }}>
          <div className="note">setQty(q =&gt; q + 1) three times</div>
          <div className="num-display" style={{ fontSize: 56, color: T.accent }}>{b}</div>
          <button className="btn primary" onClick={() => { setB((q) => q + 1); setB((q) => q + 1); setB((q) => q + 1); }}>Add 3 (functional)</button>
        </div>
        <button className="btn small" onClick={() => { setA(1); setB(1); }}>Reset both</button>
      </Col>
    </Slide>
  );
}

/* 9. Progression stepper: one counter to a full order builder */
const MENU = { coffee: 0, bagel: 0, juice: 0 };
const LABELS = { coffee: "Iced coffee", bagel: "Bagel", juice: "Orange juice" };
const LIMIT = 5;
function ProgressionSlide() {
  const [stage, setStage] = useState(0);
  const stages = [
    {
      title: "Stage 1: one item, one counter",
      code: `const [coffee, setCoffee] = useState(0)

<button onClick={() => setCoffee(coffee - 1)}>-</button>
<span>{coffee}</span>
<button onClick={() => setCoffee(coffee + 1)}>+</button>`,
      demo: <Stage1 />,
    },
    {
      title: "Stage 2: three items in one object",
      code: `const [cart, setCart] = useState({ coffee: 0, bagel: 0, juice: 0 })

function change(item, delta) {
  // copy the object, override one key. Never mutate.
  setCart({ ...cart, [item]: cart[item] + delta })
}`,
      demo: <Stage2 />,
    },
    {
      title: "Stage 3: a cap on total items, with limits",
      code: `const total = cart.coffee + cart.bagel + cart.juice  // derived
const LIMIT = 5

function change(item, delta) {
  if (delta > 0 && total === LIMIT) return
  if (delta < 0 && cart[item] === 0) return
  setCart({ ...cart, [item]: cart[item] + delta })
}

<button disabled={total === LIMIT} ...>+</button>
<button disabled={cart.coffee === 0} ...>-</button>`,
      demo: <Stage3 />,
    },
    {
      title: "Stage 4: conditional rendering on the total",
      code: `{total === 0
  ? <p>Your cart is empty</p>
  : <button onClick={() => setPlaced(true)}>Place order</button>}

{placed && <Receipt cart={cart} />}`,
      demo: <Stage4 />,
    },
  ];
  const s = stages[stage];
  return (
    <Slide kicker="Progression" title="One counter to a full order builder in four moves">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          {stages.map((st, i) => (
            <button key={i} className={"tab" + (stage === i ? " on" : "")} onClick={() => setStage(i)}>Stage {i + 1}</button>
          ))}
        </div>
        <h3 style={{ fontSize: 21, fontWeight: 600 }}>{s.title}</h3>
        <Code>{s.code}</Code>
      </Col>
      <Col>
        {s.demo}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn small" disabled={stage === 0} onClick={() => setStage(stage - 1)}>Previous stage</button>
          <button className="btn small primary" disabled={stage === stages.length - 1} onClick={() => setStage(stage + 1)}>Next stage</button>
        </div>
      </Col>
    </Slide>
  );
}
function Stage1() {
  const [coffee, setCoffee] = useState(0);
  return <div className="panel"><ItemRow label="Iced coffee" value={coffee} onDec={() => setCoffee(coffee - 1)} onInc={() => setCoffee(coffee + 1)} /></div>;
}
function Stage2() {
  const [cart, setCart] = useState(MENU);
  const change = (k, d) => setCart({ ...cart, [k]: cart[k] + d });
  return (
    <div className="panel">
      {Object.keys(cart).map((k) => <ItemRow key={k} label={LABELS[k]} value={cart[k]} onDec={() => change(k, -1)} onInc={() => change(k, 1)} />)}
    </div>
  );
}
function Stage3() {
  const [cart, setCart] = useState(MENU);
  const total = Object.values(cart).reduce((a, b) => a + b, 0);
  const change = (k, d) => {
    if (d > 0 && total === LIMIT) return;
    if (d < 0 && cart[k] === 0) return;
    setCart({ ...cart, [k]: cart[k] + d });
  };
  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span className="note">Items (max {LIMIT})</span><span className="mono num-display" style={{ fontSize: 18 }}>{total} / {LIMIT}</span></div>
      {Object.keys(cart).map((k) => <ItemRow key={k} label={LABELS[k]} value={cart[k]} onDec={() => change(k, -1)} onInc={() => change(k, 1)} decOff={cart[k] === 0} incOff={total === LIMIT} />)}
    </div>
  );
}
function Stage4() {
  const [cart, setCart] = useState(MENU);
  const [placed, setPlaced] = useState(false);
  const total = Object.values(cart).reduce((a, b) => a + b, 0);
  const change = (k, d) => {
    if (d > 0 && total === LIMIT) return;
    if (d < 0 && cart[k] === 0) return;
    setCart({ ...cart, [k]: cart[k] + d });
    setPlaced(false);
  };
  return (
    <div className="panel">
      {Object.keys(cart).map((k) => <ItemRow key={k} label={LABELS[k]} value={cart[k]} onDec={() => change(k, -1)} onInc={() => change(k, 1)} decOff={cart[k] === 0} incOff={total === LIMIT} />)}
      <div style={{ marginTop: 14, textAlign: "center" }}>
        {total === 0 ? <p className="note" style={{ margin: 0 }}>Your cart is empty</p> : <button className="btn accent" onClick={() => setPlaced(true)}>Place order</button>}
      </div>
      {placed && (
        <div style={{ marginTop: 12, padding: 12, background: T.accentSoft, borderRadius: 10, color: T.accent, fontWeight: 600 }} className="mono">
          Order placed: {Object.entries(cart).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(", ")}
        </div>
      )}
    </div>
  );
}

/* 10. Final order builder */
const PRICES = { coffee: 4.5, bagel: 3.25, juice: 3.75 };
const MODES = ["Pickup", "Delivery"];
function FinalSlide() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("Pickup");
  const [cart, setCart] = useState(MENU);
  const [placed, setPlaced] = useState(false);
  const total = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = Object.entries(cart).reduce((sum, [k, v]) => sum + v * PRICES[k], 0);
  const fee = mode === "Delivery" && subtotal < 20 ? 2.99 : 0;
  const change = (k, d) => {
    if (d > 0 && total === LIMIT) return;
    if (d < 0 && cart[k] === 0) return;
    setCart({ ...cart, [k]: cart[k] + d });
  };
  const reset = () => { setCart(MENU); setPlaced(false); };
  const canPlace = total > 0 && name.trim().length > 0;
  if (placed) {
    return (
      <Slide kicker="Target build" title="Order placed. This is what your assignment produces." wide>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="panel" style={{ width: 520, padding: 28 }}>
            <div className="chip">Confirmed</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: T.ink, marginTop: 12 }}>{name}</div>
            <div className="note" style={{ marginBottom: 16 }}>{mode}</div>
            {Object.entries(cart).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.line}` }}>
                <span>{v} x {LABELS[k]}</span><span className="mono">${(v * PRICES[k]).toFixed(2)}</span>
              </div>
            ))}
            {fee > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.line}` }}><span>Delivery fee</span><span className="mono">${fee.toFixed(2)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", fontWeight: 700, color: T.ink, fontSize: 18 }}>
              <span>Total</span><span className="mono">${(subtotal + fee).toFixed(2)}</span>
            </div>
            <div className="note" style={{ marginTop: 10 }}>Every number here is derived from cart and mode. Nothing extra stored.</div>
            <button className="btn" style={{ marginTop: 18 }} onClick={reset}>Start a new order</button>
          </div>
        </div>
      </Slide>
    );
  }
  return (
    <Slide kicker="Target build" title="Order Builder: every concept from today, in one component">
      <Col>
        <div className="panel">
          <label className="note">Name for the order</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ marginTop: 6 }} />
          <label className="note" style={{ display: "block", marginTop: 14 }}>How do you want it</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {MODES.map((m) => <button key={m} className={"tab" + (mode === m ? " on" : "")} onClick={() => setMode(m)}>{m}</button>)}
          </div>
        </div>
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: T.ink }}>Items</span>
            <span className="mono num-display" style={{ fontSize: 18 }}>{total} / {LIMIT}</span>
          </div>
          <div className="bar"><div style={{ width: `${(total / LIMIT) * 100}%` }} /></div>
          <div style={{ marginTop: 4 }}>
            {Object.keys(cart).map((k) => (
              <ItemRow key={k} label={LABELS[k]} sub={`$${PRICES[k].toFixed(2)}`} value={cart[k]} onDec={() => change(k, -1)} onInc={() => change(k, 1)} decOff={cart[k] === 0} incOff={total === LIMIT} />
            ))}
          </div>
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="note">Subtotal</span><span className="mono num-display">${subtotal.toFixed(2)}</span>
          </div>
          {mode === "Delivery" && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="note">Delivery</span>
              {fee > 0 ? <span className="mono">${fee.toFixed(2)}</span> : <span className="chip">Free</span>}
            </div>
          )}
          {!name.trim() && <p className="note" style={{ margin: "8px 0 0" }}>Add a name to place the order.</p>}
          {name.trim() && total === 0 && <p className="note" style={{ margin: "8px 0 0" }}>Your cart is empty.</p>}
          {canPlace && <button className="btn accent" onClick={() => setPlaced(true)}>Place order for {name}</button>}
          <div style={{ marginTop: 12 }}><button className="btn small" onClick={reset}>Clear cart</button></div>
        </div>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.7 }}>
          <div style={{ color: T.accent, fontWeight: 600, marginBottom: 4 }}>Concept checklist inside this one component</div>
          <div>useState for name, mode, cart object, placed</div>
          <div>onChange on a controlled input, onClick on buttons</div>
          <div>Object spread to update one item without mutating</div>
          <div>total, subtotal, fee, disabled all derived, not stored</div>
          <div>Three conditional branches deciding what renders</div>
        </div>
      </Col>
    </Slide>
  );
}

/* 11. Assignment */
function AssignmentSlide() {
  const setup = [
    { t: "npm create vite@latest order-builder -- --template react", m: true },
    { t: "cd order-builder   then   npm install   then   npm run dev", m: true },
    { t: "Open src/App.jsx, delete everything inside the return, keep the export", m: false },
    { t: "Clear src/App.css. Leave src/main.jsx alone.", m: false },
    { t: "ESM only. If you see require() or module.exports anywhere, you pasted the wrong thing.", m: false },
  ];
  const [done, setDone] = useState(setup.map(() => false));
  const tiers = [
    { name: "Bronze", color: "#B87333", text: "One menu item with + and - buttons and a visible count. It re-renders. No plain variables." },
    { name: "Silver", color: "#8D9AA5", text: "Three menu items in one object in state. Update with spread. Show a running total derived from the cart, not stored." },
    { name: "Gold", color: "#D4A017", text: "Cap the cart at 5 items and disable buttons at the limits. Add a name input. Show Place order only when the cart has items and a name is filled." },
    { name: "Bonus", color: T.accent, text: "Placed view shows a receipt with line prices and a total. Add a Pickup / Delivery toggle with a fee that disappears over $20. Clear button." },
  ];
  return (
    <Slide kicker="Assignment: due before you leave" title="Build Your Order Builder">
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Set up a fresh project</h3>
        <div className="panel" style={{ padding: 8 }}>
          {setup.map((s, i) => (
            <label key={i} className="check">
              <input type="checkbox" checked={done[i]} onChange={() => setDone(done.map((d, j) => (j === i ? !d : d)))} />
              <span className={s.m ? "mono" : ""} style={{ fontSize: s.m ? 14 : 15, textDecoration: done[i] ? "line-through" : "none", opacity: done[i] ? 0.5 : 1 }}>{s.t}</span>
            </label>
          ))}
        </div>
        <div className="note">Build in App.jsx for now. Splitting into components is next week.</div>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.5 }}>
          Submit: push to your GitHub Classroom repo and paste the link in Brightspace before the end of the block. Gold or better counts as complete.
        </div>
      </Col>
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Milestones</h3>
        {tiers.map((t) => (
          <div key={t.name} className="panel" style={{ borderLeft: `4px solid ${t.color}`, padding: "12px 16px" }}>
            <div style={{ color: t.color, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 15, lineHeight: 1.5 }}>{t.text}</div>
          </div>
        ))}
      </Col>
    </Slide>
  );
}

/* 12. Close quiz */
function QuizSlide() {
  const qs = [
    { q: "A component shows a plain variable that you change on click. What happens on screen?", a: ["It updates like normal", "Nothing, React was not told", "It updates after a refresh"], c: 1 },
    { q: "You need the new value to depend on the old one. Which is safest?", a: ["setQty(qty + 1)", "qty = qty + 1", "setQty(q => q + 1)"], c: 2 },
    { q: "{items && <p>Cart has items</p>} when items is 0 renders what?", a: ["Nothing", "A stray 0", "An error"], c: 1 },
  ];
  const [picked, setPicked] = useState([null, null, null]);
  const score = picked.filter((p, i) => p === qs[i].c).length;
  return (
    <Slide kicker="Close" title="Three checks before you go" wide>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignContent: "start" }}>
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
          <div>
            <div style={{ fontSize: 21, fontWeight: 600, color: T.ink }}>Next mission: components talk to each other. Props down, events up.</div>
            <div className="note">Tuesday: lifting state, and why the order builder wants to be three components.</div>
          </div>
          <div className="num-display" style={{ fontSize: 40, color: score === 3 ? T.accent : T.ink }}>{score} / 3</div>
        </div>
      </div>
    </Slide>
  );
}

/* ============================ DECK ================================ */
const SLIDES = [
  { el: <TitleSlide />, notes: "Have a student hit Add to cart. Ask: where does that number live? Nobody will know yet. That is the hook." },
  { el: <BugSlide />, notes: "Predict out loud before any click. Get a vote on what the button will show. Then click three times. Console moves, button does not. Reveal only after they argue." },
  { el: <AnatomySlide />, notes: "Click each part in order: 0, useState, qty, setQty. Tie destructuring back to week 2. Say the hook rule twice." },
  { el: <CounterSlide />, notes: "Watch the render log. Each click is a full function run. Ask: is qty the same variable across renders? No. It is a fresh photo each time." },
  { el: <EventsSlide />, notes: "Type slowly so they see value flow input to state to text. Deliberate mistake beat: write onClick={handle()} live and show the console spam." },
  { el: <TruthSlide />, notes: "Drag the slider. Ask what would break if subtotal was its own state. Answer: you could forget to update it. Phrase: store facts, compute views." },
  { el: <ConditionalSlide />, notes: "Cycle the three syntaxes on the same store status. Then the 0 trap. Set items to 0 and let them find the stray zero on screen." },
  { el: <StaleSlide />, notes: "Click stale first. Only goes up by 1. Then functional. Explain batching in one sentence. This is the trap that will bite them in Silver." },
  { el: <ProgressionSlide />, notes: "This is the live-code script. Stage 1 to 4 in order. At stage 2, mutate cart.coffee += 1 on purpose and show nothing re-renders. Then spread." },
  { el: <FinalSlide />, notes: "Place an order with a student's name. Walk the concept checklist. This is exactly what the assignment asks for." },
  { el: <AssignmentSlide />, notes: "Read the ESM line out loud. Start a 20 minute timer for the build block. Circulate for the mutation bug and the 0 trap." },
  { el: <QuizSlide />, notes: "Hands up per question. Anyone who misses Q2 stays on the snapshot rule for two more minutes. Tease Tuesday." },
];

export default function Deck() {
  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);
  const n = SLIDES.length;
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
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

      <div style={{ flex: 1, minHeight: 0 }} key={i}>{SLIDES[i].el}</div>

      {notes && (
        <div style={{ margin: "0 64px 10px", padding: "10px 16px", background: "#FFF8E1", border: "1px solid #F3D98A", borderRadius: 10, fontSize: 15, lineHeight: 1.5 }}>
          <span style={{ color: "#9A6B00", fontWeight: 600 }}>Instructor note: </span>{SLIDES[i].notes}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 64px 18px", borderTop: `1px solid ${T.line}`, background: T.surface }}>
        <button className="btn small" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>Back</button>
        <div style={{ flex: 1, display: "flex", gap: 6 }}>
          {SLIDES.map((_, k) => (
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
