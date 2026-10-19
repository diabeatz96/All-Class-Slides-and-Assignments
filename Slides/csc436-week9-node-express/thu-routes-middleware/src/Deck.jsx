import { useState, useEffect, useMemo, useRef } from "react";
import { T, Code, Slide, Col, Split, Tiers, Quiz, DeckShell } from "./ui.jsx";
import { createApp, jsonParser, SEED, clone, pretty, STATUS_TEXT } from "./sim.js";

/* ------------------------------------------------------------------
   CSC 436  |  Week 9, Thursday Oct 22  |  Mission 8
   Routes + Middleware. The server learns to write, and every request
   walks the same assembly line. Payoff: Recipe Finder talks to it.
   Color code: blue = browser, teal = server, amber = database.
------------------------------------------------------------------- */

/* ============ shared ============ */

function StatusPill({ status, hung }) {
  if (hung) return <span className="chip gray">no response (hanging...)</span>;
  const cls = status >= 500 ? "warn" : status >= 400 ? "amber" : "good";
  return <span className={`chip ${cls}`}>{status} {STATUS_TEXT[status] || ""}</span>;
}

const OUTCOME = {
  next: { c: T.accent, label: "next()" },
  sent: { c: T.good, label: "responded" },
  skip: { c: "#9aa3ad", label: "skipped" },
  threw: { c: T.warn, label: "threw" },
  hung: { c: T.warn, label: "hung" },
};

function Trace({ trace }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {trace.map((t, i) => {
        const o = OUTCOME[t.outcome];
        return (
          <div key={i} className="pop" style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 10, background: t.outcome === "skip" ? "transparent" : "#fff", border: `1px solid ${t.outcome === "skip" ? "transparent" : T.line}`, opacity: t.outcome === "skip" ? 0.6 : 1, animationDelay: `${i * 60}ms` }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: o.c, flex: "none" }} />
            <span className="mono" style={{ fontSize: 13.5, fontWeight: 600, minWidth: 220 }}>{t.name}</span>
            <span style={{ fontSize: 13, color: o.c, fontWeight: 700 }}>{o.label}</span>
            {t.why && <span className="note" style={{ fontSize: 12.5 }}>{t.why}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* Full CRUD server, same code as stage 6/7, running in the browser. */
function buildCrud({ json = true, validate = true } = {}) {
  const db = clone(SEED).slice(0, 4);
  let nextId = 5;
  const find = (id) => db.find((r) => r.id === Number(id));
  const app = createApp();
  if (json) app.use(jsonParser());
  app.get("/api/recipes", (req, res) => res.json(db));
  app.get("/api/recipes/:id", (req, res) => {
    const r = find(req.params.id);
    if (!r) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
    res.json(r);
  });
  app.post("/api/recipes", (req, res) => {
    console.log("req.body is", req.body === undefined ? "undefined" : req.body);
    const { name, cuisine, minutes, tags = [] } = req.body ?? {};
    if (validate) {
      const problems = [];
      if (typeof name !== "string" || !name.trim()) problems.push("name is required");
      if (typeof cuisine !== "string" || !cuisine.trim()) problems.push("cuisine is required");
      if (typeof minutes !== "number" || minutes <= 0) problems.push("minutes must be a positive number");
      if (problems.length) return res.status(400).json({ error: "Invalid recipe", problems });
    }
    const recipe = { id: nextId++, name, cuisine, minutes, tags };
    db.push(recipe);
    res.status(201).json(recipe);
  });
  app.patch("/api/recipes/:id", (req, res) => {
    const r = find(req.params.id);
    if (!r) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
    const { name, cuisine, minutes, tags } = req.body ?? {};
    if (minutes !== undefined && (typeof minutes !== "number" || minutes <= 0)) return res.status(400).json({ error: "minutes must be a positive number" });
    if (name !== undefined) r.name = name;
    if (cuisine !== undefined) r.cuisine = cuisine;
    if (minutes !== undefined) r.minutes = minutes;
    if (tags !== undefined) r.tags = tags;
    res.json(r);
  });
  app.delete("/api/recipes/:id", (req, res) => {
    const i = db.findIndex((r) => r.id === Number(req.params.id));
    if (i === -1) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
    db.splice(i, 1);
    res.status(204).end();
  });
  return { app, db };
}

function DbTable({ db, flash }) {
  return (
    <div className="panel" style={{ padding: 6, borderTop: `4px solid ${T.amber}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px" }}>
        <b style={{ color: T.amber }}>Server memory: recipes</b>
        <span className="note">{db.length} rows</span>
      </div>
      <table className="t compact">
        <thead><tr><th>id</th><th>name</th><th>cuisine</th><th>min</th></tr></thead>
        <tbody>
          {db.map((r) => (
            <tr key={r.id} style={{ background: flash === r.id ? T.amberSoft : "transparent", transition: "background .3s" }}>
              <td className="mono">{r.id}</td><td>{String(r.name)}</td><td>{String(r.cuisine)}</td><td className="mono">{String(r.minutes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============ 1. Title ============ */

const LINE = [
  { n: "logger", c: T.blue },
  { n: "express.json()", c: T.accent },
  { n: "validate", c: T.amber },
  { n: "route handler", c: T.good },
  { n: "error handler", c: T.warn },
];

function TitleSlide() {
  const [at, setAt] = useState(-1);
  useEffect(() => {
    if (at < 0 || at >= LINE.length - 1) return;
    const t = setTimeout(() => setAt(at === 3 ? 99 : at + 1), 600);
    return () => clearTimeout(t);
  }, [at]);
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "center", padding: "0 70px", gap: 50 }}>
      <div>
        <div className="kicker">CSC 436, Week 9, Mission 8, Thursday Oct 22</div>
        <h1 style={{ fontSize: 60, lineHeight: 1.02, fontWeight: 800 }}>Routes and middleware</h1>
        <p className="lead" style={{ marginTop: 20, maxWidth: 560, fontSize: 21 }}>
          Tuesday your kitchen could only read the menu. Today it takes orders, changes them, throws them out, and every order walks the same assembly line on the way in.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <span className="chip blue">POST</span><span className="chip amber">PATCH</span><span className="chip warn">DELETE</span><span className="chip">middleware</span><span className="chip good">React meets your server</span>
        </div>
      </div>
      <div className="panel" style={{ padding: 22 }}>
        <div className="note" style={{ marginBottom: 10 }}>One POST request, start to finish</div>
        <Col gap={8}>
          {LINE.map((s, i) => {
            const on = at === i || (at === 99 && i === 3);
            const past = at !== -1 && (at === 99 ? i < 3 : i < at);
            return (
              <div key={s.n} className="row" style={{ borderColor: on ? s.c : T.line, background: on ? "#fff" : past ? "#fafbfc" : T.card, boxShadow: on ? `0 0 0 3px ${s.c}22` : "none", transition: "all .2s" }}>
                <span className="mono" style={{ fontWeight: 700, color: on || past ? s.c : T.muted }}>{s.n}</span>
                <span className="note">{on ? (i === 3 ? "res.status(201).json(...)" : "working...") : past ? "next()" : i === 4 ? "only if something throws" : ""}</span>
              </div>
            );
          })}
          <button className="btn primary" style={{ marginTop: 6 }} onClick={() => setAt(0)}>Send POST /api/recipes</button>
        </Col>
      </div>
    </div>
  );
}

/* ============ 2. Warm-up: predict the response ============ */

const PREDICT = [
  { req: "GET /api/recipes/2", a: "200", why: "Route matches, Number(\"2\") finds Chicken Tikka Masala." },
  { req: "GET /api/recipes/two", a: "404", why: "Number(\"two\") is NaN. Nothing matches NaN, so our own 404 JSON." },
  { req: "GET /api/recipes?cuisine=klingon", a: "200", why: "The list route ran fine and found nothing. An empty array is still a successful answer." },
  { req: "GET /api/recipe", a: "404", why: "Typo: recipe, not recipes. No route matched, so Express's HTML 404." },
  { req: "POST /api/recipes", a: "404", why: "Tuesday's server has no POST route. Same path, wrong method: Cannot POST /api/recipes. Today we fix that." },
  { req: "GET /api/recipes/3 (server not running)", a: "none", why: "No status at all. The browser cannot connect: This site can't be reached. Check the terminal first." },
];

function PredictSlide() {
  const [ans, setAns] = useState({});
  return (
    <Slide kicker="Warm-up, 15 minutes, pairs" title="Predict the status code" sub="Tuesday's server: GET /api/recipes (with ?cuisine), GET /api/recipes/:id with Number() and a JSON 404. Predict before you click.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {PREDICT.map((p, i) => {
          const pick = ans[i];
          const right = pick === p.a;
          return (
            <div key={i} className="panel" style={{ padding: "12px 14px", borderColor: pick ? (right ? T.good : T.warn) : T.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span className="mono" style={{ fontWeight: 700, fontSize: 15 }}>{p.req}</span>
                <span style={{ display: "flex", gap: 5 }}>
                  {["200", "404", "500", "none"].map((o) => (
                    <button key={o} className="btn small" style={pick === o ? { background: right ? T.good : T.warn, color: "#fff", borderColor: "transparent" } : {}} onClick={() => setAns({ ...ans, [i]: o })}>{o}</button>
                  ))}
                </span>
              </div>
              {pick && <div className="note pop" style={{ marginTop: 6 }}><b style={{ color: right ? T.good : T.warn }}>{right ? "Yes. " : `It is ${p.a}. `}</b>{p.why}</div>}
            </div>
          );
        })}
      </div>
      <div className="callout info" style={{ marginTop: 14 }}><div className="h">The one to remember</div>Row 5. The path existed. The method did not. Routes match on method AND path. That is today's first job.</div>
    </Slide>
  );
}

/* ============ 3. CRUD meets HTTP ============ */

const CRUD = [
  { k: "C", word: "Create", m: "POST", path: "/api/recipes", body: "yes: the new recipe", ok: "201 Created + the new recipe (with its id)", bad: "400 bad body", c: T.blue },
  { k: "R", word: "Read", m: "GET", path: "/api/recipes  or  /api/recipes/:id", body: "no", ok: "200 OK + list or one", bad: "404 no such id", c: T.good },
  { k: "U", word: "Update", m: "PATCH", path: "/api/recipes/:id", body: "yes: only the fields that change", ok: "200 OK + the updated recipe", bad: "404 no such id, 400 bad body", c: T.amber },
  { k: "D", word: "Delete", m: "DELETE", path: "/api/recipes/:id", body: "no", ok: "204 No Content (empty)", bad: "404 no such id", c: T.warn },
];

function CrudSlide() {
  const [k, setK] = useState("C");
  const x = CRUD.find((c) => c.k === k);
  return (
    <Slide kicker="Concept" title="CRUD: four verbs, one noun" sub="Almost every app is these four operations on some kind of thing. The method is the verb. The path is the noun. Click a letter.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {CRUD.map((c) => (
          <button key={c.k} className="panel" onClick={() => setK(c.k)} style={{ padding: 18, cursor: "pointer", textAlign: "left", borderTop: `5px solid ${c.c}`, background: k === c.k ? "#fff" : T.card, boxShadow: k === c.k ? `0 0 0 3px ${c.c}33` : "none" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: c.c, lineHeight: 1 }}>{c.k}</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>{c.word}</div>
            <div className="mono" style={{ color: c.c, fontWeight: 700, marginTop: 4 }}>{c.m}</div>
          </button>
        ))}
      </div>
      <div className="panel pop" key={k} style={{ marginTop: 16, padding: 6 }}>
        <table className="t">
          <tbody>
            <tr><td style={{ width: 200 }} className="note">Method</td><td className="mono" style={{ fontWeight: 700, color: x.c, fontSize: 17 }}>{x.m}</td></tr>
            <tr><td className="note">Path</td><td className="mono">{x.path}</td></tr>
            <tr><td className="note">Request body?</td><td>{x.body}</td></tr>
            <tr><td className="note">Success</td><td>{x.ok}</td></tr>
            <tr><td className="note">Failure</td><td>{x.bad}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="callout info" style={{ marginTop: 14 }}><div className="h">PUT or PATCH?</div>PUT replaces the whole recipe (send every field). PATCH changes only what you send. Forms that edit one field want PATCH. Project 4 accepts either.</div>
    </Slide>
  );
}

/* ============ 4. Live CRUD playground ============ */

const PRESETS = [
  { label: "GET all", m: "GET", url: "/api/recipes", body: "" },
  { label: "GET one", m: "GET", url: "/api/recipes/2", body: "" },
  { label: "POST Ramen", m: "POST", url: "/api/recipes", body: `{ "name": "Ramen", "cuisine": "Japanese", "minutes": 40 }` },
  { label: "PATCH minutes", m: "PATCH", url: "/api/recipes/2", body: `{ "minutes": 45 }` },
  { label: "DELETE 3", m: "DELETE", url: "/api/recipes/3", body: "" },
  { label: "DELETE 3 again", m: "DELETE", url: "/api/recipes/3", body: "" },
];

function PlaygroundSlide() {
  const ref = useRef(null);
  if (!ref.current) ref.current = buildCrud();
  const [, force] = useState(0);
  const [m, setM] = useState("POST");
  const [url, setUrl] = useState("/api/recipes");
  const [body, setBody] = useState(PRESETS[2].body);
  const [result, setResult] = useState(null);
  const [flash, setFlash] = useState(null);
  const send = (mm = m, uu = url, bb = body) => {
    const r = ref.current.app.handle({ method: mm, url: uu, body: bb || undefined, contentType: bb ? "application/json" : undefined });
    setResult(r);
    const id = r.body && r.body.id ? r.body.id : Number(uu.split("/")[3]) || null;
    setFlash(id);
    force((x) => x + 1);
  };
  const reset = () => { ref.current = buildCrud(); setResult(null); setFlash(null); force((x) => x + 1); };
  return (
    <Slide kicker="Try it" title="All four, live" sub="This is the stage 6 server running right here. Send requests and watch the server's memory change.">
      <Split cols="1.15fr 1fr">
        <Col>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PRESETS.map((p) => <button key={p.label} className="btn small" onClick={() => { setM(p.m); setUrl(p.url); setBody(p.body); send(p.m, p.url, p.body); }}>{p.label}</button>)}
            <button className="btn small" onClick={reset}>Restart server</button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <select className="field" style={{ width: 120 }} value={m} onChange={(e) => setM(e.target.value)}>{["GET", "POST", "PATCH", "DELETE"].map((x) => <option key={x}>{x}</option>)}</select>
            <input className="field mono" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button className="btn primary" onClick={() => send()}>Send</button>
          </div>
          <textarea className="field mono" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="JSON body (POST and PATCH only)" disabled={m === "GET" || m === "DELETE"} />
          {result && (
            <div className="pop" key={JSON.stringify(result.body) + result.status + url}>
              <div style={{ marginBottom: 6 }}><StatusPill status={result.status} /></div>
              <pre className="term" style={{ margin: 0, maxHeight: 170, fontSize: 13 }}>{result.type === "empty" ? "(no body)" : pretty(result.body)}</pre>
            </div>
          )}
        </Col>
        <Col>
          <DbTable db={ref.current.db} flash={flash} />
          <div className="callout"><div className="h">Restart server = data gone</div>It lives in a JavaScript array in memory. Click Restart and your Ramen vanishes. Supabase on Tuesday makes it permanent.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 5. The req.body trap ============ */

function BodyTrapSlide() {
  const [json, setJson] = useState(false);
  const [header, setHeader] = useState(true);
  const [result, setResult] = useState(null);
  const send = () => {
    const { app } = buildCrud({ json, validate: false });
    setResult(app.handle({ method: "POST", url: "/api/recipes", body: `{ "name": "Ramen", "cuisine": "Japanese", "minutes": 40 }`, contentType: header ? "application/json" : undefined }));
  };
  useEffect(() => { setResult(null); }, [json, header]);
  return (
    <Slide kicker="The trap" title="req.body is undefined" sub="The most common Thursday bug, every semester. Express does not read request bodies unless you tell it to.">
      <Split cols="1.1fr 1fr">
        <Col>
          <Code size={15} hl={json ? [5] : []}>{`import express from "express";

const app = express();

${json ? "app.use(express.json());" : "// app.use(express.json());   <- missing"}

app.post("/api/recipes", (req, res) => {
  console.log("req.body is", req.body);
  ...
});`}</Code>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className={"btn" + (json ? " on" : "")} onClick={() => setJson(!json)}>{json ? "express.json() ON" : "express.json() OFF"}</button>
            <button className={"btn" + (header ? " on" : "")} onClick={() => setHeader(!header)}>{header ? "Content-Type header sent" : "No Content-Type header"}</button>
            <button className="btn primary" onClick={send}>Send the POST</button>
          </div>
        </Col>
        <Col>
          <div className="term" style={{ minHeight: 120 }}>
            <div className="dim">server terminal</div>
            {result ? result.logs.map((l, i) => <div key={i} className={l.includes("undefined") ? "err" : ""}>{l}</div>) : <div className="dim">(send the POST)</div>}
          </div>
          {result && (json && header ? (
            <div className="callout good pop"><div className="h">Body arrived</div>express.json() read the raw text and turned it into an object on req.body.</div>
          ) : (
            <div className="callout pop"><div className="h">Saved a recipe made of undefined</div>{!json ? "Nobody parsed the body. The text arrived and was ignored." : "express.json() only reads bodies labeled Content-Type: application/json. Thunder Client sets it when you pick JSON. fetch() does NOT, you add it yourself."}</div>
          ))}
          <Code size={13.5}>{`// in React, both lines matter
fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(recipe),
});`}</Code>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 6. Validation ============ */

const BAD = [
  { label: "Perfect", body: `{ "name": "Ramen", "cuisine": "Japanese", "minutes": 40 }` },
  { label: "Empty", body: `{}` },
  { label: "minutes as text", body: `{ "name": "Ramen", "cuisine": "Japanese", "minutes": "forty" }` },
  { label: "Blank name", body: `{ "name": "   ", "cuisine": "Japanese", "minutes": 40 }` },
  { label: "Sneaky id", body: `{ "id": 1, "name": "Ramen", "cuisine": "Japanese", "minutes": 40 }` },
];

const show = (v) => (v === undefined ? "undefined" : JSON.stringify(v));

function ValidateSlide() {
  const [on, setOn] = useState(true);
  const [pick, setPick] = useState(1);
  const ref = useRef(null);
  const [result, setResult] = useState(null);
  const send = (i, v = on) => {
    setPick(i);
    ref.current = buildCrud({ validate: v });
    const r = ref.current.app.handle({ method: "POST", url: "/api/recipes", body: BAD[i].body, contentType: "application/json" });
    setResult({ r, db: clone(ref.current.db) });
  };
  return (
    <Slide kicker="Never trust the client" title="Validate every body" sub="Anyone can send anything to your server: a typo in Thunder Client, a buggy form, or someone poking at it on purpose. Check before you save.">
      <Split cols="1.2fr 1fr">
        <Col>
          <Code size={12.5} hl={on ? [3, 4, 5, 6, 7, 8, 9, 10, 11] : []}>{`app.post("/api/recipes", (req, res) => {
  const { name, cuisine, minutes } = req.body;
  const problems = [];
  if (typeof name !== "string" || !name.trim())
    problems.push("name is required");
  if (typeof cuisine !== "string" || !cuisine.trim())
    problems.push("cuisine is required");
  if (typeof minutes !== "number" || minutes <= 0)
    problems.push("minutes must be a positive number");
  if (problems.length > 0)
    return res.status(400).json({ error: "Invalid recipe", problems });

  // the SERVER picks the id
  const recipe = { id: nextId++, name, cuisine, minutes };
  recipes.push(recipe);
  res.status(201).json(recipe);
});`}</Code>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={"btn" + (on ? " on" : "")} onClick={() => { setOn(!on); setResult(null); }}>{on ? "Validation ON" : "Validation OFF"}</button>
          </div>
        </Col>
        <Col>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {BAD.map((b, i) => <button key={i} className={"btn small" + (pick === i && result ? " on" : "")} onClick={() => send(i)}>{b.label}</button>)}
          </div>
          <pre className="term" style={{ margin: 0, fontSize: 13 }}>{BAD[pick].body}</pre>
          {result && (
            <div className="pop" key={pick + String(on)}>
              <div style={{ marginBottom: 6 }}><StatusPill status={result.r.status} /></div>
              <pre className="term" style={{ margin: 0, fontSize: 13, maxHeight: 130 }}>{pretty(result.r.body)}</pre>
              {!on && result.r.status === 201 && pick !== 0 && <div className="callout" style={{ marginTop: 8 }}><div className="h">Garbage saved</div>Your server now holds a recipe with name: {show(result.r.body.name)} and minutes: {show(result.r.body.minutes)}. Every page that displays it might crash.</div>}
              {pick === 4 && <div className="callout info" style={{ marginTop: 8 }}><div className="h">The id they sent was ignored</div>We build the object ourselves and pick the id. Copying req.body straight into the database would let anyone choose ids, or overwrite recipe 1.</div>}
            </div>
          )}
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 7. What is middleware? ============ */

function MiddlewareIdeaSlide() {
  const [choice, setChoice] = useState(null);
  return (
    <Slide kicker="Concept" title="Middleware: a station on the assembly line" sub="A function that runs between the request arriving and your route answering. Same shape as a route, plus one new thing: next.">
      <Split cols="1fr 1.1fr">
        <Col>
          <Code size={16} hl={choice === "next" ? [3] : choice === "send" ? [4] : choice === "hang" ? [] : []}>{`function checkOpen(req, res, next) {
  // look at req, maybe change it...
  next();                                       // option 1
  // res.status(503).json({ error: "Closed" })  // option 2
}

app.use(checkOpen);    // every request walks through it`}</Code>
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Airport security, not a black box</div>
            <p className="lead" style={{ fontSize: 17 }}>Every passenger walks the same line: ID check, bag scan, metal detector, then the gate. Each station either waves you on, or stops you. That is middleware. The gate is your route.</p>
          </div>
        </Col>
        <Col>
          <div style={{ fontWeight: 700 }}>Every middleware must do exactly one of these. Click each.</div>
          {[["next", "Call next()", "\"I am done, pass it to the next station.\" The request keeps moving.", T.accent],
            ["send", "Send a response", "\"Stop here, I answered.\" Nothing further down the line runs. Used for 400s, 401s, 404s.", T.good],
            ["hang", "Do neither", "The request is stuck at this station forever. No error. The browser just spins until it times out. Hardest bug to spot.", T.warn]].map(([k, h, b, c]) => (
            <button key={k} className="panel" onClick={() => setChoice(k)} style={{ padding: 16, textAlign: "left", cursor: "pointer", borderLeft: `5px solid ${c}`, background: choice === k ? "#fff" : T.card, boxShadow: choice === k ? `0 0 0 3px ${c}22` : "none" }}>
              <div style={{ fontWeight: 800, color: c, fontSize: 18 }}>{h}</div>
              {choice === k && <p className="pop" style={{ marginTop: 6, fontSize: 16, lineHeight: 1.45 }}>{b}</p>}
            </button>
          ))}
          <div className="callout info"><div className="h">You already used one</div>express.json() is middleware. It reads the body, puts it on req.body, and calls next().</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 8. Assembly line simulator ============ */

const STATIONS = [
  { k: "logger", label: "logger", desc: "prints every request" },
  { k: "json", label: "express.json()", desc: "fills req.body" },
  { k: "routes", label: "routes", desc: "GET / POST / DELETE" },
  { k: "notFound", label: "404 catcher", desc: "nothing matched" },
  { k: "errors", label: "error handler", desc: "something threw" },
];

function buildLine(enabled, { brokenLogger = false } = {}) {
  const db = clone(SEED).slice(0, 3);
  let nextId = 4;
  const app = createApp();
  if (enabled.logger) {
    const logger = (req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); if (!brokenLogger) next(); };
    logger.label = "logger";
    app.use(logger);
  }
  if (enabled.json) app.use(jsonParser());
  if (enabled.routes) {
    app.get("/api/recipes", (req, res) => res.json(db));
    app.post("/api/recipes", (req, res) => {
      if (!req.body || !req.body.name) return res.status(400).json({ error: "name is required" });
      const r = { id: nextId++, ...req.body };
      db.push(r);
      res.status(201).json(r);
    });
    app.get("/api/kaboom", () => { throw new Error("The oven exploded"); });
  }
  if (enabled.notFound) {
    const nf = (req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
    nf.label = "404 catcher";
    app.use(nf);
  }
  if (enabled.errors) {
    // eslint-disable-next-line no-unused-vars
    const eh = (err, req, res, next) => { console.log("Error:", err.message); res.status(500).json({ error: "Something went wrong in the kitchen" }); };
    eh.label = "error handler";
    app.use(eh);
  }
  return app;
}

const LINE_REQS = [
  { label: "GET /api/recipes", m: "GET", url: "/api/recipes" },
  { label: "POST a recipe", m: "POST", url: "/api/recipes", body: `{ "name": "Ramen" }` },
  { label: "GET /api/desserts", m: "GET", url: "/api/desserts" },
  { label: "GET /api/kaboom", m: "GET", url: "/api/kaboom" },
];

function LineSlide() {
  const [enabled, setEnabled] = useState({ logger: true, json: true, routes: true, notFound: true, errors: true });
  const [broken, setBroken] = useState(false);
  const [req, setReq] = useState(0);
  const [result, setResult] = useState(null);
  const send = (i = req, en = enabled, br = broken) => {
    setReq(i);
    const r = LINE_REQS[i];
    setResult(buildLine(en, { brokenLogger: br }).handle({ method: r.m, url: r.url, body: r.body, contentType: r.body ? "application/json" : undefined }));
  };
  const toggle = (k) => { const en = { ...enabled, [k]: !enabled[k] }; setEnabled(en); send(req, en); };
  return (
    <Slide kicker="Try it" title="Watch a request walk the line" sub="Pick a request. Turn stations off. Break the logger. Every row below is one station's decision.">
      <Split cols="1fr 1.35fr">
        <Col>
          <div style={{ fontWeight: 700 }}>Stations (top to bottom)</div>
          {STATIONS.map((s) => (
            <label key={s.k} className="row" style={{ cursor: "pointer", padding: "8px 12px", opacity: enabled[s.k] ? 1 : 0.5 }}>
              <span><span className="mono" style={{ fontWeight: 700 }}>{s.label}</span> <span className="note">{s.desc}</span></span>
              <input type="checkbox" checked={enabled[s.k]} onChange={() => toggle(s.k)} />
            </label>
          ))}
          <label className="row" style={{ cursor: "pointer", padding: "8px 12px", borderColor: broken ? T.warn : T.line }}>
            <span style={{ color: broken ? T.warn : T.ink, fontWeight: 600 }}>Delete next() from the logger</span>
            <input type="checkbox" checked={broken} onChange={() => { setBroken(!broken); send(req, enabled, !broken); }} />
          </label>
        </Col>
        <Col>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {LINE_REQS.map((r, i) => <button key={i} className={"btn small" + (req === i && result ? " on" : "")} onClick={() => send(i)}>{r.label}</button>)}
          </div>
          {result ? (
            <>
              <Trace trace={result.trace} />
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <StatusPill status={result.status} hung={result.hung} />
                <span className="mono note" style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 420 }}>{result.hung ? "browser spinner forever" : typeof result.body === "string" ? result.body.split("\n")[2] || result.body : JSON.stringify(result.body)}</span>
              </div>
              {result.logs.length > 0 && <div className="term" style={{ fontSize: 13, padding: "8px 12px" }}>{result.logs.map((l, i) => <div key={i}>{l}</div>)}</div>}
            </>
          ) : <p className="lead">Click a request to send it down the line.</p>}
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 9. Write the logger ============ */

const LOGGER = `function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    const line = \`\${req.method} \${req.originalUrl} -> \${res.statusCode}\`;
    console.log(\`\${line} (\${ms}ms)\`);
  });

  next();
}

app.use(logger);`;

const LOGGER_X = {
  1: ["Same three arguments", "req, res, next. That is all a middleware is: a function Express calls with those three."],
  2: ["Start a stopwatch", "Date.now() is milliseconds since 1970. We subtract later to see how long the request took."],
  4: ["Wait for the response", "We cannot log the status yet, the route has not run. res.on(\"finish\") says: run this later, after the response goes out."],
  6: ["One line per request", "Method, path, status, time. This is what real servers print, and it is the first place you look when something breaks."],
  10: ["Pass it on", "The line that makes it middleware instead of a black hole. Delete it and every request hangs."],
  13: ["Plug it in", "app.use with no path means every request, every method. Put it near the top so it sees everything."],
};

function LoggerSlide() {
  const [line, setLine] = useState(10);
  const x = LOGGER_X[line];
  return (
    <Slide kicker="Code walkthrough" title="Your first middleware: a logger" sub="Thirteen lines. You will add this to every server you write this semester. Click a line.">
      <Split cols="1.35fr 1fr">
        <Col>
          <Code size={13.5} hl={[line, ...(line === 4 ? [5, 6, 7, 8] : line === 6 ? [7] : [])]} onLine={(n) => LOGGER_X[n] && setLine(n)}>{LOGGER}</Code>
          <div className="term" style={{ fontSize: 13.5 }}>
            <div className="dim">$ npm run dev</div>
            <div>Kitchen open at http://localhost:3000</div>
            <div>GET /api/recipes -&gt; 200 (2ms)</div>
            <div>POST /api/recipes -&gt; 201 (4ms)</div>
            <div style={{ color: "#fde68a" }}>POST /api/recipes -&gt; 400 (1ms)</div>
            <div style={{ color: "#fca5a5" }}>GET /api/kaboom -&gt; 500 (3ms)</div>
          </div>
        </Col>
        <Col>
          <div className="panel pop" key={line} style={{ padding: 18, borderLeft: `5px solid ${line === 10 ? T.warn : T.accent}` }}>
            <div className="note mono">line {line}</div>
            <div style={{ fontWeight: 800, fontSize: 22, marginTop: 4 }}>{x[0]}</div>
            <p className="big" style={{ marginTop: 8, fontSize: 18 }}>{x[1]}</p>
          </div>
          <div className="callout info"><div className="h">Why bother?</div>When React says "it did not work", one log line answers: did the request arrive, which method, what status went back.</div>
          <div className="callout"><div className="h">Deliberate mistake (live)</div>Delete next(), save, refresh. Spinner forever, no error anywhere.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 10. Order matters ============ */

const ORDER_START = ["logger", "json", "notFound", "routes"];
const ORDER_LABEL = { logger: "app.use(logger)", json: "app.use(express.json())", routes: "app.get / app.post routes", notFound: "app.use(notFound)" };

function OrderSlide() {
  const [order, setOrder] = useState(ORDER_START);
  const [result, setResult] = useState(null);
  const [which, setWhich] = useState(0);
  const build = () => {
    const db = clone(SEED).slice(0, 3);
    const app = createApp();
    order.forEach((k) => {
      if (k === "logger") { const l = (req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next(); }; l.label = "logger"; app.use(l); }
      if (k === "json") app.use(jsonParser());
      if (k === "routes") {
        app.get("/api/recipes", (req, res) => res.json(db.map((r) => r.name)));
        app.post("/api/recipes", (req, res) => res.status(201).json({ received: req.body ?? "undefined" }));
      }
      if (k === "notFound") { const nf = (req, res) => res.status(404).json({ error: "No route" }); nf.label = "404 catcher"; app.use(nf); }
    });
    return app;
  };
  const reqs = [{ m: "GET", url: "/api/recipes" }, { m: "POST", url: "/api/recipes", body: `{ "name": "Ramen" }` }];
  const send = (i = which) => { setWhich(i); const r = reqs[i]; setResult(build().handle({ method: r.m, url: r.url, body: r.body, contentType: r.body ? "application/json" : undefined })); };
  useEffect(() => { send(which); }, [order]); // eslint-disable-line react-hooks/exhaustive-deps
  const move = (i, d) => { const o = [...order]; const j = i + d; if (j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; setOrder(o); };
  const correct = order.join() === "logger,json,routes,notFound";
  return (
    <Slide kicker="Gotcha" title="Order is the whole point" sub="Express runs app.use and routes in the order you wrote them. This server is in the wrong order. Fix it with the arrows.">
      <Split cols="1fr 1.2fr">
        <Col gap={8}>
          {order.map((k, i) => (
            <div key={k} className="row" style={{ padding: "10px 12px" }}>
              <span className="mono" style={{ fontWeight: 600 }}><span className="note" style={{ marginRight: 8 }}>{i + 1}</span>{ORDER_LABEL[k]}</span>
              <span style={{ display: "flex", gap: 4 }}>
                <button className="btn small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">{"↑"}</button>
                <button className="btn small" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Move down">{"↓"}</button>
              </span>
            </div>
          ))}
          <button className="btn small" style={{ alignSelf: "flex-start" }} onClick={() => setOrder(ORDER_START)}>Reset to broken</button>
          <div className={"callout" + (correct ? " good" : "")}><div className="h">{correct ? "Correct order" : "Rule of thumb"}</div>logger first (sees everything), parsers next, routes, then the 404 catcher, then the error handler last.</div>
        </Col>
        <Col>
          <div style={{ display: "flex", gap: 6 }}>
            <button className={"btn small" + (which === 0 ? " on" : "")} onClick={() => send(0)}>GET /api/recipes</button>
            <button className={"btn small" + (which === 1 ? " on" : "")} onClick={() => send(1)}>POST /api/recipes</button>
          </div>
          {result && <>
            <Trace trace={result.trace} />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><StatusPill status={result.status} /><span className="mono note" style={{ fontSize: 13 }}>{JSON.stringify(result.body)}</span></div>
          </>}
          <div className="note">Try: 404 catcher above routes (everything 404s). express.json() below routes (POST receives undefined). Logger at the bottom (never prints).</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 11. Route-level middleware ============ */

function RouteLevelSlide() {
  return (
    <Slide kicker="Concept" title="Global vs route-level middleware" sub="app.use runs on every request. You can also slot a middleware into ONE route, between the path and the handler.">
      <Split cols="0.9fr 1.1fr">
        <Col>
          <div className="panel" style={{ padding: 16, borderTop: `5px solid ${T.blue}` }}>
            <b style={{ color: T.blue }}>Global: every request</b>
            <Code size={14.5} style={{ marginTop: 10 }}>{`app.use(logger);
app.use(express.json());`}</Code>
            <p className="note" style={{ marginTop: 8 }}>Things every request needs: logging, body parsing, CORS.</p>
          </div>
          <div className="panel" style={{ padding: 16, borderTop: `5px solid ${T.amber}` }}>
            <b style={{ color: T.amber }}>Route-level: just this route</b>
            <Code size={14.5} style={{ marginTop: 10 }}>{`// path, then middleware, then handler
app.post("/api/recipes", validateRecipe, (req, res) => {
  // if we got here, the body is valid
  ...
});`}</Code>
            <p className="note" style={{ marginTop: 8 }}>Things only some routes need: validation, "must be logged in" (Week 12).</p>
          </div>
        </Col>
        <Col>
          <Code size={13} hl={[1, 15]}>{`export function validateRecipe(req, res, next) {
  const { name, cuisine, minutes } = req.body ?? {};
  const problems = [];

  if (typeof name !== "string" || !name.trim())
    problems.push("name is required");
  if (typeof cuisine !== "string" || !cuisine.trim())
    problems.push("cuisine is required");
  if (typeof minutes !== "number" || minutes <= 0)
    problems.push("minutes must be a positive number");

  if (problems.length > 0) {
    return res.status(400).json({ error: "Invalid recipe", problems });
  }
  next();
}`}</Code>
          <div className="callout good"><div className="h">Why pull it out?</div>POST and PUT both need the same check. Write it once, attach it to both. The route handler shrinks to the happy path.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 12. Error handler ============ */

function ErrorSlide() {
  const [handler, setHandler] = useState(false);
  const [result, setResult] = useState(null);
  const send = (h = handler) => {
    const app = createApp();
    app.get("/api/kaboom", () => { throw new Error("The oven exploded"); });
    if (h) {
      // eslint-disable-next-line no-unused-vars
      const eh = (err, req, res, next) => { console.log("Error:", err.message); res.status(500).json({ error: "Something went wrong in the kitchen" }); };
      eh.label = "error handler";
      app.use(eh);
    }
    setResult(app.handle({ method: "GET", url: "/api/kaboom" }));
  };
  return (
    <Slide kicker="Concept" title="One place where every error lands" sub="Something will throw: a typo, a null, Supabase being down. Without a plan, Express sends the user your stack trace.">
      <Split cols="1.05fr 1fr">
        <Col>
          <Code size={14.5} hl={handler ? [6, 7, 8, 9, 10, 11] : [1, 2, 3]}>{`app.get("/api/kaboom", (req, res) => {
  throw new Error("The oven exploded");
});

// LAST thing in the file. FOUR arguments.
app.use((err, req, res, next) => {
  // the real details: for you, in the terminal
  console.error("Error:", err.message);
  // a calm message: for them, as JSON
  res.status(500).json({ error: "Something went wrong" });
});`}</Code>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={"btn" + (handler ? " on" : "")} onClick={() => { setHandler(!handler); send(!handler); }}>{handler ? "Error handler ON" : "Error handler OFF"}</button>
            <button className="btn primary" onClick={() => send()}>GET /api/kaboom</button>
          </div>
          <div className="callout info"><div className="h">How does Express know?</div>Four parameters: (err, req, res, next). Express literally counts them. Three means normal middleware. Four means error handler.</div>
        </Col>
        <Col>
          {result ? (
            <div className="pop" key={String(handler) + result.status}>
              <div style={{ marginBottom: 6 }}><StatusPill status={result.status} /> <span className="note">Content-Type: {result.headers["Content-Type"]}</span></div>
              <pre className="term" style={{ margin: 0, fontSize: 12.5, whiteSpace: "pre-wrap" }}>{pretty(result.body)}</pre>
              <div className={"callout" + (handler ? " good" : "")} style={{ marginTop: 10 }}>
                <div className="h">{handler ? "JSON your React app can read" : "HTML your React app chokes on"}</div>
                {handler ? "useFetch sees res.ok is false, shows the error state, and the real message stays in your terminal." : "res.json() in React throws \"Unexpected token <\", because this is HTML. And you just showed strangers your file paths."}
              </div>
            </div>
          ) : <p className="lead">Send the request with the handler off, then on.</p>}
          <div className="callout good"><div className="h">Express 5 bonus</div>If an async route throws or a promise rejects, Express 5 sends it to the error handler for you. In Express 4 you had to wrap every async route in try/catch. Old tutorials still do.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 13. Organizing with Router ============ */

const FILES = {
  "server.js": `import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import recipesRouter from "./routes/recipes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(logger);
app.use(express.json());

app.use("/api/recipes", recipesRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(3000, () => console.log("Kitchen open"));`,
  "routes/recipes.js": `import { Router } from "express";
import { recipes, takeNextId } from "../data/recipes.js";
import { validateRecipe, validateRecipePatch } from "../middleware/validate.js";

const router = Router();

// "/" here means /api/recipes
router.get("/", (req, res) => { ... });

// "/:id" here means /api/recipes/:id
router.get("/:id", (req, res) => { ... });

router.post("/", validateRecipe, (req, res) => { ... });
router.patch("/:id", validateRecipePatch, (req, res) => { ... });
router.delete("/:id", (req, res) => { ... });

export default router;`,
  "middleware/logger.js": `export function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    console.log(\`\${req.method} \${req.originalUrl} -> \${res.statusCode}\`);
  });
  next();
}`,
  "middleware/errors.js": `export function notFound(req, res) {
  res.status(404).json({ error: \`No route for \${req.method} \${req.originalUrl}\` });
}

export function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Something went wrong in the kitchen" });
}`,
  "data/recipes.js": `// Next week this whole file is replaced by Supabase.
export const recipes = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25, tags: [...] },
  ...
];`,
};

function RouterSlide() {
  const [f, setF] = useState("server.js");
  return (
    <Slide kicker="Organizing" title="One file per job" sub="Stage 7 is one long file. Real projects split it up. Same code, easier to find things. This is the final/ folder in the example repo.">
      <Split cols="0.6fr 1.6fr">
        <Col gap={6}>
          <div className="mono note" style={{ fontSize: 13 }}>final/</div>
          {Object.keys(FILES).map((k) => (
            <button key={k} className="row" onClick={() => setF(k)} style={{ cursor: "pointer", padding: "8px 12px", justifyContent: "flex-start", background: f === k ? T.accentSoft : T.card, borderColor: f === k ? T.accent : T.line }}>
              <span className="mono" style={{ fontSize: 14, fontWeight: 600, paddingLeft: k.includes("/") ? 14 : 0 }}>{k}</span>
            </button>
          ))}
          <div className="callout" style={{ marginTop: 6 }}><div className="h">ESM reminder</div>Your own files: <span className="mono">./routes/recipes.js</span> with the .js. Forget it and you get ERR_MODULE_NOT_FOUND.</div>
        </Col>
        <Code size={13.5} key={f} hl={f === "server.js" ? [13] : f === "routes/recipes.js" ? [5, 17] : []}>{FILES[f]}</Code>
      </Split>
    </Slide>
  );
}

/* ============ 14. requests.http ============ */

function RequestsSlide() {
  return (
    <Slide kicker="Testing" title="Prove every route works" sub="A requests.http file is a to-do list for your API. One block per scenario, including the ones that should fail.">
      <Split cols="1.2fr 1fr">
        <Code size={13.5}>{`@base = http://localhost:3000

### Create: a good recipe (expect 201)
POST {{base}}/api/recipes
Content-Type: application/json

{ "name": "Ramen", "cuisine": "Japanese", "minutes": 40 }

### Create: a bad recipe (expect 400)
POST {{base}}/api/recipes
Content-Type: application/json

{ "name": "", "minutes": "forty" }

### Update one field (expect 200)
PATCH {{base}}/api/recipes/2
Content-Type: application/json

{ "minutes": 45 }

### Delete (expect 204, then 404 the second time)
DELETE {{base}}/api/recipes/4`}</Code>
        <Col>
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>The sad paths count too</div>
            <table className="t compact"><tbody>
              <tr><td className="mono">GET /api/recipes/99</td><td><StatusPill status={404} /></td></tr>
              <tr><td className="mono">POST with empty body</td><td><StatusPill status={400} /></td></tr>
              <tr><td className="mono">POST with broken JSON</td><td><StatusPill status={400} /></td></tr>
              <tr><td className="mono">DELETE same id twice</td><td><StatusPill status={404} /></td></tr>
              <tr><td className="mono">GET /api/desserts</td><td><StatusPill status={404} /></td></tr>
            </tbody></table>
          </div>
          <div className="callout"><div className="h">Forgot Content-Type?</div>The third block in the example requests.http leaves it out on purpose. Send it and watch req.body stay undefined.</div>
          <div className="callout info"><div className="h">Project 4 rubric</div>A request collection in your repo is listed as a plus. This file is that collection.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 15. Payoff: connect the Recipe Finder ============ */

function ConnectSlide() {
  const [cors, setCors] = useState(false);
  const [tried, setTried] = useState(false);
  return (
    <Slide kicker="The payoff" title="Your Recipe Finder, your server" sub="The Week 7 promise: useFetch points at localhost:3000 instead of dummyjson, and nothing else changes. Two terminals, two ports.">
      <Split cols="1.05fr 1fr">
        <Col>
          <Code size={14} hl={[2, 3]}>{`// src/api.js in examples/recipe-finder-client
// Week 7: "https://dummyjson.com/recipes"
export const API = "http://localhost:3000/api/recipes";

// src/App.jsx
const { data, loading, error, refetch } = useFetch(API);
// useFetch.js: the exact hook from Week 7, unchanged`}</Code>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="term" style={{ fontSize: 13 }}><div className="dim">terminal 1: recipe-box-api</div><div><span className="prompt">$ </span>npm run dev</div><div>Kitchen open at :3000</div></div>
            <div className="term" style={{ fontSize: 13 }}><div className="dim">terminal 2: recipe-finder-client</div><div><span className="prompt">$ </span>npm run dev</div><div>Local: localhost:5173</div></div>
          </div>
        </Col>
        <Col>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={"btn" + (cors ? " on" : "")} onClick={() => { setCors(!cors); setTried(false); }}>{cors ? "app.use(cors(...)) ON" : "No cors() on the server"}</button>
            <button className="btn primary" onClick={() => setTried(true)}>Load the app</button>
          </div>
          {tried && !cors && (
            <div className="term pop" style={{ fontSize: 12.5 }}>
              <div className="dim">Browser console</div>
              <div className="err" style={{ whiteSpace: "pre-wrap" }}>Access to fetch at 'http://localhost:3000/api/recipes' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.</div>
            </div>
          )}
          {tried && cors && (
            <div className="panel pop" style={{ padding: 12 }}>
              {SEED.slice(0, 4).map((r) => <div key={r.id} className="row" style={{ padding: "6px 10px", marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{r.name}</span><span className="note">{r.cuisine}, {r.minutes} min</span></div>)}
            </div>
          )}
          <div className={"callout" + (cors ? " good" : "")}>
            <div className="h">{cors ? "One line on the server fixes it" : "The wall (preview)"}</div>
            {cors ? <span className="mono" style={{ fontSize: 14 }}>npm install cors<br />app.use(cors({"{"} origin: "http://localhost:5173" {"}"}));</span> : "5173 and 3000 are different origins. The browser refuses to hand the response to your page unless the server says this origin is allowed. Full story on Nov 5."}
          </div>
          <div className="callout info"><div className="h">Live demo</div>Stop the server with Ctrl + C, reload the app: the Week 7 error state shows up. Start it, click Try again. That is the Three States Pattern against a real backend.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 16. Live-code progression ============ */

const STAGES = [
  { s: "5", cmd: "npm run stage5", title: "POST", what: "Comment out express.json() first. Send a POST from Thunder Client. req.body is undefined. Uncomment. Then send the three bad bodies.", hl: "app.use(express.json());\n\napp.post(\"/api/recipes\", (req, res) => {\n  // validate, build, push\n  res.status(201).json(recipe);\n});" },
  { s: "6", cmd: "npm run stage6", title: "PATCH + DELETE", what: "PATCH one field. DELETE id 3, then DELETE it again for the 404. Point out 204 has no body.", hl: "app.patch(\"/api/recipes/:id\", (req, res) => { ... });\n\napp.delete(\"/api/recipes/:id\", (req, res) => {\n  ...\n  res.status(204).end();\n});" },
  { s: "7", cmd: "npm run stage7", title: "Middleware", what: "Watch the log lines appear. Hit /api/nope and /api/kaboom. Then delete next() from the logger and let the room find it.", hl: "app.use(logger);\napp.use(express.json());\n// routes...\napp.use(notFound);\napp.use(errorHandler);" },
  { s: "F", cmd: "npm run dev", title: "Final, organized", what: "Same behavior, split into routes/ and middleware/. Walk the folder. Run requests.http top to bottom.", hl: "app.use(\"/api/recipes\", recipesRouter);" },
  { s: "R", cmd: "cd ../recipe-finder-client && npm run dev", title: "React meets it", what: "Two terminals. List loads, add a recipe, see the 400 message from the server in the form, delete one. Kill the server to show the error state.", hl: "export const API = \"http://localhost:3000/api/recipes\";" },
];

function ProgressionSlide() {
  const [k, setK] = useState(0);
  return (
    <Slide kicker="Live code, 40 minutes" title="Build it in five stages" sub="Students continue Tuesday's repo. Instructor runs examples/recipe-box-api, stages 5 through 7, then final/, then the client.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {STAGES.map((x, i) => (
          <button key={i} className="panel" onClick={() => setK(i)} style={{ padding: 14, textAlign: "left", cursor: "pointer", borderTop: `5px solid ${i === k ? T.accent : i < k ? T.good : T.line}`, background: i === k ? T.accentSoft : T.card }}>
            <div className="note">{x.s === "F" ? "Final" : x.s === "R" ? "Client" : `Stage ${x.s}`}</div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{x.title}</div>
          </button>
        ))}
      </div>
      <div className="pop" key={k} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14, marginTop: 14 }}>
        <div className="panel" style={{ padding: 18 }}>
          <div className="mono" style={{ color: T.accent, fontWeight: 700 }}>$ {STAGES[k].cmd}</div>
          <p className="big" style={{ marginTop: 10, fontSize: 18 }}>{STAGES[k].what}</p>
        </div>
        <Code size={13.5} numbers={false}>{STAGES[k].hl}</Code>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <div className="callout"><div className="h">Checkpoint after stage 5</div>Every laptop gets a 201 from POST in Thunder Client and sees the new recipe in GET. Nobody moves on with req.body undefined.</div>
        <div className="callout info"><div className="h">Checkpoint after stage 7</div>Terminal shows one log line per request, and /api/desserts returns JSON, not HTML.</div>
      </div>
    </Slide>
  );
}

/* ============ 17. Assignment ============ */

function AssignmentSlide() {
  return (
    <Slide kicker="Build block, 25 minutes" title="Mission 8: Run the Kitchen" sub="Same repo as Tuesday. Your server learns to write and gets an assembly line. Push to GitHub Classroom, link in Brightspace.">
      <Tiers tiers={[
        { name: "Bronze", tag: "everyone", items: ["app.use(express.json())", "POST /api/recipes saves a recipe and returns 201", "Server picks the id", "Bad body returns 400 with a reason"] },
        { name: "Silver", items: ["PATCH /api/recipes/:id updates only sent fields", "DELETE /api/recipes/:id returns 204", "Both return 404 for missing ids", "Logger middleware prints method, path, status"] },
        { name: "Gold", items: ["JSON 404 catcher after all routes", "Error handler (4 args) returns JSON 500", "validateRecipe as route-level middleware", "requests.http with 8+ requests, good and bad"] },
        { name: "Bonus", items: ["Split into routes/ and middleware/ with Router", "cors() and connect your Recipe Finder", "Collect ALL problems in one 400, not just the first"] },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginTop: 14 }}>
        <div className="callout info"><div className="h">This is Project 4's skeleton</div>Full CRUD, validation, logger, JSON errors. Tuesday you swap the array for Supabase and this exact code starts saving for real.</div>
        <div className="callout"><div className="h">Watch for</div>req.body undefined, middleware without next(), 404 catcher above routes, sending two responses.</div>
      </div>
    </Slide>
  );
}

/* ============ 18. Close ============ */

function CloseSlide() {
  return (
    <Slide kicker="Exit check, 10 minutes" title="Five questions, hands up">
      <Split cols="1.5fr 1fr">
        <Quiz questions={[
          { q: "POST arrives, req.body is undefined. Most likely cause?", options: ["Missing app.use(express.json())", "Wrong port", "Express 5 bug"], answer: 0, why: "No parser, no body. Also check the request sent Content-Type: application/json." },
          { q: "Every request hangs with no error. What did a middleware forget?", options: [{ text: "return", mono: true }, { text: "next()", mono: true }, { text: "res.end()", mono: true }], answer: 1, why: "A middleware must call next() or send a response. Doing neither strands the request." },
          { q: "What status for a successful DELETE with nothing to send back?", options: ["200", "201", "204"], answer: 2, why: "204 No Content. 201 is for creating." },
          { q: "Every route suddenly returns 404. What moved?", options: ["The logger", "The 404 catcher went above the routes", "express.json()"], answer: 1, why: "The catcher answers anything that reaches it. Above the routes, that is everything." },
          { q: "How does Express know a middleware is the error handler?", options: ["Its name", "It has four parameters", "It is in errors.js"], answer: 1, why: "(err, req, res, next). Express counts the parameters." },
        ]} />
        <Col>
          <div className="panel" style={{ padding: 18, borderTop: `5px solid ${T.amber}` }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Restart the server and your data is gone.</div>
            <p className="lead" style={{ marginTop: 8 }}>Tuesday: Supabase. Real tables, real rows, and these exact routes start reading and writing a database that survives restarts.</p>
          </div>
          <div className="callout info"><div className="h">Before Tuesday</div>Finish Mission 8 through Silver. Make a free Supabase account. Decide your Project 4 resource.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ deck ============ */

const SLIDES = [
  { el: <TitleSlide />, notes: "12:20. Click Send POST while people settle. Name the five stations; by the end of today each one is a line of code they wrote." },
  { el: <PredictSlide />, notes: "Warm-up in pairs, then reveal row by row with hands up. Row 5 is the bridge into today: path existed, method did not. Row 6 is the most common real-world answer to 'it is not working'." },
  { el: <CrudSlide />, notes: "Click C, R, U, D. Say the pattern: method is the verb, path is the noun. Only POST and PATCH carry a body. DELETE success is 204 with nothing in it." },
  { el: <PlaygroundSlide />, notes: "Click presets left to right and narrate the amber table. DELETE 3 twice for the 404. Then Restart server to show memory is not a database. Let a student drive one request." },
  { el: <BodyTrapSlide />, notes: "Start with express.json OFF and send: undefined in the terminal. Turn it ON: body arrives. Then turn the header OFF: undefined again. Point at the fetch snippet: React needs that header line." },
  { el: <ValidateSlide />, notes: "Validation ON: click Empty, minutes as text, Blank name. Then turn it OFF and click the same ones: garbage saved with 201. Sneaky id: we ignore their id. Say it: never trust the client." },
  { el: <MiddlewareIdeaSlide />, notes: "Airport security analogy. Click the three choices. Stress 'do neither' is the silent killer. Callback: express.json() was middleware all along." },
  { el: <LineSlide />, notes: "Centerpiece. Send all four requests with everything on. Then: turn off 404 catcher and send desserts (HTML 404). Turn off error handler and send kaboom (HTML stack trace). Check 'Delete next()' and send anything: hung. Ask before each click what they expect." },
  { el: <LoggerSlide />, notes: "Click lines 1, 2, 4, 6, 10, 13. Then leave the deck and add the logger to stage 6 live. Deliberate mistake: delete next(), refresh, wait in silence, let them find it." },
  { el: <OrderSlide />, notes: "It starts broken: 404 catcher above routes, everything 404s. Have the room tell you which arrow to click. Then try json below routes for the POST. Land on the rule of thumb." },
  { el: <RouteLevelSlide />, notes: "Global vs route-level. Show validateRecipe pulled out of the handler. Foreshadow Week 12: requireLogin will be route-level middleware too." },
  { el: <ErrorSlide />, notes: "Handler OFF, send: HTML stack trace with file paths. Handler ON: calm JSON. Four parameters is how Express knows. Express 5 catches async errors, old tutorials wrap everything in try/catch." },
  { el: <RouterSlide />, notes: "Click each file. In server.js line 13 mounts the router at /api/recipes, so inside the router '/' means /api/recipes. ESM .js extension reminder. This is the shape Project 4 should have." },
  { el: <RequestsSlide />, notes: "Open examples/recipe-box-api/requests.http and run it top to bottom against npm run dev. Sad paths count. The block with no Content-Type is planted on purpose." },
  { el: <ConnectSlide />, notes: "Without cors: the console error. Read the important part aloud: blocked by CORS policy. Toggle cors on, load. Then do it for real with two terminals. Kill the server to show the error state. Full CORS lesson Nov 5, keep this to 5 minutes." },
  { el: <ProgressionSlide />, notes: "Leave the deck. Stages 5, 6, 7 from examples/recipe-box-api while students extend Tuesday's repo. Checkpoints after 5 and 7. Final and Client are demo only if time is short." },
  { el: <AssignmentSlide />, notes: "25 minute timer. Circulate for req.body undefined, missing next(), notFound above routes, double responses (missing return), and Number() on params." },
  { el: <CloseSlide />, notes: "Hands up per question. Q2 and Q4 are the bugs they will actually hit tonight. Tease Tuesday: the array becomes Supabase and data survives a restart." },
];

export default function Deck() {
  return <DeckShell slides={SLIDES} />;
}
