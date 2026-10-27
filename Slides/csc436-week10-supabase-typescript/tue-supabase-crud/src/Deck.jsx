import { useState } from "react";
import { T, Code, Slide, Col, Split, Tiers, Checklist, Term, DeckShell } from "./ui.jsx";
import { COLUMNS, SEED, clone, pretty, tryInsert, runSelect, toSql, toUrl } from "./pantry.js";

/* ------------------------------------------------------------------
   CSC 436  |  Week 10, Tuesday Oct 27  |  Mission 9
   Supabase CRUD from Express. The array moves into a real database.
   Color code: blue = browser, teal = server, amber = database.
------------------------------------------------------------------- */

/* ============ shared bits ============ */

function ErrBox({ e }) {
  return (
    <div className="term pop" style={{ fontSize: 13.5, padding: "12px 14px" }}>
      <div className="err">code: {e.code}</div>
      <div className="err" style={{ whiteSpace: "pre-wrap" }}>message: {e.message}</div>
    </div>
  );
}

function Pill({ ok, children }) {
  return <span className={`chip ${ok ? "good" : "warn"}`}>{children}</span>;
}

/* ============ 1. Title ============ */

function TitleSlide() {
  const [mem, setMem] = useState(8);
  const [db, setDb] = useState(8);
  const [hasRamen, setHasRamen] = useState({ mem: false, db: false });
  const [restarted, setRestarted] = useState(false);
  const post = () => {
    if (!hasRamen.mem) setMem(mem + 1);
    if (!hasRamen.db) setDb(db + 1);
    setHasRamen({ mem: true, db: true });
    setRestarted(false);
  };
  const restart = () => {
    setMem(8);
    setHasRamen({ ...hasRamen, mem: false });
    setRestarted(true);
  };
  const Box = ({ title, sub, count, ramen, color, wiped }) => (
    <div className="panel" style={{ padding: 16, borderTop: `5px solid ${color}` }}>
      <div style={{ fontWeight: 800 }}>{title}</div>
      <div className="note">{sub}</div>
      <div style={{ fontSize: 44, fontWeight: 800, color, marginTop: 6 }}>{count}</div>
      <div className="note">recipes</div>
      <div style={{ marginTop: 8, minHeight: 28 }}>
        {ramen && <span className="chip good pop">Ramen is here</span>}
        {wiped && <span className="chip warn pop">wiped by the restart</span>}
        {!ramen && !wiped && <span className="note">no Ramen yet</span>}
      </div>
    </div>
  );
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.05fr 1fr", alignItems: "center", padding: "0 70px", gap: 46 }}>
      <div>
        <div className="kicker">CSC 436, Week 10, Mission 9, Tuesday Oct 27</div>
        <h1 style={{ fontSize: 58, lineHeight: 1.03, fontWeight: 800 }}>Memory forgets. Databases remember.</h1>
        <p className="lead" style={{ marginTop: 20, maxWidth: 560, fontSize: 21 }}>
          Last week every recipe lived in an array. Restart the server and they vanish. Today the recipes move into a real database, and your routes barely change.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <span className="chip amber">Postgres</span><span className="chip amber">Supabase</span><span className="chip">supabase-js</span><span className="chip gray">.env</span><span className="chip blue">async / await</span>
        </div>
      </div>
      <Col gap={12}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Box title="Last week" sub="an array in memory" count={mem} ramen={hasRamen.mem} color={T.accent} wiped={restarted && hasRamen.db && !hasRamen.mem} />
          <Box title="Today" sub="a Supabase table" count={db} ramen={hasRamen.db} color={T.amber} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn primary" onClick={post}>POST Ramen</button>
          <button className="btn" onClick={restart}>Restart the server</button>
        </div>
        <div className="note">Click POST, then restart. Watch which side forgets.</div>
      </Col>
    </div>
  );
}

/* ============ 2. Warm-up: does Ramen survive? ============ */

const SURVIVE = [
  { q: "You save a file while npm run dev (node --watch) is running.", a: "no", why: "--watch restarts Node on every save. A new process starts with a fresh array. Every save wiped your test data last week." },
  { q: "A bug throws an error nothing catches, and the server crashes.", a: "no", why: "The process died. Its memory died with it." },
  { q: "You close your laptop lid and open it an hour later.", a: "yes", why: "The twist. Sleep pauses the process. It never stopped, so the array is still in memory." },
  { q: "You press Ctrl+C, then run npm run dev again.", a: "no", why: "A brand new process, a brand new array, the same 8 starting recipes." },
  { q: "Your partner POSTs Ramen to the server on THEIR laptop. You GET from yours.", a: "no", why: "Two processes, two arrays. Nothing is shared between them." },
  { q: "Next week you deploy to Render. Nobody visits for a while, so the free server shuts down.", a: "no", why: "A free server that goes to sleep is stopped, not paused. The next visitor wakes up a fresh process." },
];

function SurviveSlide() {
  const [ans, setAns] = useState({});
  return (
    <Slide kicker="Warm-up, 10 minutes, pairs" title="Does Ramen survive?" sub="Last week's server keeps recipes in an array. You POST Ramen, it works. Then this happens. Predict yes or no before you click.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {SURVIVE.map((p, i) => {
          const pick = ans[i];
          const right = pick === p.a;
          return (
            <div key={i} className="panel" style={{ padding: "12px 14px", borderColor: pick ? (right ? T.good : T.warn) : T.line }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 650, fontSize: 15.5 }}>{i + 1}. {p.q}</span>
                <span style={{ display: "flex", gap: 5, flex: "none" }}>
                  {["yes", "no"].map((o) => (
                    <button key={o} className="btn small" style={pick === o ? { background: right ? T.good : T.warn, color: "#fff", borderColor: "transparent" } : {}} onClick={() => setAns({ ...ans, [i]: o })}>{o}</button>
                  ))}
                </span>
              </div>
              {pick && <div className="note pop" style={{ marginTop: 6 }}><b style={{ color: right ? T.good : T.warn }}>{right ? "Yes. " : `Answer: ${p.a}. `}</b>{p.why}</div>}
            </div>
          );
        })}
      </div>
      <div className="callout info" style={{ marginTop: 14 }}><div className="h">The pattern</div>Memory belongs to ONE running process. When the process ends, the data is gone. When there are two processes, the data is split. We need storage that lives outside the process.</div>
    </Slide>
  );
}

/* ============ 3. What is a database ============ */

const DB_FACTS = [
  { k: "Permanent", c: T.amber, txt: "It survives restarts, crashes, and deploys. The data is saved on disk on a different computer, not in your server's memory." },
  { k: "Shared", c: T.blue, txt: "Every copy of your server, and every user of your app, sees the same rows. Your partner adds Ramen, you see Ramen." },
  { k: "Organized", c: T.accent, txt: "Data lives in tables with named, typed columns and rules. It refuses rows that break the rules, before they are saved." },
  { k: "Searchable", c: T.good, txt: "You can ask it questions like 'vegetarian, 30 minutes or less, fastest first' and it answers quickly, even with millions of rows." },
];

function DatabaseSlide() {
  const [k, setK] = useState(0);
  const parts = [
    { t: "Frontend", s: "asks", c: T.blue, d: "React, the dining room" },
    { t: "Backend", s: "decides", c: T.accent, d: "Express, the kitchen" },
    { t: "Database", s: "remembers", c: T.amber, d: "Postgres, the pantry" },
  ];
  return (
    <Slide kicker="Concept" title="A database is the pantry" sub="A database is a separate program whose only job is to keep data safe, organized, and shared. Your server asks it for things. It never forgets.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {parts.map((p, i) => (
          <div key={i} className="panel" style={{ padding: "14px 16px", borderTop: `5px solid ${p.c}`, opacity: i === 2 ? 1 : 0.75 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>The {p.t.toLowerCase()} <span style={{ color: p.c }}>{p.s}.</span></div>
            <div className="note" style={{ marginTop: 2 }}>{p.d}{i === 2 ? ". New today." : ""}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 16 }}>
        {DB_FACTS.map((f, i) => (
          <button key={f.k} className="panel" onClick={() => setK(i)} style={{ padding: 14, textAlign: "left", cursor: "pointer", borderLeft: `5px solid ${f.c}`, background: k === i ? "#fff" : T.card, boxShadow: k === i ? `0 0 0 3px ${f.c}33` : "none" }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{f.k}</div>
          </button>
        ))}
      </div>
      <div className="panel pop" key={k} style={{ marginTop: 12, padding: "16px 20px", borderLeft: `5px solid ${DB_FACTS[k].c}` }}>
        <p className="big" style={{ fontSize: 20 }}>{DB_FACTS[k].txt}</p>
      </div>
      <div className="callout info" style={{ marginTop: 14 }}><div className="h">Our database: Postgres</div>PostgreSQL (everyone says Postgres) is free, open source, over 30 years old, and one of the most widely used databases in the world. Supabase runs one for you.</div>
    </Slide>
  );
}

/* ============ 4. Tables, rows, columns ============ */

function TableSlide() {
  const [row, setRow] = useState(3);
  const [col, setCol] = useState(null);
  const r = SEED.find((x) => x.id === row);
  const c = COLUMNS.find((x) => x.name === col);
  const obj = `{\n  id: ${r.id},\n  name: "${r.name}",\n  cuisine: "${r.cuisine}",\n  minutes: ${r.minutes},\n  tags: [${r.tags.map((t) => `"${t}"`).join(", ")}],\n  created_at: "${r.created_at}"\n}`;
  return (
    <Slide kicker="Concept" title="Tables, rows, and columns" sub="A table looks like a spreadsheet. A row is one recipe. A column is one field. Click a row, then click a column name.">
      <Split cols="1.55fr 1fr">
        <div className="panel" style={{ padding: 4, overflow: "hidden" }}>
          <table className="t compact">
            <thead>
              <tr>{COLUMNS.map((x) => (
                <th key={x.name} onClick={() => setCol(x.name)} style={{ cursor: "pointer", color: col === x.name ? T.amber : undefined, background: col === x.name ? T.amberSoft : undefined }}>
                  {x.name}<div style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500, fontSize: 11 }}>{x.type}</div>
                </th>
              ))}</tr>
            </thead>
            <tbody>
              {SEED.map((x) => (
                <tr key={x.id} onClick={() => { setRow(x.id); setCol(null); }} style={{ cursor: "pointer", background: row === x.id && !col ? T.amberSoft : undefined }}>
                  {COLUMNS.map((k) => (
                    <td key={k.name} className={k.name === "id" || k.name === "minutes" ? "mono" : ""} style={{ fontSize: 13, background: col === k.name ? "#fffaf0" : undefined, whiteSpace: "nowrap" }}>
                      {k.name === "tags" ? `{${x.tags.join(",")}}` : k.name === "created_at" ? "2026-10-27 16:05" : String(x[k.name])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Col>
          {c ? (
            <div className="panel pop" key={col} style={{ padding: 18, borderLeft: `5px solid ${T.amber}` }}>
              <div className="note">column</div>
              <div className="mono" style={{ fontWeight: 800, fontSize: 24 }}>{c.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}><span className="chip amber">type: {c.type}</span><span className="chip blue">in JS: {c.js}</span></div>
              <div className="mono note" style={{ marginTop: 8 }}>{c.rule}</div>
              <p className="big" style={{ marginTop: 8, fontSize: 17 }}>{c.note}</p>
            </div>
          ) : (
            <div className="pop" key={row}>
              <div className="note" style={{ marginBottom: 6 }}>Row {row}, as the JavaScript object you used to keep in the array:</div>
              <Code size={14} numbers={false}>{obj}</Code>
            </div>
          )}
          <div className="callout good"><div className="h">Same data, new home</div>The table is the array. A row is one object. A column is one key.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 5. Rules: the database says no ============ */

const ATTEMPTS = [
  { label: "A good recipe", body: { name: "Ramen", cuisine: "Japanese", minutes: 40, tags: ["noodles"] } },
  { label: "minutes: \"twenty\"", body: { name: "Soup", cuisine: "French", minutes: "twenty" } },
  { label: "minutes: 12.5", body: { name: "Soup", cuisine: "French", minutes: 12.5 } },
  { label: "no name", body: { cuisine: "French", minutes: 20 } },
  { label: "minutes: -5", body: { name: "Soup", cuisine: "French", minutes: -5 } },
  { label: "choose my own id", body: { id: 99, name: "Soup", cuisine: "French", minutes: 20 } },
  { label: "tags: \"vegan\"", body: { name: "Soup", cuisine: "French", minutes: 20, tags: "vegan" } },
  { label: "minutes: \"20\" (twist)", body: { name: "Soup", cuisine: "French", minutes: "20" } },
];

const RULE_WHY = {
  "22P02": "Wrong type. The column wants a whole number (or a list) and this is not one.",
  "23502": "A required column (not null) got nothing.",
  "23514": "The value has the right type but breaks the check rule: minutes > 0.",
  "428C9": "id is generated always. The database picks ids. Nobody else may.",
};

function RulesSlide() {
  const [i, setI] = useState(null);
  const a = i === null ? null : ATTEMPTS[i];
  const res = a ? tryInsert(SEED, a.body, 9) : null;
  return (
    <Slide kicker="Concept, try it" title="Every column has a type and rules" sub="A spreadsheet lets you type anything anywhere. A database checks every row before it saves it. Try to sneak something in.">
      <Split cols="0.95fr 1.25fr">
        <Col gap={8}>
          {ATTEMPTS.map((x, k) => (
            <button key={k} className={"btn" + (i === k ? " on" : "")} style={{ textAlign: "left" }} onClick={() => setI(k)}><span className="mono" style={{ fontSize: 14 }}>{x.label}</span></button>
          ))}
        </Col>
        <Col>
          {a ? (
            <div className="pop" key={i}>
              <Code size={13.5} numbers={false} file="insert into recipes ...">{pretty(a.body)}</Code>
              <div style={{ marginTop: 10 }}>
                {res.row ? (
                  <Col gap={8}>
                    <div><Pill ok>saved</Pill> <span className="note">the database added id {res.row.id} and created_at</span></div>
                    {i === 7 && <div className="callout"><div className="h">The twist</div>Postgres quietly turned the text "20" into the number 20. Helpful, but surprising. That is why our validateRecipe still checks types: our rules, not luck.</div>}
                  </Col>
                ) : (
                  <Col gap={8}>
                    <div><Pill>refused</Pill> <span className="note">{RULE_WHY[res.error.code]}</span></div>
                    <ErrBox e={res.error} />
                  </Col>
                )}
              </div>
            </div>
          ) : (
            <div className="panel" style={{ padding: 18 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>The rules on our table</div>
              <table className="t compact"><tbody>
                {COLUMNS.map((c) => <tr key={c.name}><td className="mono" style={{ fontWeight: 700 }}>{c.name}</td><td className="mono note">{c.type}</td><td className="note">{c.rule}</td></tr>)}
              </tbody></table>
            </div>
          )}
          <div className="callout info"><div className="h">These are real Postgres messages</div>You will see them in your terminal. The code (22P02, 23502...) names the rule you broke. The field guide has the list.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 6. SQL: setup.sql ============ */

const SETUP = `create table public.recipes (
  id          bigint generated always as identity primary key,
  name        text not null,
  cuisine     text not null,
  minutes     integer not null check (minutes > 0),
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);

alter table public.recipes enable row level security;

revoke all on public.recipes from anon, authenticated;
grant select, insert, update, delete on public.recipes to service_role;

insert into public.recipes (name, cuisine, minutes, tags) values
  ('Margherita Pizza', 'Italian', 25, array['vegetarian', 'oven']),
  ('Pad Thai',         'Thai',    30, array['noodles', 'dinner']);`;

const SETUP_X = {
  1: ["create table", "Make a new table named recipes. public is the default schema, think of it as the folder tables live in. Everything between ( and ) describes the columns."],
  2: ["The id column", "bigint is a whole number that can get very large. generated always as identity: the database numbers rows 1, 2, 3 by itself. primary key: no two rows can ever share it. This replaces takeNextId()."],
  3: ["name text not null", "Column name first, then its type, then its rules. text is any length of text. not null means required."],
  5: ["A rule with a check", "integer is a whole number. check (minutes > 0) is a custom rule the database enforces on every save."],
  6: ["A list column", "text[] is a list of text, like a JavaScript array of strings. default '{}' means: if nobody sends tags, store an empty list."],
  7: ["Automatic timestamps", "timestamptz is a date and time with a time zone. default now() fills it in at the moment the row is saved. Free history."],
  10: ["Lock the front door", "Row Level Security (RLS) checks every row against rules. We turn it on and write NO rules, so the public key gets nothing at all. Rules come in Week 12 with login."],
  12: ["Take away keys", "anon and authenticated are the roles behind the public key. revoke all: they may not touch this table."],
  13: ["Hand the kitchen its key", "service_role is the role behind the SECRET key, the one our Express server uses. It may select, insert, update, and delete. New Supabase projects require this line: without it, even the secret key gets permission denied."],
  15: ["Stock the pantry", "insert into ... values adds rows. Notice: no id. The database picks it. Text uses single quotes, and array[...] makes a list. The real file adds all 8 recipes."],
};

function SqlSlide() {
  const [line, setLine] = useState(2);
  const x = SETUP_X[line];
  const group = line === 1 ? [1, 2, 3, 4, 5, 6, 7, 8] : line === 15 ? [15, 16, 17] : [line];
  return (
    <Slide kicker="Code walkthrough" title="SQL: talking to the database directly" sub="SQL (say 'sequel' or 'S-Q-L') is the database's own language. You will run this file, setup.sql, once in the Supabase SQL Editor. Click a line.">
      <Split cols="1.5fr 1fr">
        <Code size={13.5} lang="sql" hl={group} file="setup.sql (shortened)" onLine={(n) => SETUP_X[n] && setLine(n)}>{SETUP}</Code>
        <Col>
          <div className="panel pop" key={line} style={{ padding: 18, borderLeft: `5px solid ${line >= 10 && line <= 13 ? T.warn : T.amber}` }}>
            <div className="note mono">line {line}</div>
            <div style={{ fontWeight: 800, fontSize: 22, marginTop: 4 }}>{x[0]}</div>
            <p className="big" style={{ marginTop: 8, fontSize: 17 }}>{x[1]}</p>
          </div>
          <div className="callout info"><div className="h">Reading SQL</div>Keywords are not case sensitive: CREATE TABLE and create table mean the same thing. Text values go in single quotes: 'Thai'. A statement ends with a semicolon.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 7. SELECT ============ */

const QUESTIONS = [
  { label: "Every recipe", sql: "select * from recipes;", spec: { filters: [], order: "id" } },
  { label: "Only Thai food", sql: "select * from recipes\nwhere cuisine = 'Thai';", spec: { filters: [{ op: "eq", col: "cuisine", val: "Thai" }] } },
  { label: "30 minutes or less", sql: "select * from recipes\nwhere minutes <= 30\norder by minutes;", spec: { filters: [{ op: "lte", col: "minutes", val: 30 }], order: "minutes" } },
  { label: "Vegetarian", sql: "select * from recipes\nwhere tags @> array['vegetarian'];", spec: { filters: [{ op: "contains", col: "tags", val: ["vegetarian"] }], order: "id" } },
  { label: "Recipe number 3", sql: "select * from recipes\nwhere id = 3;", spec: { filters: [{ op: "eq", col: "id", val: "3" }] } },
];

function SelectSlide() {
  const [k, setK] = useState(0);
  const q = QUESTIONS[k];
  const { data } = runSelect(SEED, q.spec);
  return (
    <Slide kicker="Concept" title="Asking questions: select" sub="Reading data in SQL starts with select. * means every column. where filters rows. order by sorts them. Click a question.">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {QUESTIONS.map((x, i) => <button key={i} className={"btn" + (k === i ? " on" : "")} onClick={() => setK(i)}>{x.label}</button>)}
      </div>
      <Split cols="1fr 1.35fr" style={{ marginTop: 14 }}>
        <Col>
          <Code size={16} lang="sql" numbers={false}>{q.sql}</Code>
          <div className="callout info"><div className="h">You will rarely type select</div>In Express, supabase-js writes the SQL for you from JavaScript. Knowing what it writes helps you read errors and the SQL Editor.</div>
        </Col>
        <div className="panel pop" key={k} style={{ padding: 4 }}>
          <table className="t compact">
            <thead><tr><th>id</th><th>name</th><th>cuisine</th><th>minutes</th><th>tags</th></tr></thead>
            <tbody>{data.map((r) => <tr key={r.id}><td className="mono">{r.id}</td><td>{r.name}</td><td>{r.cuisine}</td><td className="mono">{r.minutes}</td><td className="note">{r.tags.join(", ")}</td></tr>)}</tbody>
          </table>
          <div className="note" style={{ padding: "6px 12px" }}>{data.length} row{data.length === 1 ? "" : "s"}</div>
        </div>
      </Split>
    </Slide>
  );
}

/* ============ 8. Meet Supabase ============ */

const HOPS = [
  { k: "React", c: T.blue, sub: "your browser app", txt: "The Recipe Finder. It calls fetch(\"http://localhost:3000/api/recipes\"). Same as last week. It does not know a database exists." },
  { k: "Express", c: T.accent, sub: "your server", txt: "Your routes. Instead of reading an array, a route asks Supabase with supabase-js, using the secret key from .env." },
  { k: "supabase-js", c: T.accent, sub: "an npm package", txt: "Turns supabase.from(\"recipes\").select(\"*\") into an HTTPS request to your project. It is fetch under the hood, just like your Recipe Finder." },
  { k: "Supabase", c: T.amber, sub: "in the cloud", txt: "Checks the key, turns the request into SQL, runs it on Postgres, and sends the rows back as JSON." },
];

function SupabaseSlide() {
  const [k, setK] = useState(2);
  return (
    <Slide kicker="Concept" title="Meet Supabase" sub="Supabase runs a Postgres database for you in the cloud, with a dashboard to look at it and a way to reach it from JavaScript. Free for small projects. Click each hop.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 30px 1fr 30px 1fr 30px 1fr", alignItems: "center" }}>
        {HOPS.map((h, i) => [
          <button key={h.k} className="panel" onClick={() => setK(i)} style={{ padding: "14px 12px", cursor: "pointer", textAlign: "center", borderTop: `5px solid ${h.c}`, background: k === i ? "#fff" : T.card, boxShadow: k === i ? `0 0 0 3px ${h.c}33` : "none" }}>
            <div style={{ fontWeight: 800, fontSize: 18 }} className={i === 2 ? "mono" : ""}>{h.k}</div>
            <div className="note">{h.sub}</div>
          </button>,
          i < HOPS.length - 1 && <div key={"a" + i} style={{ textAlign: "center", color: T.muted, fontSize: 22 }}>{"→"}</div>,
        ])}
      </div>
      <div className="panel pop" key={k} style={{ marginTop: 14, padding: "16px 20px", borderLeft: `5px solid ${HOPS[k].c}` }}>
        <p className="big" style={{ fontSize: 19 }}>{HOPS[k].txt}</p>
      </div>
      <Split cols="1fr 1fr" style={{ marginTop: 14 }}>
        <div className="panel" style={{ padding: "12px 16px" }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>The dashboard, four places we use today</div>
          <table className="t compact"><tbody>
            <tr><td style={{ fontWeight: 700 }}>Table Editor</td><td className="note">See and edit rows like a spreadsheet</td></tr>
            <tr><td style={{ fontWeight: 700 }}>SQL Editor</td><td className="note">Run SQL, like setup.sql</td></tr>
            <tr><td style={{ fontWeight: 700 }}>Connect button</td><td className="note">Your Project URL</td></tr>
            <tr><td style={{ fontWeight: 700 }}>Settings, API Keys</td><td className="note">Your secret key</td></tr>
          </tbody></table>
        </div>
        <div className="callout info"><div className="h">Who talks to whom</div>React talks to Express. Express talks to Supabase. React never touches the database this week. The secret key lives in exactly one place: your server.</div>
      </Split>
    </Slide>
  );
}

/* ============ 9. Code-along A ============ */

function CodeAlongASlide() {
  return (
    <Slide kicker="Code-along A, 15 minutes" title="Stock the pantry" sub="Do each step with me. Check it off when your screen matches mine. Nobody moves on until the room hits Checkpoint A.">
      <Split cols="1.45fr 1fr">
        <Checklist items={[
          "supabase.com, sign in with GitHub, New project. Name it recipe-box. Region: East US (North Virginia).",
          "Generate a database password and save it in your password manager. Leave the other options as they are. Create.",
          "While it sets up (about 2 minutes), open setup.sql in VS Code and read it with me.",
          "SQL Editor, New query. Paste ALL of setup.sql. Run. You should see 8 rows at the bottom.",
          "Table Editor, recipes. Look at the type under each column name. Insert a row by hand: try letters in minutes, then add a real recipe.",
          "Click Connect at the top. Copy the Project URL into a private note.",
          "Project Settings, API Keys. Copy the secret key (starts with sb_secret_) into the same private note.",
        ]} />
        <Col>
          <div className="callout good"><div className="h">Checkpoint A</div>Your Table Editor shows 9 rows (8 from setup.sql plus the one you typed), and your private note has the URL and the secret key.</div>
          <div className="callout info"><div className="h">If you see these</div>A checkbox about exposing new tables automatically: leave it as it is, setup.sql grants exactly what we need. No secret key listed: click to create one. Only legacy keys (anon, service_role): use service_role today.</div>
          <div className="callout"><div className="h">Free plan</div>Two active projects per account. Already have two? Pause one you are not using.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 10. Two keys ============ */

const PLACES = [".env", "GitHub", "React", "nowhere in code"];
const SORT = [
  { item: "SUPABASE_URL", a: ".env", why: "Not secret, but it is configuration. It changes per project, so it lives in .env next to the key." },
  { item: "The secret key (sb_secret_...)", a: ".env", why: "Only on your laptop and, next week, in Render's settings. Never GitHub, never React." },
  { item: "The publishable key", a: "React", why: "Designed to be public, it only gets what RLS allows. We do not need it this week. Week 12." },
  { item: "The database password", a: "nowhere in code", why: "Supabase uses it for direct database connections. We never put it in code this semester. Password manager." },
  { item: ".env.example (placeholders only)", a: "GitHub", why: "It tells classmates and future you which values to fill in, without the values. Safe to commit." },
];

function KeysSlide() {
  const [ans, setAns] = useState({});
  return (
    <Slide kicker="Concept" title="Two keys, one rule" sub="Supabase gives you two kinds of API key. Which one you use decides what you are allowed to do.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="panel" style={{ padding: "12px 16px", borderTop: `5px solid ${T.blue}` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><b>Publishable key</b><span className="mono note">sb_publishable_...</span></div>
          <div className="note" style={{ marginTop: 4 }}>Safe to show the world. Only gets what Row Level Security rules allow. Our setup.sql allows it nothing: permission denied.</div>
        </div>
        <div className="panel" style={{ padding: "12px 16px", borderTop: `5px solid ${T.warn}` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><b>Secret key</b><span className="mono note">sb_secret_...</span></div>
          <div className="note" style={{ marginTop: 4 }}>The master key. Skips every RLS rule. Only for servers you control. Supabase refuses it when it comes from a browser.</div>
        </div>
        <div className="callout" style={{ margin: 0 }}><div className="h">If a secret key ever leaks</div>GitHub, a screenshot, Discord: treat it as stolen. API Keys page, delete it, create a new one, update .env.</div>
      </div>
      <div style={{ fontWeight: 800, margin: "12px 0 6px" }}>Where does each one go? Pick, then check.</div>
      <Col gap={6}>
        {SORT.map((s, i) => {
          const pick = ans[i];
          const right = pick === s.a;
          return (
            <div key={i} className="row" style={{ borderColor: pick ? (right ? T.good : T.warn) : T.line, alignItems: "flex-start", flexDirection: "column", gap: 4, padding: "7px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span style={{ fontWeight: 650 }}>{s.item}</span>
                <span style={{ display: "flex", gap: 5 }}>
                  {PLACES.map((p) => <button key={p} className="btn small" style={pick === p ? { background: right ? T.good : T.warn, color: "#fff", borderColor: "transparent" } : {}} onClick={() => setAns({ ...ans, [i]: p })}>{p}</button>)}
                </span>
              </div>
              {pick && <div className="note pop"><b style={{ color: right ? T.good : T.warn }}>{right ? "Yes. " : `${s.a}. `}</b>{s.why}</div>}
            </div>
          );
        })}
      </Col>
    </Slide>
  );
}

/* ============ 11. .env ============ */

const ENV_FILES = {
  ".env": { lang: "js", code: `# SECRET. Stays on your laptop. Never commit.
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SECRET_KEY=sb_secret_a1b2c3...
PORT=3000`, x: "One NAME=value per line. No quotes, no spaces around =. Node reads this file when it starts." },
  ".env.example": { lang: "js", code: `# Copy to .env and fill in your own values.
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_paste_yours_here
PORT=3000`, x: "Same names, fake values. This one IS committed, so anyone who clones the repo knows what to fill in." },
  ".gitignore": { lang: "js", code: `node_modules
.env`, x: "Files Git pretends do not exist. Add .env here BEFORE your first commit. Then run git status: .env must not be listed." },
  "package.json": { lang: "js", code: `"scripts": {
  "dev": "node --watch --env-file=.env server.js",
  "start": "node server.js"
}`, x: "--env-file=.env loads the file into process.env when Node starts. No extra package needed. start has no --env-file: on Render, next week, the values come from Render's settings." },
};

function EnvSlide() {
  const [f, setF] = useState(".env");
  const x = ENV_FILES[f];
  return (
    <Slide kicker="Concept" title=".env: secrets live outside the code" sub="Code goes to GitHub. Secrets must not. So the code reads them from a file that never leaves your laptop. Click each file.">
      <Split cols="1.15fr 1fr">
        <Col>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.keys(ENV_FILES).map((k) => <button key={k} className={"btn small" + (f === k ? " on" : "")} onClick={() => setF(k)}><span className="mono">{k}</span></button>)}
          </div>
          <Code size={14.5} numbers={false} file={f} lang={x.lang}>{x.code}</Code>
          <div className="panel pop" key={f} style={{ padding: "12px 16px" }}><p className="big" style={{ fontSize: 17 }}>{x.x}</p></div>
          <Code size={13.5} numbers={false} file="reading a value in code">{`const url = process.env.SUPABASE_URL;  // the URL from .env`}</Code>
        </Col>
        <Col>
          <Term height={250} title="terminal" script={[
            { cmd: "npm run dev", out: "> node --watch server.js\nError: Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env", err: true },
            { cmd: "npm run dev", out: "> node --watch --env-file=.env server.js\nKitchen open at http://localhost:3000" },
            { cmd: "git status", out: "Changes not staged for commit:\n  modified:   package.json\nUntracked files:\n  .env.example\n  data/supabase.js" },
          ]} />
          <div className="callout"><div className="h">Edited .env?</div>Stop the server (Ctrl+C) and start it again, so Node reads the new values for sure. Then test.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 12. data/supabase.js ============ */

const CLIENT = `import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env"
  );
}

export const supabase = createClient(url, secretKey);`;

const CLIENT_X = {
  1: ["The package", "npm install @supabase/supabase-js first. createClient is the one function we need from it. ESM import, like everything else in this course."],
  3: ["Read the address", "process.env holds values from .env (thanks to --env-file). If the name has a typo, you get undefined, not an error."],
  4: ["Read the key", "The SECRET key, because this code runs on our server. It never goes to the browser."],
  6: ["Fail loud, fail early", "If either value is missing, crash right now with a message that says exactly what to fix. Much better than a confusing error three files later."],
  12: ["One shared client", "Make the client once, export it, and import it in every route file. createClient does not contact Supabase yet. It just remembers the address and the key."],
};

function ClientSlide() {
  const [line, setLine] = useState(12);
  const x = CLIENT_X[line];
  return (
    <Slide kicker="Code walkthrough" title="One file holds the connection" sub="data/supabase.js replaces last week's data/recipes.js. Every route imports supabase from here. Click a line.">
      <Split cols="1.45fr 1fr">
        <Col>
          <Code size={14} hl={line === 6 ? [6, 7, 8, 9, 10] : [line]} file="data/supabase.js" onLine={(n) => CLIENT_X[n] && setLine(n)}>{CLIENT}</Code>
          <div className="term" style={{ fontSize: 13.5 }}><span className="prompt">$ </span>npm install @supabase/supabase-js</div>
        </Col>
        <Col>
          <div className="panel pop" key={line} style={{ padding: 18, borderLeft: `5px solid ${line === 6 ? T.warn : T.accent}` }}>
            <div className="note mono">line {line}</div>
            <div style={{ fontWeight: 800, fontSize: 22, marginTop: 4 }}>{x[0]}</div>
            <p className="big" style={{ marginTop: 8, fontSize: 17 }}>{x[1]}</p>
          </div>
          <div className="callout info"><div className="h">In a route file</div><span className="mono" style={{ fontSize: 14 }}>import {"{"} supabase {"}"} from "../data/supabase.js";</span><br />Our own file, so it ends in .js. The package name does not.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 13. { data, error } ============ */

const DE_PRESETS = [
  { label: "Every recipe", code: `await supabase.from("recipes").select("*").order("id")`, spec: { filters: [], order: "id" } },
  { label: "Recipe 3", code: `await supabase.from("recipes").select("*")\n  .eq("id", "3").maybeSingle()`, spec: { filters: [{ op: "eq", col: "id", val: "3" }], mode: "maybeSingle" } },
  { label: "Recipe 99", code: `await supabase.from("recipes").select("*")\n  .eq("id", "99").maybeSingle()`, spec: { filters: [{ op: "eq", col: "id", val: "99" }], mode: "maybeSingle" } },
  { label: "Recipe \"two\"", code: `await supabase.from("recipes").select("*")\n  .eq("id", "two").maybeSingle()`, spec: { filters: [{ op: "eq", col: "id", val: "two" }], mode: "maybeSingle" } },
  { label: "Typo: \"recipe\"", code: `await supabase.from("recipe").select("*")`, spec: { table: "recipe", filters: [] } },
];
const DE_WHY = [
  "data is the list, error is null. The normal case.",
  "maybeSingle turns a list of one into one object.",
  "No match is NOT an error. data is null, error is null. Your route decides that means 404.",
  "The database could not even compare \"two\" with a number. data is null, error is filled in.",
  "The table does not exist. Typos in table names show up here, not as a crash.",
];

function DataErrorSlide() {
  const [k, setK] = useState(0);
  const p = DE_PRESETS[k];
  const r = runSelect(SEED, p.spec);
  const shown = Array.isArray(r.data) && r.data.length > 2 ? { data: [r.data[0], r.data[1], `...${r.data.length - 2} more`], error: r.error } : r;
  return (
    <Slide kicker="Concept" title="Every answer comes in two halves" sub="A supabase-js query does not throw. It hands back an object with data and error. Click a query and look at both halves.">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DE_PRESETS.map((x, i) => <button key={i} className={"btn" + (k === i ? " on" : "")} onClick={() => setK(i)}>{x.label}</button>)}
      </div>
      <Split cols="1.15fr 1fr" style={{ marginTop: 12 }}>
        <Col>
          <Code size={13.5} numbers={false}>{`const { data, error } =\n  ${p.code.replace(/\n/g, "\n  ")};`}</Code>
          <div className="pop" key={k}>
            <Code size={12.5} numbers={false} file="what comes back" style={{ maxHeight: 290 }}>{pretty(shown)}</Code>
          </div>
        </Col>
        <Col>
          <div className="panel pop" key={"w" + k} style={{ padding: 16, borderLeft: `5px solid ${r.error ? T.warn : T.good}` }}>
            <div style={{ display: "flex", gap: 6 }}><span className={`chip ${r.data ? "good" : "gray"}`}>data: {r.data ? (Array.isArray(r.data) ? "a list" : "an object") : "null"}</span><span className={`chip ${r.error ? "warn" : "gray"}`}>error: {r.error ? "filled in" : "null"}</span></div>
            <p className="big" style={{ marginTop: 10, fontSize: 17 }}>{DE_WHY[k]}</p>
          </div>
          <Code size={12.5} numbers={false} file="Week 7 fetch vs today">{`// fetch: you check res.ok
const res = await fetch(url);
if (!res.ok) throw new Error("Request failed");

// supabase-js: you check error
const { data, error } = await query;
if (error) throw error;`}</Code>
          <div className="callout good"><div className="h">The rule for every route</div>Check error first, then use data. throw error sends it to our error handler.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 14. Query builder ============ */

function BuilderSlide() {
  const [on, setOn] = useState({ cuisine: false, maxMinutes: true, tag: true, q: false });
  const [vals, setVals] = useState({ cuisine: "thai", maxMinutes: "30", tag: "vegetarian", q: "ram" });
  const filters = [];
  if (on.cuisine) filters.push({ op: "ilike", col: "cuisine", val: vals.cuisine });
  if (on.maxMinutes) filters.push({ op: "lte", col: "minutes", val: Number(vals.maxMinutes) });
  if (on.tag) filters.push({ op: "contains", col: "tags", val: [vals.tag] });
  if (on.q) filters.push({ op: "ilike", col: "name", val: `%${vals.q}%` });
  const spec = { filters, order: "id" };
  const { data } = runSelect(SEED, spec);
  const js = [
    `let query = supabase.from("recipes").select("*").order("id");`,
    on.cuisine && `query = query.ilike("cuisine", "${vals.cuisine}");`,
    on.maxMinutes && `query = query.lte("minutes", ${Number(vals.maxMinutes)});`,
    on.tag && `query = query.contains("tags", ["${vals.tag}"]);`,
    on.q && `query = query.ilike("name", "%${vals.q}%");`,
    `const { data, error } = await query;  // sent NOW`,
  ].filter(Boolean).join("\n");
  const ctl = (key, label) => (
    <div className="row" style={{ padding: "6px 10px" }}>
      <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
        <input type="checkbox" checked={on[key]} onChange={() => setOn({ ...on, [key]: !on[key] })} />
        <span className="mono" style={{ fontSize: 14 }}>?{key}=</span>
      </label>
      <input className="field mono" style={{ width: 120, padding: "4px 8px" }} value={vals[key]} onChange={(e) => setVals({ ...vals, [key]: e.target.value })} />
      <span className="note" style={{ width: 120 }}>{label}</span>
    </div>
  );
  return (
    <Slide kicker="Concept, try it" title="Building a question one piece at a time" sub="Each method adds one piece. Nothing is sent until you await it. Turn the pieces on and off like a query string would.">
      <Split cols="0.95fr 1.3fr">
        <Col gap={7}>
          {ctl("cuisine", "ilike: same text, any case")}
          {ctl("maxMinutes", "lte: less than or equal")}
          {ctl("tag", "contains: list includes it")}
          {ctl("q", "ilike with %: contains")}
          <div className="panel" style={{ padding: "8px 12px" }}>
            <div className="note">Result: {data.length} row{data.length === 1 ? "" : "s"}</div>
            <div style={{ fontWeight: 650, fontSize: 15 }}>{data.map((r) => r.name).join(", ") || "(empty list, still a 200)"}</div>
          </div>
        </Col>
        <Col gap={8}>
          <Code size={13} numbers={false} file="JavaScript you write">{js}</Code>
          <Code size={13} numbers={false} lang="sql" file="the SQL it means">{toSql(spec)}</Code>
          <div className="term" style={{ fontSize: 12.5, padding: "10px 14px" }}><span className="dim">what actually travels over HTTPS:</span><br />{toUrl(spec)}</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 15. Before and after ============ */

const BA = {
  all: {
    before: `router.get("/", (req, res) => {
  res.json(recipes);
});`,
    after: `router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("id");
  if (error) throw error;
  res.json(data);
});`,
    hl: [1, 2, 6],
  },
  one: {
    before: `router.get("/:id", (req, res) => {
  const recipe = findRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: \`No recipe with id \${req.params.id}\` });
  res.json(recipe);
});`,
    after: `router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: \`No recipe with id \${req.params.id}\` });
  res.json(data);
});`,
    hl: [1, 2, 5, 6, 7],
  },
};
const CHANGES = [
  ["async", "The handler waits for the database, so it is an async function. Same keyword you used with fetch in Week 7."],
  ["await", "Pause this route until Supabase answers. Other requests keep being served meanwhile."],
  ["{ data, error }", "Destructure both halves of the answer."],
  ["if (error) throw error;", "Express 5 catches errors thrown in async routes and hands them to our error handler. Express 4 did not, which is why old tutorials wrap everything in try/catch."],
];

function BeforeAfterSlide() {
  const [k, setK] = useState("all");
  const x = BA[k];
  return (
    <Slide kicker="Code walkthrough" title="Same route, new pantry" sub="Last week on top, today below. Same path, same status codes, same JSON. Read the highlighted lines out loud: they are what changed.">
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button className={"btn small" + (k === "all" ? " on" : "")} onClick={() => setK("all")}>GET /api/recipes</button>
        <button className={"btn small" + (k === "one" ? " on" : "")} onClick={() => setK("one")}>GET /api/recipes/:id</button>
      </div>
      <Split cols="2.1fr 1fr">
        <Col gap={10}>
          <Code size={12.5} file="last week: array" style={{ opacity: 0.8 }}>{x.before}</Code>
          <Code size={12.5} file="today: Supabase" hl={x.hl}>{x.after}</Code>
        </Col>
        <Col gap={8}>
          {CHANGES.map((c) => (
            <div key={c[0]} className="panel" style={{ padding: "9px 12px" }}>
              <div className="mono" style={{ fontWeight: 700, color: T.accent, fontSize: 14 }}>{c[0]}</div>
              <div className="note" style={{ marginTop: 3 }}>{c[1]}</div>
            </div>
          ))}
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 16. The trap ============ */

function TrapSlide() {
  const [pick, setPick] = useState(null);
  const [fixed, setFixed] = useState(false);
  const shown = pick !== null;
  return (
    <Slide kicker="Predict, then fix" title="GET /api/recipes/two" sub={'Last week this was a 404: Number("two") is NaN, and NaN matches nothing. Now the database does the matching. Predict the status code.'}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontWeight: 700 }}>Your prediction:</span>
        {["200", "404", "500"].map((o) => <button key={o} className={"btn" + (pick === o ? " on" : "")} onClick={() => setPick(o)}>{o}</button>)}
        {shown && <span className={`chip ${pick === "500" ? "good" : "warn"} pop`}>{pick === "500" ? "Right: 500" : "It is a 500"}</span>}
      </div>
      {shown && (
        <Split cols="0.78fr 1.22fr" style={{ marginTop: 14 }}>
          <Col>
            <div className="term" style={{ fontSize: 13.5 }}>
              <div className="dim">server terminal</div>
              {!fixed && <div style={{ color: "#fca5a5" }}>Error: invalid input syntax for type bigint: "two"</div>}
              <div>GET /api/recipes/two -&gt; {fixed ? "404" : "500"} (41ms)</div>
            </div>
            <div className="panel" style={{ padding: "12px 16px" }}>
              <div className="note">Thunder Client</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                <span className={`chip ${fixed ? "amber" : "warn"}`}>{fixed ? "404 Not Found" : "500 Internal Server Error"}</span>
                <span className="mono" style={{ fontSize: 13 }}>{fixed ? '{"error":"No recipe with id two"}' : '{"error":"Something went wrong in the kitchen"}'}</span>
              </div>
            </div>
            <div className="callout"><div className="h">Why</div>The database refuses to even compare "two" with a whole number. That is an error, not "no match". A stranger's typo should never be a 500.</div>
          </Col>
          <Col>
            <button className={"btn" + (fixed ? " on" : " primary")} onClick={() => setFixed(!fixed)}>{fixed ? "checkId is ON (click to remove)" : "Add checkId"}</button>
            {fixed && (
              <div className="pop">
                <Code size={12} file="middleware/validate.js">{`export function checkId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({ error: \`No recipe with id \${req.params.id}\` });
  }
  next();
}`}</Code>
                <Code size={13} numbers={false} file="routes/recipes.js" style={{ marginTop: 8 }}>{`router.get("/:id", checkId, async (req, res) => {`}</Code>
                <div className="callout info" style={{ marginTop: 8 }}><div className="h">Route-level middleware, again</div>Like validateRecipe last Thursday. It runs only on routes with :id, and it stops bad ids before they reach the database.</div>
              </div>
            )}
          </Col>
        </Split>
      )}
    </Slide>
  );
}

/* ============ 17. Writes ============ */

const WRITES = {
  POST: {
    code: `router.post("/", validateRecipe, async (req, res) => {
  const { name, cuisine, minutes, tags = [] } = req.body;

  const { data, error } = await supabase
    .from("recipes")
    .insert({ name: name.trim(), cuisine: cuisine.trim(), minutes, tags })
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
});`,
    x: { 6: [".insert({ ... })", "Add one row. No id: the database picks it. No created_at: default now() fills it in."], 7: [".select()", "Send back the row you just saved. Without it, data is null and you would answer 201 with null as the body."], 8: [".single()", "I expect exactly one row. Give it to me as an object, not a list of one."], 11: ["201 + data", "data has the new id and created_at. Same response shape as last week."] },
    start: 7,
  },
  PATCH: {
    code: `router.patch("/:id", checkId, validateRecipePatch, async (req, res) => {
  const { name, cuisine, minutes, tags } = req.body;
  const changes = {};
  if (name !== undefined) changes.name = name.trim();
  if (minutes !== undefined) changes.minutes = minutes;
  // ...cuisine and tags the same way

  const { data, error } = await supabase
    .from("recipes")
    .update(changes)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) return res.status(404).json({ error: \`No recipe with id \${req.params.id}\` });
  res.json(data);
});`,
    x: { 3: ["Only what was sent", "Build an object with just the fields in the body. Everything else in the row stays as it is."], 10: [".update(changes)", "Change these columns..."], 11: [".eq(\"id\", ...)", "...but ONLY in the row with this id. Forget .eq and you change EVERY row. Always filter an update."], 13: [".maybeSingle()", "The updated row as an object, or null if no row had that id."], 16: ["null means 404", "No row matched. Same 404 as last week."] },
    start: 11,
  },
  DELETE: {
    code: `router.delete("/:id", checkId, async (req, res) => {
  const { data, error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", req.params.id)
    .select();

  if (error) throw error;
  if (data.length === 0) return res.status(404).json({ error: \`No recipe with id \${req.params.id}\` });
  res.status(204).end();
});`,
    x: { 4: [".delete()", "Remove rows..."], 5: [".eq(\"id\", ...)", "...only the one with this id. Again: never a delete without a filter."], 6: [".select()", "Send back the rows that were deleted. An empty list means nothing matched."], 9: ["[] means 404", "data.length === 0: there was no such recipe."], 10: ["204, no body", "Deleted. Nothing to send back. Same as last week."] },
    start: 6,
  },
};

function WritesSlide() {
  const [m, setM] = useState("POST");
  const [line, setLine] = useState(WRITES.POST.start);
  const w = WRITES[m];
  const x = w.x[line];
  return (
    <Slide kicker="Code walkthrough" title="Writing: insert, update, delete" sub="Same pattern every time: build the query, await it, check error, answer. Pick a method, then click the highlighted lines.">
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {Object.keys(WRITES).map((k) => <button key={k} className={"btn small" + (m === k ? " on" : "")} onClick={() => { setM(k); setLine(WRITES[k].start); }}>{k}</button>)}
      </div>
      <Split cols="1.95fr 1fr">
        <Code size={12.5} hl={[line]} onLine={(n) => w.x[n] && setLine(n)} file="routes/recipes.js">{w.code}</Code>
        <Col>
          {x && (
            <div className="panel pop" key={m + line} style={{ padding: 18, borderLeft: `5px solid ${T.accent}` }}>
              <div className="note mono">line {line}</div>
              <div className="mono" style={{ fontWeight: 800, fontSize: 20, marginTop: 4 }}>{x[0]}</div>
              <p className="big" style={{ marginTop: 8, fontSize: 17 }}>{x[1]}</p>
            </div>
          )}
          <div className="panel" style={{ padding: "10px 14px" }}>
            <table className="t compact"><tbody>
              <tr><td className="mono" style={{ fontWeight: 700 }}>.select()</td><td className="note">after a write: send back the rows you changed</td></tr>
              <tr><td className="mono" style={{ fontWeight: 700 }}>.single()</td><td className="note">exactly one row, as an object</td></tr>
              <tr><td className="mono" style={{ fontWeight: 700 }}>.maybeSingle()</td><td className="note">one row as an object, or null</td></tr>
            </tbody></table>
          </div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 18. Restart proof ============ */

function RestartSlide() {
  return (
    <Slide kicker="The payoff" title="Restart the kitchen. The food is still there." sub="This is the whole point of today. Do it with me, one step at a time.">
      <Split cols="1.2fr 1fr">
        <Checklist items={[
          "Thunder Client: POST Ramen. 201, and it has an id and a created_at.",
          "Server terminal: Ctrl+C. The kitchen is closed.",
          "npm run dev. The kitchen opens again.",
          "GET /api/recipes. Ramen is still there. Last week it would be gone.",
          "Refresh the Table Editor in your browser. There is the Ramen row.",
          "Delete Ramen in the Table Editor (not in Thunder Client), then GET again. Gone.",
        ]} />
        <Col>
          <div className="panel" style={{ padding: 18, borderTop: `5px solid ${T.amber}` }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}>Two doors, one pantry</div>
            <p className="lead" style={{ marginTop: 8 }}>Your API and the dashboard both reach the same table. Change a row through one door and the other door sees it.</p>
          </div>
          <div className="callout good"><div className="h">Checkpoint 3</div>Ramen survives a restart on your laptop.</div>
          <div className="callout info"><div className="h">Your partner's laptop</div>Point their .env at YOUR project URL and key and they see your Ramen too. Shared data, the other half of today. (Then switch them back.)</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 19. Error decoder ============ */

const ERRORS = [
  { msg: "Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env", mean: "Our own check in data/supabase.js. process.env did not have the values.", fix: "Is the file named exactly .env, in the folder where you ran npm run dev? Does the dev script say --env-file=.env? Are the names spelled exactly like in the code?" },
  { msg: "node: .env: not found", mean: "Node was told to load .env and there is no such file in this folder.", fix: "Create .env next to package.json. Windows: make sure it is not secretly .env.txt (turn on file extensions)." },
  { msg: "Invalid API key", mean: "Supabase did not recognize the key.", fix: "Copy the secret key again, all of it. No quotes, no spaces around =. Restart the server after editing .env." },
  { msg: "42501 permission denied for table recipes", mean: "The key worked, but its role may not use this table.", fix: "You used the publishable key. Use the secret key. Or the grant line in setup.sql did not run: run it again in the SQL Editor." },
  { msg: "PGRST205 Could not find the table 'public.recipes' in the schema cache", mean: "No table by that name.", fix: "Typo in .from(\"...\")? Or setup.sql never ran in THIS project. Check the Table Editor." },
  { msg: "22P02 invalid input syntax for type bigint: \"two\"", mean: "A value of the wrong type reached the database.", fix: "Stop bad input earlier: checkId for ids, validateRecipe for bodies." },
  { msg: "TypeError: fetch failed", mean: "supabase-js could not reach the URL at all.", fix: "Typo in SUPABASE_URL, or no internet. It must look like https://something.supabase.co" },
  { msg: "201 with null, or 200 with an EMPTY body", mean: "The route answered, but data had nothing in it.", fix: "null: forgot .select() after insert or update. Empty, or 404 for every id: forgot await, so data is undefined." },
];

function ErrorsSlide() {
  const [k, setK] = useState(3);
  const e = ERRORS[k];
  return (
    <Slide kicker="Reference" title="When it breaks: read the terminal" sub="The client only sees 'Something went wrong in the kitchen'. Your terminal has the real reason. Click the message you are looking at.">
      <Split cols="1.15fr 1fr">
        <Col gap={6}>
          {ERRORS.map((x, i) => (
            <button key={i} className="row" onClick={() => setK(i)} style={{ cursor: "pointer", textAlign: "left", padding: "7px 12px", background: k === i ? "#fff" : T.card, borderColor: k === i ? T.warn : T.line }}>
              <span className="mono" style={{ fontSize: 13, color: k === i ? T.warn : T.ink }}>{x.msg}</span>
            </button>
          ))}
        </Col>
        <Col>
          <div className="panel pop" key={k} style={{ padding: 18, borderLeft: `5px solid ${T.warn}` }}>
            <div className="note">What it means</div>
            <p className="big" style={{ fontSize: 18, marginTop: 2 }}>{e.mean}</p>
            <div className="note" style={{ marginTop: 12 }}>Fix</div>
            <p className="big" style={{ fontSize: 18, marginTop: 2 }}>{e.fix}</p>
          </div>
          <div className="callout info"><div className="h">Full list</div>The field guide has every error from this week, with the code, the meaning, and the fix.</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ 20. Progression ============ */

const STEPS = [
  { n: "00", title: "Start", cmd: "npm run cp00", what: "Last Thursday's organized server: routes/, middleware/, data/recipes.js. Everything in memory. No Supabase needed.", code: `import { recipes, takeNextId } from "../data/recipes.js";` },
  { n: "01", title: "Connected", cmd: "npm run cp01", what: "data/supabase.js, .env, and GET /api/recipes reads from Supabase. The other routes still use the array for now. Proof it worked: every recipe now has created_at, which only the database adds.", code: `const { data, error } = await supabase.from("recipes").select("*").order("id");\nif (error) throw error;\nres.json(data);` },
  { n: "02", title: "Read", cmd: "npm run cp02", what: "GET /api/recipes/:id from Supabase with maybeSingle. Hit the /two trap, then add checkId. The error handler now prints the database error code.", code: `router.get("/:id", checkId, async (req, res) => {` },
  { n: "03", title: "Create", cmd: "npm run cp03", what: "POST inserts a real row with .select().single(). validateRecipe now insists minutes is a whole number, because the column is an integer. Restart test passes.", code: `.insert({ name: name.trim(), cuisine: cuisine.trim(), minutes, tags })\n.select()\n.single();` },
  { n: "04", title: "Full CRUD", cmd: "npm run cp04", what: "PATCH with update + eq + maybeSingle, DELETE with delete + eq + select. data/recipes.js is deleted. Nothing lives in memory anymore.", code: `if (data.length === 0) return res.status(404).json(...);\nres.status(204).end();` },
  { n: "05", title: "Filters", cmd: "npm run cp05", what: "The Gold solution: ?cuisine, ?maxMinutes, ?tag, ?q come back using the query builder. Compare with yours AFTER you try.", code: `let query = supabase.from("recipes").select("*").order("id");\nif (cuisine) query = query.ilike("cuisine", cuisine);` },
];

function ProgressionSlide() {
  const [k, setK] = useState(1);
  const s = STEPS[k];
  return (
    <Slide kicker="Code-along map" title="Six checkpoints" sub="Fell behind? Copy that checkpoint's files into your project, keep your own .env, and you are caught up. Ask, nobody gets left behind today.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
        {STEPS.map((x, i) => (
          <button key={x.n} className="panel" onClick={() => setK(i)} style={{ padding: 12, textAlign: "left", cursor: "pointer", borderTop: `5px solid ${i === k ? T.accent : i < k ? T.good : T.line}`, background: i === k ? T.accentSoft : T.card }}>
            <div className="note mono">{x.n}</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{x.title}</div>
          </button>
        ))}
      </div>
      <div className="pop" key={k} style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 14, marginTop: 14 }}>
        <div className="panel" style={{ padding: 18 }}>
          <div className="mono" style={{ color: T.accent, fontWeight: 700 }}>$ {s.cmd}</div>
          <p className="big" style={{ marginTop: 10, fontSize: 17 }}>{s.what}</p>
        </div>
        <Code size={13} numbers={false}>{s.code}</Code>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <div className="callout info"><div className="h">How to catch up</div>Copy everything inside checkpoints/0X-name/ into your project folder, replacing files. Run npm install. Your .env stays yours.</div>
        <div className="callout good"><div className="h">Checkpoint check</div>01: created_at appears. 02: /two is a 404. 03: Ramen survives a restart. 04: data/recipes.js is gone and everything still works.</div>
      </div>
    </Slide>
  );
}

/* ============ 21. Assignment ============ */

function AssignmentSlide() {
  return (
    <Slide kicker="Build block, 15 minutes" title="Mission 9: Stock the Pantry" sub="Same repo as Missions 7 and 8. Finish what we built together, then go further. Push to GitHub Classroom, link in Brightspace.">
      <Tiers tiers={[
        { name: "Bronze", tag: "everyone", items: ["Supabase project with setup.sql run", ".env, .env.example, .gitignore (.env NOT on GitHub)", "data/supabase.js", "GET all and GET one from Supabase, with checkId"] },
        { name: "Silver", items: ["POST, PATCH, DELETE use Supabase", "Same status codes as last week", "data/recipes.js deleted", "Data survives a restart"] },
        { name: "Gold", items: ["Filters back: ?cuisine ?maxMinutes ?tag ?q with the query builder", "requests.http with 12+ requests, including /two and 12.5 minutes"] },
        { name: "Bonus", items: ["Recipe Finder shows a recipe you typed in the Table Editor", "400 (not 500) for ?maxMinutes=abc", "A new column, end to end"] },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginTop: 14 }}>
        <div className="callout info"><div className="h">Project 4 uses this exact pattern</div>Your P4 resource gets its own table, its own setup.sql, and routes shaped like these. P4 is due Tuesday, November 10.</div>
        <div className="callout"><div className="h">Submit</div>Push, paste the repo link in Brightspace, and add a screenshot of your Table Editor showing a recipe you created through YOUR API.</div>
      </div>
    </Slide>
  );
}

/* ============ 22. Close ============ */

const HOP_LIST = ["Thunder Client sends POST /api/recipes", "Express: logger, express.json(), validateRecipe, the route", "supabase-js sends an HTTPS request with the secret key", "Postgres checks the rules and saves the row", "The Table Editor shows it, and it survives any restart"];

function CloseSlide() {
  const [n, setN] = useState(0);
  return (
    <Slide kicker="Close, 7 minutes" title="The frontend asks. The backend decides. The database remembers.">
      <Split cols="1.25fr 1fr">
        <Col>
          <div className="panel" style={{ padding: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 19 }}>Pair explain, 3 minutes</div>
            <p className="lead" style={{ marginTop: 6 }}>Turn to a neighbor. Trace one POST from Thunder Client to the Table Editor, out loud, in your own words. Then swap. Click to check your story.</p>
          </div>
          <Col gap={6}>
            {HOP_LIST.slice(0, n).map((h, i) => <div key={i} className="row pop" style={{ justifyContent: "flex-start" }}><span className="chip">{i + 1}</span><span>{h}</span></div>)}
          </Col>
          <button className="btn primary" style={{ alignSelf: "flex-start" }} onClick={() => setN(Math.min(HOP_LIST.length, n + 1))} disabled={n >= HOP_LIST.length}>{n >= HOP_LIST.length ? "That is the whole trip" : "Next hop"}</button>
        </Col>
        <Col>
          <div className="panel" style={{ padding: 18, borderTop: `5px solid ${T.blue}` }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Thursday: TypeScript</div>
            <p className="lead" style={{ marginTop: 8 }}>The /two bug and the 12.5 minutes bug both waited until runtime to bite. Thursday your editor underlines mistakes like these while you type, using the column types Supabase already knows.</p>
          </div>
          <div className="callout info"><div className="h">Before Thursday</div>Mission 9 Silver pushed. Run node -v: you need v22.18 or newer (Node 24 LTS recommended).</div>
        </Col>
      </Split>
    </Slide>
  );
}

/* ============ deck ============ */

const SLIDES = [
  { el: <TitleSlide />, notes: "12:20. Click POST Ramen, then Restart the server, while people settle. Ask: which side forgot? That is the whole lesson in one click." },
  { el: <SurviveSlide />, notes: "Pairs predict, then reveal row by row with hands up. Row 1 is the one they lived through last week (every save wiped test data). Row 3 is the twist: sleep pauses, it does not stop. Land on the callout." },
  { el: <DatabaseSlide />, notes: "Callback to the restaurant: the pantry was always on the diagram, today it becomes real. Click the four cards. Keep it to 4 minutes." },
  { el: <TableSlide />, notes: "Click row 3: it is the exact object from last week's array. Then click minutes and tags headers to show type and rule. Say: the table is the array, a row is one object, a column is one key." },
  { el: <RulesSlide />, notes: "Have the room call out which attempts will be refused before you click. Do the good one first, then twenty, 12.5, no name, -5, id. End with the twist: text 20 is accepted. That is why our own validation stays." },
  { el: <SqlSlide />, notes: "Walk lines 1 to 7 slowly, one column at a time. Then 10, 12, 13: lock the door, take away keys, give the kitchen its key. Say clearly: new Supabase projects need the grant line." },
  { el: <SelectSlide />, notes: "Click each question. Read the SQL out loud like a sentence. Then the callout: supabase-js writes this for us. Three minutes, do not teach SQL syntax in depth." },
  { el: <SupabaseSlide />, notes: "Click the four hops left to right. Stress hop 3: supabase-js is fetch under the hood. Then the dashboard map, we use all four places in the next 15 minutes." },
  { el: <CodeAlongASlide />, notes: "12:45. Leave the deck, do every step on the projector in your own Supabase. Read setup.sql together while projects spin up. Walk the room for Checkpoint A before moving on." },
  { el: <KeysSlide />, notes: "Two cards, then the sorting game with the room voting. The publishable key in React will surprise people: it is designed to be public, RLS protects the data. Week 12." },
  { el: <EnvSlide />, notes: "Click each file tab. Run the terminal: first run fails with OUR message, fix the script, second run opens. Have everyone create .gitignore first, then .env, then run git status." },
  { el: <ClientSlide />, notes: "Code-along: npm install, then type data/supabase.js together line by line. Click lines 1, 3, 6, 10 as you go. Then convert GET all (slide 15 left tab) and hit Checkpoint 1: created_at appears." },
  { el: <DataErrorSlide />, notes: "Click all five. Recipe 99 is the important one: no match is not an error. Recipe two sets up the trap in three slides. Then the fetch comparison: same idea as res.ok." },
  { el: <BuilderSlide />, notes: "Toggle pieces on and off and read the JS, the SQL, and the URL. Point out the result can be an empty list and that is still a 200. This is the Gold filter pattern, do not live-code it." },
  { el: <BeforeAfterSlide />, notes: "GET all tab during Checkpoint 1, GET one tab before Checkpoint 2. Read the four changes out loud. Mention Express 5 catching async errors." },
  { el: <TrapSlide />, notes: "Deliberate mistake: live-code GET one WITHOUT checkId, send /two from Thunder Client, let the 500 land. Read the terminal message aloud. Make the error handler print err.code and send /two again: 22P02. Then add checkId together. Checkpoint 2: /two is a 404." },
  { el: <WritesSlide />, notes: "POST first, live: type it, send Ramen, watch the Table Editor. Ask what happens to 12.5 minutes, try it, then fix validateRecipe. Then restart proof (next slide). PATCH and DELETE: students try first for 5 minutes, then you show." },
  { el: <RestartSlide />, notes: "Do every step on the projector, slowly. Pause at step 4 and let the room react. Checkpoint 3. Step 6 shows the dashboard and the API are two doors to one pantry." },
  { el: <ErrorsSlide />, notes: "Reference slide. Jump here whenever a student hits an error during the code-along or build block, click their message, read the fix aloud." },
  { el: <ProgressionSlide />, notes: "Keep this up during transitions. Anyone behind: copy the checkpoint folder into their project. 01 proof is created_at; 04 means data/recipes.js is deleted." },
  { el: <AssignmentSlide />, notes: "1:52. 15 minute timer. Bronze and Silver are what we just built; this block is for finishing them. Gold is the filters. Circulate for .env problems, missing await, missing .select()." },
  { el: <CloseSlide />, notes: "2:08. Pair explain, both partners talk. Click Next hop after a minute so they can check their story. Tease Thursday and remind them about node -v." },
];

export default function Deck() {
  return <DeckShell slides={SLIDES} />;
}
