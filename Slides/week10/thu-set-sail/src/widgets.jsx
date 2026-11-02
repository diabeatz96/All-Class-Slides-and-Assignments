import { useState } from "react";
import { Term, useBounty, fmt } from "./kit/index.jsx";

/* ==================================================================
   Thursday widgets: Mission 12, Set Sail
   ================================================================== */

/* ---------------- live leaderboard from the shared bounty board ---------------- */
export function Leaderboard() {
  const { crews } = useBounty();
  const sorted = crews.map((c, i) => ({ ...c, i })).sort((a, b) => b.bounty - a.bounty);
  return (
    <div className="parch" style={{ padding: "14px 18px" }}>
      <h3 style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 400, color: "var(--red-deep)" }}>Standings right now</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 18 }}>
        <tbody>
          {sorted.map((c, k) => (
            <tr key={c.i} style={{ borderBottom: "1px dashed var(--parch-edge)" }}>
              <td style={{ padding: "6px 4px", width: 34, fontFamily: "var(--display)", fontSize: 24 }}>{k + 1}</td>
              <td style={{ padding: "6px 4px", fontWeight: 800 }}>
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: c.color, marginRight: 8 }} />
                {c.name}
              </td>
              <td style={{ padding: "6px 4px", textAlign: "right", fontFamily: "var(--mono)", fontSize: 16 }}>{fmt(c.bounty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="muted" style={{ fontSize: 15, marginTop: 8 }}>Press B to pay out bounties. Tuesday's totals carry over.</div>
    </div>
  );
}

/* ---------------- deploy steps, revealed one at a time ---------------- */
const DEPLOY_STEPS = [
  ["Copy", "Your code goes to someone else's computer."],
  ["Install", "That computer runs npm install from your package.json."],
  ["Build", "It prepares your code to run (for us: bundles app.js and what it imports)."],
  ["Run", "It starts your code when requests arrive."],
  ["Address", "It gives you a public URL that anyone can open."],
  ["Keep it up", "It keeps answering while your laptop sleeps."],
];
export function DeploySteps() {
  const [n, setN] = useState(0);
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="grid3" style={{ gap: 12 }}>
        {DEPLOY_STEPS.map(([t, d], k) => (
          <div key={t} className={k < n ? "parch pop" : "panel"} style={{ minHeight: 118, padding: "12px 14px", opacity: k < n ? 1 : 0.55 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 30, color: k < n ? "var(--red-deep)" : "var(--gold)" }}>{k + 1}. {k < n ? t : "?"}</div>
            {k < n && <div style={{ fontSize: 17, lineHeight: 1.35 }}>{d}</div>}
          </div>
        ))}
      </div>
      <div className="row" style={{ gap: 10 }}>
        {n < DEPLOY_STEPS.length && (
          <button className="btn" onClick={() => setN(n + 1)}>
            Reveal next step ({n}/{DEPLOY_STEPS.length})
          </button>
        )}
        {n > 0 && <button className="btn ghost sm" onClick={() => setN(0)}>Hide all</button>}
      </div>
    </div>
  );
}

/* ---------------- serverless simulator ---------------- */
const BASE = 12 * 3600 + 40 * 60; // 12:40:00
const clockText = (s) => {
  const t = BASE + s;
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor((t % 3600) / 60);
  const sec = t % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export function ServerlessSim() {
  const [clock, setClock] = useState(0);
  const [laptop, setLaptop] = useState({ visits: 0, startedAt: 0 });
  const [copies, setCopies] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [deploy, setDeploy] = useState(1);
  const [recipes, setRecipes] = useState(8);
  const [log, setLog] = useState([{ c: "dim", t: "Deployment 1 is live. No copies are running yet." }]);

  const push = (entries) => setLog((l) => [...l, ...entries].slice(-8));

  function hit(state, now, preferNew) {
    // returns [newCopies, copyUsed, newNextId, startedNew]
    let cs = state.copies;
    let id = state.nextId;
    let used;
    let started = false;
    if (cs.length === 0 || preferNew) {
      used = { id, startedAt: now, visits: 0 };
      cs = [...cs, used];
      id += 1;
      started = true;
    } else {
      used = cs[0];
    }
    used = { ...used, visits: used.visits + 1 };
    cs = cs.map((c) => (c.id === used.id ? used : c));
    return [cs, used, id, started];
  }

  const send = () => {
    const now = clock + 7;
    const [cs, used, id, started] = hit({ copies, nextId }, now, false);
    setClock(now);
    setCopies(cs);
    setNextId(id);
    setLaptop((l) => ({ ...l, visits: l.visits + 1 }));
    push([
      ...(started ? [{ c: "dim", t: `${clockText(now)}  a new copy (#${used.id}) starts` }] : []),
      { c: "ok", t: `GET /api/visits -> copy #${used.id}: { "visits": ${used.visits}, "thisCopyStartedAt": "${clockText(used.startedAt)}" }` },
    ]);
  };

  const rush = () => {
    // Three requests arrive at the same moment. One copy is busy, so another can start.
    const now = clock + 7;
    let cs = [...copies];
    let id = nextId;
    const entries = [];
    const start = (why) => {
      const c = { id, startedAt: now, visits: 0 };
      entries.push({ c: "dim", t: `${clockText(now)}  ${why}: a new copy (#${id}) starts` });
      id += 1;
      cs = [...cs, c];
      return c.id;
    };
    const first = cs.length ? cs[0].id : start("no copy running");
    const other = cs.find((c) => c.id !== first)?.id ?? start("requests overlap");
    for (const target of [first, other, first]) {
      cs = cs.map((c) => (c.id === target ? { ...c, visits: c.visits + 1 } : c));
      const c = cs.find((x) => x.id === target);
      entries.push({ c: "ok", t: `GET /api/visits -> copy #${c.id}: { "visits": ${c.visits} }` });
    }
    setClock(now);
    setCopies(cs);
    setNextId(id);
    setLaptop((l) => ({ ...l, visits: l.visits + 3 }));
    push(entries);
  };

  const idle = () => {
    const now = clock + 15 * 60;
    setClock(now);
    if (copies.length) push([{ c: "dim", t: `${clockText(now)}  15 quiet minutes. Idle copies can be shut down: ${copies.length} gone.` }]);
    else push([{ c: "dim", t: `${clockText(now)}  15 quiet minutes. Nothing was running anyway.` }]);
    setCopies([]);
  };

  const redeploy = () => {
    const now = clock + 40;
    setClock(now);
    setDeploy((d) => d + 1);
    setCopies([]);
    push([{ c: "prompt", t: `redeploy: deployment ${deploy + 1} is live. Every copy of deployment ${deploy} is gone.` }]);
  };

  const save = () => {
    const now = clock + 7;
    setClock(now);
    setRecipes((r) => r + 1);
    push([{ c: "ok", t: `POST /api/recipes -> 201 (row ${recipes + 1} saved in Supabase)` }]);
  };

  const reset = () => {
    setClock(0); setLaptop({ visits: 0, startedAt: 0 }); setCopies([]); setNextId(1); setDeploy(1); setRecipes(8);
    setLog([{ c: "dim", t: "Deployment 1 is live. No copies are running yet." }]);
  };

  return (
    <div className="col" style={{ gap: 10 }}>
      <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn sm" onClick={send}>Send request</button>
        <button className="btn sm" onClick={rush}>Rush: 3 at once</button>
        <button className="btn sm teal" onClick={idle}>Wait 15 min (idle)</button>
        <button className="btn sm red" onClick={redeploy}>Redeploy</button>
        <button className="btn sm ghost" onClick={save}>POST a recipe</button>
        <button className="btn sm ghost" onClick={reset}>Reset</button>
        <span className="note" style={{ marginLeft: "auto", fontSize: 15 }}>clock {clockText(clock)}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 12 }}>
        <div className="panel" style={{ borderTop: "5px solid var(--teal)" }}>
          <div className="tag teal">your laptop: npm run dev</div>
          <div style={{ fontSize: 16, marginTop: 6 }}>One process. Started once. Calls listen(3000).</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 54, color: "var(--teal-soft)", lineHeight: 1.1 }}>{laptop.visits}</div>
          <div className="note" style={{ fontSize: 15 }}>visits in memory, started {clockText(laptop.startedAt)}</div>
        </div>
        <div className="panel" style={{ borderTop: "5px solid var(--gold)" }}>
          <div className="tag">vercel: deployment {deploy}, copies of ONE function</div>
          <div className="row" style={{ gap: 10, marginTop: 8, flexWrap: "wrap", minHeight: 104 }}>
            {copies.length === 0 && <div style={{ fontSize: 17, color: "var(--foam)", alignSelf: "center" }}>No copies running right now.</div>}
            {copies.map((c) => (
              <div key={c.id} className="parch pop" style={{ padding: "8px 12px", minWidth: 128 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>copy #{c.id}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 40, lineHeight: 1, color: "var(--red-deep)" }}>{c.visits}</div>
                <div style={{ fontSize: 14 }}>visits, started {clockText(c.startedAt)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel" style={{ borderTop: "5px solid var(--warn)" }}>
          <div className="tag" style={{ color: "#ffc58a", borderColor: "rgba(239,154,60,.6)", background: "rgba(239,154,60,.14)" }}>supabase</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 54, color: "#ffc58a", lineHeight: 1.1, marginTop: 6 }}>{recipes}</div>
          <div className="note" style={{ fontSize: 15 }}>recipes in the database. Idle, redeploy: still here.</div>
        </div>
      </div>
      <Term title="what the API answered" lines={log} size={14} style={{ minHeight: 168 }} />
      <div className="note" style={{ fontSize: 15 }}>Simplified on purpose. On Vercel a copy CAN be reused for many requests, and an idle copy CAN disappear. You never choose which copy answers.</div>
    </div>
  );
}

/* ---------------- what Vercel actually bundled ---------------- */
const REPO_FILES = [
  ["app.js", true], ["server.js", false], ["config/env.js", true], ["data/supabase.js", true],
  ["middleware/errors.js", true], ["middleware/logger.js", true], ["middleware/validate.js", true],
  ["routes/recipes.js", true], ["services/recipes.js", true], ["package.json", true],
  [".env.example", false], ["setup.sql", false], [".env (not in git)", false],
];
export function BundleView() {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel" style={{ padding: "12px 16px" }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="tag teal">vercel build, our real output</div>
        {!open && <button className="btn sm" onClick={() => setOpen(true)}>Show the bundle</button>}
      </div>
      <div className="mono" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.55 }}>
        {open && <div className="gold pop" style={{ marginBottom: 4 }}>.vc-config.json: handler "app.js", runtime "nodejs26.x"</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16 }}>
        {open ? (
          <>
            {REPO_FILES.map(([f, inBundle]) => (
              <div key={f} style={{ opacity: inBundle ? 1 : 0.4 }}>
                {inBundle ? <span className="ok-badge">in  </span> : <span className="no-badge">out </span>}
                <span className={inBundle ? "" : "strike"}>{f}</span>
                {f === "server.js" && <span className="red" style={{ fontFamily: "var(--body)", fontWeight: 800 }}> not bundled</span>}
              </div>
            ))}
            <div><span className="ok-badge">in  </span>node_modules/</div>
          </>
        ) : (
          REPO_FILES.map(([f]) => <div key={f}>{f}</div>)
        )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- three places an env var could live ---------------- */
const PLACES = [
  {
    where: "Your laptop",
    file: ".env",
    q: "Who reads it?",
    a: "Node does, because of --env-file=.env in npm run dev. It never leaves your laptop: .gitignore keeps it out of every push.",
    color: "var(--teal)",
  },
  {
    where: "Vercel",
    file: "Project Settings > Environment Variables",
    q: "When does a new value take effect?",
    a: "Only on the NEXT deployment. Values are encrypted at rest, and you choose the environments: Production, Preview, Development.",
    color: "var(--gold)",
  },
  {
    where: "Git and GitHub",
    file: "your repo",
    q: "Which secrets belong here?",
    a: "None. Ever. Anything pushed stays in the history, even after you delete the file. Commit .env.example with fake values instead.",
    color: "var(--red)",
  },
];
export function EnvVarMap() {
  const [shown, setShown] = useState({});
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="grid3">
        {PLACES.map((p, k) => (
          <div key={p.where} className="panel" style={{ borderTop: `6px solid ${p.color}`, minHeight: 210 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 32, color: p.color }}>{p.where}</div>
            <div className="mono" style={{ fontSize: 15, color: "var(--foam)" }}>{p.file}</div>
            <div style={{ fontWeight: 800, fontSize: 19, marginTop: 8 }}>{p.q}</div>
            {shown[k] ? (
              <div className="pop" style={{ fontSize: 17, lineHeight: 1.4, marginTop: 6, color: "var(--foam)" }}>{p.a}</div>
            ) : (
              <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setShown({ ...shown, [k]: true })}>Reveal</button>
            )}
          </div>
        ))}
      </div>
      <table className="t" style={{ fontSize: 17 }}>
        <thead><tr><th>Variable</th><th>Laptop .env</th><th>Vercel</th></tr></thead>
        <tbody>
          <tr><td className="mono">SUPABASE_URL</td><td>yes</td><td>yes</td></tr>
          <tr><td className="mono">SUPABASE_SECRET_KEY</td><td>yes</td><td>yes</td></tr>
          <tr><td className="mono">CORS_ORIGINS</td><td>yes</td><td>yes (can hold a different list)</td></tr>
          <tr><td className="mono">PORT</td><td>yes</td><td>not needed: nothing of yours listens on Vercel</td></tr>
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- two remotes ---------------- */
const COMMIT_NAMES = ["add /api/health", "fix routes folder case", "update CORS list", "tidy README", "add servings"];
export function TwoRemotes() {
  const [commits, setCommits] = useState(["Week 10 final"]);
  const [origin, setOrigin] = useState(0);
  const [personal, setPersonal] = useState(-1);
  const [vercel, setVercel] = useState({ state: "waiting", commit: -1 });
  const [note, setNote] = useState("Make a commit, then try each push.");
  const head = commits.length - 1;
  const label = (i) => (i < 0 ? "(empty repo)" : `c${i + 1}: ${commits[i]}`);

  const commit = () => {
    const name = COMMIT_NAMES[(commits.length - 1) % COMMIT_NAMES.length];
    setCommits([...commits, name]);
    setNote(`git commit: c${commits.length + 1} exists ONLY on your machine so far.`);
  };
  const pushOrigin = () => {
    setOrigin(head);
    setNote("git push: the Classroom repo got your work. Vercel is not watching that repo, so nothing deploys.");
  };
  const pushPersonal = () => {
    setPersonal(head);
    setVercel({ state: "building", commit: head });
    setNote("git push personal main: your own repo got your work, and Vercel noticed.");
    setTimeout(() => setVercel({ state: "ready", commit: head }), 1300);
  };

  const Box = ({ title, sub, value, color, children }) => (
    <div className="panel" style={{ borderTop: `6px solid ${color}`, minHeight: 150 }}>
      <div style={{ fontFamily: "var(--display)", fontSize: 28, color }}>{title}</div>
      <div className="note" style={{ fontSize: 15 }}>{sub}</div>
      <div className="mono pop" key={value} style={{ fontSize: 15, marginTop: 8 }}>{value}</div>
      {children}
    </div>
  );

  return (
    <div className="col" style={{ gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <Box title="Your repo" sub="laptop or Codespace" value={label(head)} color="var(--teal)">
          <div className="note" style={{ fontSize: 14, marginTop: 6 }}>{commits.length} commit{commits.length > 1 ? "s" : ""}</div>
        </Box>
        <Box title="origin" sub="Classroom org repo, private. Adam grades here." value={label(origin)} color="var(--sea-500)">
          {origin < head && <div className="red" style={{ fontSize: 14, fontWeight: 800, marginTop: 6 }}>behind your repo</div>}
        </Box>
        <Box title="personal" sub="YOUR account, private. Vercel watches here." value={label(personal)} color="var(--gold)">
          {personal < head && <div className="red" style={{ fontSize: 14, fontWeight: 800, marginTop: 6 }}>behind your repo</div>}
        </Box>
        <Box
          title="Vercel"
          sub="production deployment"
          value={vercel.state === "waiting" ? "nothing deployed yet" : vercel.state === "building" ? `building ${label(vercel.commit)}...` : `ready: ${label(vercel.commit)}`}
          color="var(--good)"
        />
      </div>
      <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn sm teal" onClick={commit}>git commit</button>
        <button className="btn sm" onClick={pushOrigin}>git push</button>
        <button className="btn sm" onClick={pushPersonal}>git push personal main</button>
      </div>
      <div className="parch" style={{ fontSize: 18, padding: "10px 14px" }}>{note}</div>
    </div>
  );
}

/* ---------------- log mysteries ---------------- */
const CASES = [
  {
    key: "A",
    title: "Works on my laptop, crashes on Vercel",
    symptom: "Every request to the deployed API fails. On your Windows laptop, npm run dev works perfectly. The runtime log says:",
    log: [{ c: "err", t: "Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/Routes/recipes.js' imported from /var/task/app.js" }],
    cause: "app.js imports \"./Routes/recipes.js\", but the folder is routes/ with a small r. Windows and Mac file systems ignore letter case. Vercel's Linux machines do not.",
    fix: "Match the case exactly in the import, commit, and git push personal main to redeploy.",
  },
  {
    key: "B",
    title: "The health check is a 500",
    symptom: "You open /api/health on your production URL and get an error page. The runtime log says:",
    log: [{ c: "err", t: "Error: Missing environment variable SUPABASE_URL. On your laptop: add it to .env (see .env.example). On a host: add it in the host's environment variable settings." }],
    cause: "Vercel never saw your .env (it is in .gitignore, so it never left your laptop) and nobody added the variable in Vercel.",
    fix: "Project Settings > Environment Variables: add SUPABASE_URL (and check the other two). Then redeploy.",
  },
  {
    key: "C",
    title: "I added it ten minutes ago!",
    symptom: "You added SUPABASE_URL in Vercel's settings. You refresh /api/health again and again. Same 500, same log:",
    log: [{ c: "err", t: "Error: Missing environment variable SUPABASE_URL. On your laptop: add it to .env (see .env.example). On a host: add it in the host's environment variable settings." }],
    cause: "Changes to environment variables only apply to NEW deployments. The deployment you are refreshing was built before the variable existed.",
    fix: "Redeploy: use the Redeploy option in the deployment's menu, or push a new commit to your personal repo.",
  },
  {
    key: "D",
    title: "A line pasted from the internet",
    symptom: "You pasted a snippet from a blog post, pushed, and the deploy crashes. The log says:",
    log: [{ c: "err", t: "ReferenceError: require is not defined in ES module scope, you can use import instead" }],
    cause: "The snippet was CommonJS (const x = require(\"...\")). Our project is ESM: \"type\": \"module\" in package.json.",
    fix: "Rewrite it as import x from \"...\". This crashes on your laptop too, so run npm run dev before every push.",
  },
  {
    key: "E",
    title: "The browser blocks the deployed API",
    symptom: "harbor-client on http://localhost:5173 now points at your production URL. Thunder Client gets 200. The page gets TypeError: Failed to fetch, and the Console says:",
    log: [{ c: "err", t: "Access to fetch at 'https://your-project.vercel.app/api/recipes' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource." }],
    cause: "CORS_ORIGINS on Vercel does not include http://localhost:5173 (left out, or typed with a slash at the end). Same harbor master as Tuesday, new harbor.",
    fix: "Fix the comma list in Vercel's Environment Variables, for example http://localhost:5173 with no trailing slash. Redeploy.",
  },
  {
    key: "F",
    title: "A login page instead of JSON",
    symptom: "You copy the long link from a deployment's page, open it in a private window, and see a Vercel login page. No log line at all.",
    log: [{ c: "dim", t: "(nothing in the runtime log: the request never reached your function)" }],
    cause: "Deployment protection. Vercel can put the long, per-deployment URLs behind a Vercel login. Production domains stay public.",
    fix: "Use the short production domain from the project's Domains (your-project.vercel.app) for testing and for your frontend.",
  },
];
export function LogMysteries() {
  const [k, setK] = useState(0);
  const [shown, setShown] = useState({});
  const c = CASES[k];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 16 }}>
      <div className="col" style={{ gap: 8 }}>
        {CASES.map((x, i) => (
          <button key={x.key} className={`chipbtn ${i === k ? "on" : ""}`} style={{ textAlign: "left", borderRadius: 10, padding: "8px 12px", fontSize: 15 }} onClick={() => setK(i)}>
            <span style={{ fontFamily: "var(--display)", fontSize: 20, marginRight: 8 }}>{x.key}</span>
            {x.title}
            {shown[i] && <span className="ok-badge" style={{ marginLeft: 6 }}> solved</span>}
          </button>
        ))}
      </div>
      <div className="col pop" key={c.key} style={{ gap: 10 }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 30, color: "var(--gold)" }}>Case {c.key}: {c.title}</div>
        <div style={{ fontSize: 18, color: "var(--foam)", lineHeight: 1.4 }}>{c.symptom}</div>
        <Term title={c.key === "E" ? "browser console" : "runtime log"} lines={c.log} size={14} />
        {shown[k] ? (
          <div className="parch pop" style={{ fontSize: 17, lineHeight: 1.45 }}>
            <div><b style={{ color: "var(--red-deep)" }}>Cause: </b>{c.cause}</div>
            <div style={{ marginTop: 6 }}><b style={{ color: "var(--red-deep)" }}>Fix: </b>{c.fix}</div>
          </div>
        ) : (
          <div className="row" style={{ alignItems: "center", gap: 12 }}>
            <button className="btn" onClick={() => setShown({ ...shown, [k]: true })}>Reveal cause and fix</button>
            <span className="note" style={{ fontSize: 15 }}>Crews: diagnosis first. Cause in one sentence, fix in one sentence.</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- option cards with a verdict each (slide 11) ---------------- */
export function VerdictCards({ items }) {
  const [shown, setShown] = useState({});
  return (
    <div className="col" style={{ gap: 10 }}>
      {items.map((it, k) => (
        <div key={k} className="panel" style={{ padding: "10px 14px" }}>
          <div className="row" style={{ alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 19 }}>{it.option}</div>
            {!shown[k] && <button className="btn sm" onClick={() => setShown({ ...shown, [k]: true })}>Verdict</button>}
            {shown[k] && <span className={`tag ${it.ok ? "green" : "red"} pop`}>{it.ok ? "yes" : "no"}</span>}
          </div>
          {shown[k] && <div className="pop" style={{ fontSize: 16, color: "var(--foam)", marginTop: 4, lineHeight: 1.4 }}>{it.why}</div>}
        </div>
      ))}
    </div>
  );
}
