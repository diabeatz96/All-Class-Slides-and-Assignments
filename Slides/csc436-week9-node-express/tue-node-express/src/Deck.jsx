import { useState, useEffect, useMemo } from "react";
import { T, Code, Slide, Col, Split, Reveal, Term, Tiers, Checklist, Quiz, DeckShell } from "./ui.jsx";
import { createApp, SEED, clone, pretty, STATUS_TEXT } from "./sim.js";

/* ------------------------------------------------------------------
   CSC 436  |  Week 9, Tuesday Oct 20  |  Mission 7
   Node + Express, ESM Head-On. First backend lesson, ever.
   Thread: the Recipe Finder from Week 7 finally gets its own server.
   Color code: blue = browser, teal = server, amber = database.
------------------------------------------------------------------- */

/* ============ shared bits ============ */

function Box({ color, soft, title, sub, active, onClick, style }) {
  return (
    <button onClick={onClick} className="panel" style={{
      padding: "16px 18px", textAlign: "left", cursor: onClick ? "pointer" : "default",
      borderColor: active ? color : T.line, background: active ? soft : T.card,
      boxShadow: active ? `0 0 0 3px ${soft}` : "none", transition: "all .15s", ...style,
    }}>
      <div style={{ fontWeight: 800, fontSize: 18, color }}>{title}</div>
      {sub && <div className="note" style={{ marginTop: 4 }}>{sub}</div>}
    </button>
  );
}

function StatusPill({ status }) {
  const cls = status >= 500 ? "warn" : status >= 400 ? "amber" : "good";
  return <span className={`chip ${cls}`}>{status} {STATUS_TEXT[status] || ""}</span>;
}

/* ============ 1. Title ============ */

function TitleSlide() {
  const [phase, setPhase] = useState(-1);
  useEffect(() => {
    if (phase < 0 || phase > 3) return;
    const t = setTimeout(() => setPhase(phase + 1), 650);
    return () => clearTimeout(t);
  }, [phase]);
  const stops = [
    { label: "Your React app", sub: "localhost:5173", c: T.blue, s: T.blueSoft },
    { label: "Your Express server", sub: "localhost:3000", c: T.accent, s: T.accentSoft },
    { label: "Data", sub: "an array today, Supabase next week", c: T.amber, s: T.amberSoft },
  ];
  const lit = (k) => (phase === 0 && k === 0) || (phase === 1 && k === 1) || (phase === 2 && k === 2) || (phase === 3 && k === 1) || (phase === 4 && k === 0);
  const msg = ["The app asks for recipes...", "...the server gets the request...", "...looks up the data...", "...and sends JSON back.", "Round trip complete. Today you build the middle box."];
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.15fr 1fr", alignItems: "center", padding: "0 70px", gap: 50 }}>
      <div>
        <div className="kicker">CSC 436, Week 9, Mission 7, Tuesday Oct 20</div>
        <h1 style={{ fontSize: 64, lineHeight: 1.0, fontWeight: 800 }}>Your first server</h1>
        <p className="lead" style={{ marginTop: 20, maxWidth: 560, fontSize: 21 }}>
          For seven weeks your apps asked other people's servers for data. Today you stop asking. You become the server.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <span className="chip">Node</span><span className="chip">Express</span><span className="chip warn">ESM, not CommonJS</span><span className="chip blue">Project 4 assigned</span>
        </div>
      </div>
      <div className="panel" style={{ padding: 22 }}>
        <Col gap={10}>
          {stops.map((s, k) => (
            <div key={k} className="row" style={{ borderColor: lit(k) ? s.c : T.line, background: lit(k) ? s.s : T.card, transition: "all .2s", padding: "14px 16px" }}>
              <div>
                <div style={{ fontWeight: 800, color: s.c }}>{s.label}</div>
                <div className="note mono" style={{ fontSize: 13 }}>{s.sub}</div>
              </div>
              {k === 1 && <span className="chip">today</span>}
            </div>
          ))}
          <div className="note" style={{ minHeight: 20 }}>{phase >= 0 ? msg[Math.min(phase, 4)] : "Click to watch one request travel."}</div>
          <button className="btn primary" onClick={() => setPhase(0)}>Send a request</button>
        </Col>
      </div>
    </div>
  );
}

/* ============ 2. Warm-up: where does this run? ============ */

const WHERE = [
  { t: "Show a button that says Add to cart", a: "browser", why: "Anything the user sees or clicks lives in the browser." },
  { t: "Store the secret key for a paid AI API", a: "server", why: "Everything in the browser can be read with View Source. Secrets live on the server." },
  { t: "Remember which tab the user has open", a: "browser", why: "Personal UI state. useState or localStorage is perfect." },
  { t: "Save a new recipe so EVERY user can see it", a: "server", why: "localStorage is one browser on one laptop. Shared data needs one place everyone talks to." },
  { t: "Check that a price is not set to $0 before an order is saved", a: "server", why: "Users can edit browser code. Rules that matter must be enforced where they cannot touch them." },
  { t: "Highlight an input red while the user types", a: "browser", why: "Instant feedback belongs in the UI. (The server should still double check on save.)" },
  { t: "Read and write a database", a: "server", why: "Database passwords never ship to browsers. The server is the only one with the key." },
  { t: "Count how many users signed up today", a: "server", why: "No single browser knows about other users. Only the server sees everyone." },
];

function WhereSlide() {
  const [ans, setAns] = useState({});
  const score = WHERE.filter((w, i) => ans[i] === w.a).length;
  const done = Object.keys(ans).length === WHERE.length;
  return (
    <Slide kicker="Warm-up, 15 minutes, pairs" title="Where does this code run?" sub="No backend knowledge needed. Use your gut. Click Browser or Server for each job.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {WHERE.map((w, i) => {
          const picked = ans[i];
          const right = picked === w.a;
          return (
            <div key={i} className="panel" style={{ padding: "10px 14px", borderColor: picked ? (right ? T.good : T.warn) : T.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{w.t}</div>
                <div style={{ display: "flex", gap: 6, flex: "none" }}>
                  <button className="btn small" style={picked === "browser" ? { background: T.blue, color: "#fff", borderColor: T.blue } : {}} onClick={() => setAns({ ...ans, [i]: "browser" })}>Browser</button>
                  <button className="btn small" style={picked === "server" ? { background: T.accent, color: "#fff", borderColor: T.accent } : {}} onClick={() => setAns({ ...ans, [i]: "server" })}>Server</button>
                </div>
              </div>
              {picked && <div className="note pop" style={{ marginTop: 6, color: right ? T.good : T.warn }}>{right ? "Yes. " : `Answer: ${w.a === "server" ? "Server" : "Browser"}. `}<span style={{ color: T.muted }}>{w.why}</span></div>}
            </div>
          );
        })}
      </div>
      {done && <div className="callout good pop" style={{ marginTop: 14 }}><div className="h">{score} / {WHERE.length}</div>Notice the pattern: secrets, shared data, and rules all landed on the server. That is the whole reason backends exist.</div>}
    </Slide>
  );
}

/* ============ 3. The restaurant ============ */

const DINER = [
  { k: "dining", title: "Dining room", sub: "The frontend", c: T.blue, s: T.blueSoft,
    body: "What customers see: tables, menus, decor. They point at things and ask for things. They never walk into the kitchen.",
    stack: "Your React app. Runs in the browser on localhost:5173." },
  { k: "waiter", title: "Waiter", sub: "HTTP", c: T.ink, s: "#eef0f3",
    body: "Carries an order (a request) to the kitchen and brings food (a response) back. Every order has the same format so any kitchen can read it.",
    stack: "fetch() sends an HTTP request. The response comes back with a status code and a body." },
  { k: "kitchen", title: "Kitchen", sub: "The server", c: T.accent, s: T.accentSoft,
    body: "Reads the order, follows the recipes, says no to impossible orders, and plates the food. Customers trust what comes out because they cannot see in.",
    stack: "Your Express server. Runs in Node on localhost:3000. Today's job." },
  { k: "pantry", title: "Pantry", sub: "The database", c: T.amber, s: T.amberSoft,
    body: "Where ingredients are stored. Only the kitchen has the key. Customers do not get to rummage.",
    stack: "An array in memory today. Supabase next Tuesday." },
];

function RestaurantSlide() {
  const [pick, setPick] = useState("kitchen");
  const d = DINER.find((x) => x.k === pick);
  return (
    <Slide kicker="The big picture" title="A web app is a restaurant" sub="Click each part. Keep this picture in your head all semester; every new tool is one of these four.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, alignItems: "stretch" }}>
        {DINER.map((x, i) => (
          <div key={x.k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Box color={x.c} soft={x.s} title={x.title} sub={x.sub} active={pick === x.k} onClick={() => setPick(x.k)} style={{ flex: 1, minHeight: 92 }} />
            {i < 3 && <span style={{ color: T.muted, fontSize: 22 }}>{"↔"}</span>}
          </div>
        ))}
      </div>
      <div className="panel pop" key={pick} style={{ marginTop: 18, padding: "20px 24px", borderLeft: `5px solid ${d.c}` }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: d.c }}>{d.title}: {d.sub}</div>
        <p className="big" style={{ marginTop: 8 }}>{d.body}</p>
        <p className="lead" style={{ marginTop: 10 }}><b style={{ color: T.ink }}>In our stack: </b>{d.stack}</p>
      </div>
      <div className="callout info" style={{ marginTop: 16 }}>
        <div className="h">The one sentence to remember</div>
        The frontend asks. The backend decides. The database remembers.
      </div>
    </Slide>
  );
}

/* ============ 4. Why a backend? three demos ============ */

function WhySlide() {
  const [tab, setTab] = useState("shared");
  return (
    <Slide kicker="Why bother?" title="Three things a browser can never do alone">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["shared", "1. Share data"], ["secret", "2. Keep secrets"], ["rules", "3. Enforce rules"]].map(([k, l]) => (
          <button key={k} className={"btn" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "shared" && <SharedDemo />}
      {tab === "secret" && <SecretDemo />}
      {tab === "rules" && <RulesDemo />}
    </Slide>
  );
}

function SharedDemo() {
  const [mode, setMode] = useState("local");
  const [a, setA] = useState(["Pad Thai"]);
  const [b, setB] = useState(["Pad Thai"]);
  const [server, setServer] = useState(["Pad Thai"]);
  const [text, setText] = useState("Ramen");
  const add = () => {
    if (!text.trim()) return;
    if (mode === "local") setA([...a, text]);
    else setServer([...server, text]);
    setText("");
  };
  const listA = mode === "local" ? a : server;
  const listB = mode === "local" ? b : server;
  return (
    <Split cols="1fr 1fr 1.1fr">
      {[["Maria's laptop", listA, true], ["Jay's phone", listB, false]].map(([who, list, canAdd]) => (
        <div key={who} className="panel" style={{ padding: 16, borderTop: `4px solid ${T.blue}` }}>
          <div style={{ fontWeight: 800, color: T.blue }}>{who}</div>
          <Col gap={6} style={{ marginTop: 10 }}>
            {list.map((r, i) => <div key={i} className="row" style={{ padding: "8px 12px" }}>{r}</div>)}
          </Col>
          {canAdd && (
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="New recipe" />
              <button className="btn primary" onClick={add}>Add</button>
            </div>
          )}
        </div>
      ))}
      <Col>
        <div style={{ display: "flex", gap: 6 }}>
          <button className={"btn small" + (mode === "local" ? " on" : "")} onClick={() => setMode("local")}>Saved in localStorage</button>
          <button className={"btn small" + (mode === "server" ? " on" : "")} onClick={() => setMode("server")}>Saved on a server</button>
        </div>
        {mode === "local" ? (
          <div className="callout"><div className="h">Maria adds Ramen. Jay never sees it.</div>localStorage lives inside one browser on one device. It is a sticky note on Maria's laptop, not a shared fridge.</div>
        ) : (
          <div className="callout good"><div className="h">One kitchen, everybody eats</div>Both devices ask the same server. Add on the laptop, and the phone sees it on the next fetch. This is every app you use: Instagram, Discord, your bank.</div>
        )}
        <div className="panel" style={{ padding: 12, borderTop: `4px solid ${T.accent}`, opacity: mode === "server" ? 1 : 0.35 }}>
          <div style={{ fontWeight: 800, color: T.accent, fontSize: 14 }}>Server: /api/recipes</div>
          <div className="mono note" style={{ fontSize: 13, marginTop: 6 }}>{JSON.stringify(server)}</div>
        </div>
      </Col>
    </Split>
  );
}

function SecretDemo() {
  const [peek, setPeek] = useState(false);
  return (
    <Split cols="1.1fr 1fr">
      <Col>
        <Code size={14}>{`// src/App.jsx   (Week 7, remember this slide?)
const KEY = "sk-live-9f3a7c2e41b8d0"

useEffect(() => {
  fetch(\`https://api.example.com/recipes?key=\${KEY}\`)
}, [])`}</Code>
        <button className="btn" onClick={() => setPeek(!peek)}>{peek ? "Hide" : "Open DevTools on the live site"}</button>
        {peek && (
          <div className="term pop" style={{ fontSize: 13 }}>
            <div className="dim">Network  &gt;  recipes?key=...  &gt;  Headers</div>
            <div>Request URL: https://api.example.com/recipes?<span className="err">key=sk-live-9f3a7c2e41b8d0</span></div>
            <div className="dim" style={{ marginTop: 8 }}>Sources  &gt;  assets/index-a81f.js</div>
            <div>...const <span className="err">KEY="sk-live-9f3a7c2e41b8d0"</span>;function App()...</div>
          </div>
        )}
      </Col>
      <Col>
        <div className="callout"><div className="h">Everything in src/ ships to every visitor</div>Vite bundles your code into a .js file and hands it to the browser. A key in there is a key on a billboard. Someone runs up your bill by lunch.</div>
        <div className="callout good"><div className="h">The fix is a server</div>React calls <i>your</i> server. Your server holds the key in an environment variable and calls the real API. The key never leaves the kitchen.</div>
      </Col>
    </Split>
  );
}

function RulesDemo() {
  const [price, setPrice] = useState(18);
  const [result, setResult] = useState(null);
  return (
    <Split cols="1fr 1fr">
      <Col>
        <div className="panel" style={{ padding: 16, borderTop: `4px solid ${T.blue}` }}>
          <div style={{ fontWeight: 800, color: T.blue }}>Checkout (browser)</div>
          <div className="note" style={{ marginTop: 4 }}>A sneaky user opened DevTools and can change the price before it is sent.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
            <span>Pad Thai x 1, price sent: $</span>
            <input className="field" style={{ width: 90 }} type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn" onClick={() => setResult({ trust: true, price })}>Server that trusts the browser</button>
            <button className="btn primary" onClick={() => setResult({ trust: false, price })}>Server that checks</button>
          </div>
        </div>
      </Col>
      <Col>
        {!result && <p className="lead">Set the price to 0 and try both servers.</p>}
        {result && result.trust && <div className={"callout pop" + (result.price === 18 ? " good" : "")}><div className="h">Order saved at ${result.price}</div>{result.price === 18 ? "Fine this time." : "The kitchen just gave away food. The browser said so, and the server believed it."}</div>}
        {result && !result.trust && (
          <div className={"callout pop" + (result.price === 18 ? " good" : "")}>
            <div className="h">{result.price === 18 ? "201 Created" : "400 Bad Request"}</div>
            {result.price === 18 ? "Price matches the menu. Saved." : "The server looked up the real price ($18) in its own data and ignored what the browser sent."}
          </div>
        )}
        <div className="callout info"><div className="h">Rule of the semester</div>Never trust the client. Validate in the browser for speed, validate on the server for truth.</div>
      </Col>
    </Split>
  );
}

/* ============ 5. Where we are in the stack ============ */

function StackSlide() {
  const [week, setWeek] = useState(9);
  const hops = [
    { w: [1, 2, 3, 4, 5, 6, 7, 8], label: "React in the browser", sub: "localhost:5173", c: T.blue, s: T.blueSoft },
    { w: [9, 10, 11], label: "Express server in Node", sub: "localhost:3000", c: T.accent, s: T.accentSoft },
    { w: [10, 11], label: "Supabase database", sub: "Postgres in the cloud", c: T.amber, s: T.amberSoft },
    { w: [11], label: "Deployed on Render", sub: "a real URL anyone can hit", c: T.ink, s: "#eef0f3" },
  ];
  const label = { 7: "Week 7: you fetched dummyjson", 9: "Week 9 (today): build the server, data in an array", 10: "Week 10: swap the array for Supabase", 11: "Week 11: put it on the internet" };
  return (
    <Slide kicker="The map" title="Where today fits" sub="Project 4 is this whole middle column. We build it one layer at a time.">
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[7, 9, 10, 11].map((w) => <button key={w} className={"btn small" + (week === w ? " on" : "")} onClick={() => setWeek(w)}>Week {w}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {hops.map((h, i) => {
          const on = h.w.includes(week) || (week === 7 && i === 0);
          return (
            <div key={i} className="panel" style={{ padding: 18, minHeight: 140, borderTop: `5px solid ${on ? h.c : T.line}`, background: on ? h.s : T.card, opacity: on ? 1 : 0.45, transition: "all .2s" }}>
              <div style={{ fontWeight: 800, color: h.c, fontSize: 18 }}>{h.label}</div>
              <div className="mono note" style={{ marginTop: 6 }}>{h.sub}</div>
            </div>
          );
        })}
      </div>
      <p className="big" style={{ marginTop: 18 }}>{label[week]}</p>
      {week === 7 && <div className="callout info" style={{ marginTop: 12 }}><div className="h">Callback</div>In Week 7 the middle box belonged to dummyjson.com. Somebody wrote a server so you could fetch from it. Today that somebody is you.</div>}
      <div className="panel" style={{ marginTop: "auto", padding: "14px 18px" }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Today's plan</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {[["12:20", "Warm-up", "where does it run?"], ["12:35", "Big ideas", "restaurant, Node, npm, ESM, HTTP"], ["1:00", "Live code", "five stages, you type along"], ["1:40", "Build", "Mission 7: Open the Kitchen"], ["2:05", "Exit check", "five questions"]].map(([t, h, d]) => (
            <div key={t} style={{ borderLeft: `3px solid ${T.accent}`, paddingLeft: 10 }}>
              <div className="mono note" style={{ fontSize: 12 }}>{t}</div>
              <div style={{ fontWeight: 700 }}>{h}</div>
              <div className="note" style={{ fontSize: 13 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  );
}

/* ============ 6. What is Node? ============ */

const GLOBALS = [
  { name: "document", b: true, n: false, why: "The page. Node has no page." },
  { name: "window", b: true, n: false, why: "The browser tab. No tab in Node." },
  { name: "localStorage", b: true, n: false, why: "Browser storage. Node uses files and databases." },
  { name: "alert()", b: true, n: false, why: "Pops a dialog. Who would see it? There is no screen." },
  { name: "console.log()", b: true, n: true, why: "In Node it prints to the terminal, not DevTools." },
  { name: "fetch()", b: true, n: true, why: "Built into modern Node too. Servers call other servers." },
  { name: "process", b: false, n: true, why: "Info about the running program: process.env holds secrets." },
  { name: "fs (file system)", b: false, n: true, why: "Read and write files on the computer. Browsers are sandboxed away from your disk." },
  { name: "listen on a port", b: false, n: true, why: "Wait for requests from other machines. This is what makes it a server." },
];

function NodeSlide() {
  const [env, setEnv] = useState("browser");
  return (
    <Slide kicker="Concept" title="Node is JavaScript without the browser" sub="Same language you already know. Different place to run it. Toggle the environment and watch what exists.">
      <Split cols="1fr 1.15fr">
        <Col>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" style={env === "browser" ? { background: T.blue, color: "#fff", borderColor: T.blue } : {}} onClick={() => setEnv("browser")}>In the browser</button>
            <button className="btn" style={env === "node" ? { background: T.accent, color: "#fff", borderColor: T.accent } : {}} onClick={() => setEnv("node")}>In Node</button>
          </div>
          <div className="panel" style={{ padding: 18 }}>
            <p className="big"><b>2009:</b> someone took the JavaScript engine out of Chrome (V8) and let it run on its own, with access to files, the network, and the operating system.</p>
            <p className="lead" style={{ marginTop: 10 }}>That program is <b style={{ color: T.ink }}>Node</b>. You type <span className="mono">node file.js</span> in a terminal and your JavaScript runs, no browser, no HTML.</p>
          </div>
          <div className="callout info"><div className="h">So what is Express?</div>Node can talk HTTP, but it is wordy. Express is a small library (an npm package) that makes "when this request comes in, send that back" a one-liner. Node is the engine. Express is the steering wheel.</div>
        </Col>
        <div className="panel" style={{ padding: 6 }}>
          <table className="t compact">
            <thead><tr><th>Thing</th><th style={{ width: 80 }}>Exists?</th><th>Why</th></tr></thead>
            <tbody>
              {GLOBALS.map((g) => {
                const yes = env === "browser" ? g.b : g.n;
                return (
                  <tr key={g.name} style={{ opacity: yes ? 1 : 0.55 }}>
                    <td className="mono" style={{ fontWeight: 600 }}>{g.name}</td>
                    <td><span className={`chip ${yes ? "good" : "warn"}`}>{yes ? "yes" : "no"}</span></td>
                    <td className="note">{g.why}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Split>
    </Slide>
  );
}

/* ============ 7. Terminal 101 ============ */

function TerminalSlide() {
  const script = [
    { cmd: "node -v", out: "v22.11.0" },
    { cmd: "npm -v", out: "10.9.0" },
    { cmd: "node -e \"console.log(2 + 2)\"", out: "4" },
    { cmd: "cat hello.js", out: "console.log(\"Hello from Node, not the browser\");\nconsole.log(\"Today is\", new Date().toDateString());" },
    { cmd: "node hello.js", out: "Hello from Node, not the browser\nToday is Tue Oct 20 2026" },
    { cmd: "node server.js", out: "Kitchen open at http://localhost:3000\n(the cursor just sits here. The server is waiting for requests. It did not freeze.)" },
    { cmd: "^C   (Ctrl + C)", out: "Server stopped. The terminal is yours again." },
  ];
  return (
    <Slide kicker="Hands on keyboards" title="The terminal is where servers live" sub="Everyone opens a terminal (VS Code: Ctrl + backtick) and types along. Click to run each command.">
      <Split cols="1.25fr 1fr">
        <Term script={script} height={360} title="~/csc436/week9" />
        <Col>
          <div className="callout"><div className="h">The number one confusion today</div>When a server is running, the terminal looks frozen. It is not. It is listening. To run another command, open a second terminal tab.</div>
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Three keys to know cold</div>
            <table className="t">
              <tbody>
                <tr><td className="mono">Ctrl + C</td><td>stop the running server</td></tr>
                <tr><td className="mono">Up arrow</td><td>bring back the last command</td></tr>
                <tr><td className="mono">Tab</td><td>autocomplete a file or folder name</td></tr>
              </tbody>
            </table>
          </div>
          <div className="callout info"><div className="h">No node -v?</div>Install Node LTS from nodejs.org, then close and reopen the terminal. Or use the Codespace, it already has Node.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 8. npm + package.json ============ */

const PKG_LINES = `{
  "name": "recipe-box-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}`;

const PKG_EXPLAIN = {
  2: ["name", "Your project's name. Lowercase, no spaces. npm init -y fills it in from the folder name."],
  3: ["version", "Only matters if you publish to npm. Ignore it."],
  4: ["\"type\": \"module\"", "THE most important line in this file today. It tells Node: use import and export (ESM). Without it, Node assumes the old require() style, and every import line you write will crash."],
  5: ["scripts", "Shortcuts. npm run dev runs whatever is next to \"dev\". You will type npm run dev a thousand times this semester."],
  6: ["node --watch", "Restarts the server every time you save. Without it, you edit code, refresh, and nothing changes, because the old server is still running the old code."],
  7: ["start", "How Render will launch your server in Week 11. No --watch in production."],
  9: ["dependencies", "Packages your project needs. npm install express adds a line here and downloads the code into node_modules."],
  10: ["\"express\": \"^5.1.0\"", "The ^ means \"5.1.0 or any newer 5.x\". Express 5 is current. Old tutorials use Express 4; most code is the same."],
};

function PackageSlide() {
  const [line, setLine] = useState(4);
  const info = PKG_EXPLAIN[line];
  return (
    <Slide kicker="Concept" title="npm and package.json" sub="npm is the app store for JavaScript code. package.json is your project's ID card. Click a line.">
      <Split cols="1fr 1.1fr">
        <Code hl={[line]} onLine={(n) => PKG_EXPLAIN[n] && setLine(n)} size={17}>{PKG_LINES}</Code>
        <Col>
          <div className="panel pop" key={line} style={{ padding: 20, minHeight: 150, borderLeft: `5px solid ${line === 4 ? T.warn : T.accent}` }}>
            <div className="mono" style={{ fontWeight: 700, fontSize: 18, color: line === 4 ? T.warn : T.accent }}>{info?.[0]}</div>
            <p className="big" style={{ marginTop: 8, fontSize: 19 }}>{info?.[1]}</p>
          </div>
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>The four commands, in order</div>
            <table className="t">
              <tbody>
                <tr><td className="mono">npm init -y</td><td>make package.json</td></tr>
                <tr><td className="mono">npm pkg set type=module</td><td>add the ESM line (or type it by hand)</td></tr>
                <tr><td className="mono">npm install express</td><td>download Express into node_modules</td></tr>
                <tr><td className="mono">npm run dev</td><td>start the server</td></tr>
              </tbody>
            </table>
          </div>
          <div className="callout"><div className="h">node_modules never goes on GitHub</div>It can be 50,000 files. Put it in .gitignore. Anyone can rebuild it with npm install, because package.json lists what to download.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 9. ESM head-on ============ */

function EsmSlide() {
  return (
    <Slide kicker="Memorize this slide" title="ESM vs CommonJS: the landmine" sub="JavaScript has two ways to share code between files. We use ESM. Most of the internet still pastes the other one.">
      <Split cols="1fr 1fr">
        <div className="panel" style={{ padding: 16, borderTop: `5px solid ${T.good}` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><b style={{ color: T.good, fontSize: 18 }}>ESM (what we use)</b><span className="chip good">import / export</span></div>
          <Code size={15} style={{ marginTop: 10 }}>{`// package.json has "type": "module"

import express from "express";
import { recipes } from "./data/recipes.js";

export function findRecipe(id) { ... }
export default router;`}</Code>
          <p className="note" style={{ marginTop: 8 }}>Same syntax as your React code. Same syntax as the browser. One way to write JavaScript everywhere.</p>
        </div>
        <div className="panel" style={{ padding: 16, borderTop: `5px solid ${T.warn}` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><b style={{ color: T.warn, fontSize: 18 }}>CommonJS (old, do not paste)</b><span className="chip warn">require / module.exports</span></div>
          <Code size={15} style={{ marginTop: 10 }}>{`// no "type": "module"

const express = require("express");
const { recipes } = require("./data/recipes");

exports.findRecipe = function (id) { ... };
module.exports = router;`}</Code>
          <p className="note" style={{ marginTop: 8 }}>Node's original style from 2009. Still in most tutorials, Stack Overflow answers, and a lot of AI output.</p>
        </div>
      </Split>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
        <div className="callout good"><div className="h">Rule 1</div>"type": "module" in package.json. Check it first, every time.</div>
        <div className="callout good"><div className="h">Rule 2</div>Your own files need the .js on the end: <span className="mono">"./data/recipes.js"</span>. Packages do not: <span className="mono">"express"</span>.</div>
        <div className="callout good"><div className="h">Rule 3</div>If you see require, translate it before you run it. Never mix the two in one project.</div>
      </div>
    </Slide>
  );
}

/* ============ 10. Spot it + error decoder ============ */

const SPOT = [
  { code: `import cors from "cors";`, a: "esm" },
  { code: `const fs = require("fs");`, a: "cjs" },
  { code: `module.exports = app;`, a: "cjs" },
  { code: `export default function logger() {}`, a: "esm" },
  { code: `import { Router } from "express";`, a: "esm" },
  { code: `const { Router } = require("express");`, a: "cjs" },
];

const ERRORS = [
  { msg: "ReferenceError: require is not defined in ES module scope, you can use import instead", means: "You pasted CommonJS into an ESM project.", fix: "Change require(...) to import ... from ..." },
  { msg: "SyntaxError: Cannot use import statement outside a module", means: "You wrote ESM but package.json is missing \"type\": \"module\".", fix: "Add \"type\": \"module\" to package.json." },
  { msg: "Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/.../data/recipes' imported from /.../server.js", means: "Your own file import is missing the .js extension (or the path is wrong).", fix: "Write \"./data/recipes.js\" with the extension." },
  { msg: "ReferenceError: module is not defined in ES module scope", means: "module.exports in an ESM file.", fix: "Use export default or a named export." },
];

function SpotSlide() {
  const [ans, setAns] = useState({});
  const [err, setErr] = useState(0);
  return (
    <Slide kicker="Practice" title="Spot it, then decode it">
      <Split cols="1fr 1.15fr">
        <Col gap={8}>
          <div className="note">Click ESM or CJS for each line. Call it out loud as a class.</div>
          {SPOT.map((s, i) => {
            const p = ans[i];
            const right = p === s.a;
            return (
              <div key={i} className="row" style={{ borderColor: p ? (right ? T.good : T.warn) : T.line, padding: "8px 12px" }}>
                <span className="mono" style={{ fontSize: 14 }}>{s.code}</span>
                <span style={{ display: "flex", gap: 6, flex: "none" }}>
                  {["esm", "cjs"].map((k) => (
                    <button key={k} className="btn small" style={p === k ? { background: right ? T.good : T.warn, color: "#fff", borderColor: "transparent" } : {}} onClick={() => setAns({ ...ans, [i]: k })}>{k.toUpperCase()}</button>
                  ))}
                </span>
              </div>
            );
          })}
        </Col>
        <Col>
          <div className="note">Error decoder. These are the exact messages you will see. Click through them.</div>
          <div style={{ display: "flex", gap: 6 }}>{ERRORS.map((_, i) => <button key={i} className={"btn small" + (err === i ? " on" : "")} onClick={() => setErr(i)}>Error {i + 1}</button>)}</div>
          <div className="term pop" key={err} style={{ fontSize: 14 }}>
            <div className="dim">$ npm run dev</div>
            <div className="err" style={{ whiteSpace: "pre-wrap" }}>{ERRORS[err].msg}</div>
          </div>
          <div className="panel" style={{ padding: 16 }}>
            <div><b>What it means: </b>{ERRORS[err].means}</div>
            <div style={{ marginTop: 6, color: T.good }}><b>Fix: </b>{ERRORS[err].fix}</div>
          </div>
          <div className="callout"><div className="h">Live demo</div>In the example repo: <span className="mono">npm run oops</span>. It crashes on purpose. Fix it together.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 11. HTTP in one slide ============ */

function HttpSlide() {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/api/recipes/3");
  const body = method === "POST" ? `{ "name": "Ramen", "cuisine": "Japanese", "minutes": 40 }` : "";
  const resp = useMemo(() => {
    const m = path.match(/^\/api\/recipes\/?(\d+)?$/);
    if (!m) return { s: 404, b: `{ "error": "No route for ${method} ${path}" }` };
    if (method === "GET" && !m[1]) return { s: 200, b: `[ { "id": 1, "name": "Margherita Pizza", ... }, ... ]` };
    if (method === "GET") { const r = SEED.find((x) => x.id === Number(m[1])); return r ? { s: 200, b: JSON.stringify(r) } : { s: 404, b: `{ "error": "No recipe with id ${m[1]}" }` }; }
    if (method === "POST" && !m[1]) return { s: 201, b: `{ "id": 7, "name": "Ramen", "cuisine": "Japanese", "minutes": 40 }` };
    if (method === "DELETE" && m[1]) return { s: 204, b: "" };
    return { s: 404, b: `{ "error": "No route for ${method} ${path}" }` };
  }, [method, path]);
  return (
    <Slide kicker="Concept" title="HTTP: the order slip" sub="Every request and every response has the same parts. This is the waiter's notepad. Change the method and path.">
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
        {["GET", "POST", "DELETE"].map((m) => <button key={m} className={"btn small" + (method === m ? " on" : "")} onClick={() => { setMethod(m); setPath(m === "POST" ? "/api/recipes" : "/api/recipes/3"); }}>{m}</button>)}
        <input className="field mono" style={{ width: 360 }} value={path} onChange={(e) => setPath(e.target.value)} />
        <span className="note">try /api/recipes, /api/recipes/99, /api/menu</span>
      </div>
      <Split cols="1fr 1fr">
        <Col>
          <div style={{ fontWeight: 800, color: T.blue }}>Request (browser to server)</div>
          <div className="term" style={{ fontSize: 15, minHeight: 200 }}>
            <div><span style={{ color: "#93c5fd" }}>{method}</span> <span style={{ color: "#fde68a" }}>{path}</span> HTTP/1.1</div>
            <div className="dim">Host: localhost:3000</div>
            {body && <div className="dim">Content-Type: application/json</div>}
            {body && <div style={{ marginTop: 10, color: "#a5d6a7" }}>{body}</div>}
          </div>
          <table className="t"><tbody>
            <tr><td><span className="chip blue">method</span></td><td>the verb: GET reads, POST creates, DELETE removes</td></tr>
            <tr><td><span className="chip blue">path</span></td><td>the noun: which thing on the server</td></tr>
            <tr><td><span className="chip blue">body</span></td><td>data you are sending (GET has none)</td></tr>
          </tbody></table>
        </Col>
        <Col>
          <div style={{ fontWeight: 800, color: T.accent }}>Response (server to browser)</div>
          <div className="term pop" key={method + path} style={{ fontSize: 15, minHeight: 200 }}>
            <div>HTTP/1.1 <span style={{ color: resp.s < 300 ? "#86efac" : "#fca5a5" }}>{resp.s} {STATUS_TEXT[resp.s]}</span></div>
            <div className="dim">Content-Type: application/json</div>
            <div style={{ marginTop: 10, color: "#a5d6a7", whiteSpace: "pre-wrap" }}>{resp.b || "(no body)"}</div>
          </div>
          <table className="t"><tbody>
            <tr><td><span className="chip">status</span></td><td>a number that says how it went</td></tr>
            <tr><td><span className="chip">headers</span></td><td>labels, like "this is JSON"</td></tr>
            <tr><td><span className="chip">body</span></td><td>the actual data</td></tr>
          </tbody></table>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 12. Status codes ============ */

const CODES = [
  { c: 200, line: "Here is your food.", when: "Any successful GET, PATCH." },
  { c: 201, line: "Your new dish is on the menu.", when: "POST created something." },
  { c: 204, line: "Done. Nothing to hand you.", when: "DELETE worked." },
  { c: 400, line: "That order makes no sense.", when: "Bad input: missing name, minutes is \"forty\"." },
  { c: 404, line: "We do not have that.", when: "No recipe with that id, or no route at all." },
  { c: 500, line: "The kitchen is on fire.", when: "Your code crashed. Not the user's fault." },
];

function StatusSlide() {
  const [open, setOpen] = useState(null);
  return (
    <Slide kicker="Concept" title="Status codes, in waiter language" sub="First digit tells you who is to blame. 2 = it worked. 4 = the customer messed up. 5 = the kitchen messed up.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {CODES.map((x) => (
          <button key={x.c} className="panel" onClick={() => setOpen(x.c)} style={{ padding: 18, textAlign: "left", cursor: "pointer", borderTop: `5px solid ${x.c >= 500 ? T.warn : x.c >= 400 ? T.amber : T.good}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: x.c >= 500 ? T.warn : x.c >= 400 ? T.amber : T.good }}>{x.c}</span>
              <span className="note">{STATUS_TEXT[x.c]}</span>
            </div>
            <div className="big" style={{ fontSize: 19, marginTop: 4 }}>"{x.line}"</div>
            {open === x.c && <div className="note pop" style={{ marginTop: 8 }}><b>Use it when: </b>{x.when}</div>}
          </button>
        ))}
      </div>
      <div className="callout info" style={{ marginTop: 18 }}><div className="h">Why this matters for React</div>Your useFetch checks <span className="mono">res.ok</span>. That is true for 200 to 299 and false for everything else. If your server sends 200 with an error message inside, the frontend thinks it worked. Send the honest code.</div>
    </Slide>
  );
}

/* ============ 13. Hello Express, line by line ============ */

const HELLO = `import express from "express";

const app = express();
const PORT = 3000;
const recipes = [ /* six recipe objects */ ];

app.get("/", (req, res) => {
  res.send("Welcome to the Recipe Box kitchen.");
});

app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

app.listen(PORT, () => {
  console.log(\`Kitchen open at http://localhost:\${PORT}\`);
});`;

const HELLO_X = {
  1: { h: "Bring in Express", b: "ESM import. This works because package.json says \"type\": \"module\". \"express\" has no ./ and no .js because it is a package from node_modules." },
  3: { h: "Make the app", b: "express() builds your server object. Everything else hangs off app. One app per project." },
  4: { h: "Pick a port", b: "A port is a numbered door on your computer. Vite already uses 5173. We take 3000. Two programs cannot share a door." },
  5: { h: "Fake data", b: "An array of objects, same shape dummyjson sent you. It lives in memory, so it resets every restart. Supabase replaces it next week." },
  7: { h: "A route", b: "Read it out loud: \"When a GET request arrives for the path /, run this function.\" Method + path + handler. That is a route." },
  8: { h: "req and res", b: "req is the order slip that came in (method, path, params, body). res is the plate you send back. You get both every time." },
  11: { h: "A JSON route", b: "/api/recipes is the path your React app will fetch. Starting data paths with /api is a convention that keeps them apart from pages." },
  12: { h: "res.json()", b: "Turns an array or object into JSON text and sets Content-Type: application/json. This is exactly what dummyjson did for you in Week 7." },
  15: { h: "Open the doors", b: "listen starts the server. The program does not end here. It waits. Forever. Until Ctrl + C." },
  16: { h: "Proof of life", b: "This console.log prints in the terminal, not in the browser. If you do not see it, the server is not running." },
};

function HelloSlide() {
  const [line, setLine] = useState(7);
  const x = HELLO_X[line];
  return (
    <Slide kicker="Code walkthrough" title="Hello, Express" sub="Seventeen lines, a working server. Click any line. Then we type it together from an empty folder.">
      <Split cols="1.2fr 1fr">
        <Code hl={x ? [line, ...(line === 7 || line === 11 ? [line + 1, line + 2] : [])] : []} onLine={(n) => HELLO_X[n] && setLine(n)} size={16}>{HELLO}</Code>
        <Col>
          <div className="panel pop" key={line} style={{ padding: 20, borderLeft: `5px solid ${T.accent}`, minHeight: 170 }}>
            <div className="note mono">line {line}</div>
            <div style={{ fontWeight: 800, fontSize: 22, marginTop: 4 }}>{x?.h}</div>
            <p className="big" style={{ marginTop: 8, fontSize: 18 }}>{x?.b}</p>
          </div>
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Anatomy of every route you will ever write</div>
            <div className="mono" style={{ fontSize: 17 }}>
              <span style={{ color: T.accent }}>app</span>.<span style={{ color: T.blue }}>get</span>(<span style={{ color: T.amber }}>"/path"</span>, (req, res) =&gt; {"{ ... }"})
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span className="chip">who</span><span className="chip blue">method</span><span className="chip amber">path</span><span className="chip gray">what to do</span>
            </div>
          </div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 14. Server simulator ============ */

function buildTuesdayApp() {
  const recipes = clone(SEED);
  const app = createApp();
  app.get("/", (req, res) => res.send("Welcome to the Recipe Box kitchen."));
  app.get("/api/recipes", (req, res) => res.json(recipes));
  app.get("/api/recipes/:id", (req, res) => {
    const recipe = recipes.find((r) => r.id === Number(req.params.id));
    if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
    res.json(recipe);
  });
  return app;
}

const SIM_CODE = `app.get("/", (req, res) => {
  res.send("Welcome to the Recipe Box kitchen.");
});

app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

app.get("/api/recipes/:id", (req, res) => {
  const id = Number(req.params.id);
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return res.status(404).json({ error: "..." });
  res.json(recipe);
});`;

function SimSlide() {
  const app = useMemo(buildTuesdayApp, []);
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("/api/recipes/3");
  const [result, setResult] = useState(null);
  const send = () => setResult(app.handle({ method, url }));
  const matched = result?.trace.find((t) => t.outcome === "sent");
  const hlLines = !matched ? [] : matched.name === "GET /" ? [1, 2, 3] : matched.name === "GET /api/recipes" ? [5, 6, 7] : matched.name === "GET /api/recipes/:id" ? [9, 10, 11, 12, 13, 14] : [];
  return (
    <Slide kicker="Try it" title="Be the request" sub="Express reads routes top to bottom and runs the FIRST one whose method and path both match. Send a few and watch which block lights up.">
      <Split cols="1.15fr 1fr">
        <Code hl={hlLines} dim size={14.5}>{SIM_CODE}</Code>
        <Col>
          <div style={{ display: "flex", gap: 6 }}>
            <select className="field" style={{ width: 110 }} value={method} onChange={(e) => setMethod(e.target.value)}>
              {["GET", "POST", "DELETE"].map((m) => <option key={m}>{m}</option>)}
            </select>
            <input className="field mono" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="btn primary" onClick={send}>Send</button>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["/", "/api/recipes", "/api/recipes/3", "/api/recipes/99", "/api/menu"].map((u) => (
              <button key={u} className="btn small" onClick={() => { setUrl(u); setMethod("GET"); setResult(app.handle({ method: "GET", url: u })); }}>{u}</button>
            ))}
            <button className="btn small" onClick={() => { setMethod("POST"); setUrl("/api/recipes"); setResult(app.handle({ method: "POST", url: "/api/recipes" })); }}>POST /api/recipes</button>
          </div>
          {result && (
            <div className="pop" key={JSON.stringify(result.trace) + url}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <StatusPill status={result.status} />
                <span className="note">{matched?.name === "Express default" ? "No route matched. Express answered for you." : `Matched: ${matched?.name}`}</span>
              </div>
              <pre className="term" style={{ margin: 0, maxHeight: 220, fontSize: 13 }}>{pretty(result.body)}</pre>
            </div>
          )}
          {result?.status === 404 && result.type === "html" && <div className="callout pop"><div className="h">"Cannot {method} ..."</div>That HTML page is Express's default when nothing matches. Thursday we replace it with a JSON 404 our React app can read.</div>}
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 15. Params vs query + the string trap ============ */

function ParamsSlide() {
  const [url, setUrl] = useState("/api/recipes/3?spicy=true");
  const [fixed, setFixed] = useState(false);
  const [pathPart, qs = ""] = url.split("?");
  const m = pathPart.match(/^\/api\/recipes\/([^/]+)$/);
  const params = m ? { id: m[1] } : {};
  const query = Object.fromEntries(new URLSearchParams(qs));
  const found = m ? SEED.find((r) => (fixed ? r.id === Number(m[1]) : r.id === m[1])) : null;
  return (
    <Slide kicker="Two ways to put info in a URL" title="Params pick ONE. Query filters MANY.">
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <span className="mono note">http://localhost:3000</span>
        <input className="field mono" style={{ width: 520 }} value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["/api/recipes/3", "/api/recipes/5?spicy=true", "/api/recipes?cuisine=Thai", "/api/recipes?tag=vegetarian&maxMinutes=30", "/api/recipes/pizza"].map((u) => <button key={u} className="btn small" onClick={() => setUrl(u)}>{u}</button>)}
      </div>
      <Split cols="1fr 1fr 1.1fr">
        <div className="panel" style={{ padding: 16, borderTop: `5px solid ${T.blue}` }}>
          <div style={{ fontWeight: 800, color: T.blue }}>req.params</div>
          <div className="note">route written as <span className="mono">/api/recipes/:id</span></div>
          <pre className="term" style={{ marginTop: 10, fontSize: 14 }}>{JSON.stringify(params, null, 2)}</pre>
          <p className="note" style={{ marginTop: 8 }}>The colon makes a slot. Whatever sits there becomes req.params.id.</p>
        </div>
        <div className="panel" style={{ padding: 16, borderTop: `5px solid ${T.amber}` }}>
          <div style={{ fontWeight: 800, color: T.amber }}>req.query</div>
          <div className="note">everything after the <span className="mono">?</span></div>
          <pre className="term" style={{ marginTop: 10, fontSize: 14 }}>{JSON.stringify(query, null, 2)}</pre>
          <p className="note" style={{ marginTop: 8 }}>Optional extras. key=value pairs joined with &amp;. No route change needed.</p>
        </div>
        <Col>
          <div className="callout"><div className="h">Look at the quotes</div>"3", not 3. Every param and every query value is a STRING. Always. Same string-vs-number bug from Week 2.</div>
          <Code size={13.5} hl={[fixed ? 2 : 1]}>{`recipes.find((r) => r.id === req.params.id)
recipes.find((r) => r.id === Number(req.params.id))`}</Code>
          <div style={{ display: "flex", gap: 6 }}>
            <button className={"btn small" + (!fixed ? " on" : "")} onClick={() => setFixed(false)}>Line 1 (broken)</button>
            <button className={"btn small" + (fixed ? " on" : "")} onClick={() => setFixed(true)}>Line 2 (fixed)</button>
          </div>
          {m && <div className={"callout pop" + (found ? " good" : "")} key={String(fixed) + url}><div className="h">{found ? `Found: ${found.name}` : "undefined, so 404"}</div>{found ? "Number(\"3\") is 3, and 3 === 3." : `"${m[1]}" === ${Number(m[1])} is false. Nothing ever matches.`}</div>}
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 16. How to test a server ============ */

function TestingSlide() {
  const [tool, setTool] = useState("browser");
  return (
    <Slide kicker="Workflow" title="Three ways to poke your server" sub="You are going to send hundreds of requests this unit. Pick the right tool.">
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["browser", "Browser address bar"], ["thunder", "Thunder Client"], ["http", "requests.http file"]].map(([k, l]) => <button key={k} className={"btn" + (tool === k ? " on" : "")} onClick={() => setTool(k)}>{l}</button>)}
      </div>
      <Split cols="1.2fr 1fr">
        {tool === "browser" && <>
          <div className="panel" style={{ padding: 18 }}>
            <div className="mono" style={{ padding: "8px 12px", border: `1px solid ${T.line}`, borderRadius: 999, fontSize: 15 }}>localhost:3000/api/recipes?cuisine=Thai</div>
            <pre className="term" style={{ marginTop: 12, fontSize: 13 }}>{JSON.stringify(SEED.filter((r) => r.cuisine === "Thai"), null, 2)}</pre>
          </div>
          <Col>
            <div className="callout good"><div className="h">Great for</div>Quick GET checks. Zero setup.</div>
            <div className="callout"><div className="h">Cannot do</div>POST, PATCH, DELETE, or send a body. The address bar only ever sends GET.</div>
          </Col>
        </>}
        {tool === "thunder" && <>
          <div className="panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 8 }}><span className="chip blue">POST</span><span className="mono">http://localhost:3000/api/recipes</span></div>
            <div className="note" style={{ marginTop: 12 }}>Body &gt; JSON</div>
            <pre className="term" style={{ fontSize: 13 }}>{`{ "name": "Ramen", "cuisine": "Japanese", "minutes": 40 }`}</pre>
            <div style={{ marginTop: 10 }}><StatusPill status={201} /></div>
          </div>
          <Col>
            <div className="callout good"><div className="h">Great for</div>Every method, bodies, headers, saved collections. A Postman that lives inside VS Code.</div>
            <div className="callout info"><div className="h">Install</div>VS Code Extensions, search Thunder Client, install. Lightning bolt icon in the sidebar.</div>
          </Col>
        </>}
        {tool === "http" && <>
          <Code size={14}>{`@base = http://localhost:3000

### every recipe
GET {{base}}/api/recipes

### one recipe
GET {{base}}/api/recipes/3

### filter
GET {{base}}/api/recipes?tag=vegetarian`}</Code>
          <Col>
            <div className="callout good"><div className="h">Great for</div>Tests that live in your repo. Your grader clicks Send Request and sees exactly what you saw.</div>
            <div className="callout info"><div className="h">Install</div>VS Code extension "REST Client". The example repo ships with a full requests.http.</div>
          </Col>
        </>}
      </Split>
      <div className="callout" style={{ marginTop: 14 }}><div className="h">"I changed the code and nothing happened"</div>The old server is still running the old code. Use <span className="mono">npm run dev</span> (node --watch restarts on save), or Ctrl + C and start it again.</div>
    </Slide>
  );
}

/* ============ 17. Live-code progression ============ */

const STAGES = [
  { s: "0", cmd: "npm run oops", title: "The trap", what: "Crashes with require is not defined. Read the error out loud. Fix it together: import, export default.",
    code: `const express = require("express");   // crashes here
import express from "express";        // the fix

module.exports = app;                 // crashes too
export default app;                   // the fix` },
  { s: "1", cmd: "npm run stage1", title: "Hello server", what: "Two text routes. Visit /, /about, then /menu for Express's HTML 404. Edit text, save, refresh: --watch restarts.",
    code: `app.get("/", (req, res) => {
  res.send("Welcome to the Recipe Box kitchen.");
});

app.get("/about", (req, res) => {
  res.send("This kitchen is run by CSC 436.");
});` },
  { s: "2", cmd: "npm run stage2", title: "Send JSON", what: "/api/recipes returns the array. Open DevTools Network, find Content-Type: application/json.",
    code: `const recipes = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25 },
  ...
];

app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});` },
  { s: "3", cmd: "npm run stage3", title: "One by id", what: "Uncomment the broken find first. /api/recipes/3 gives 404. Ask the room why. Then Number().",
    code: `app.get("/api/recipes/:id", (req, res) => {
  const id = Number(req.params.id);
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) {
    return res.status(404).json({ error: \`No recipe with id \${req.params.id}\` });
  }
  res.json(recipe);
});` },
  { s: "4", cmd: "npm run stage4", title: "Filter with query", what: "cuisine, maxMinutes, tag, q. Show ?cuisine=klingon returns [] with 200. Empty is not an error.",
    code: `app.get("/api/recipes", (req, res) => {
  const { cuisine, maxMinutes } = req.query;
  let results = recipes;
  if (cuisine) {
    results = results.filter((r) => r.cuisine.toLowerCase() === cuisine.toLowerCase());
  }
  if (maxMinutes) {
    results = results.filter((r) => r.minutes <= Number(maxMinutes));
  }
  res.json(results);
});` },
];

function ProgressionSlide() {
  const [k, setK] = useState(0);
  return (
    <Slide kicker="Live code, 40 minutes" title="Build it in five stages" sub="examples/recipe-box-api. Students type along in their own empty folder. Each stage is one file you can run.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {STAGES.map((x, i) => (
          <button key={i} className="panel" onClick={() => setK(i)} style={{ padding: 14, textAlign: "left", cursor: "pointer", borderTop: `5px solid ${i === k ? T.accent : i < k ? T.good : T.line}`, background: i === k ? T.accentSoft : T.card }}>
            <div className="note">Stage {x.s}</div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{x.title}</div>
          </button>
        ))}
      </div>
      <div className="pop" key={k} style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: 14, marginTop: 14 }}>
        <div className="panel" style={{ padding: 18 }}>
          <div className="mono" style={{ color: T.accent, fontWeight: 700 }}>$ {STAGES[k].cmd}</div>
          <p className="big" style={{ marginTop: 10, fontSize: 18 }}>{STAGES[k].what}</p>
        </div>
        <Code size={13} numbers={false}>{STAGES[k].code}</Code>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <div className="callout info"><div className="h">Students start from nothing</div><span className="mono">mkdir recipe-box && cd recipe-box && npm init -y && npm pkg set type=module && npm install express</span></div>
        <div className="callout"><div className="h">Checkpoint after stage 2</div>Every laptop shows JSON at localhost:3000/api/recipes before anyone moves on. Pairs help pairs.</div>
      </div>
    </Slide>
  );
}

/* ============ 18. Assignment ============ */

function AssignmentSlide() {
  return (
    <Slide kicker="Build block, 25 minutes" title="Mission 7: Open the Kitchen" sub="Build your own Recipe Box API from an empty folder. No cloning. Push to your GitHub Classroom repo, link in Brightspace.">
      <Tiers tiers={[
        { name: "Bronze", tag: "everyone", items: ["New folder, npm init, \"type\": \"module\", Express installed", "GET / sends a welcome message", "GET /api/recipes returns at least 6 recipes as JSON", "npm run dev uses node --watch"] },
        { name: "Silver", items: ["GET /api/recipes/:id returns one recipe", "Number() on the param", "Unknown id sends 404 with a JSON error message", "No \"headers already sent\" crash (use return)"] },
        { name: "Gold", items: ["?cuisine= filter (case does not matter)", "?maxMinutes= filter", "Filters combine: ?cuisine=Thai&maxMinutes=30", "GET /api/stats returns count and fastest"] },
        { name: "Bonus", items: ["?q= search by name", "Swap recipes for your Project 4 idea: 8 items, your own fields", "requests.http with a request for every route"] },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginTop: 14 }}>
        <div className="callout info"><div className="h">Project 4 starts today</div>Express + Supabase API: full CRUD, middleware, TypeScript types, deployed on Render. Due Tue Nov 10. Today's repo is the first brick, so pick your resource tonight.</div>
        <div className="callout"><div className="h">Rules of the road</div>No require anywhere. If AI or a tutorial hands you CommonJS, translate it. Keep this repo, Thursday builds on it.</div>
      </div>
    </Slide>
  );
}

/* ============ 19. Close ============ */

function CloseSlide() {
  return (
    <Slide kicker="Exit check, 10 minutes" title="Five questions, hands up">
      <Split cols="1.5fr 1fr">
        <Quiz questions={[
          { q: "Your server prints nothing and the browser says \"This site can't be reached\". First thing to check?", options: ["Is the server actually running in a terminal?", "Reinstall Node", "Clear the browser cache"], answer: 0, why: "If the terminal is not showing \"Kitchen open\", there is no kitchen. Start it with npm run dev." },
          { q: "SyntaxError: Cannot use import statement outside a module. The fix?", options: ["Switch to require()", "Add \"type\": \"module\" to package.json", "Rename to .jsx"], answer: 1, why: "Node defaults to CommonJS. The type line switches the whole project to ESM." },
          { q: "GET /api/recipes/4. What is req.params.id?", options: [{ text: "4", mono: true }, { text: "\"4\"", mono: true }, { text: "undefined", mono: true }], answer: 1, why: "Always a string. Number() it before comparing to numeric ids." },
          { q: "Which URL filters a list rather than picking one item?", options: [{ text: "/api/recipes/thai", mono: true }, { text: "/api/recipes?cuisine=thai", mono: true }], answer: 1, why: "Query strings filter. Params identify one thing." },
          { q: "You need to test a POST. Which tool cannot do it?", options: ["Browser address bar", "Thunder Client", "requests.http"], answer: 0, why: "The address bar only sends GET." },
        ]} />
        <Col>
          <div className="panel" style={{ padding: 18, borderTop: `5px solid ${T.accent}` }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Today your server could only READ.</div>
            <p className="lead" style={{ marginTop: 8 }}>Thursday: POST, PATCH, DELETE, and middleware, the assembly line every request walks down. Then your Week 7 Recipe Finder talks to your own server.</p>
          </div>
          <div className="callout info"><div className="h">Before Thursday</div>Finish Mission 7 through Silver at least. Install Thunder Client. Read the Project 4 spec.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ deck ============ */

const SLIDES = [
  { el: <TitleSlide />, notes: "12:20. Click Send a request while people settle. Say: for seven weeks you lived in the blue box. Today we build the teal one. Nobody here has done this before, and that is the point of today." },
  { el: <WhereSlide />, notes: "Warm-up, pairs, 10 to 12 minutes. Read each answer out and announce the top pairs. The point: secrets, shared data, rules all land on Server. That is the thesis of the whole lesson. Do not explain Node yet." },
  { el: <RestaurantSlide />, notes: "Click all four in order: dining room, waiter, kitchen, pantry. Make them say the one sentence back: the frontend asks, the backend decides, the database remembers. Refer back to this all unit." },
  { el: <WhySlide />, notes: "Three tabs. Shared: add Ramen on Maria's laptop in localStorage mode, show Jay never sees it, flip to server mode. Secret: callback to the Week 7 API key slide, open the fake DevTools. Rules: set price to 0 and run both servers." },
  { el: <StackSlide />, notes: "Click Week 7, 9, 10, 11. Project 4 is the teal plus amber column. Today: teal only, data in an array. Keep it fast, 2 minutes." },
  { el: <NodeSlide />, notes: "Toggle browser vs Node. Ask before toggling: does document exist in Node? Get a guess. The Express callout: Node is the engine, Express is the steering wheel. WATCH FOR: students who think Node is a different language. It is not." },
  { el: <TerminalSlide />, notes: "Everyone opens a terminal and types along. If node -v fails, pair them with a neighbor or the Codespace. Stress the frozen terminal: a running server owns the terminal. Second terminal tab for other commands." },
  { el: <PackageSlide />, notes: "Click line 4 first and stay there a moment. Then scripts and --watch. Then node_modules and .gitignore. Commands box: they will run these four in the live code." },
  { el: <EsmSlide />, notes: "SAY THIS: this is the single biggest source of confusing errors in this course, every semester. Three rules. Have them photograph this slide. Every time AI hands them require, translate before running." },
  { el: <SpotSlide />, notes: "Call out ESM or CJS as a room. Then click through the four errors and have someone read each one aloud. These are verbatim Node 22 messages. Then switch to the example repo and run npm run oops." },
  { el: <HttpSlide />, notes: "Switch between GET and POST so they see the body appear and disappear. Try /api/recipes/99 and /api/menu. Method is the verb, path is the noun." },
  { el: <StatusSlide />, notes: "Click each card. Key line: first digit tells you who is to blame. Connect to res.ok from Week 7: it is only true for 2xx, so honest codes make useFetch work." },
  { el: <HelloSlide />, notes: "Click lines 1, 3, 4, 5, 7, 8, 12, 15, 16 in order. Then leave the deck and live-code this in an empty folder. Deliberate mistake: forget type module first, run it, read the error together." },
  { el: <SimSlide />, notes: "Click the preset buttons left to right. Ask before each: which block lights up? /api/menu shows Express's HTML 404. POST /api/recipes also 404s: same path, wrong method. Routes match on BOTH." },
  { el: <ParamsSlide />, notes: "Click presets. Point at the quotes around \"3\". Toggle broken vs fixed. CALLBACK: the Silver Trial id trap from Week 2. Ask who got bitten then. /api/recipes/pizza shows NaN matches nothing." },
  { el: <TestingSlide />, notes: "Browser for quick GETs, Thunder Client or REST Client for everything else. Make sure everyone installs one before the build block. The --watch callout saves you ten hand-raises." },
  { el: <ProgressionSlide />, notes: "Leave the deck. Run each stage in examples/recipe-box-api while students build in their own folder. CHECKPOINT after stage 2: JSON on every screen. At stage 3, run the broken find first and let the 404 confuse them." },
  { el: <AssignmentSlide />, notes: "Start a 25 minute timer. Circulate for: missing type module, missing .js on local imports, Number() missing, a second terminal not opened, and two res.json calls without return." },
  { el: <CloseSlide />, notes: "Hands up per question. Q1 is the most common real problem. Q3 is the trap. Tease Thursday: their server learns to write, and their Recipe Finder connects to it." },
];

export default function Deck() {
  return <DeckShell slides={SLIDES} />;
}
