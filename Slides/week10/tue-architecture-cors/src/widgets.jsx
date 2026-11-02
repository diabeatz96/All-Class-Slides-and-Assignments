import { useState } from "react";
import { Code, useBounty } from "./kit/index.jsx";

/* ==================================================================
   Tuesday widgets: Mission 11, Assemble the Crew
   ================================================================== */

/* ---------------- 3. Job Hunt: the one-file galley ---------------- */
export const ONE_FILE = `import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Missing Supabase settings");
const supabase = createClient(url, key);
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use((req, res, next) => { console.log(req.method, req.url); next(); });
app.use(express.json());
app.get("/api/recipes", async (req, res) => {
  const { data, error } = await supabase.from("recipes").select("*");
  if (error) throw error;
  res.json(data);
});
app.post("/api/recipes", async (req, res) => {
  const { name, cuisine, minutes } = req.body;
  if (!(minutes > 0)) return res.status(400).json({ error: "Bad recipe" });
  const { data, error } = await supabase.from("recipes")
    .insert({ name, cuisine, minutes }).select().single();
  if (error) throw error;
  res.status(201).json(data);
});
app.use((req, res) => res.status(404).json({ error: "No route" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Kitchen fire" }));
app.listen(process.env.PORT ?? 3000, () => console.log("Kitchen open"));`;

const JOBS = [
  { name: "Read settings from the environment", lines: [4, 5, 6] },
  { name: "Connect to the database", lines: [3, 7] },
  { name: "Build the app", lines: [1, 8] },
  { name: "Decide which websites may read us (CORS)", lines: [2, 9] },
  { name: "Log every request", lines: [10] },
  { name: "Turn JSON bodies into req.body", lines: [11] },
  { name: "Check the input", lines: [19] },
  { name: "Talk to the database", lines: [13, 20, 21] },
  { name: "Pick status codes", lines: [15, 19, 23] },
  { name: "Answer unknown routes (404)", lines: [25] },
  { name: "Handle errors", lines: [14, 22, 26] },
  { name: "Start listening on a port", lines: [27] },
];

export function JobHunt() {
  const [shown, setShown] = useState(0);
  const [active, setActive] = useState(null);
  const job = active === null ? null : JOBS[active];
  return (
    <div className="split stretch" style={{ gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 20 }}>
      <Code code={ONE_FILE} title="galley.js (the whole API in one file)" size={12} hl={job ? job.lines : []} />
      <div className="col" style={{ gap: 8 }}>
        <div className="row" style={{ alignItems: "center", gap: 10 }}>
          <button className="btn sm" disabled={shown >= JOBS.length} onClick={() => setShown(shown + 1)}>Reveal a job ({shown}/{JOBS.length})</button>
          <button className="btn sm ghost" disabled={shown >= JOBS.length} onClick={() => setShown(JOBS.length)}>Show all</button>
        </div>
        <div className="col" style={{ gap: 6 }}>
          {JOBS.slice(0, shown).map((j, k) => (
            <button key={k} className={`chipbtn pop ${active === k ? "on" : ""}`} style={{ textAlign: "left", fontSize: 16, borderRadius: 10 }}
              onClick={() => setActive(active === k ? null : k)}>
              {k + 1}. {j.name}
            </button>
          ))}
        </div>
        {shown === 0 && <div className="parch" style={{ fontSize: 18 }}>Crews: list every separate job this file does. One bounty per real job. Click a revealed job to light up its lines.</div>}
      </div>
    </div>
  );
}

/* ---------------- 4. Scenario cards ---------------- */
const SCENARIOS = [
  { s: "The recipe list comes back in the wrong order.", where: "services/recipes.js", why: "The query (order by id) is the cook's job." },
  { s: "POST accepts a recipe with minutes: -5.", where: "middleware/validate.js", why: "Checking input is a lookout's job, before the route runs." },
  { s: "The server will not even start: a key is missing.", where: "config/env.js", why: "Every setting is read and checked in one place, at startup." },
  { s: "A new recipe comes back with 200, not 201.", where: "routes/recipes.js", why: "Status codes are HTTP decisions. Only the navigator makes them." },
  { s: "The browser console says CORS.", where: "app.js and CORS_ORIGINS", why: "The cors line lives in app.js. The guest list lives in the env var." },
];

export function ScenarioCards() {
  const [open, setOpen] = useState({});
  return (
    <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {SCENARIOS.map((c, k) => (
        <div key={k} className="panel" style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 112 }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: "var(--white)" }}>{c.s}</div>
          {open[k] ? (
            <div className="pop" style={{ fontSize: 17 }}>
              <span className="tag teal" style={{ fontSize: 13 }}>{c.where}</span>
              <div style={{ marginTop: 6, color: "var(--foam)" }}>{c.why}</div>
            </div>
          ) : (
            <div><button className="btn sm" onClick={() => setOpen({ ...open, [k]: true })}>After the refactor, where?</button></div>
          )}
        </div>
      ))}
      <div className="parch" style={{ display: "grid", placeItems: "center", fontSize: 19, fontWeight: 800, textAlign: "center" }}>
        In one file, the answer is always: "somewhere in here".
      </div>
    </div>
  );
}

/* ---------------- 5. Crew map ---------------- */
const CREW = [
  { role: "The Ship", job: "Holds the whole crew together, in order.", file: "app.js", rule: "Builds the app and exports it. Never listens." },
  { role: "Setting Sail", job: "Pushes the ship into the water on your laptop.", file: "server.js", rule: "The only file that calls listen()." },
  { role: "The Ship's Log", job: "Knows every setting and secret, checked once.", file: "config/env.js", rule: "The only file that reads process.env." },
  { role: "The Pantry Door", job: "One shared way into the food stores.", file: "data/supabase.js", rule: "Creates the Supabase client from config." },
  { role: "The Cook", job: "The only one allowed in the galley.", file: "services/recipes.js", rule: "Only file that talks to Supabase. No req, no res." },
  { role: "The Navigator", job: "Reads the order, steers it, answers it.", file: "routes/recipes.js", rule: "Owns req and res. Never imports supabase." },
  { role: "The Lookouts", job: "Check everything before it reaches the deck.", file: "middleware/", rule: "Logger, validation, 404, errors." },
];

export function CrewMap() {
  const [open, setOpen] = useState({});
  return (
    <div className="col" style={{ gap: 8 }}>
      {CREW.map((c, k) => (
        <div key={k} className="panel" style={{ display: "grid", gridTemplateColumns: "170px 1fr 1.25fr", gap: 12, alignItems: "center", padding: "8px 14px" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 25, color: "var(--gold)" }}>{c.role}</div>
          <div style={{ fontSize: 16, color: "var(--foam)" }}>{c.job}</div>
          {open[k] ? (
            <div className="pop" style={{ fontSize: 16 }}>
              <span className="mono teal" style={{ fontWeight: 700 }}>{c.file}</span>
              <span style={{ color: "var(--foam)" }}>  {c.rule}</span>
            </div>
          ) : (
            <div><button className="btn sm" onClick={() => setOpen({ ...open, [k]: true })}>Which file?</button></div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- 6. Floor plan ---------------- */
const FILES = [
  { f: "server.js", depth: 0, job: "Starts the app on your laptop: app.listen(config.port).", imports: ["./app.js", "./config/env.js"], usedBy: ["you, through npm run dev"], never: "Never builds routes. Never touches the database." },
  { f: "app.js", depth: 0, job: "Builds the app: logger, cors, express.json, routes, 404, errors. Then export default app.", imports: ["express", "cors", "./middleware/logger.js", "./middleware/errors.js", "./routes/recipes.js", "./config/env.js"], usedBy: ["server.js", "(Thursday: someone else too)"], never: "Never calls listen()." },
  { f: "config/", depth: 0, dir: true },
  { f: "env.js", depth: 1, job: "Reads process.env once, checks it, exports a frozen config object.", imports: ["nothing (it reads process.env)"], usedBy: ["server.js", "app.js", "data/supabase.js"], never: "Nobody else may read process.env." },
  { f: "data/", depth: 0, dir: true },
  { f: "supabase.js", depth: 1, job: "Creates the one shared Supabase client.", imports: ["@supabase/supabase-js", "../config/env.js"], usedBy: ["services/recipes.js"], never: "Routes may never import it." },
  { f: "services/", depth: 0, dir: true },
  { f: "recipes.js", depth: 1, key: "svc", job: "listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe. Plain values in, plain data out, throws on errors.", imports: ["../data/supabase.js"], usedBy: ["routes/recipes.js"], never: "No req, no res, no status codes." },
  { f: "routes/", depth: 0, dir: true },
  { f: "recipes.js", depth: 1, key: "rt", job: "Express Router: reads req, calls a service, picks the status code, sends res.", imports: ["express (Router)", "../services/recipes.js", "../middleware/validate.js"], usedBy: ["app.js"], never: "Never imports supabase." },
  { f: "middleware/", depth: 0, dir: true },
  { f: "logger.js", depth: 1, job: "Prints one line per request after the response: GET /api/recipes -> 200 (19ms).", imports: ["nothing"], usedBy: ["app.js"], never: "Never decides the answer." },
  { f: "validate.js", depth: 1, job: "checkId, validateRecipe, validateRecipePatch: turn away bad input early.", imports: ["nothing"], usedBy: ["routes/recipes.js"], never: "Never talks to the database." },
  { f: "errors.js", depth: 1, job: "notFound (404) and errorHandler (the four-parameter catch-all).", imports: ["nothing"], usedBy: ["app.js"], never: "Never leaks database details to the client." },
];

export function FloorPlan() {
  const [sel, setSel] = useState(1);
  const f = FILES[sel];
  return (
    <div className="split" style={{ gridTemplateColumns: "300px 1fr", gap: 24 }}>
      <div className="panel" style={{ padding: "10px 12px" }}>
        <div className="mono note" style={{ marginBottom: 6 }}>recipe-box-api/</div>
        {FILES.map((x, k) => (
          x.dir ? (
            <div key={k} className="mono" style={{ fontSize: 16, color: "var(--teal-soft)", padding: "3px 0 1px 12px" }}>{x.f}</div>
          ) : (
            <button key={k} onClick={() => setSel(k)} className="mono"
              style={{ display: "block", width: "100%", textAlign: "left", fontSize: 16, padding: "3px 8px", marginLeft: 12 + x.depth * 22, maxWidth: `calc(100% - ${12 + x.depth * 22}px)`, borderRadius: 6, border: 0, cursor: "pointer", background: sel === k ? "var(--gold)" : "transparent", color: sel === k ? "var(--ink)" : "var(--white)", fontWeight: 700 }}>
              {x.f}
            </button>
          )
        ))}
      </div>
      <div className="parch pop" key={sel} style={{ fontSize: 18, lineHeight: 1.45 }}>
        <h3 className="mono" style={{ fontSize: 22 }}>{pathOf(sel)}</h3>
        <div style={{ marginBottom: 10 }}>{f.job}</div>
        <div><b>It imports:</b> <span className="mono" style={{ fontSize: 15 }}>{f.imports.join(", ")}</span></div>
        <div><b>Imported by:</b> <span className="mono" style={{ fontSize: 15 }}>{f.usedBy.join(", ")}</span></div>
        <div style={{ marginTop: 10, color: "var(--red-deep)", fontWeight: 800 }}>{f.never}</div>
      </div>
    </div>
  );
}
function pathOf(k) {
  let dir = "";
  for (let i = k; i >= 0; i--) if (FILES[i].dir) { dir = FILES[i].f; break; }
  return dir + FILES[k].f;
}

/* ---------------- 8. Sort the Crew ---------------- */
const SNIPPETS = [
  { code: "const value = process.env[name];", ans: "config/", why: "Reading process.env is the ship's log's job, and nobody else's." },
  { code: "createClient(config.supabaseUrl, config.supabaseSecretKey)", ans: "data/", why: "One shared client: the pantry door." },
  { code: 'await supabase.from("recipes").delete().eq("id", id).select();', ans: "services/", why: "It talks to the database, so it belongs to the cook." },
  { code: "res.status(201).json(saved);", ans: "routes/", why: "It touches res and picks a status code: the navigator." },
  { code: "if (!Number.isInteger(id) || id < 1) return res.status(404)...", ans: "middleware/", why: "checkId turns bad input away before any route runs." },
  { code: "app.listen(config.port, () => { ... });", ans: "server.js", why: "Only one file sets sail." },
  { code: "app.use(cors({ origin: config.corsOrigins }));", ans: "app.js", why: "Wiring the crew together, in order, happens in app.js." },
  { code: "console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`)", ans: "middleware/", why: "The logger is a lookout: it watches every request." },
];
const DESTS = ["config/", "data/", "services/", "routes/", "middleware/", "app.js", "server.js"];

export function SortTheCrew() {
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState({});
  const s = SNIPPETS[i];
  const pick = picks[i];
  const score = Object.entries(picks).filter(([k, v]) => SNIPPETS[k].ans === v).length;
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <span className="tag">Snippet {i + 1} of {SNIPPETS.length}</span>
        <span className="note" style={{ fontSize: 16 }}>Class score: {score} / {Object.keys(picks).length}</span>
      </div>
      <Code code={s.code} size={21} />
      <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
        {DESTS.map((d) => {
          const isPick = pick === d;
          const right = pick && d === s.ans;
          const cls = right ? "on" : isPick ? "onred" : "";
          return (
            <button key={d} className={`chipbtn mono ${cls}`} style={{ fontSize: 17, padding: "8px 14px" }} disabled={!!pick} onClick={() => setPicks({ ...picks, [i]: d })}>{d}</button>
          );
        })}
      </div>
      <div style={{ minHeight: 70 }}>
        {pick && (
          <div className="parch pop" style={{ fontSize: 18 }}>
            <b>{pick === s.ans ? "Right." : `Not quite: it goes in ${s.ans}.`}</b> {s.why}
          </div>
        )}
      </div>
      <div className="row" style={{ gap: 10 }}>
        <button className="btn sm ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Previous snippet</button>
        <button className="btn sm" disabled={i === SNIPPETS.length - 1} onClick={() => setI(i + 1)}>Next snippet</button>
      </div>
    </div>
  );
}

/* ---------------- 9. Follow the request ---------------- */
function stationsFor(id) {
  const ok = /^\d+$/.test(id) && Number(id) >= 1;
  const exists = ok && Number(id) <= 8;
  const st = [
    { at: "middleware/logger.js", what: "Starts a stopwatch and waits for the response to finish. Then next()." },
    { at: "cors (app.js)", what: "Is the Origin header on the CORS_ORIGINS list? If so, add Access-Control-Allow-Origin. Then next()." },
    { at: "express.json() (app.js)", what: "A GET has no body. Nothing to parse. next()." },
    { at: "app.js: /api/recipes", what: 'The prefix matches. The router gets the rest of the path: "/' + id + '".' },
    { at: "routes/recipes.js", what: 'GET "/:id" matches, with req.params.id = "' + id + '" (always text).' },
    { at: "middleware/validate.js: checkId", what: ok ? `"${id}" becomes ${id}, a positive whole number. next().` : `Number("${id}") is not a positive whole number. Answer 404 right here. The database is never asked.` },
  ];
  if (!ok) {
    st.push({ at: "middleware/logger.js", what: `Prints: GET /api/recipes/${id} -> 404 (1ms)`, end: true });
    return st;
  }
  st.push(
    { at: "routes/recipes.js handler", what: `Calls recipes.getRecipe("${id}") and waits.` },
    { at: "services/recipes.js", what: `Builds the query: select * from recipes where id = ${id}, maybeSingle().` },
    { at: "data/supabase.js to the database", what: exists ? "One row comes back." : "No row has that id. The service returns null." },
    { at: "routes/recipes.js handler", what: exists ? "res.json(recipe): status 200." : 'No recipe: res.status(404).json({ error: "No recipe with id ' + id + '" }).' },
    { at: "middleware/logger.js", what: `Prints: GET /api/recipes/${id} -> ${exists ? 200 : 404} (21ms)`, end: true },
  );
  return st;
}

export function FollowTheRequest() {
  const [id, setId] = useState("7");
  const [n, setN] = useState(1);
  const st = stationsFor(id);
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row" style={{ alignItems: "center", gap: 10 }}>
        <span className="mono" style={{ fontSize: 20, fontWeight: 800 }}>GET /api/recipes/</span>
        {["7", "999", "seven"].map((v) => (
          <button key={v} className={`chipbtn mono ${id === v ? "on" : ""}`} onClick={() => { setId(v); setN(1); }}>{v}</button>
        ))}
        <span style={{ flex: 1 }} />
        <button className="btn sm" disabled={n >= st.length} onClick={() => setN(n + 1)}>Where next? ({n}/{st.length})</button>
        <button className="btn sm ghost" onClick={() => setN(1)}>Start over</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {st.slice(0, n).map((s, k) => (
          <div key={id + k} className={`panel pop`} style={{ padding: "8px 12px", borderLeft: `5px solid ${s.end ? "var(--gold)" : "var(--teal)"}` }}>
            <div className="mono" style={{ fontSize: 15, color: "var(--gold)", fontWeight: 700 }}>{k + 1}. {s.at}</div>
            <div style={{ fontSize: 16, color: "var(--foam)" }}>{s.what}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 17. Origin checker ---------------- */
const PAIRS = [
  { a: ["http", "localhost", "5173", ""], b: ["http", "localhost", "3000", ""], same: false, diff: "port", why: "Port 5173 is not port 3000." },
  { a: ["http", "localhost", "5173", ""], b: ["http", "127.0.0.1", "5173", ""], same: false, diff: "host", why: "Same machine, but the browser compares the host name as text." },
  { a: ["https", "galley.example", "", ""], b: ["http", "galley.example", "", ""], same: false, diff: "scheme", why: "https and http are different schemes." },
  { a: ["https", "galley.example", "", "/menu"], b: ["https", "galley.example", "", "/cart"], same: true, diff: "path", why: "The path is not part of an origin." },
  { a: ["https", "galley.example", "", ""], b: ["https", "galley.example", "443", ""], same: true, diff: "port", why: "443 is the default port for https." },
  { a: ["http", "localhost", "5173", "", "/"], b: ["http", "localhost", "5173", ""], same: false, diff: "slash", label: ["CORS_ORIGINS entry", "the page's Origin header"], why: "The Origin header never ends with a slash. No match, so cors sends no header." },
];

function Url({ p, hi }) {
  const [scheme, host, port, path, slash] = p;
  const part = (txt, key) => <span style={{ background: hi === key ? "rgba(242,193,78,.35)" : "transparent", borderRadius: 4 }}>{txt}</span>;
  return (
    <span className="mono" style={{ fontSize: 17 }}>
      {part(scheme + "://", "scheme")}{part(host, "host")}{port && part(":" + port, "port")}{path && part(path, "path")}{slash && part(slash, "slash")}
    </span>
  );
}

export function OriginChecker() {
  const [open, setOpen] = useState({});
  return (
    <div className="col" style={{ gap: 8 }}>
      {PAIRS.map((p, k) => (
        <div key={k} className="panel" style={{ display: "grid", gridTemplateColumns: "26px 300px 290px minmax(0,1fr)", gap: 12, alignItems: "center", padding: "6px 14px", minHeight: 62 }}>
          <span style={{ fontFamily: "var(--display)", fontSize: 26, color: "var(--gold)" }}>{k + 1}</span>
          <div>{p.label && <div className="note" style={{ fontSize: 13 }}>{p.label[0]}</div>}<Url p={p.a} hi={open[k] ? p.diff : null} /></div>
          <div>{p.label && <div className="note" style={{ fontSize: 13 }}>{p.label[1]}</div>}<Url p={p.b} hi={open[k] ? p.diff : null} /></div>
          {open[k] ? (
            <div className="pop" style={{ fontSize: 15.5, color: "var(--foam)", lineHeight: 1.3 }}>
              <span className={p.same ? "ok-badge" : "no-badge"} style={{ fontSize: 17 }}>{p.same ? "SAME. " : "DIFFERENT. "}</span>{p.why}
            </div>
          ) : (
            <div><button className="btn sm" onClick={() => setOpen({ ...open, [k]: true })}>Reveal</button></div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- 18. Bank story ---------------- */
export function BankStory() {
  const [sop, setSop] = useState(true);
  const [sent, setSent] = useState(false);
  return (
    <div className="split" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20 }}>
      <div className="col" style={{ gap: 10 }}>
        <div className="panel">
          <div className="tag green">Tab 1: bank.example</div>
          <div style={{ fontSize: 18, marginTop: 8 }}>You logged in this morning. Your browser holds the bank's login cookie.</div>
          <div className="mono note" style={{ marginTop: 6 }}>Cookie: session=you-are-logged-in</div>
        </div>
        <div className="panel">
          <div className="tag red">Tab 2: free-games.example</div>
          <div style={{ fontSize: 18, marginTop: 8 }}>A game site you clicked from an ad. Its JavaScript quietly runs this:</div>
          <Code code={`fetch("https://bank.example/api/balance", {\n  credentials: "include", // send the bank cookie\n})`} size={15} style={{ marginTop: 8 }} />
        </div>
      </div>
      <div className="col" style={{ gap: 10 }}>
        <div className="row" style={{ alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 18 }}>Same-origin policy:</span>
          <button className={`chipbtn ${sop ? "on" : ""}`} onClick={() => { setSop(true); setSent(false); }}>ON (real browsers)</button>
          <button className={`chipbtn ${!sop ? "onred" : ""}`} onClick={() => { setSop(false); setSent(false); }}>OFF (imagine)</button>
        </div>
        <button className="btn" onClick={() => setSent(true)}>Run the game site's script</button>
        {sent && (sop ? (
          <div className="parch pop" style={{ fontSize: 18, lineHeight: 1.45 }}>
            <b>The request still goes out</b> (with your cookie), and the bank answers. But the answer is from bank.example, and the page is free-games.example. The bank sent no permission slip for that origin, so <b>the browser refuses to hand the answer to the script.</b>
            <div className="mono" style={{ color: "var(--red-deep)", marginTop: 8, fontSize: 16 }}>TypeError: Failed to fetch</div>
          </div>
        ) : (
          <div className="parch pop" style={{ fontSize: 18, lineHeight: 1.45, borderColor: "var(--red-deep)" }}>
            <b style={{ color: "var(--red-deep)" }}>The script reads it:</b>
            <div className="mono" style={{ marginTop: 6, fontSize: 16 }}>{`{ "balance": 2431.17, "name": "You" }`}</div>
            <div style={{ marginTop: 8 }}>...and sends it to its own server. Every site you visit could read every site you are logged in to.</div>
          </div>
        ))}
        {!sent && <div className="note" style={{ fontSize: 16 }}>Predict first: what does the game site get?</div>}
      </div>
    </div>
  );
}

/* ---------------- 19. Permission slip ---------------- */
export function PermissionSlip() {
  const [page, setPage] = useState("http://localhost:5174");
  const [mode, setMode] = useState("string");
  const header = mode === "string" ? "http://localhost:5173" : page === "http://localhost:5173" ? page : null;
  const ok = header === page;
  const msg = ok
    ? null
    : header
      ? `Access to fetch at 'http://localhost:3000/api/recipes' from origin '${page}' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value '${header}' that is not equal to the supplied origin. Have the server send the header with a valid value.`
      : `Access to fetch at 'http://localhost:3000/api/recipes' from origin '${page}' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`;
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 18, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontWeight: 800 }}>Page:</span>
        {["http://localhost:5173", "http://localhost:5174"].map((o) => (
          <button key={o} className={`chipbtn mono ${page === o ? "on" : ""}`} onClick={() => setPage(o)}>{o}</button>
        ))}
        <span style={{ fontWeight: 800, marginLeft: 10 }}>Server:</span>
        <button className={`chipbtn mono ${mode === "string" ? "on" : ""}`} onClick={() => setMode("string")}>origin: "http://localhost:5173"</button>
        <button className={`chipbtn mono ${mode === "array" ? "on" : ""}`} onClick={() => setMode("array")}>origin: config.corsOrigins</button>
      </div>
      <div className="grid3" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.38fr) minmax(0,0.95fr)", gap: 14 }}>
        <div className="col" style={{ gap: 6 }}>
          <span className="tag teal">1. Browser sends</span>
          <Code lang="http" size={14} code={`GET /api/recipes HTTP/1.1\nHost: localhost:3000\nOrigin: ${page}`} />
          <div className="note" style={{ fontSize: 15 }}>The browser adds Origin by itself. Your code cannot fake it.</div>
        </div>
        <div className="col" style={{ gap: 6 }}>
          <span className="tag">2. Server answers 200</span>
          <Code lang="http" size={12.5} code={`HTTP/1.1 200 OK\n${header ? "Access-Control-Allow-Origin: " + header + "\n" : ""}Content-Type: application/json`} />
          <div className="note" style={{ fontSize: 15 }}>{mode === "string" ? "One string: cors sends it to EVERY page." : "A list: cors only answers origins on the list."}</div>
        </div>
        <div className="col" style={{ gap: 6 }}>
          <span className={`tag ${ok ? "green" : "red"}`}>3. Browser compares</span>
          <div className="parch" style={{ fontSize: 17 }}>
            {ok ? <b style={{ color: "#1d6b3c" }}>Match. The script gets the data.</b> : <b style={{ color: "var(--red-deep)" }}>No match. The script gets TypeError: Failed to fetch.</b>}
          </div>
          <div className="note" style={{ fontSize: 15 }}>Thunder Client and curl never do step 3. That is why they always "work".</div>
        </div>
      </div>
      {msg && <div className="term pop" style={{ fontSize: 14 }}><span className="err">{msg}</span></div>}
    </div>
  );
}

/* ---------------- 20. Harbor simulator ---------------- */
const API = "http://localhost:3000";
const REQS = {
  get: { label: "GET /api/recipes", method: "GET", path: "/api/recipes", ct: null, status: 200, ms: 19 },
  postJson: { label: "POST /api/recipes (JSON)", method: "POST", path: "/api/recipes", ct: "application/json", status: 201, ms: 24 },
  postText: { label: "POST /api/recipes (text/plain)", method: "POST", path: "/api/recipes", ct: "text/plain", status: 400, ms: 3 },
  del: { label: "DELETE /api/recipes/8", method: "DELETE", path: "/api/recipes/8", ct: null, status: 204, ms: 21 },
};
const SIMPLE_CT = [null, "text/plain", "application/x-www-form-urlencoded", "multipart/form-data"];

export function simulate({ origin, reqKey, allow, position }) {
  const r = REQS[reqKey];
  const same = origin === API;
  const list = allow.split(",").map((s) => s.trim()).filter(Boolean);
  const listed = list.includes(origin);
  const simple = ["GET", "HEAD", "POST"].includes(r.method) && SIMPLE_CT.includes(r.ct);
  const steps = [];
  const log = [];
  let reaches = true;
  let canRead = true;
  let consoleMsg = null;
  const url = API + r.path;

  if (same) {
    steps.push("Same origin: the browser does not need any permission slip.");
    log.push(`${r.method} ${r.path} -> ${r.status} (${r.ms}ms)`);
    return { steps, log, reaches: true, canRead: true, consoleMsg, preflight: false };
  }
  // the header the server would put on a given response
  const headerOnPreflight = position === "before" && listed;
  const headerOnRoute = position === "before" && listed;

  if (!simple) {
    steps.push(`Not a simple request (${r.ct === "application/json" ? "JSON body" : r.method}). The browser first asks: OPTIONS ${r.path}.`);
    if (position === "before") {
      log.push(`OPTIONS ${r.path} -> 204 (2ms)`);
      steps.push(headerOnPreflight ? "cors answers the preflight itself, with Access-Control-Allow-Origin for this origin." : "cors answers the preflight itself, but sends no Access-Control-Allow-Origin: this origin is not on the list.");
    } else {
      log.push(`OPTIONS ${r.path} -> 200 (3ms)`);
      steps.push(position === "after"
        ? "cors never runs in time: Express answers the OPTIONS by itself, with no CORS headers."
        : "There is no cors at all: Express answers the OPTIONS by itself, with no CORS headers.");
    }
    if (!headerOnPreflight) {
      reaches = false;
      canRead = false;
      steps.push(`Preflight failed. The real ${r.method} is never sent.`);
      consoleMsg = `Access to fetch at '${url}' from origin '${origin}' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.`;
      return { steps, log, reaches, canRead, consoleMsg, preflight: true };
    }
    steps.push(`Preflight passed. Now the real ${r.method} goes out.`);
  } else {
    steps.push("Simple request: the browser sends it right away. No preflight.");
  }
  log.push(`${r.method} ${r.path} -> ${r.status} (${r.ms}ms)`);
  steps.push(`The server runs the route and answers ${r.status}.`);
  if (!headerOnRoute) {
    canRead = false;
    steps.push("The answer has no permission slip for this origin. The browser hides it from the script.");
    consoleMsg = `Access to fetch at '${url}' from origin '${origin}' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`;
  } else {
    steps.push("The answer carries Access-Control-Allow-Origin for this origin. The script can read it.");
  }
  return { steps, log, reaches, canRead, consoleMsg, preflight: !simple };
}

function YesNo({ label, value, onChange, truth, shown }) {
  return (
    <div className="row" style={{ alignItems: "center", gap: 8 }}>
      <span style={{ fontWeight: 800, fontSize: 16, width: 170 }}>{label}</span>
      {[true, false].map((v) => (
        <button key={String(v)} className={`chipbtn ${value === v ? "on" : ""}`} onClick={() => onChange(v)}>{v ? "Yes" : "No"}</button>
      ))}
      {shown && (
        <span className={`pop ${truth ? "ok-badge" : "no-badge"}`} style={{ fontSize: 16 }}>
          {truth ? "Yes" : "No"}{value === undefined ? "" : value === truth ? ", you called it" : ", missed it"}
        </span>
      )}
    </div>
  );
}

export function HarborSimulator() {
  const [origin, setOrigin] = useState("http://localhost:5174");
  const [reqKey, setReqKey] = useState("get");
  const [allow, setAllow] = useState("http://localhost:5173");
  const [position, setPosition] = useState("before");
  const [predReach, setPredReach] = useState(undefined);
  const [predRead, setPredRead] = useState(undefined);
  const [result, setResult] = useState(null);
  const reset = (fn) => (v) => { fn(v); setResult(null); setPredReach(undefined); setPredRead(undefined); };
  return (
    <div className="split" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.12fr)", gap: 18 }}>
      <div className="col" style={{ gap: 9 }}>
        <div>
          <div className="note" style={{ fontSize: 14, marginBottom: 3 }}>Page origin (the ship)</div>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"].map((o) => (
              <button key={o} className={`chipbtn mono ${origin === o ? "on" : ""}`} style={{ fontSize: 13 }} onClick={() => reset(setOrigin)(o)}>{o}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="note" style={{ fontSize: 14, marginBottom: 3 }}>Request</div>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {Object.entries(REQS).map(([k, r]) => (
              <button key={k} className={`chipbtn mono ${reqKey === k ? "on" : ""}`} style={{ fontSize: 13 }} onClick={() => reset(setReqKey)(k)}>{r.label}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="note" style={{ fontSize: 14, marginBottom: 3 }}>CORS_ORIGINS on the server</div>
          <input value={allow} onChange={(e) => reset(setAllow)(e.target.value)} className="mono" aria-label="CORS_ORIGINS"
            style={{ width: "100%", fontSize: 15, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(143,227,220,.35)", background: "#06121f", color: "var(--white)" }} />
        </div>
        <div>
          <div className="note" style={{ fontSize: 14, marginBottom: 3 }}>Where is app.use(cors(...))?</div>
          <div className="row" style={{ gap: 6 }}>
            {[["before", "before the routes"], ["after", "after the routes"], ["missing", "missing"]].map(([k, l]) => (
              <button key={k} className={`chipbtn ${position === k ? "on" : ""}`} style={{ fontSize: 13 }} onClick={() => reset(setPosition)(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="panel" style={{ padding: "8px 12px" }}>
          <div className="note" style={{ fontSize: 14, marginBottom: 4 }}>Crews predict, then send:</div>
          <YesNo label="Reaches the route?" value={predReach} onChange={setPredReach} truth={result?.reaches} shown={!!result} />
          <div style={{ height: 6 }} />
          <YesNo label="Script can read it?" value={predRead} onChange={setPredRead} truth={result?.canRead} shown={!!result} />
        </div>
        <div><button className="btn" onClick={() => setResult(simulate({ origin, reqKey, allow, position }))}>Send</button></div>
      </div>
      <div className="col" style={{ gap: 8 }}>
        {!result && <div className="parch" style={{ fontSize: 18 }}>Pick a ship, a request, a guest list, and where the harbor master stands. Predict both answers. Then send.</div>}
        {result && (
          <>
            <div className="panel pop" style={{ padding: "8px 12px" }}>
              {result.steps.map((s, k) => <div key={k} style={{ fontSize: 15.5, color: "var(--foam)", marginBottom: 3 }}>{k + 1}. {s}</div>)}
            </div>
            <div className="term pop" style={{ fontSize: 14 }}>
              <div className="dim">server terminal (logger runs first)</div>
              {result.log.map((l, k) => <div key={k} className="ok">{l}</div>)}
              {result.log.length === 0 && <div className="dim">(nothing arrived)</div>}
            </div>
            <div className="term pop" style={{ fontSize: 13.5 }}>
              <div className="dim">browser console, page {origin}</div>
              {result.consoleMsg ? <div className="err">{result.consoleMsg}</div> : <div className="ok">(no CORS errors: the script got the response)</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- small helper: award a bounty from inside a slide ---------------- */
export function QuickBounty({ amount = 1_000_000, label = "+1M" }) {
  const { crews, award } = useBounty();
  const [paid, setPaid] = useState({});
  return (
    <div className="row" style={{ gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      <span className="note">Bounty {label}:</span>
      {crews.map((c, k) => (
        <button key={k} className={`chipbtn ${paid[k] ? "on" : ""}`} style={{ fontSize: 13 }} onClick={() => { award(k, amount); setPaid({ ...paid, [k]: (paid[k] || 0) + 1 }); }}>
          {c.name}{paid[k] ? ` x${paid[k]}` : ""}
        </button>
      ))}
    </div>
  );
}
