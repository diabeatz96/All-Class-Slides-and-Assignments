import { useState, useEffect, useRef } from "react";
import { T, Code, Slide, Col, Reveal } from "./ui.jsx";
import { lab, labFetch, LabControls, TypeChip, PlayingCard, ProductThumb, JsonTree, kb, cap } from "./apiLab.jsx";

/* ------------------------------------------------------------------
   API Lab: async with real, fun APIs. Runs before the error-handling
   half of the deck. Every demo is a real fetch (flip to Backup data
   if the wifi dies).
------------------------------------------------------------------- */

const now = () => performance.now();
const friendly = (e, who) => (e instanceof TypeError ? `Could not reach ${who}. Check the wifi, or flip to Backup data.` : e.message);

/* L1. Pokédex: the hook */
const STAT_LABEL = { hp: "HP", attack: "Atk", defense: "Def", "special-attack": "Sp.Atk", "special-defense": "Sp.Def", speed: "Speed" };

function PokedexSlide() {
  const [name, setName] = useState("pikachu");
  const [status, setStatus] = useState("idle");
  const [mon, setMon] = useState(null);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const req = useRef(0);

  async function load(raw) {
    const q = String(raw).toLowerCase().trim();
    if (!q) return;
    const id = ++req.current;
    setStatus("loading"); setError(null);
    const t0 = now();
    try {
      const res = await labFetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
      if (!res.ok) throw new Error(res.status === 404 ? `No Pokémon called "${q}". Check the spelling.` : `PokéAPI had a problem (HTTP ${res.status}). Try again.`);
      const text = await res.text();
      const data = JSON.parse(text);
      if (id !== req.current) return;
      setMon({
        id: data.id,
        name: data.name,
        art: data.sprites.other["official-artwork"].front_default,
        types: data.types.map((t) => t.type.name),
        stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
        cry: data.cries?.latest,
      });
      setMeta({ path: q, status: res.status, ms: Math.round(now() - t0), size: text.length, keys: Object.keys(data).length });
      setStatus("data");
    } catch (e) {
      if (id !== req.current) return;
      setError(friendly(e, "PokéAPI")); setStatus("error");
    }
  }

  useEffect(() => { load("pikachu"); }, []);

  const random = () => {
    const pick = lab.backup ? ["pikachu", "charizard", "snorlax", "gengar", "mewtwo"][Math.floor(Math.random() * 5)] : String(1 + Math.floor(Math.random() * 1025));
    setName(pick); load(pick);
  };

  return (
    <Slide kicker="API Lab 1 · PokéAPI" title="Gotta fetch 'em all: one name in, one await, one Pokémon out">
      <Col>
        <Code>{`async function getPokemon(name) {
  const res = await fetch(\`https://pokeapi.co/api/v2/pokemon/\${name}\`)
  if (!res.ok) throw new Error(\`No Pokémon called "\${name}"\`)
  const data = await res.json()

  return {
    name:  data.name,
    art:   data.sprites.other["official-artwork"].front_default,
    types: data.types.map(t => t.type.name),
    stats: data.stats.map(s => s.base_stat),
  }
}`}</Code>
        {meta && status === "data" && (
          <div className="panel mono" style={{ fontSize: 14, padding: "12px 16px", lineHeight: 1.7 }}>
            GET /pokemon/{meta.path} <span style={{ color: T.accent, fontWeight: 700 }}>{meta.status}</span> · {meta.ms} ms · {kb(meta.size)}
            <div className="note">They sent {meta.keys} top-level fields. We used 4. Most APIs over-share. Your job is picking.</div>
          </div>
        )}
        <LabControls />
      </Col>
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(name)} placeholder="pikachu, 150, eevee..." />
          <button className="btn primary" onClick={() => load(name)}>Fetch</button>
          <button className="btn accent" onClick={random}>Random</button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["charizard", "snorlax", "gengar", "mewtwo", "pikachoo"].map((n) => <button key={n} className="tab" onClick={() => { setName(n); load(n); }}>{n}</button>)}
        </div>
        <div className="panel" style={{ flex: 1, display: "flex", gap: 18, alignItems: "center", minHeight: 300, opacity: status === "loading" ? 0.5 : 1, transition: "opacity 150ms" }}>
          {status === "error" && <div className="callout" style={{ width: "100%" }}><div className="h">Fetch failed</div>{error}</div>}
          {status === "loading" && !mon && <div className="note">Loading...</div>}
          {mon && status !== "error" && (
            <>
              <div style={{ width: 210, height: 210, borderRadius: "50%", background: T.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
                {mon.art ? <img src={mon.art} alt={mon.name} style={{ width: 200, height: 200 }} /> : <span className="note">no art</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div className="mono note">#{String(mon.id).padStart(4, "0")}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: T.ink, textTransform: "capitalize" }}>{mon.name}</div>
                <div style={{ display: "flex", gap: 6, margin: "6px 0 12px" }}>{mon.types.map((t) => <TypeChip key={t} type={t} />)}</div>
                {mon.stats.map((s) => (
                  <div key={s.name} style={{ display: "grid", gridTemplateColumns: "58px 34px 1fr", gap: 8, alignItems: "center", fontSize: 13 }}>
                    <span className="note">{STAT_LABEL[s.name] || s.name}</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{s.value}</span>
                    <div className="bar"><div style={{ width: `${Math.min(100, (s.value / 180) * 100)}%`, background: s.value >= 100 ? T.accent : T.blue }} /></div>
                  </div>
                ))}
                {mon.cry && <button className="btn small" style={{ marginTop: 12 }} onClick={() => new Audio(mon.cry).play().catch(() => {})}>Play cry</button>}
              </div>
            </>
          )}
        </div>
      </Col>
    </Slide>
  );
}

/* L2. The five steps, executed one at a time */
const STEP_APIS = {
  pokemon: {
    label: "Pokémon", input: "gengar", varName: "pokemon",
    url: (v) => `https://pokeapi.co/api/v2/pokemon/${v.toLowerCase()}`,
    urlCode: "`https://pokeapi.co/api/v2/pokemon/${name}`",
    pickCode: "{ name: data.name, hp: data.stats[0].base_stat }",
    pick: (d) => ({ name: d.name, hp: d.stats[0].base_stat }),
  },
  cards: {
    label: "Cards", input: "3", varName: "hand",
    url: (v) => `https://deckofcardsapi.com/api/deck/new/draw/?count=${v}`,
    urlCode: "`https://deckofcardsapi.com/api/deck/new/draw/?count=${n}`",
    pickCode: "data.cards.map(c => `${c.value} of ${c.suit}`)",
    pick: (d) => d.cards.map((c) => `${c.value} of ${c.suit}`),
  },
  fashion: {
    label: "Fashion", input: "sunglasses", varName: "items",
    url: (v) => `https://dummyjson.com/products/category/${v}?limit=3&select=title,price`,
    urlCode: "`https://dummyjson.com/products/category/${cat}?limit=3`",
    pickCode: "data.products.map(p => `${p.title} ($${p.price})`)",
    pick: (d) => d.products.map((p) => `${p.title} ($${p.price})`),
  },
};

function StepsSlide() {
  const [apiKey, setApiKey] = useState("pokemon");
  const api = STEP_APIS[apiKey];
  const [input, setInput] = useState(api.input);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(true);
  const [clicks, setClicks] = useState(0);
  const [vals, setVals] = useState({});
  const res = useRef(null);

  const reset = (k = apiKey) => { setStep(0); setVals({}); setBusy(false); res.current = null; if (k !== apiKey) { setApiKey(k); setInput(STEP_APIS[k].input); } };

  const lines = [
    { n: 0, code: `async function load() {` },
    { n: 1, code: `  const url = ${api.urlCode}`, cm: "1. build the URL" },
    { n: 2, code: `  const res = await fetch(url)`, cm: "2. send it, wait" },
    { n: 3, code: `  if (!res.ok) throw new Error("HTTP " + res.status)`, cm: "3. did it work?" },
    { n: 4, code: `  const data = await res.json()`, cm: "4. wait for the body" },
    { n: 5, code: `  set${cap(api.varName)}(${api.pickCode})`, cm: "5. take what you need" },
    { n: 0, code: `}` },
  ];

  async function next() {
    if (busy || step >= 5) return;
    const s = step + 1;
    setBusy(true);
    try {
      if (s === 1) setVals({ url: api.url(input.trim()) });
      if (s === 2) {
        const t0 = now();
        const [r] = await Promise.all([labFetch(vals.url), new Promise((ok) => setTimeout(ok, slow ? 2500 : 0))]);
        res.current = r;
        setVals((v) => ({ ...v, res: { status: r.status, ok: r.ok, type: r.headers.get("content-type"), ms: Math.round(now() - t0) } }));
      }
      if (s === 3 && !res.current.ok) { setVals((v) => ({ ...v, thrown: `Error: HTTP ${res.current.status}` })); setStep(3); return; }
      if (s === 4) {
        const data = await res.current.json();
        setVals((v) => ({ ...v, data, keys: Object.keys(data) }));
      }
      if (s === 5) setVals((v) => ({ ...v, picked: api.pick(v.data) }));
      setStep(s);
    } catch (e) {
      setVals((v) => ({ ...v, thrown: friendly(e, "the API") })); setStep(s);
    } finally { setBusy(false); }
  }

  const waiting = busy && step === 1;
  const show = (x) => JSON.stringify(x, null, 1).replace(/\n\s*/g, " ");

  return (
    <Slide kicker="API Lab 2 · The steps" title="Every API call is the same five steps. Run them one at a time.">
      <Col>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {Object.entries(STEP_APIS).map(([k, a]) => <button key={k} className={"tab" + (apiKey === k ? " on" : "")} onClick={() => reset(k)}>{a.label}</button>)}
          <input className="input mono" style={{ width: 160, marginLeft: "auto", padding: "7px 10px", fontSize: 14 }} value={input} onChange={(e) => { setInput(e.target.value); reset(); }} />
        </div>
        <div style={{ background: T.codeBg, borderRadius: 12, padding: "12px 0", overflow: "auto" }}>
          {lines.map((l, i) => {
            const on = l.n && l.n === step + 1;
            const done = l.n && l.n <= step;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", background: on ? "rgba(14,159,110,.28)" : "transparent", borderLeft: `4px solid ${on ? T.accent : "transparent"}` }}>
                <span className="mono" style={{ width: 26, flexShrink: 0, textAlign: "right", fontSize: 12, fontWeight: 700, color: done ? T.accent : on ? "#A7F3D0" : "#4B5563" }}>{l.n ? (done ? "✓" : l.n) : ""}</span>
                <Code style={{ background: "transparent", padding: "3px 12px", fontSize: 13.5, flex: 1, overflow: "visible", opacity: done ? 0.55 : 1 }}>{l.code}</Code>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {lines.filter((l) => l.cm).map((l) => {
            const on = l.n === step + 1;
            const done = l.n <= step;
            return <div key={l.n} className="panel" style={{ padding: "6px 8px", fontSize: 12.5, lineHeight: 1.3, textAlign: "center", borderColor: on ? T.accent : T.line, background: done ? T.accentSoft : on ? T.surface : T.bg, color: done ? T.accent : on ? T.ink : T.muted, fontWeight: on ? 600 : 400 }}>{l.cm}</div>;
          })}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn primary" onClick={next} disabled={busy || step >= 5 || !!vals.thrown}>{busy ? "Waiting..." : step >= 5 ? "Done" : `Run step ${step + 1}`}</button>
          <button className="btn" onClick={() => reset()}>Reset</button>
          <label className="note" style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 8 }}>
            <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} style={{ accentColor: T.accent }} /> bad wifi (+2.5 s on step 2)
          </label>
        </div>
        <div className="callout blue">
          <div className="h">await pauses the function, not the page</div>
          During step 2, click the button on the right. The page still counts. JavaScript parks <span className="mono">load()</span> and keeps running everything else.
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderColor: waiting ? T.accent : T.line }}>
          <button className="btn small accent" onClick={() => setClicks((c) => c + 1)}>Click me while it waits</button>
          <span className="mono num-display" style={{ fontSize: 22 }}>{clicks}</span>
          <span className="note">{waiting ? "fetch is pending... page still alive" : ""}</span>
        </div>
        <div className="panel mono" style={{ fontSize: 13.5, lineHeight: 1.65, flex: 1, overflow: "auto" }}>
          <div className="note" style={{ fontFamily: "inherit", marginBottom: 8 }}>What JavaScript knows right now</div>
          {step === 0 && !busy && <div className="note">Nothing yet. Press Run step 1.</div>}
          {vals.url && <div><b style={{ color: T.blue }}>url</b> = "{vals.url}"</div>}
          {waiting && <div style={{ color: T.warn }}>res = Promise {"{ <pending> }"}  ...waiting on the network</div>}
          {vals.res && <div><b style={{ color: T.blue }}>res</b> = Response {"{"} status: <b>{vals.res.status}</b>, ok: <b>{String(vals.res.ok)}</b>, type: "{vals.res.type}" {"}"} <span className="note">({vals.res.ms} ms)</span></div>}
          {step >= 3 && !vals.thrown && <div><b style={{ color: T.blue }}>res.ok</b> is true, keep going</div>}
          {vals.thrown && <div style={{ color: T.warn, fontWeight: 600 }}>throw {vals.thrown}  → jumps to catch, steps 4 and 5 never run</div>}
          {vals.keys && <div><b style={{ color: T.blue }}>data</b> = {"{ "}{vals.keys.slice(0, 7).join(", ")}{vals.keys.length > 7 ? `, ...${vals.keys.length - 7} more` : ""}{" }"}</div>}
          {vals.picked && <div style={{ marginTop: 8, padding: 10, background: T.accentSoft, borderRadius: 8 }}><b style={{ color: T.accent }}>{api.varName}</b> = {show(vals.picked)}</div>}
        </div>
        <div className="note">Try a typo (gengr, or a category like shirtz) and run it again. Which step stops it?</div>
        <LabControls />
      </Col>
    </Slide>
  );
}

/* L3. Deck of Cards: requests that depend on each other */
const RANK = { ACE: 14, KING: 13, QUEEN: 12, JACK: 11 };
const rank = (c) => RANK[c.value] || Number(c.value);
const CARDS = "https://deckofcardsapi.com/api/deck";

function CardsSlide() {
  const [deckId, setDeckId] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [hand, setHand] = useState({ you: null, cpu: null });
  const [score, setScore] = useState({ you: 0, cpu: 0 });
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const call = async (path, note) => {
    const t0 = now();
    const res = await labFetch(CARDS + path);
    if (!res.ok) throw new Error(`Deck API said ${res.status}`);
    const data = await res.json();
    setLog((l) => [{ path, note: note(data), ms: Math.round(now() - t0), k: Math.random() }, ...l].slice(0, 6));
    return data;
  };

  async function battle() {
    setBusy(true); setError(null);
    try {
      let id = deckId;
      if (!id || remaining < 2) {
        const deck = await call("/new/shuffle/?deck_count=1", (d) => `deck_id ${d.deck_id}, ${d.remaining} cards`);
        id = deck.deck_id; setDeckId(id); setScore({ you: 0, cpu: 0 });
      }
      const draw = await call(`/${id}/draw/?count=2`, (d) => `${d.cards.map((c) => c.code).join(" + ")}, ${d.remaining} left`);
      const [you, cpu] = draw.cards;
      setHand({ you, cpu });
      setRemaining(draw.remaining);
      setScore((s) => (rank(you) > rank(cpu) ? { ...s, you: s.you + 1 } : rank(cpu) > rank(you) ? { ...s, cpu: s.cpu + 1 } : s));
    } catch (e) { setError(friendly(e, "the Deck of Cards API")); }
    finally { setBusy(false); }
  }

  const { you, cpu } = hand;
  const result = you && cpu ? (rank(you) > rank(cpu) ? "You win the round" : rank(cpu) > rank(you) ? "CPU takes it" : "War! It's a tie") : "Press Battle to draw";

  return (
    <Slide kicker="API Lab 3 · Game API: Deck of Cards" title="When request 2 needs the answer from request 1">
      <Col>
        <Code>{`const BASE = "https://deckofcardsapi.com/api/deck"

// Request 1: ask for a shuffled deck. The SERVER keeps it.
const res1 = await fetch(\`\${BASE}/new/shuffle/?deck_count=1\`)
const deck = await res1.json()
// { deck_id: "lgkgu8ras1pn", remaining: 52, shuffled: true }

// Request 2 needs deck.deck_id, so it MUST wait for request 1
const res2 = await fetch(\`\${BASE}/\${deck.deck_id}/draw/?count=2\`)
const { cards, remaining } = await res2.json()`}</Code>
        <div className="callout blue">
          <div className="h">deck_id is your ticket</div>
          The deck lives on their server. Every later call has to bring the id. In React, where does it go so it survives re-renders? <b>State.</b> Refresh the page and you lose it.
        </div>
        <LabControls />
      </Col>
      <Col>
        <div className="panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: 18 }}>
          <div style={{ textAlign: "center" }}>
            <div className="note" style={{ marginBottom: 6 }}>You · <b className="mono" style={{ color: T.ink, fontSize: 18 }}>{score.you}</b></div>
            <PlayingCard card={you} dim={you && cpu && rank(you) < rank(cpu)} />
          </div>
          <div style={{ textAlign: "center", width: 170 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 10 }}>{result}</div>
            <button className="btn primary" onClick={battle} disabled={busy}>{busy ? "Drawing..." : remaining !== null && remaining < 2 ? "New deck + battle" : "Battle"}</button>
            <div className="note mono" style={{ marginTop: 8 }}>{remaining === null ? "no deck yet" : `${remaining} cards left`}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="note" style={{ marginBottom: 6 }}>CPU · <b className="mono" style={{ color: T.ink, fontSize: 18 }}>{score.cpu}</b></div>
            <PlayingCard card={cpu} dim={you && cpu && rank(cpu) < rank(you)} />
          </div>
        </div>
        {error && <div className="callout"><div className="h">Could not draw</div>{error}</div>}
        <div className="panel mono" style={{ fontSize: 13, lineHeight: 1.7, padding: "12px 16px", minHeight: 150 }}>
          <div className="note" style={{ fontFamily: "inherit", marginBottom: 4 }}>Network log (newest first)</div>
          {log.length === 0 && <div className="note">The first Battle makes two requests, in order. Every one after makes one.</div>}
          {log.map((l, i) => (
            <div key={l.k} style={{ opacity: 1 - i * 0.13 }}>
              GET <span style={{ color: T.blue }}>{l.path}</span> <span className="note">{l.ms} ms</span><br />
              <span style={{ color: T.accent }}>  → {l.note}</span>
            </div>
          ))}
        </div>
      </Col>
    </Slide>
  );
}

/* L4. Fashion: Promise.all vs one at a time */
const SLOTS = [
  { slot: "Top", cats: ["tops", "mens-shirts", "womens-dresses"] },
  { slot: "Shoes", cats: ["womens-shoes", "mens-shoes"] },
  { slot: "Shades", cats: ["sunglasses"] },
  { slot: "Extra", cats: ["womens-bags", "mens-watches", "womens-jewellery", "womens-watches"] },
];
const any = (arr) => arr[Math.floor(Math.random() * arr.length)];

function FashionSlide() {
  const [mode, setMode] = useState("par");
  const [fit, setFit] = useState(null);
  const [bars, setBars] = useState([]);
  const [busy, setBusy] = useState(false);
  const [best, setBest] = useState({ seq: null, par: null });
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const t0 = useRef(0);

  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setTick(Math.round(now() - t0.current)), 50);
    return () => clearInterval(id);
  }, [busy]);

  async function getRandom(slot, i) {
    const cat = any(slot.cats);
    const delay = 300 + Math.round(Math.random() * 700);
    const start = now() - t0.current;
    setBars((b) => b.map((x, j) => (j === i ? { ...x, start, cat } : x)));
    const res = await labFetch(`https://dummyjson.com/products/category/${cat}?select=title,price,thumbnail,brand&delay=${delay}`);
    if (!res.ok) throw new Error(`DummyJSON said ${res.status} for ${cat}`);
    const data = await res.json();
    const end = now() - t0.current;
    setBars((b) => b.map((x, j) => (j === i ? { ...x, end } : x)));
    return { slot: slot.slot, cat, ...any(data.products) };
  }

  async function roll() {
    setBusy(true); setError(null); setFit(null);
    setBars(SLOTS.map((s) => ({ slot: s.slot, start: null, end: null })));
    t0.current = now(); setTick(0);
    try {
      let items;
      if (mode === "seq") {
        items = [];
        for (let i = 0; i < SLOTS.length; i++) items.push(await getRandom(SLOTS[i], i));
      } else {
        items = await Promise.all(SLOTS.map((s, i) => getRandom(s, i)));
      }
      const total = Math.round(now() - t0.current);
      setFit({ items, total });
      setBest((b) => ({ ...b, [mode]: total }));
    } catch (e) { setError(friendly(e, "DummyJSON")); }
    finally { setBusy(false); }
  }

  const scale = Math.max(3800, fit?.total || 0, tick);
  const price = fit ? fit.items.reduce((s, p) => s + p.price, 0) : 0;

  return (
    <Slide kicker="API Lab 4 · Fashion API: DummyJSON products" title="Fit check: four requests that don't need each other">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={"tab" + (mode === "seq" ? " on" : "")} onClick={() => setMode("seq")}>One at a time</button>
          <button className={"tab" + (mode === "par" ? " on" : "")} onClick={() => setMode("par")}>All at once (Promise.all)</button>
        </div>
        {mode === "seq" ? (
          <Code>{`// Each await waits for the one before it.
// But shoes never needed the top's answer!
const top    = await getRandom("tops")
const shoes  = await getRandom("mens-shoes")
const shades = await getRandom("sunglasses")
const extra  = await getRandom("womens-bags")

// total time = top + shoes + shades + extra`}</Code>
        ) : (
          <Code>{`// Start all four, THEN wait for all four.
const [top, shoes, shades, extra] = await Promise.all([
  getRandom("tops"),
  getRandom("mens-shoes"),
  getRandom("sunglasses"),
  getRandom("womens-bags"),
])

// total time = the slowest one`}</Code>
        )}
        <div className="callout good">
          <div className="h">The rule</div>
          Does request B need data from request A? Then await in order (the card deck). If not, start them together (the outfit). One catch: if any one rejects, Promise.all rejects. <span className="mono">Promise.allSettled</span> gives you the ones that worked.
        </div>
        <div className="note">Each request has a random <span className="mono">?delay=</span> so you can see the timing on the projector. Real networks vary like this anyway.</div>
      </Col>
      <Col>
        <div className="panel" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <button className="btn primary" onClick={roll} disabled={busy}>{busy ? "Styling..." : fit ? "Re-roll the fit" : "Generate outfit"}</button>
            <span className="mono num-display" style={{ fontSize: 22 }}>{busy ? tick : fit ? fit.total : 0} ms</span>
            <span className="note mono" style={{ marginLeft: "auto", textAlign: "right" }}>
              one at a time: {best.seq ?? "-"} ms<br />all at once: {best.par ?? "-"} ms
            </span>
          </div>
          {bars.map((b) => (
            <div key={b.slot} style={{ display: "grid", gridTemplateColumns: "60px 1fr", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="note">{b.slot}</span>
              <div style={{ position: "relative", height: 18, background: T.bg, borderRadius: 6 }}>
                {b.start !== null && (
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(b.start / scale) * 100}%`, width: `${(((b.end ?? tick) - b.start) / scale) * 100}%`, background: b.end ? T.accent : T.blue, borderRadius: 6, minWidth: 4 }} />
                )}
              </div>
            </div>
          ))}
          {bars.length === 0 && <div className="note">Run it in each mode. Watch the bars line up (one at a time) or stack (all at once).</div>}
        </div>
        {error && <div className="callout"><div className="h">The fit fell apart</div>{error}</div>}
        {fit && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {fit.items.map((p) => (
              <div key={p.slot} className="panel" style={{ display: "flex", gap: 10, padding: 10, alignItems: "center" }}>
                <ProductThumb p={p} size={64} />
                <div style={{ minWidth: 0 }}>
                  <div className="note" style={{ fontSize: 12 }}>{p.slot} · {p.cat}</div>
                  <div style={{ fontWeight: 600, color: T.ink, fontSize: 14, lineHeight: 1.3 }}>{p.title}</div>
                  <div className="mono note">${p.price}</div>
                </div>
              </div>
            ))}
            <div className="panel" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
              <span style={{ fontWeight: 600, color: T.ink }}>Fit total</span>
              <span className="mono" style={{ fontWeight: 700 }}>${price.toFixed(2)}</span>
            </div>
          </div>
        )}
        <LabControls />
      </Col>
    </Slide>
  );
}

/* L5. Picking an API */
const CANDIDATES = [
  { name: "PokéAPI", url: "https://pokeapi.co/api/v2/pokemon/ditto", auth: "none", limits: "fair use, cache what you can" },
  { name: "Deck of Cards", url: "https://deckofcardsapi.com/api/deck/new/", auth: "none", limits: "none listed" },
  { name: "DummyJSON (fashion)", url: "https://dummyjson.com/products/category/tops?limit=1", auth: "none", limits: "100 requests / min" },
  { name: "Open Trivia DB", url: "https://opentdb.com/api.php?amount=1&category=15", auth: "none", limits: "1 request / 5 s per IP" },
  { name: "RAWG (video games)", url: "https://api.rawg.io/api/games?page_size=1", auth: "API key", limits: "20k / month" },
  { name: "Steam Store", url: "https://store.steampowered.com/api/appdetails?appids=570", auth: "none", limits: "undocumented" },
];

function verdictFor(r, c) {
  if (r.blocked && c.auth === "API key") return { good: false, t: "Wants a key. Its 401 has no CORS header, so the browser hides it and you only see TypeError. Open the URL in a tab to read the real message. A key in React is public anyway: Project 4." };
  if (r.blocked) return { good: false, t: "Blocked by the browser. Opens fine in a tab, but no CORS header, so fetch from your React app fails. Needs a server." };
  if (r.status === 401 || r.status === 403) return { good: false, t: "Wants a key. A key in React code is public (see the slide later today). Project 4 material." };
  if (r.status === 429) return { good: false, t: "Rate limited. You asked too fast. Read the limits section." };
  if (r.ok) return { good: true, t: "Works from the browser, no key. Class-project ready." };
  return { good: false, t: `HTTP ${r.status}. Check the URL against the docs.` };
}

function PickSlide() {
  const [results, setResults] = useState({});
  const tryout = async (c) => {
    setResults((r) => ({ ...r, [c.name]: { running: true } }));
    const t0 = now();
    try {
      const res = await labFetch(c.url);
      const text = await res.text();
      setResults((r) => ({ ...r, [c.name]: { ok: res.ok, status: res.status, ms: Math.round(now() - t0), size: text.length } }));
    } catch (e) {
      setResults((r) => ({ ...r, [c.name]: { blocked: true, ms: Math.round(now() - t0), msg: `${e.name}: ${e.message}` } }));
    }
  };
  const q = [
    { t: "Does it have the data I need?", d: "Look at an example response, not the marketing page. Find your exact field.", deal: true },
    { t: "Auth: none, key, or OAuth?", d: "None = go. Key = needs a server (Project 4). OAuth = skip it for a class project.", deal: true },
    { t: "Can a browser call it? (CORS)", d: "Run one fetch from localhost before you plan anything. A browser tab working proves nothing.", deal: true },
    { t: "Limits", d: "Requests per minute, pagination, cost. 1 call / 5 s kills a search-as-you-type UI." },
    { t: "Alive and HTTPS?", d: "Last commit, status page, recent issues. A dead API kills your project at 11pm." },
    { t: "Docs with copyable examples?", d: "If you can't find a sample request and response in 2 minutes, move on." },
  ];
  return (
    <Slide kicker="Picking an API" title="Six questions before you fall in love with an API" cols="0.9fr 1.1fr">
      <Col>
        {q.map((x, i) => (
          <div key={i} className="panel" style={{ padding: "10px 14px", display: "grid", gridTemplateColumns: "30px 1fr", gap: 8 }}>
            <span className="num-display" style={{ fontSize: 22, color: x.deal ? T.warn : T.muted }}>{i + 1}</span>
            <div>
              <div style={{ fontWeight: 600, color: T.ink, fontSize: 15.5 }}>{x.t} {x.deal && <span className="chip warn" style={{ fontSize: 11, padding: "2px 8px", marginLeft: 4 }}>dealbreaker</span>}</div>
              <div className="note">{x.d}</div>
            </div>
          </div>
        ))}
        <div className="note">Where to look: <span className="mono">github.com/public-apis/public-apis</span>. It literally has Auth, HTTPS, and CORS columns.</div>
      </Col>
      <Col>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 600, color: T.ink }}>API tryouts: a real fetch from this page</div>
          <button className="btn small primary" onClick={() => CANDIDATES.forEach(tryout)}>Run all</button>
        </div>
        {CANDIDATES.map((c) => {
          const r = results[c.name];
          const v = r && !r.running ? verdictFor(r, c) : null;
          return (
            <div key={c.name} className="panel" style={{ padding: "10px 14px", borderLeft: `4px solid ${v ? (v.good ? T.accent : T.warn) : T.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: T.ink }}>{c.name} <span className="note" style={{ fontWeight: 400 }}>· auth: {c.auth} · {c.limits}</span></div>
                  <div className="mono note" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.url}</div>
                </div>
                {r && !r.running && <span className="mono" style={{ fontSize: 13, color: r.ok ? T.accent : T.warn, fontWeight: 700, whiteSpace: "nowrap" }}>{r.blocked ? "TypeError" : r.status} · {r.ms} ms</span>}
                <button className="btn small" onClick={() => tryout(c)} disabled={r?.running}>{r?.running ? "..." : "Try"}</button>
              </div>
              {v && <div style={{ fontSize: 13.5, marginTop: 6, color: v.good ? T.accent : T.warn }}>{v.t}</div>}
            </div>
          );
        })}
      </Col>
    </Slide>
  );
}

/* L6. Scanning docs */
const DOC_SPOTS = [
  { id: "intro", order: null, label: "What is this? A brief history of PokéAPI and the team behind it...", why: "Skip it. Nice story, zero code. Scroll past.", skip: true },
  { id: "base", order: 1, label: "Base URL", why: "Every request starts with this. Copy it into a const BASE right now." },
  { id: "auth", order: 2, label: "Fair Use Policy", why: "This is where auth and limits hide. Here: no key, no auth, but cache results and don't hammer it. A key requirement would be here too." },
  { id: "endpoint", order: 3, label: "Endpoint: GET /pokemon/{id or name}/", why: "Find the noun you need (pokemon, deck, product). Curly braces = a path parameter you fill in: /pokemon/pikachu or /pokemon/25." },
  { id: "query", order: 4, label: "Resource lists: ?limit=20&offset=0", why: "Query params after the ?. limit and offset = pagination. Without them you get 20 results, not all 1,025." },
  { id: "example", order: 5, label: "Example response", why: "The money section. Find the exact path to the field you want before writing any React. sprites.other[\"official-artwork\"].front_default." },
  { id: "fields", order: 6, label: "Field table: height · integer · The height of this Pokémon in decimetres.", why: "Units and types live here. height: 17 is not 17 feet. It's 1.7 metres. The JSON alone won't tell you." },
  { id: "sdk", order: null, label: "Wrapper libraries: Pokedex.js, pokepy, PokeAPI-Kotlin...", why: "Skip for now. fetch is already the wrapper. Learn the raw API first.", skip: true },
];

function DocsSlide() {
  const [sel, setSel] = useState(null);
  const [showOrder, setShowOrder] = useState(false);
  const [ep, setEp] = useState("pokemon");
  const [val, setVal] = useState("eevee");
  const [limit, setLimit] = useState(5);
  const spot = DOC_SPOTS.find((s) => s.id === sel);
  const url = ep === "list" ? `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=0` : `https://pokeapi.co/api/v2/${ep}/${val.toLowerCase().trim()}`;
  const Hot = ({ id, children, style }) => {
    const s = DOC_SPOTS.find((x) => x.id === id);
    return (
      <div className={"hot" + (sel === id ? " on" : "")} style={{ position: "relative", ...style }} onClick={() => setSel(id)}>
        {showOrder && <span style={{ position: "absolute", right: 6, top: 6, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: s.skip ? T.line : T.ink, color: s.skip ? T.muted : "#fff" }}>{s.skip ? "skip" : s.order}</span>}
        {children}
      </div>
    );
  };
  const walk = () => {
    const order = DOC_SPOTS.filter((s) => !s.skip).sort((a, b) => a.order - b.order);
    const i = order.findIndex((s) => s.id === sel);
    setSel(order[(i + 1) % order.length].id); setShowOrder(true);
  };
  return (
    <Slide kicker="Reading docs" title="Don't read docs top to bottom. Scan them in this order." cols="1.1fr 0.9fr">
      <Col>
        <div className="panel" style={{ padding: 14, fontSize: 14, lineHeight: 1.5, overflow: "auto" }}>
          <div className="note mono" style={{ marginBottom: 6 }}>pokeapi.co/docs/v2 (abridged)</div>
          <Hot id="intro"><div className="note">{DOC_SPOTS[0].label}</div></Hot>
          <Hot id="base"><b>Base URL</b> <span className="mono" style={{ background: T.bg, padding: "1px 6px", borderRadius: 4 }}>https://pokeapi.co/api/v2/</span></Hot>
          <Hot id="auth"><b>Fair Use Policy</b><div className="note">PokéAPI is free and open. No authentication is required. Please cache resources locally and limit request frequency.</div></Hot>
          <Hot id="query"><b>Resource Lists / Pagination</b> <span className="mono" style={{ fontSize: 13 }}>GET /api/v2/{"{endpoint}"}/?limit=20&offset=0</span></Hot>
          <Hot id="endpoint"><b>Pokémon</b> <span className="mono" style={{ fontSize: 13, background: T.blueSoft, color: T.blue, padding: "1px 6px", borderRadius: 4 }}>GET /api/v2/pokemon/{"{id or name}"}/</span></Hot>
          <Hot id="example">
            <pre className="mono" style={{ margin: 0, fontSize: 12, background: T.codeBg, color: "#E5E7EB", padding: 10, borderRadius: 8, lineHeight: 1.45 }}>{`{
  "id": 35, "name": "clefairy", "height": 6, "weight": 75,
  "sprites": { "other": { "official-artwork": { "front_default": "https://..." } } },
  "types": [ { "slot": 1, "type": { "name": "fairy" } } ], ...
}`}</pre>
          </Hot>
          <Hot id="fields">
            <div className="mono" style={{ fontSize: 12.5, display: "grid", gridTemplateColumns: "70px 70px 1fr", gap: "2px 8px" }}>
              <b>Name</b><b>Type</b><b>Description</b>
              <span>height</span><span>integer</span><span>The height of this Pokémon in decimetres.</span>
              <span>weight</span><span>integer</span><span>The weight of this Pokémon in hectograms.</span>
            </div>
          </Hot>
          <Hot id="sdk"><div className="note">{DOC_SPOTS[7].label}</div></Hot>
        </div>
      </Col>
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn primary" onClick={walk}>{sel ? "Next in scan order" : "Start the scan"}</button>
          <button className={"tab" + (showOrder ? " on" : "")} onClick={() => setShowOrder(!showOrder)}>Show numbers</button>
        </div>
        <div className={"callout" + (spot ? (spot.skip ? "" : " good") : " blue")} style={{ minHeight: 120 }}>
          {spot ? (
            <>
              <div className="h">{spot.skip ? "Skip" : `Scan step ${spot.order}`}: {spot.label.split(":")[0].split("...")[0]}</div>
              {spot.why}
            </>
          ) : (
            <><div className="h">Click any part of the docs</div>Guess first: which part would you read first? Which two can you skip entirely?</>
          )}
        </div>
        <div className="panel" style={{ padding: 14 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 8 }}>Build the URL, then open it in a tab before writing code</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {[["pokemon", "/pokemon/{name}"], ["type", "/type/{name}"], ["list", "/pokemon?limit"]].map(([k, l]) => <button key={k} className={"tab mono" + (ep === k ? " on" : "")} style={{ fontSize: 12.5 }} onClick={() => { setEp(k); if (k === "type") setVal("fire"); if (k === "pokemon") setVal("eevee"); }}>{l}</button>)}
          </div>
          {ep === "list"
            ? <input className="input" type="number" min="1" max="100" value={limit} onChange={(e) => setLimit(e.target.value)} />
            : <input className="input" value={val} onChange={(e) => setVal(e.target.value)} />}
          <div className="mono" style={{ fontSize: 13, background: T.bg, padding: 10, borderRadius: 8, margin: "8px 0", wordBreak: "break-all" }}>{url}</div>
          <a className="btn small accent" href={url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-block" }}>Open in a new tab</a>
          <span className="note" style={{ marginLeft: 10 }}>Raw JSON in the browser = your field guide.</span>
        </div>
      </Col>
    </Slide>
  );
}

/* L7. JSON treasure hunt */
const HUNT = [
  { q: "The official artwork image URL", path: 'data.sprites.other["official-artwork"].front_default' },
  { q: "The name of its first type", path: "data.types[0].type.name" },
  { q: "Its HP (hint: stats)", path: "data.stats[0].base_stat" },
  { q: "Its height. Then: in what unit?", path: "data.height", after: "Decimetres. 17 means 1.7 m. The JSON can't tell you that, only the docs field table can." },
];

function HuntSlide() {
  const [name, setName] = useState("charizard");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [picked, setPicked] = useState(null);
  const [value, setValue] = useState(null);
  const [done, setDone] = useState([]);
  const [hint, setHint] = useState(false);

  async function load(n) {
    setError(null); setData(null); setPicked(null); setDone([]);
    try {
      const res = await labFetch(`https://pokeapi.co/api/v2/pokemon/${n.toLowerCase().trim()}`);
      if (!res.ok) throw new Error(`No Pokémon called "${n}".`);
      setData(await res.json());
    } catch (e) { setError(friendly(e, "PokéAPI")); }
  }
  useEffect(() => { load("charizard"); }, []);

  const current = HUNT.findIndex((_, i) => !done.includes(i));
  const pick = (path, v) => {
    setPicked(path); setValue(v);
    const i = HUNT.findIndex((h, j) => h.path === path && !done.includes(j));
    if (i !== -1) setDone((d) => [...d, i]);
  };
  const isLeaf = value === null || typeof value !== "object";

  return (
    <Slide kicker="JSON treasure hunt" title="Find the path in the tree. That path IS your code." cols="1fr 1fr">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(name)} />
          <button className="btn primary" onClick={() => load(name)}>Load</button>
        </div>
        {error && <div className="callout">{error}</div>}
        {!data && !error && <div className="note">Loading the real response...</div>}
        {data && <JsonTree key={data.id} data={data} onPick={pick} picked={picked} />}
        <div className="note">Click arrows to open, click any value to get its path. Big arrays show 6 at a time.</div>
      </Col>
      <Col>
        <div className="panel" style={{ padding: 12 }}>
          {HUNT.map((h, i) => {
            const ok = done.includes(i);
            return (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 6px", alignItems: "flex-start", borderRadius: 8, background: i === current ? T.blueSoft : "transparent" }}>
                <span style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, background: ok ? T.accent : T.line, color: ok ? "#fff" : T.muted }}>{ok ? "✓" : i + 1}</span>
                <div>
                  <div style={{ fontWeight: 600, color: T.ink, fontSize: 15 }}>{h.q}</div>
                  {(ok || (hint && i === current)) && <div className="mono" style={{ fontSize: 13, color: ok ? T.accent : T.muted }}>{h.path}</div>}
                  {ok && h.after && <div className="note" style={{ color: T.warn }}>{h.after}</div>}
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <span className="note">{done.length} / {HUNT.length} found</span>
            <button className="btn small" onClick={() => setHint(!hint)}>{hint ? "Hide hint" : "Hint"}</button>
          </div>
        </div>
        <div className="panel" style={{ padding: 12 }}>
          <div className="note" style={{ marginBottom: 6 }}>You clicked</div>
          {picked ? (
            <>
              <Code style={{ fontSize: 13.5, padding: "10px 14px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{`const value = ${picked}`}</Code>
              <div className="mono" style={{ fontSize: 13, marginTop: 8, display: "flex", gap: 10, alignItems: "center", wordBreak: "break-all" }}>
                {isLeaf && typeof value === "string" && /\.(png|jpg|svg)$/.test(value) && <img src={value} alt="" style={{ width: 64, height: 64, flexShrink: 0 }} />}
                <span>= {isLeaf ? JSON.stringify(value) : Array.isArray(value) ? `[ ${value.length} items ]` : `{ ${Object.keys(value).join(", ")} }`}</span>
              </div>
            </>
          ) : <div className="note">Nothing yet.</div>}
        </div>
        {done.length === HUNT.length && (
          <Reveal label="Now: what if the wifi drops mid-hunt?">Then <span className="mono">fetch</span> rejects, <span className="mono">data</span> never arrives, and every path above is <span className="mono">undefined</span>. That's the rest of today: making it survive.</Reveal>
        )}
      </Col>
    </Slide>
  );
}

export const LAB_SLIDES = [
  { el: <PokedexSlide />, notes: "Hook first, explain later. Let students shout names. Hit Random a few times, play a cry. Then click pikachoo: 404, friendly message. Point at the meta line: 300+ KB for 4 fields. Wifi bad? Flip Backup data." },
  { el: <StepsSlide />, notes: "Keep bad wifi on. Run step 1, then step 2 and have someone spam the click counter while it waits: await pauses the function, not the page. Then type gengr and rerun: step 3 throws, 4 and 5 never run. Switch tabs: same five lines, different API." },
  { el: <CardsSlide />, notes: "First Battle: the log shows TWO requests, in order. Ask: could we draw before we have deck_id? No. That's why these awaits are sequential. Ask where deckId lives in React: state. Play a few rounds, let the room cheer." },
  { el: <FashionSlide />, notes: "Run One at a time twice, then All at once twice. Compare the two numbers on the right. Ask: why couldn't the cards game do this? Because draw needed deck_id. Rule: dependent = sequential, independent = Promise.all." },
  { el: <PickSlide />, notes: "Ask the room to predict each tryout before clicking. Steam is the twist: open the URL in a tab, it works. Fetch it, TypeError. That's CORS. RAWG also shows TypeError: its 401 has no CORS header. Open it in a tab to read the key error, which sets up the keys slide later. Open Trivia: hit Try twice fast for the rate limit." },
  { el: <DocsSlide />, notes: "Have them guess the reading order first, then Start the scan and walk it. Spend time on Example response and the field table: decimetres is the gotcha. Then build a URL and open it in a tab: always look at raw JSON before code." },
  { el: <HuntSlide />, notes: "Race format: first to call out the full path for each one. Hint button shows the path for the current item. The height one lands the docs point. Reveal at the end is the bridge into errors and loading." },
];
