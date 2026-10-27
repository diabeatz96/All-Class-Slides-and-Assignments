import { useState, useEffect, useMemo } from "react";
import { T, Code, Slide, Col, Split, Tiers, Term, DeckShell } from "./ui.jsx";
import { Checker, TypesPanel, useEngine, loadEngine } from "./Checker.jsx";
import { CONSOLE, P_VALUES, P_OBJECTS, P_MAYBE, P_FUNCTIONS, P_NARROW, SUPA_PRELUDE, P_CLIENT } from "./presets.js";

/* ------------------------------------------------------------------
   CSC 436  |  Week 10, Thursday Oct 29  |  Mission 10
   TypeScript via generated types. Every jar in the pantry gets a label,
   and the labels come straight from the database.
   Color code: blue = browser, teal = server, amber = database.
------------------------------------------------------------------- */

/* ============ shared bits ============ */

function Step({ n, children, c = T.accent }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ width: 24, height: 24, borderRadius: 12, background: c, color: "#fff", fontWeight: 800, fontSize: 13, display: "grid", placeItems: "center", flex: "none", marginTop: 1 }}>{n}</span>
      <div style={{ fontSize: 15, lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}

const M = ({ children }) => <code style={{ background: "#eef1f4", padding: "1px 6px", borderRadius: 6, fontSize: "0.92em" }}>{children}</code>;

function TypeAlong({ steps, note }) {
  return (
    <div className="panel" style={{ padding: "14px 16px", borderLeft: `5px solid ${T.blue}` }}>
      <div style={{ fontWeight: 800, marginBottom: 8, color: T.blue }}>Type along at typescriptlang.org/play</div>
      <Col gap={7}>{steps.map((s, i) => <Step key={i} n={i + 1} c={T.blue}>{s}</Step>)}</Col>
      {note && <div className="note" style={{ marginTop: 8 }}>{note}</div>}
      <div className="note" style={{ marginTop: 6, fontSize: 12.5 }}>Or: playground.ts in a folder OUTSIDE your Mission repo.</div>
    </div>
  );
}

/* ============ 1. Title ============ */

const JARS = [
  { k: "id", t: "number", v: "3" },
  { k: "name", t: "string", v: "\"Pad Thai\"" },
  { k: "minutes", t: "number", v: "\"25\"" },
  { k: "tags", t: "string[]", v: "[\"noodles\"]" },
];

function TitleSlide() {
  const [labels, setLabels] = useState(true);
  const [ran, setRan] = useState(false);
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.05fr 1fr", alignItems: "center", padding: "0 70px", gap: 46 }}>
      <div>
        <div className="kicker">CSC 436, Week 10, Mission 10, Thursday Oct 29</div>
        <h1 style={{ fontSize: 62, lineHeight: 1.02, fontWeight: 800 }}>Label every jar</h1>
        <p className="lead" style={{ marginTop: 20, maxWidth: 560, fontSize: 21 }}>
          Tuesday the pantry became a real database. Today every jar gets a label, and your editor reads the labels for you. Mistakes turn red while you type, before the code ever runs.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <span className="chip blue">TypeScript</span><span className="chip">types</span><span className="chip amber">generated from the database</span><span className="chip good">node runs .ts</span>
        </div>
      </div>
      <div className="panel" style={{ padding: 22 }}>
        <div className="note" style={{ marginBottom: 12 }}>One recipe row, four jars</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {JARS.map((j) => (
            <div key={j.k} style={{ border: `2px solid ${T.amber}`, borderRadius: "14px 14px 18px 18px", background: T.amberSoft, padding: "10px 6px 14px", textAlign: "center" }}>
              <div className="mono" style={{ fontWeight: 800, fontSize: 15 }}>{j.k}</div>
              <div style={{ margin: "10px 4px 0", padding: "6px 2px", borderRadius: 8, background: labels ? "#fff" : "transparent", border: `1px dashed ${labels ? T.amber : "#d6b68a"}`, minHeight: 32 }}>
                <span className="mono" style={{ color: labels ? "#9d174d" : T.muted, fontWeight: 700, fontSize: 14 }}>{labels ? j.t : "?"}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="code" style={{ marginTop: 16, fontSize: 14.5, padding: "10px 0" }}>
          <div className="ln"><span>{"// minutes arrived as text: \"25\""}</span></div>
          <div className={"ln" + (labels && ran ? " err" : "")}><span><span className="tk-k">const</span> total = recipe.minutes + <span className="tk-n">5</span>;</span></div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className={"btn small" + (labels ? " on" : "")} onClick={() => { setLabels(true); setRan(false); }}>Labels on (TypeScript)</button>
          <button className={"btn small" + (!labels ? " on" : "")} onClick={() => { setLabels(false); setRan(false); }}>Labels off (JavaScript)</button>
          <button className="btn small primary" onClick={() => setRan(true)}>{labels ? "Check it" : "Run it"}</button>
        </div>
        {ran && (labels
          ? <div className="msg pop" style={{ marginTop: 10 }}>Before it runs: Type 'string' is not assignable to type 'number'.</div>
          : <div className="term pop" style={{ marginTop: 10, padding: "10px 14px" }}><span className="dim">total is </span><span style={{ color: "#fde68a" }}>"255"</span><span className="dim">  (no error, just wrong)</span></div>)}
      </div>
    </div>
  );
}

/* ============ 2. Warm-up: spot the bug ============ */

const BUGS = [
  { title: "Minutes arrived as text", code: "// recipe.minutes is \"25\"\nconst total = recipe.minutes + 5;", a: "wrong", run: "total is \"255\". Text plus a number glues them together. No error.", ts: "Add one label (: Recipe) and TypeScript says: Type 'string' is not assignable to type 'number'." },
  { title: "A typo", code: "res.json({ time: recipe.minuts });", a: "wrong", run: "Sends { } because minuts is undefined, and JSON drops undefined. No error.", ts: "Property 'minuts' does not exist on type 'Recipe'. Did you mean 'minutes'?" },
  { title: "Text id, number id", code: "const found = recipes.find(\n  (r) => r.id === req.params.id);", a: "wrong", run: "3 === \"3\" is false. Every id says 404. Week 2's Silver Trial, again.", ts: "This comparison appears to be unintentional because the types 'number' and 'string' have no overlap." },
  { title: "Column name typo", code: "await supabase.from(\"recipes\")\n  .select(\"*\").eq(\"cusine\", \"Thai\");", a: "crash", run: "The database answers: column recipes.cusine does not exist. Your route throws, the client gets a 500.", ts: "Argument of type '\"cusine\"' is not assignable to parameter of type '\"created_at\" | \"cuisine\" | \"id\" | \"minutes\" | \"name\" | \"tags\"'." },
  { title: "Forgot await", code: "const { data } = supabase\n  .from(\"recipes\").select(\"*\");\nres.json(data);", a: "wrong", run: "data is undefined. The response is 200 with an empty body, and React fails to parse it.", ts: "Property 'data' does not exist on type 'PostgrestFilterBuilder<...>'. (It is a question, not an answer, until you await it.)" },
  { title: "No such row", code: "const { data } = await supabase.from(\"recipes\")\n  .select(\"*\").eq(\"id\", 99).maybeSingle();\nres.json(data.name);", a: "crash", run: "data is null. Cannot read properties of null (reading 'name'). 500.", ts: "'data' is possibly 'null'." },
];
const OUTCOMES = [{ k: "crash", label: "Crash (500)" }, { k: "wrong", label: "Wrong, no error" }, { k: "works", label: "Works fine" }];

function WarmupSlide() {
  const [ans, setAns] = useState({});
  const done = Object.keys(ans).length === BUGS.length;
  return (
    <Slide kicker="Warm-up, 10 minutes, pairs" title="Spot the bug before it runs" sub="Real bugs from this course. Predict what happens when the code RUNS. Then read what TypeScript says before it runs.">
      {done && <div className="chip warn pop" style={{ position: "absolute", top: 50, right: 60, fontSize: 14 }}>4 of 6 fail silently. TypeScript flags all 6.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
        {BUGS.map((b, i) => {
          const pick = ans[i];
          const right = pick === b.a;
          return (
            <div key={i} className="panel" style={{ padding: "9px 11px", borderColor: pick ? (right ? T.good : T.warn) : T.line, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{i + 1}. {b.title}</div>
              <Code size={11} numbers={false} style={{ padding: "6px 0" }}>{b.code}</Code>
              <div style={{ display: "flex", gap: 5 }}>
                {OUTCOMES.map((o) => (
                  <button key={o.k} className="btn small" style={{ padding: "4px 8px", fontSize: 12, ...(pick === o.k ? { background: right ? T.good : T.warn, color: "#fff", borderColor: "transparent" } : {}) }} onClick={() => setAns({ ...ans, [i]: o.k })}>{o.label}</button>
                ))}
              </div>
              {pick && (
                <div className="pop" style={{ fontSize: 12, lineHeight: 1.38 }}>
                  <div><b style={{ color: right ? T.good : T.warn }}>{right ? "Yes. " : b.a === "crash" ? "It crashes. " : "Wrong answer, no error. "}</b>{b.run}</div>
                  <div style={{ marginTop: 4, color: "#9d174d" }}><b>TypeScript:</b> {b.ts}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Slide>
  );
}

/* ============ 3. When do you find out? ============ */

const STAGES = ["You type it", "You save", "Server restarts", "You send a request", "You read the response", "A user finds it"];
const FOUND_JS = [5, 4, 4, 3, 4, 5]; // stage index per bug, JavaScript
function TimelineSlide() {
  const [ts, setTs] = useState(false);
  return (
    <Slide kicker="Concept" title="When do you find out?" sub="Same six bugs from the warm-up. Where on this line does each one show up? Flip between JavaScript and TypeScript.">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className={"btn" + (!ts ? " on" : "")} onClick={() => setTs(false)}>JavaScript</button>
        <button className={"btn" + (ts ? " on" : "")} onClick={() => setTs(true)}>TypeScript</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
        {STAGES.map((s, si) => {
          const here = BUGS.map((_, bi) => bi).filter((bi) => (ts ? 0 : FOUND_JS[bi]) === si);
          const late = si >= 3;
          return (
            <div key={s} className="panel" style={{ padding: 12, minHeight: 250, borderTop: `5px solid ${si === 0 ? T.good : late ? T.warn : T.line}`, display: "flex", flexDirection: "column" }}>
              <div className="note mono">step {si + 1}</div>
              <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.2, marginTop: 2 }}>{s}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                {here.map((bi) => (
                  <span key={bi + (ts ? "t" : "j")} className="pop" style={{ width: 34, height: 34, borderRadius: 17, display: "grid", placeItems: "center", fontWeight: 800, color: "#fff", background: ts ? T.good : late ? T.warn : T.amber }}>{bi + 1}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <div className="callout"><div className="h">The later, the worse</div>Found at step 6, a bug has more code built on top of it and real people affected. Found at step 1, it costs you five seconds.</div>
        <div className="callout good"><div className="h">TypeScript moves bugs to step 1</div>Not every bug. Only the ones that come from YOUR code disagreeing with the labels. That is a lot of them.</div>
      </div>
    </Slide>
  );
}

/* ============ 4. TypeScript is JavaScript with labels ============ */

const ERASE_CODE = `type Recipe = {
  name: string;
  minutes: number;
};

function totalTime(recipe: Recipe, extra: number): number {
  return recipe.minutes + extra;
}

const pizza: Recipe = { name: "Pizza", minutes: 25 };
console.log(totalTime(pizza, 5)); // 30`;

function MaskedCode({ text, mask, size = 15 }) {
  const lines = text.split("\n");
  let off = 0;
  return (
    <div className="code" style={{ fontSize: size }}>
      {lines.map((l, i) => {
        const start = off;
        off += l.length + 1;
        const parts = [];
        let run = "", on = false;
        for (let c = 0; c < l.length; c++) {
          const m = !!mask?.[start + c];
          if (m !== on && run) { parts.push(on ? <span key={c} className="erased">{run}</span> : <span key={c}>{highlight2(run)}</span>); run = ""; }
          on = m; run += l[c];
        }
        if (run) parts.push(on ? <span key="e" className="erased">{run}</span> : <span key="e">{highlight2(run)}</span>);
        return <div key={i} className="ln"><span className="n">{i + 1}</span><span>{parts.length ? parts : " "}</span></div>;
      })}
    </div>
  );
}
// light highlight for fragments (keywords only, keeps it simple)
function highlight2(s) {
  return s.split(/(\bconst\b|\bfunction\b|\breturn\b|"[^"]*"|\/\/.*$|\b\d+\b)/).map((p, i) => {
    if (!p) return null;
    if (/^(const|function|return)$/.test(p)) return <span key={i} className="tk-k">{p}</span>;
    if (/^"/.test(p)) return <span key={i} className="tk-s">{p}</span>;
    if (/^\/\//.test(p)) return <span key={i} className="tk-c">{p}</span>;
    if (/^\d+$/.test(p)) return <span key={i} className="tk-n">{p}</span>;
    return p;
  });
}

function EraseSlide() {
  const engine = useEngine();
  const [erased, setErased] = useState(false);
  const out = useMemo(() => (engine ? engine.erase(ERASE_CODE) : null), [engine]);
  return (
    <Slide kicker="Concept" title="TypeScript is JavaScript with labels" sub="Everything after a colon is a label for you and your editor. Before the code runs, the labels are erased. What is left is plain JavaScript.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Col gap={8}>
          <div className="note" style={{ height: 34, display: "flex", alignItems: "center" }}>What you write: <b style={{ marginLeft: 4 }}>recipes.ts</b></div>
          <Code size={13.5} lang="ts">{ERASE_CODE}</Code>
        </Col>
        <Col gap={8}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 34 }}>
            <span className="note">What Node actually runs {erased ? "(labels erased)" : ""}</span>
            <button className="btn small primary" onClick={() => setErased(!erased)} disabled={!out}>{erased ? "Put the labels back" : "Erase the labels"}</button>
          </div>
          {out && erased ? <MaskedCode text={out.text} mask={out.mask} size={13.5} /> : <Code size={13.5} lang="ts">{ERASE_CODE}</Code>}
        </Col>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
        <div className="callout info"><div className="h">Node 22.18 and newer</div>Runs .ts files by replacing the labels with spaces. Same line numbers, so errors point at the right line.</div>
        <div className="callout"><div className="h">Node does NOT check them</div>It erases labels without reading them. A wrong label runs anyway. Checking is a separate job.</div>
        <div className="callout good"><div className="h">tsc does the checking</div>The TypeScript compiler reads every label and reports every disagreement. So does VS Code, live.</div>
      </div>
    </Slide>
  );
}

/* ============ 5 to 9. Playgrounds ============ */

function PlaygroundSlide({ kicker, title, sub, presets, prelude = CONSOLE, steps, note, side, size = 13, only }) {
  const [res, setRes] = useState(null);
  return (
    <Slide kicker={kicker} title={title} sub={sub}>
      <Split cols="1.25fr 1fr">
        <Checker presets={presets} prelude={prelude} onResult={setRes} size={size} probsHeight={140} maxProbs={3} />
        <Col>
          <TypeAlong steps={steps} note={note} />
          <TypesPanel result={res} only={only} />
          {side}
        </Col>
      </Split>
    </Slide>
  );
}

function ValuesSlide() {
  return (
    <PlaygroundSlide kicker="Playground 1 of 5" title="Labels on values" sub="A label goes after the name, after a colon. The editor is live: type in it."
      presets={P_VALUES} size={14}
      steps={[
        <>Write <M>let minutes: number = 25;</M> Read it as "minutes is a number".</>,
        <>Now <M>minutes = "forty";</M> Red. Hover the red to read why.</>,
        <>Write <M>let name = "Pad Thai";</M> with NO label. Hover name: TypeScript guessed string.</>,
        <>Lists: <M>const tags: string[] = [...]</M> then try <M>tags.push(5)</M>.</>,
      ]}
      note="Basic labels: string, number, boolean. A list: string[]. Only label what TypeScript cannot guess."
    />
  );
}

function ObjectsSlide() {
  return (
    <PlaygroundSlide kicker="Playground 2 of 5" title="Labels on whole objects" sub="type Recipe = { ... } describes a shape. Put it on a value with : Recipe and every key gets checked."
      presets={P_OBJECTS}
      steps={[
        <>Write the <M>type Recipe</M> block. A type is a name for a shape.</>,
        <>Make <M>const pizza: Recipe</M> and misspell a key: <M>minuts</M>.</>,
        <>Leave out <M>tags</M>. Read the message: missing in type.</>,
        <>Ask for <M>pizza.cuisine</M>. A key that is not in the shape is red.</>,
      ]}
      side={<div className="callout info"><div className="h">Look familiar?</div>Tuesday's recipes table has these same columns. Hold that thought.</div>}
    />
  );
}

function MaybeSlide() {
  return (
    <PlaygroundSlide kicker="Playground 3 of 5" title="Maybe there, maybe not" sub="Some values can be missing. TypeScript makes you check before you use them."
      presets={P_MAYBE}
      steps={[
        <><M>number | null</M> means "a number, or nothing". The | reads as "or".</>,
        <><M>notes?: string</M> means the key might not be there at all (undefined).</>,
        <>Multiply <M>ramen.servings * 2</M> without checking. Red.</>,
        <>Wrap it in <M>if (ramen.servings !== null)</M>. Red is gone. TypeScript read your if.</>,
      ]}
      side={<div className="callout info"><div className="h">You already do this</div>maybeSingle() gives back Recipe | null. That is why every route says if (!data) before it touches data.</div>}
    />
  );
}

function FunctionsSlide() {
  return (
    <PlaygroundSlide kicker="Playground 4 of 5" title="Functions say what they take and give back" sub="Label each parameter. Label what comes back after the parentheses."
      presets={P_FUNCTIONS} only={["findRecipe", "fromUrl", "found", "total"]}
      steps={[
        <>Write <M>{"function findRecipe(id: number)"}</M> and its return label.</>,
        <>Call it with <M>"3"</M>, the way req.params.id arrives. Red.</>,
        <>Call it with <M>Number(fromUrl)</M>. Fixed.</>,
        <>Pass <M>[25, 30, "10"]</M> to totalMinutes. The list must be all numbers.</>,
      ]}
      side={<div className="callout"><div className="h">Remember this one</div>req.params.id is always text; the id column is a number. You will need Number() three times today.</div>}
    />
  );
}

function NarrowSlide() {
  return (
    <PlaygroundSlide kicker="Playground 5 of 5" title="Check first: typeof, unknown, any" sub="unknown means: you must check what it is before you use it. any means: TypeScript stops looking."
      presets={P_NARROW}
      steps={[
        <>Write <M>shout(value: unknown)</M> and call <M>value.toUpperCase()</M>. Red.</>,
        <>Add <M>if (typeof value === "string")</M> around it. Inside the if, value is a string.</>,
        <>Try <M>value: any</M>. No red at all, even for <M>trustMe(42)</M>, which crashes.</>,
        <>Click the preset "Like validateRecipe". Look familiar?</>,
      ]}
      side={<div className="callout info"><div className="h">You did this in Week 9</div>validateRecipe's typeof checks are narrowing. And req.body is any.</div>}
    />
  );
}

/* ============ 10. Code vs data ============ */

const WHO = [
  { t: "You typed recipe.minuts", a: "ts", why: "Your code disagrees with the Recipe label. Red while you type." },
  { t: "Someone sends { \"minutes\": \"forty\" } from Thunder Client", a: "val", why: "That happens while the server runs. TypeScript is long gone. validateRecipe answers 400." },
  { t: "You passed req.params.id (text) to .eq(\"id\", ...)", a: "ts", why: "Your code, a known label. Red before you run anything." },
  { t: "A POST arrives with no name at all", a: "val", why: "Their data, not your code. Validation, and the database's not null rule as the last net." },
  { t: "You forgot maybeSingle() can give back null", a: "ts", why: "'data' is possibly 'null'. Your code skipped a check the label demands." },
  { t: "A user types -5 into the minutes field", a: "val", why: "Runtime data. Validation (and the database check rule: minutes > 0)." },
];

function CodeVsDataSlide() {
  const [ans, setAns] = useState({});
  return (
    <Slide kicker="Concept" title="TypeScript checks your code. Validation checks their data." sub="TypeScript only reads what you wrote, before it runs. It never meets the strangers who send requests. Who catches each mistake?">
      <Split cols="1.45fr 1fr">
        <Col gap={8}>
          {WHO.map((w, i) => {
            const pick = ans[i];
            const right = pick === w.a;
            return (
              <div key={i} className="row" style={{ flexDirection: "column", alignItems: "stretch", gap: 5, padding: "8px 12px", borderColor: pick ? (right ? T.good : T.warn) : T.line }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{w.t}</span>
                  <span style={{ display: "flex", gap: 5, flex: "none" }}>
                    {[["ts", "TypeScript"], ["val", "Validation"]].map(([k, l]) => (
                      <button key={k} className="btn small" style={pick === k ? { background: right ? T.good : T.warn, color: "#fff", borderColor: "transparent" } : {}} onClick={() => setAns({ ...ans, [i]: k })}>{l}</button>
                    ))}
                  </span>
                </div>
                {pick && <div className="note pop" style={{ fontSize: 13 }}>{w.why}</div>}
              </div>
            );
          })}
        </Col>
        <Col>
          <div className="panel" style={{ padding: 16, borderTop: `5px solid ${T.blue}` }}>
            <div style={{ fontWeight: 800, color: T.blue }}>TypeScript</div>
            <div style={{ fontSize: 15, marginTop: 4 }}>When: while you type. Checks: your code. Gone by the time the server runs.</div>
          </div>
          <div className="panel" style={{ padding: 16, borderTop: `5px solid ${T.accent}` }}>
            <div style={{ fontWeight: 800, color: T.accent }}>Validation (validateRecipe)</div>
            <div style={{ fontSize: 15, marginTop: 4 }}>When: every request, while the server runs. Checks: their data.</div>
          </div>
          <Code size={13} lang="ts" numbers={false}>{`router.post("/", validateRecipe, async (req, res) => {
  req.body // hover it: any`}</Code>
          <div className="callout"><div className="h">req.body is any</div>Express cannot know what a stranger will send. So TypeScript does not pretend to. Keep validating.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 11. The database already knows the types ============ */

const SQL = `create table public.recipes (
  id          bigint generated always as identity primary key,
  name        text not null,
  cuisine     text not null,
  minutes     integer not null check (minutes > 0),
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);`;
const ROW = `Row: {
  created_at: string
  cuisine: string
  id: number
  minutes: number
  name: string
  tags: string[]
}`;
const INSERT = `Insert: {
  created_at?: string
  cuisine: string
  id?: never
  minutes: number
  name: string
  tags?: string[]
}`;
const UPDATE = `Update: {
  created_at?: string
  cuisine?: string
  id?: never
  minutes?: number
  name?: string
  tags?: string[]
}`;
const COLS = [
  { k: "id", sql: 2, t: 4, x: "bigint becomes number. Row: always there. Insert: id?: never means you may NOT send one, because the database generates it. In error messages TypeScript shows it as undefined: Type 'number' is not assignable to type 'undefined'." },
  { k: "name", sql: 3, t: 6, x: "text becomes string. not null with no default: required in Row AND in Insert. Update: optional, because you might not be changing it." },
  { k: "cuisine", sql: 4, t: 3, x: "Same story as name: text not null, so string, required to insert." },
  { k: "minutes", sql: 5, t: 5, x: "integer becomes number. TypeScript has one number type for whole numbers and decimals. The check (minutes > 0) is a database rule TypeScript cannot see; validation still guards it." },
  { k: "tags", sql: 6, t: 7, x: "text[] becomes string[]. It has a default ('{}', an empty list), so Insert makes it optional: tags?." },
  { k: "created_at", sql: 7, t: 2, x: "timestamptz becomes string, because dates travel as text in JSON. default now() means the database fills it in, so it is optional in Insert." },
];

function SchemaSlide() {
  const [k, setK] = useState("id");
  const c = COLS.find((x) => x.k === k);
  return (
    <Slide kicker="Concept" title="The database already knows the types" sub="Tuesday's setup.sql gave every column a type and rules. Supabase turns that into three TypeScript shapes. Click a column.">
      <Split cols="0.85fr 2fr" gap={20}>
        <Col gap={8}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {COLS.map((x) => <button key={x.k} className={"btn small" + (x.k === k ? " on" : "")} onClick={() => setK(x.k)}>{x.k}</button>)}
          </div>
          <div className="panel pop" key={k} style={{ padding: 14, borderLeft: `5px solid ${T.amber}` }}>
            <div className="mono" style={{ fontWeight: 800, fontSize: 18 }}>{c.k}</div>
            <p style={{ fontSize: 15, lineHeight: 1.5, marginTop: 6 }}>{c.x}</p>
          </div>
          <div className="note" style={{ fontSize: 13 }}><b>Row</b>: what you GET back. <b>Insert</b>: what you may send to insert(). <b>Update</b>: what you may send to update(). The generator lists columns A to Z.</div>
        </Col>
        <Col gap={10}>
          <Code size={12} lang="sql" hl={[c.sql]} file="setup.sql">{SQL}</Code>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <Code size={12} lang="ts" numbers={false} hl={[c.t]} file="Row">{ROW}</Code>
            <Code size={12} lang="ts" numbers={false} hl={[c.t]} file="Insert">{INSERT}</Code>
            <Code size={12} lang="ts" numbers={false} hl={[c.t]} file="Update">{UPDATE}</Code>
          </div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 12. Generate them, do not write them ============ */

function GenerateSlide() {
  return (
    <Slide kicker="Code along" title="Generate the types. Never write them by hand." sub="One command reads your real database and writes data/database.types.ts.">
      <Split cols="1.1fr 1fr">
        <Col gap={10}>
          <div className="panel" style={{ padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Your project ref is in two places</div>
            <div className="mono" style={{ fontSize: 14, lineHeight: 1.8 }}>
              <div>supabase.com/dashboard/project/<span style={{ background: T.amberSoft, color: T.amber, fontWeight: 800, padding: "1px 4px", borderRadius: 4 }}>abcdefghijklmnop</span></div>
              <div>https://<span style={{ background: T.amberSoft, color: T.amber, fontWeight: 800, padding: "1px 4px", borderRadius: 4 }}>abcdefghijklmnop</span>.supabase.co</div>
            </div>
          </div>
          <Term height={250} title="terminal, inside your project" script={[
            { cmd: "npx supabase login", out: "(a browser tab opens: approve it; paste the code it shows if asked)" },
            { cmd: "npx supabase gen types typescript --project-id abcdefghijklmnop --schema public > data/database.types.ts", out: "(prints nothing: > sends it into the file)" },
            { cmd: "npm run typecheck", out: "(prints nothing: zero errors)" },
          ]} />
          <div className="panel" style={{ padding: "10px 14px" }}>
            <div className="note" style={{ marginBottom: 4 }}>package.json, inside "scripts", so next time it is just <b>npm run types</b></div>
            <div className="mono" style={{ fontSize: 12.5, whiteSpace: "pre-wrap", wordBreak: "break-all", color: T.ink }}>"types": "npx supabase gen types typescript --project-id abcdefghijklmnop --schema public &gt; data/database.types.ts"</div>
          </div>
        </Col>
        <Col gap={10}>
          <div className="callout info"><div className="h">Types are a snapshot</div>The file is a photo of your database at one moment. Change the database, take a new photo. Never edit the file by hand: the next npm run types overwrites it.</div>
          <div className="callout"><div className="h">Login not working?</div>Copy checkpoints/08-all-typescript/data/database.types.ts into your data folder. Everyone ran the same setup.sql, so the file is the same.</div>
          <div className="panel" style={{ padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>Open the file and find three words</div>
            <div style={{ fontSize: 15 }}>Under recipes: <M>Row</M>, <M>Insert</M>, <M>Update</M>. The long helper types at the bottom are plumbing. You will use them by name, like <M>Tables&lt;"recipes"&gt;</M>.</div>
          </div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 13. A typed client ============ */

function ClientSlide() {
  const [res, setRes] = useState(null);
  return (
    <Slide kicker="Playground, simplified Supabase types" title="One small change: createClient<Database>" sub="Give the client your Database type and every query knows your columns.">
      <Split cols="1.3fr 1fr">
        <Checker presets={P_CLIENT} prelude={SUPA_PRELUDE} onResult={setRes} size={12.5} probsHeight={130} maxProbs={3} />
        <Col>
          <Code size={12.5} lang="ts" numbers={false} file="data/supabase.ts">{`import type { Database } from "./database.types.ts";

export const supabase =
  createClient<Database>(url, secretKey);`}</Code>
          <TypesPanel result={res} only={["data", "error", "saved", "id"]} />
          <div className="callout info"><div className="h">Try it</div>Change "cusine" to "cuisine". Then delete Number( ) around the id and watch the red come back.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 14. tsconfig.json ============ */

const TSCONFIG = `{
  // TypeScript settings for a Node server that runs .ts files directly.
  "compilerOptions": {
    // CHECK ONLY. Node runs our .ts files itself (it strips the types),
    // so the TypeScript compiler never needs to write .js files.
    "noEmit": true,

    // Modern JavaScript and modern Node-style imports.
    "target": "esnext",
    "module": "nodenext",

    // Three rules that match how Node runs TypeScript:
    "allowImportingTsExtensions": true, // write "./file.ts", the real file name
    "verbatimModuleSyntax": true,       // type-only imports must say \`import type\`
    "erasableSyntaxOnly": true,         // only syntax Node can simply erase

    // The safety net. This is the whole point.
    "strict": true,

    // Bring in the types for Node itself (process.env and friends).
    "types": ["node"],

    // Do not re-check the types inside node_modules.
    "skipLibCheck": true
  },
  "include": ["**/*.ts"]
}`;
const TSC_X = {
  6: ["noEmit", "tsc only checks. It never writes .js files, because Node runs the .ts files itself. Without this, tsc would litter your folders with copies."],
  9: ["target", "Which JavaScript features to allow. esnext means: all of the modern ones. Node 22 understands them."],
  10: ["module", "nodenext means: follow Node's own import rules exactly. That is why TypeScript insists on file extensions in imports."],
  13: ["allowImportingTsExtensions", "Lets you write import ... from \"./data/supabase.ts\", the real file name. Node needs the real name to find the file."],
  14: ["verbatimModuleSyntax", "Imports that are only types must say import type. Node erases those lines. Without the word type, Node tries to load something that does not exist at runtime and crashes."],
  15: ["erasableSyntaxOnly", "Blocks the few TypeScript features Node cannot simply erase, like enum. If tsc is happy, Node can run it."],
  18: ["strict", "Turns on the important checks, including 'possibly null'. This one line is where most of the value comes from. Never turn it off to make red go away."],
  21: ["types", "Loads the labels for Node itself, from @types/node. Without it, process and process.env are unknown."],
  24: ["skipLibCheck", "Do not re-check the label files inside node_modules. Faster, and their mistakes are not yours to fix."],
  26: ["include", "Which files to check: every .ts file in the project. node_modules is skipped automatically."],
};

function TsconfigSlide() {
  const [line, setLine] = useState(18);
  const x = TSC_X[line];
  return (
    <Slide kicker="Code walkthrough" title="tsconfig.json, line by line">
      <Split cols="1.75fr 1fr">
        <Code size={12} hl={[line]} onLine={(n) => TSC_X[n] && setLine(n)} file="tsconfig.json (project root)">{TSCONFIG}</Code>
        <Col>
          <div className="note">Click any setting.</div>
          <div className="panel pop" key={line} style={{ padding: 18, borderLeft: `5px solid ${line === 18 ? T.good : T.accent}` }}>
            <div className="note mono">line {line}</div>
            <div className="mono" style={{ fontWeight: 800, fontSize: 19, marginTop: 4, wordBreak: "break-word" }}>{x[0]}</div>
            <p className="big" style={{ marginTop: 8, fontSize: 16 }}>{x[1]}</p>
          </div>
          <div className="panel" style={{ padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Install first (dev tools only)</div>
            <div className="mono" style={{ fontSize: 13, background: "#0b0f14", color: "#d1d9e0", padding: "10px 12px", borderRadius: 10 }}>
              <span style={{ color: "#34d399" }}>$ </span>npm install -D typescript @types/node @types/express @types/cors supabase
            </div>
            <div className="note" style={{ marginTop: 6 }}>-D: only needed while developing. express and cors need @types packages; supabase is the CLI that generates types.</div>
          </div>
          <div className="callout info"><div className="h">JSON with comments?</div>tsconfig.json is allowed to have comments. package.json is not.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 15. Running TypeScript ============ */

const RULES = [
  {
    t: "Import your own files by their real name",
    good: "import { logger } from \"./middleware/logger.ts\";",
    tsc: "TS2835: Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './middleware/logger.js'?",
    node: "Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../middleware/logger' imported from .../server.ts",
    tip: "TypeScript suggests .js. In our setup, write .ts: the real file name.",
  },
  {
    t: "Types-only imports say import type",
    good: "import type { Request, Response } from \"express\";",
    tsc: "TS1484: 'Request' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.",
    node: "SyntaxError: Named export 'Request' not found. The requested module 'express' is a CommonJS module, which may not support all module.exports as named exports.",
    tip: "Types do not exist when the code runs. import type tells Node to erase the whole line.",
  },
  {
    t: "No enum (use a union of strings)",
    good: "type Difficulty = \"easy\" | \"medium\" | \"hard\";",
    tsc: "TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.",
    node: "SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode",
    tip: "An enum would need new JavaScript written for it. Node only erases.",
  },
  {
    t: "Some packages need their labels installed",
    good: "npm install -D @types/cors",
    tsc: "TS7016: Could not find a declaration file for module 'cors'. '.../node_modules/cors/lib/index.js' implicitly has an 'any' type.",
    node: "(runs fine: this is only a checking problem)",
    tip: "supabase-js ships its own types. express and cors keep theirs in @types/express and @types/cors.",
  },
];

function RunningSlide() {
  const [k, setK] = useState(0);
  const r = RULES[k];
  return (
    <Slide kicker="Concept and code along" title="Node runs it. tsc checks it." sub="Two different jobs, two different commands. Watch what happens to a file with a wrong label.">
      <Split cols="1fr 1.15fr">
        <Col gap={10}>
          <Code size={13} lang="ts" err={[1]} file="hello.ts">{`const minutes: number = "25";
console.log(minutes + 5);`}</Code>
          <Term height={262} title="terminal" script={[
            { cmd: "node -v", out: "v24.11.0   (need v22.18 or newer)" },
            { cmd: "node hello.ts", out: "255" },
            { cmd: "npx tsc", out: "hello.ts:1:7 - error TS2322: Type 'string' is not assignable to type 'number'.\n\n1 const minutes: number = \"25\";\n        ~~~~~~~\n\nFound 1 error in hello.ts:1", err: true },
          ]} />
          <div className="callout"><div className="h">Node printed 255 and said nothing</div>Node never checks labels. npx tsc (same as npm run typecheck) checks every .ts file. Then delete hello.ts.</div>
        </Col>
        <Col gap={8}>
          <div style={{ fontWeight: 800 }}>Four rules for TypeScript that Node runs</div>
          {RULES.map((x, i) => (
            <button key={i} className="row" onClick={() => setK(i)} style={{ cursor: "pointer", textAlign: "left", background: i === k ? T.accentSoft : T.card, borderColor: i === k ? T.accent : T.line, padding: "8px 12px" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{i + 1}. {x.t}</span>
            </button>
          ))}
          <div className="panel pop" key={k} style={{ padding: 12, display: "flex", flexDirection: "column", gap: 7 }}>
            <Code size={12.5} lang="ts" numbers={false}>{r.good}</Code>
            <div className="msg" style={{ fontSize: 12 }}><b>tsc:</b> {r.tsc}</div>
            <div className="msg" style={{ fontSize: 12, background: "#f4f5f7", borderColor: T.line, color: T.ink }}><b>node:</b> {r.node}</div>
            <div className="note" style={{ fontSize: 13 }}>{r.tip}</div>
          </div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 16. Converting the routes ============ */

const FIXES = [
  {
    k: "A",
    title: "Query strings are not always text",
    count: 1,
    before: `const { cuisine, maxMinutes, tag, q } = req.query;

let query = supabase.from("recipes").select("*").order("id");
if (cuisine) query = query.ilike("cuisine", cuisine);`,
    err: [4],
    msg: "line 20: TS2769: No overload matches this call. Argument of type 'string | (string | ParsedQs)[] | ParsedQs' is not assignable to parameter of type 'string'.",
    why: "?tag=a&tag=b makes tag a LIST. ?tag[x]=1 makes it an OBJECT. TypeScript knows all three can happen. It flagged cuisine; the other three filters have the same risk.",
    after: `function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

const cuisine = text(req.query.cuisine);
const maxMinutes = text(req.query.maxMinutes);
const tag = text(req.query.tag);
const q = text(req.query.q);`,
    hl: [1, 2, 3, 5, 6, 7, 8],
  },
  {
    k: "B",
    title: "Params are text, ids are numbers",
    count: 3,
    before: `const { data, error } = await supabase
  .from("recipes")
  .select("*")
  .eq("id", req.params.id)
  .maybeSingle();`,
    err: [4],
    msg: "lines 36, 72, 86: TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'number'.",
    why: "Tuesday the database quietly turned \"3\" into 3 for us. TypeScript wants us to do it on purpose. (string[] is there because Express 5 allows wildcard params that are lists. Our :id never is.)",
    after: `const id = Number(req.params.id); // params are text; the id column is a number
const { data, error } = await supabase
  .from("recipes")
  .select("*")
  .eq("id", id)
  .maybeSingle();`,
    hl: [1, 5],
  },
  {
    k: "C",
    title: "An empty object has no room",
    count: 4,
    before: `const changes = {};
if (name !== undefined) changes.name = name.trim();
if (cuisine !== undefined) changes.cuisine = cuisine.trim();
if (minutes !== undefined) changes.minutes = minutes;
if (tags !== undefined) changes.tags = tags;`,
    err: [2, 3, 4, 5],
    msg: "lines 64 to 67: TS2339: Property 'name' does not exist on type '{}'. (and cuisine, minutes, tags)",
    why: "{} with no label means \"an object with no keys, ever\". Give it the Update shape from the generated types and every key is allowed, and checked.",
    after: `import { supabase, type RecipeChanges } from "../data/supabase.ts";

const changes: RecipeChanges = {};
if (name !== undefined) changes.name = name.trim();
if (cuisine !== undefined) changes.cuisine = cuisine.trim();
if (minutes !== undefined) changes.minutes = minutes;
if (tags !== undefined) changes.tags = tags;`,
    hl: [1, 3],
  },
];

function RoutesSlide() {
  const [k, setK] = useState(0);
  const [fixed, setFixed] = useState({});
  const left = FIXES.reduce((n, f) => n + (fixed[f.k] ? 0 : f.count), 0);
  const f = FIXES[k];
  const isFixed = fixed[f.k];
  return (
    <Slide kicker="Live code" title="Converting the routes: three kinds of red" sub="Rename routes/recipes.js to recipes.ts (its imports already end in .ts from checkpoints 06 and 07) and run npm run typecheck. Eight errors. Three fixes.">
      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        {FIXES.map((x, i) => (
          <button key={x.k} className="panel" onClick={() => setK(i)} style={{ flex: 1, padding: "10px 14px", textAlign: "left", cursor: "pointer", borderTop: `5px solid ${fixed[x.k] ? T.good : T.warn}`, background: i === k ? "#fff" : T.card, boxShadow: i === k ? `0 0 0 3px ${T.accent}33` : "none" }}>
            <div className="note">{x.count} error{x.count > 1 ? "s" : ""} {fixed[x.k] ? "(fixed)" : ""}</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{x.k}. {x.title}</div>
          </button>
        ))}
        <div className="panel" style={{ width: 130, display: "grid", placeItems: "center", padding: 10, background: left ? T.warnSoft : T.goodSoft, borderColor: left ? T.warn : T.good }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: left ? T.warn : T.good, lineHeight: 1 }}>{left}</div>
            <div className="note">errors left</div>
          </div>
        </div>
      </div>
      <div className="pop" key={k + (isFixed ? "f" : "b")} style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 14, marginTop: 14 }}>
        <Col gap={8}>
          {isFixed
            ? <Code size={13} lang="ts" hl={f.hl} file="routes/recipes.ts (after)">{f.after}</Code>
            : <Code size={13} lang="ts" err={f.err} file="routes/recipes.ts (before)">{f.before}</Code>}
          <button className={"btn" + (isFixed ? "" : " primary")} style={{ alignSelf: "flex-start" }} onClick={() => setFixed({ ...fixed, [f.k]: !isFixed })}>{isFixed ? "Show the error again" : "Apply the fix"}</button>
        </Col>
        <Col gap={8}>
          <div className="msg">{f.msg}</div>
          <p style={{ fontSize: 16, lineHeight: 1.5 }}>{f.why}</p>
          {left === 0 && <div className="callout good pop"><div className="h">npm run typecheck: no output</div>Zero errors. Now server.js: rename it to server.ts and point its three imports at .ts files. Then the dev script runs server.ts.</div>}
        </Col>
      </div>
    </Slide>
  );
}

/* ============ 17. Schema change loop ============ */

const LOOP = [
  {
    t: "Change the database",
    code: `alter table public.recipes
  add column servings integer check (servings > 0);`,
    lang: "sql",
    file: "add-servings.sql (SQL Editor)",
    say: "A new optional column: how many people a recipe feeds. Old rows get null.",
  },
  {
    t: "Use it in your code",
    code: `const newRecipe: NewRecipe = {
  name: name.trim(),
  cuisine: cuisine.trim(),
  minutes,
  tags,
  servings,
};`,
    err: [6],
    lang: "ts",
    file: "routes/recipes.ts",
    msg: "TS2353: Object literal may only specify known properties, and 'servings' does not exist in type '{ created_at?: string | undefined; cuisine: string; id?: undefined; minutes: number; name: string; tags?: string[] | undefined; }'.",
    say: "Red. TypeScript is not wrong: its snapshot is from before the change. (PATCH says TS2339: Property 'servings' does not exist.)",
  },
  {
    t: "Take a new snapshot",
    code: `$ npm run types

  Row: {
    ...
    name: string
+   servings: number | null
    tags: string[]
  }
  Insert: { ...  servings?: number | null  ... }
  Update: { ...  servings?: number | null  ... }`,
    lang: "js",
    file: "data/database.types.ts",
    say: "Nullable column, so number | null. Not required to insert, so servings?.",
  },
  {
    t: "Let the red guide you",
    code: `const { name, cuisine, minutes, tags = [], servings = null } = req.body;
const newRecipe: NewRecipe = {
  name: name.trim(),
  cuisine: cuisine.trim(),
  minutes,
  tags,
  servings, // allowed now
};`,
    hl: [1, 7],
    lang: "ts",
    file: "routes/recipes.ts",
    say: "Red gone. Hover Recipe: servings is number | null. Add it to validation too (TypeScript cannot check strangers).",
  },
];

function LoopSlide() {
  const [k, setK] = useState(0);
  const x = LOOP[k];
  return (
    <Slide kicker="Live demo, 7 minutes" title="Change the database. Regenerate. Follow the red." sub="This loop is how real teams keep a database and a server in sync. Click through the four steps.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {LOOP.map((s, i) => (
          <button key={i} className="panel" onClick={() => setK(i)} style={{ padding: 12, textAlign: "left", cursor: "pointer", borderTop: `5px solid ${i === k ? T.accent : i < k ? T.good : T.line}`, background: i === k ? T.accentSoft : T.card }}>
            <div className="note">step {i + 1}</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{s.t}</div>
          </button>
        ))}
      </div>
      <div className="pop" key={k} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginTop: 14 }}>
        <Code size={13.5} lang={x.lang} err={x.err || []} hl={x.hl || []} file={x.file}>{x.code}</Code>
        <Col gap={10}>
          {x.msg && <div className="msg">{x.msg}</div>}
          <p className="big" style={{ fontSize: 18 }}>{x.say}</p>
          {k === 3 && <div className="callout good"><div className="h">The loop</div>Change the database, npm run types, fix every red line. TypeScript shows you every place the change touches.</div>}
        </Col>
      </div>
    </Slide>
  );
}

/* ============ 18. Code-along progression ============ */

const CPS = [
  {
    s: "Setup",
    title: "Tools and labels",
    cmd: "npm install -D typescript @types/node @types/express @types/cors supabase",
    what: "Check node -v (22.18 or newer). Install the tools. Add tsconfig.json. Generate data/database.types.ts with npm run types.",
    code: `"scripts": {
  "dev": "node --watch --env-file=.env server.js",
  "typecheck": "tsc",
  "types": "npx supabase gen types typescript --project-id YOUR_REF --schema public > data/database.types.ts"
}`,
    lang: "js",
  },
  {
    s: "06",
    title: "Typed client",
    cmd: "npm run cp06",
    what: "data/supabase.js becomes supabase.ts with createClient<Database>. routes/recipes.js imports \"../data/supabase.ts\". Still runs with server.js.",
    code: `import type { Database, Tables, TablesInsert, TablesUpdate } from "./database.types.ts";

export const supabase = createClient<Database>(url, secretKey);

export type Recipe = Tables<"recipes">;
export type NewRecipe = TablesInsert<"recipes">;
export type RecipeChanges = TablesUpdate<"recipes">;`,
    lang: "ts",
  },
  {
    s: "07",
    title: "Typed middleware",
    cmd: "npm run cp07",
    what: "logger, validate, errors become .ts. Each parameter gets a label from Express. server.js and routes import the .ts names.",
    code: `import type { Request, Response, NextFunction } from "express";

export function checkId(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);
  ...
}`,
    lang: "ts",
  },
  {
    s: "08",
    title: "All TypeScript",
    cmd: "npm run cp08",
    what: "routes/recipes.ts (the eight errors, three fixes) and server.ts. The dev script now runs server.ts. typecheck: zero errors.",
    code: `// package.json
"dev": "node --watch --env-file=.env server.ts",

// server.ts
const PORT = Number(process.env.PORT ?? 3000);`,
    lang: "ts",
  },
  {
    s: "09",
    title: "Servings",
    cmd: "npm run cp09",
    what: "Demo only. Run add-servings.sql first, then npm run types. servings flows through POST, PATCH and validation.",
    code: `const newRecipe: NewRecipe = {
  name: name.trim(),
  cuisine: cuisine.trim(),
  minutes,
  tags,
  servings,
};`,
    lang: "ts",
  },
];

function ProgressionSlide() {
  const [k, setK] = useState(0);
  const x = CPS[k];
  return (
    <Slide kicker="Live code, 35 minutes" title="Convert it in four checkpoints" sub="Students convert their own Mission 9 repo while you type. Fell behind? Copy that checkpoint's folder into your project (keep your .env) and keep going.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {CPS.map((c, i) => (
          <button key={c.s} className="panel" onClick={() => setK(i)} style={{ padding: 12, textAlign: "left", cursor: "pointer", borderTop: `5px solid ${i === k ? T.accent : i < k ? T.good : T.line}`, background: i === k ? T.accentSoft : T.card }}>
            <div className="note">{c.s === "Setup" ? "First" : `Checkpoint ${c.s}`}</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{c.title}</div>
          </button>
        ))}
      </div>
      <div className="pop" key={k} style={{ display: "grid", gridTemplateColumns: "0.9fr 1.45fr", gap: 14, marginTop: 14 }}>
        <div className="panel" style={{ padding: 16 }}>
          <div className="mono" style={{ color: T.accent, fontWeight: 700, fontSize: 14, wordBreak: "break-word" }}>$ {x.cmd}</div>
          <p className="big" style={{ marginTop: 10, fontSize: 17 }}>{x.what}</p>
          {x.s !== "Setup" && <div className="note" style={{ marginTop: 8 }}>Catch up: copy examples/recipe-box-api/checkpoints/{x.s}-* into your project.</div>}
        </div>
        <Code size={12} numbers={false} lang={x.lang}>{x.code}</Code>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <div className="callout"><div className="h">Checkpoint after 06</div>npm run typecheck prints nothing, and GET /api/recipes still answers. Nobody moves on with red in supabase.ts.</div>
        <div className="callout info"><div className="h">Checkpoint after 08</div>npm run dev starts server.ts, typecheck is clean, and every request in requests.http still passes.</div>
      </div>
    </Slide>
  );
}

/* ============ 19. Assignment ============ */

function AssignmentSlide() {
  return (
    <Slide kicker="Build block, 17 minutes" title="Mission 10: Label Every Jar" sub="Same repo as Mission 9. Convert your server to TypeScript with labels generated from your own database. Push, then link it in Brightspace.">
      <Tiers tiers={[
        { name: "Bronze", tag: "Track B: everyone", items: ["npm i -D typescript @types/node @types/express @types/cors supabase", "tsconfig.json from class", "data/database.types.ts generated", "data/supabase.ts with createClient<Database>", "npm run typecheck runs"] },
        { name: "Silver", items: ["middleware/*.ts with Request, Response, NextFunction", "routes/recipes.ts converted", "typecheck: 0 errors", "Server still runs with node"] },
        { name: "Gold", items: ["server.ts, nothing .js left", "Scripts: dev, typecheck, types", "No any and no as in routes", "requests.http: every request still passes"] },
        { name: "Bonus", items: ["Add a column of your own in SQL", "npm run types, follow the red", "Wire it through POST, PATCH and validation"] },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <div className="callout info"><div className="h">Track A</div>Optional. Bronze earns extra credit. Your JavaScript server stays a valid Project 4.</div>
        <div className="callout good"><div className="h">Track B</div>Required. TypeScript from here on, including Project 4 (due Nov 10).</div>
      </div>
      <div className="callout" style={{ marginTop: 12 }}><div className="h">Watch for</div>Imports still ending in .js, import without type for Request, a missing @types package, and red "fixed" with any. Ask before you reach for any.</div>
    </Slide>
  );
}

/* ============ 20. Close ============ */

function CloseSlide() {
  return (
    <Slide kicker="Close, 8 minutes" title="Three sentences to keep">
      <Split cols="1.3fr 1fr">
        <Col gap={12}>
          {[
            ["Labels catch mistakes while you type.", "Node erases them and runs. tsc and VS Code read them and check."],
            ["TypeScript checks your code. Validation checks their data.", "req.body is any. Keep validateRecipe."],
            ["The database is the source of truth.", "Generate the types from it. Change it, run npm run types, follow the red."],
          ].map(([a, b], i) => (
            <div key={i} className="panel" style={{ padding: "14px 18px", borderLeft: `5px solid ${[T.blue, T.accent, T.amber][i]}` }}>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{a}</div>
              <div className="lead" style={{ fontSize: 16, marginTop: 4 }}>{b}</div>
            </div>
          ))}
          <div className="panel" style={{ padding: "14px 18px", background: T.blueSoft, borderColor: T.blue }}>
            <div style={{ fontWeight: 800, color: T.blue }}>Turn to a partner, 2 minutes each</div>
            <div style={{ fontSize: 16, marginTop: 4 }}>Explain why .eq("id", req.params.id) was red, and why Number() fixed it. Then: name one mistake TypeScript can NOT catch.</div>
          </div>
        </Col>
        <Col>
          <div className="panel" style={{ padding: 18, borderTop: `5px solid ${T.accent}` }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Your kitchen only runs on your laptop.</div>
            <p className="lead" style={{ marginTop: 8 }}>Tuesday Nov 3: deploy to Render. The server goes live on the internet, and the .env values move into Render's settings.</p>
          </div>
          <div className="callout info"><div className="h">Before Tuesday</div>Everyone: Mission 9 through Silver, pushed. Track B: Mission 10 through Silver. Project 4 is due Tuesday Nov 10.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ deck ============ */

const SLIDES = [
  { el: <TitleSlide />, notes: "12:20. Labels on: click Check it, the error appears before anything runs. Labels off: Run it gives 255. One sentence: today every jar in the pantry gets a label, and the labels come from the database." },
  { el: <WarmupSlide />, notes: "Pairs, 8 minutes. Every snippet is a bug from this course. Reveal card by card with hands up. Card 3 is the Week 2 Silver Trial trap: point at whoever remembers it. Land on: four of six fail silently." },
  { el: <TimelineSlide />, notes: "JavaScript first: bugs pile up at steps 4 to 6. Flip to TypeScript: all six jump to step 1. Say it: TypeScript does not make bugs impossible, it makes these ones cheap." },
  { el: <EraseSlide />, notes: "Read the TypeScript once. Click Erase: the teal boxes are where labels were. Same line numbers. Stress: Node erases, it does not check. That is why we need tsc. Students open typescriptlang.org/play now (or a playground.ts OUTSIDE their repo). Any stray .ts scratch files in the repo get deleted before the code-along." },
  { el: <ValuesSlide />, notes: "12:38. Students type along at typescriptlang.org/play (strict by default, hover works). Type each step live in the slide editor too. Hover to show inference. Keep it to 4 minutes." },
  { el: <ObjectsSlide />, notes: "Click A typo, then Something missing, then Fixed. Read each message aloud. Did you mean 'minutes'? is the editor reading the label for you." },
  { el: <MaybeSlide />, notes: "Run Start here: two reds. Then type the if around forTwo live. Point at the types panel: forTwo is number only inside the check. Tie to maybeSingle and if (!data)." },
  { el: <FunctionsSlide />, notes: "Call findRecipe with the text id: red. Number(fromUrl): fixed. Say it out loud: params are text, ids are numbers. They will see this exact error in 40 minutes." },
  { el: <NarrowSlide />, notes: "unknown forces a check. any turns checking off. Click Like validateRecipe: they have been narrowing since Week 9. Rule for the class: ask before using any." },
  { el: <CodeVsDataSlide />, notes: "12:58. Hands up per row: TypeScript or Validation? The split is when, not what: your code before it runs vs their data while it runs. req.body is any, so validation stays." },
  { el: <SchemaSlide />, notes: "Click id first: never means you may not send it. Then name (required to insert), tags and created_at (optional because of defaults). Minutes: the check rule is invisible to TypeScript." },
  { el: <GenerateSlide />, notes: "Do it live: find the ref, npx supabase login, gen types, open the file. Anyone stuck on login copies the file from checkpoint 08 and keeps going. Add the types script to package.json." },
  { el: <ClientSlide />, notes: "Simplified types, real messages. Three mistakes: read each red. Sending an id: never shows as undefined. Forgot about null: the if (!data) check. Then show the real createClient<Database> line." },
  { el: <TsconfigSlide />, notes: "1:08 code-along starts. Install first, then create tsconfig.json together. Click strict, verbatimModuleSyntax, allowImportingTsExtensions. Do not let anyone turn strict off to make red go away." },
  { el: <RunningSlide />, notes: "Run all three. node hello.ts prints 255 with no complaint: that is the point. Then plain npx tsc (never npx tsc hello.ts: with a tsconfig present that fails with TS5112). Delete hello.ts. Then walk the four rules; rule 4 is real: cors needs @types/cors." },
  { el: <RoutesSlide />, notes: "The main event. Rename routes to .ts, npm run typecheck: 8 errors. Fix A, then B (Week 2's string id trap, caught before running), then C. Click Apply after you type each fix live." },
  { el: <LoopSlide />, notes: "1:43. Demo only, students watch. Run add-servings.sql, type servings into the POST: red. npm run types: red gone. Then show validation also needs servings, because TypeScript cannot check strangers." },
  { el: <ProgressionSlide />, notes: "Keep this up while coding. Checkpoints after 06 and 08. Anyone behind copies the checkpoint folder and keeps their .env. cp09 needs add-servings.sql first." },
  { el: <AssignmentSlide />, notes: "1:50. 17 minute timer. Track A: optional, extra credit. Track B: required. Circulate for .js imports, missing import type, missing @types/cors, and any used to silence red." },
  { el: <CloseSlide />, notes: "2:07. Read the three sentences. Pairs explain to each other, 2 minutes each. Tease Render: the .env values have to move somewhere. No quiz." },
];

export default function Deck() {
  useEffect(() => { loadEngine(); }, []); // warm up the checker in the background
  return <DeckShell slides={SLIDES} />;
}
