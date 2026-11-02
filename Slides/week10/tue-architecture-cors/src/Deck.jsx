import { DeckShell, Slide, Split, Cap, Code, Dissect, CallIt, Term, Reveal, Checklist, Tiers, Ask } from "./kit/index.jsx";
import { JobHunt, ScenarioCards, CrewMap, FloorPlan, SortTheCrew, FollowTheRequest, OriginChecker, BankStory, PermissionSlip, HarborSimulator, QuickBounty } from "./widgets.jsx";

/* ==================================================================
   CSC 436 | Week 11 | Tuesday Nov 3 | Mission 11: Assemble the Crew
   Architecture + CORS. The Recipe Box API is the ship's galley.
   Run: npm install, then npm run dev (http://localhost:4100)
   ================================================================== */

const K = (s) => `Mission 11 | ${s}`;
const mono = { fontFamily: "var(--mono)", fontSize: "0.62em" };

/* ---------------- code excerpts (real code from the checkpoints) ---------------- */
const CONFIG_11 = `function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      \`Missing environment variable \${name}. \` +
        "On your laptop: add it to .env (see .env.example). " +
        "On a host: add it in the host's environment variable settings."
    );
  }
  return value.trim();
}

export const config = Object.freeze({
  supabaseUrl: required("SUPABASE_URL"),
  supabaseSecretKey: required("SUPABASE_SECRET_KEY"),
  // PORT is optional. Env values are always text, and listen() wants a number.
  port: Number(process.env.PORT ?? 3000),
});`;

const SUPABASE_11 = `import { createClient } from "@supabase/supabase-js";
import { config } from "../config/env.js";

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseSecretKey
);`;

const SERVICE_12 = `// services/recipes.js: THE GALLEY COOK.
import { supabase } from "../data/supabase.js";

// One recipe, or null when no row has that id.
export async function getRecipe(id) {
  const { data, error } = await supabase
    .from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}`;

const ROUTE_12 = `// routes/recipes.js: THE NAVIGATOR.
import * as recipes from "../services/recipes.js";

// GET /api/recipes/:id
router.get("/:id", checkId, async (req, res) => {
  const recipe = await recipes.getRecipe(req.params.id);
  if (!recipe) return res.status(404).json(notFoundMsg(req.params.id));
  res.json(recipe);
});`;

const APP_13 = `import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import recipesRouter from "./routes/recipes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(logger);
app.use(express.json());

// 4. Routes.
app.use("/api/recipes", recipesRouter);

app.use(notFound);
app.use(errorHandler);

// Hand the finished ship to whoever imports this file.
export default app;`;

const SERVER_13 = `import app from "./app.js";
import { config } from "./config/env.js";

app.listen(config.port, () => {
  console.log(\`Galley open at http://localhost:\${config.port}\`);
});`;

const LIST_14 = `// "a,b" -> ["a", "b"]  (short version of the real comment)
function list(name) {
  return required(name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
  // ...inside config:
  corsOrigins: list("CORS_ORIGINS"),`;

const APP_14 = `// 1. The lookout at the top of the mast: log EVERY request, first.
app.use(logger);

// 2. CORS: which OTHER websites may read our responses in a browser.
app.use(cors({ origin: config.corsOrigins }));

// 3. Turn JSON bodies into req.body.
app.use(express.json());`;

const MISSING_ERR = "Error: Missing environment variable SUPABASE_URL. On your laptop: add it to .env (see .env.example). On a host: add it in the host's environment variable settings.";
const CONSOLE_STRING_5174 = "Access to fetch at 'http://localhost:3000/api/recipes' from origin 'http://localhost:5174' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' that is not equal to the supplied origin. Have the server send the header with a valid value.";
const CONSOLE_PREFLIGHT_STRING_5174 = "Access to fetch at 'http://localhost:3000/api/recipes' from origin 'http://localhost:5174' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The 'Access-Control-Allow-Origin' header has a value 'http://localhost:5173' that is not equal to the supplied origin. Have the server send the header with a valid value.";
const CONSOLE_NO_HEADER_5173 = "Access to fetch at 'http://localhost:3000/api/recipes' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.";

/* ======================= slides ======================= */
const slides = [
  /* ---------- A. Warm-up 12:20-12:35 ---------- */
  {
    id: "title",
    notes: "12:20. Doors open, deck up. Today the Recipe Box API becomes the ship's galley and gets a real crew. Point at the question and let it hang: who does what on a ship? Seat people in crews of 4 or 5 by table (6 crews). Tell them bounties carry over to Thursday. Next slide explains how to earn them.",
    render: () => (
      <Slide kicker="CSC 436 | Week 11 | Tuesday Nov 3 | Mission 11">
        <Split cols="minmax(0,1.05fr) minmax(0,1fr)" style={{ alignItems: "center", marginTop: 30 }}>
          <div className="col" style={{ gap: 18 }}>
            <h1 className="qtitle" style={{ fontSize: 74 }}>Assemble the Crew</h1>
            <p className="lead">Architecture and CORS. Today our API gets a real crew, and we meet the harbor master who decides which ships may dock.</p>
            <Ask n="?">Who does what on a ship, and why not one person doing everything?</Ask>
          </div>
          <Cap id="t-01-title" hint="the crew setting sail together" style={{ height: 400 }} />
        </Split>
      </Slide>
    ),
  },
  {
    id: "bounty-rules",
    notes: "Press B to show the empty Wanted posters. Rename crews if a table wants a name (click the name). Rules: Call It slides pay +1M to every crew that called it right (crews hold up a letter BEFORE the reveal). Best question of the day: +5M at the end. Catch a bug in my live code: +1M. Explain something to the whole class: +1M. P picks a random crew to answer. T starts a timer.",
    render: () => (
      <Slide kicker={K("How the voyage works")} q="How do you earn a bounty today?">
        <Split cols="minmax(0,1.15fr) minmax(0,1fr)">
          <div className="col" style={{ gap: 10 }}>
            {[
              ["+1M", "Call it right on a Call It! slide. Hold up your letter BEFORE the reveal."],
              ["+5M", "Best question of the day. Questions beat answers today."],
              ["+1M", "Catch a bug in my live code before I do."],
              ["+1M", "Explain something to the whole class."],
            ].map(([amt, txt]) => (
              <div key={txt} className="panel" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 34, color: "var(--gold)", width: 78 }}>{amt}</span>
                <span style={{ fontSize: 19 }}>{txt}</span>
              </div>
            ))}
            <div className="note" style={{ fontSize: 16 }}>Crews of 4 or 5 by table. <span className="kbd">B</span> board, <span className="kbd">P</span> pick a crew, <span className="kbd">T</span> timer. Bounties carry over to Thursday.</div>
          </div>
          <Cap id="t-02-bounty" hint="a wanted poster reveal" style={{ height: 360 }} />
        </Split>
      </Slide>
    ),
  },
  {
    id: "job-hunt",
    notes: "Warm-up Bounty Hunt. Press T, pick 180 s. Crews list every separate JOB this one file does. Then go crew by crew (press P), each names one job, +1M per real job not already named. Use Reveal a job to confirm and click each to light its lines. There are 12. Expect people to merge 'talk to the database' and 'pick status codes': push them apart, they are different jobs. Ask: if 12 jobs live in one file, who owns a bug?",
    render: () => (
      <Slide q="How many different jobs is this one file doing?" sm style={{ paddingTop: 28, paddingBottom: 48 }}>
        <JobHunt />
      </Slide>
    ),
  },
  {
    id: "two-am",
    notes: "Read each symptom, crews point at the line on the previous slide where they would look, then reveal where it lives AFTER today's refactor. The punchline card: in one file, the answer is always 'somewhere in here'. That is the whole case for architecture: when something breaks, the file name tells you where to look.",
    render: () => (
      <Slide kicker={K("Warm-up")} q="Something breaks at 2 a.m. Where do you look first?" sm>
        <ScenarioCards />
      </Slide>
    ),
  },

  /* ---------- B. Architecture 12:35-12:55 ---------- */
  {
    id: "crew-map",
    notes: "12:35. Ask: why does a pirate crew have a navigator, a cook and a lookout instead of one person doing everything? Answers: each gets good at one job, two people can work at once, you know who to blame. Software name: separation of concerns. Go down the list, crews guess the file BEFORE you click Which file. The cook rule is the one we will test hardest: only the cook goes into the galley.",
    render: () => (
      <Slide kicker={K("Architecture")} q="Why does a pirate crew have a navigator, a cook, and a lookout?" sm>
        <Split cols="minmax(0,1.75fr) minmax(0,1fr)">
          <CrewMap />
          <div className="col" style={{ gap: 12 }}>
            <Cap id="t-05-crew" hint="the whole crew lined up, each with a different job" style={{ height: 250 }} />
            <div className="parch" style={{ fontSize: 17 }}>Software name for this idea: <b>separation of concerns</b>. Every file has one job, and you can say it in one sentence.</div>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "floor-plan",
    notes: "Click through the files in this order: server.js, app.js, config/env.js, data/supabase.js, services, routes, middleware. For each: what does it import, who imports it, and the red NEVER line. Ask before clicking: who do you think is allowed to import data/supabase.js? Only the service. Note app.js says '(Thursday: someone else too)': do not explain yet.",
    render: () => (
      <Slide kicker={K("Architecture")} q="What is our ship's floor plan?" sm>
        <FloorPlan />
      </Slide>
    ),
  },
  {
    id: "house-rules",
    notes: "Two rules, both enforceable with a search. Ask the first question, take two answers, reveal. Then the second. The swap question is the payoff: only services and data change; routes, middleware, app.js do not notice. Mention we can CHECK rule 1 with a search command in the code-along.",
    render: () => (
      <Slide kicker={K("Architecture")} q="Two house rules. What breaks if we ignore them?" sm>
        <div className="grid2" style={{ gap: 18, marginBottom: 16 }}>
          <div className="parch"><h3 style={{ fontSize: 24 }}>Rule 1</h3><div style={{ fontSize: 21, fontWeight: 800 }}>Only services talk to Supabase.</div></div>
          <div className="parch"><h3 style={{ fontSize: 24 }}>Rule 2</h3><div style={{ fontSize: 21, fontWeight: 800 }}>Only routes touch req and res.</div></div>
        </div>
        <div className="grid2" style={{ gap: 18 }}>
          <div className="col" style={{ gap: 10 }}>
            <Ask n="1">What goes wrong if a service reads req.body?</Ask>
            <Reveal><div className="panel" style={{ fontSize: 18 }}>Now the cook only works inside an HTTP request. You cannot call it from a test, a script, or another service, and a renamed field in the request breaks the database code.</div></Reveal>
          </div>
          <div className="col" style={{ gap: 10 }}>
            <Ask n="2">We swap Supabase for another database. How many files change?</Ask>
            <Reveal><div className="panel" style={{ fontSize: 18 }}>Two: <span className="mono teal">services/recipes.js</span> and <span className="mono teal">data/supabase.js</span>. Routes, middleware and app.js never notice. That is the payoff.</div></Reveal>
          </div>
        </div>
      </Slide>
    ),
  },
  {
    id: "sort",
    notes: "Sort the Crew. For each snippet: 15 seconds, crews hold up fingers or shout a folder, press P if nobody volunteers, then click the folder they picked. If the class gets it, award with B. The checkId one is the trap: it uses res, so people say routes. It is middleware: it runs BEFORE the route.",
    render: () => (
      <Slide kicker={K("Game")} q="Where does this line belong?">
        <SortTheCrew />
      </Slide>
    ),
  },
  {
    id: "follow",
    notes: "Predict before every click: where does the request go next? Start with 7 (a real recipe). Then 999 (exists as a number, not in the table: service returns null, route sends 404). Then 'seven' (checkId stops it, the database is never asked). Point out the logger is first in and last out: it starts a stopwatch and prints after the response.",
    render: () => (
      <Slide kicker={K("Trace")} q={<>Where does <span style={mono}>GET /api/recipes/7</span> go next?</>} sm>
        <FollowTheRequest />
      </Slide>
    ),
  },
  {
    id: "no-listen",
    notes: "Let crews argue for a minute. Expected answers: a test can import the app and send it requests without opening a port; two programs could share one app. Reveal, but do NOT explain the Thursday reason. Just say: hold on to this. On Thursday someone else imports app.js. Plant it hard.",
    render: () => (
      <Slide kicker={K("Architecture")} q="Why would anyone build an app that does not listen?" sm>
        <Split cols="minmax(0,1.1fr) minmax(0,1fr)">
          <div className="col" style={{ gap: 12 }}>
            <Code code={`// app.js\nconst app = express();\n// ...crew, routes, errors...\nexport default app; // no listen() here`} title="app.js builds the ship" size={17} />
            <Code code={`// server.js\nimport app from "./app.js";\napp.listen(config.port);`} title="server.js sets sail" size={17} />
            <Reveal label="Show one answer">
              <div className="parch" style={{ fontSize: 18 }}>A test can import the app and send it requests without opening a port. <b>And there is one more reason. You will meet it on Thursday.</b></div>
            </Reveal>
          </div>
          <Cap id="t-10-mystery" hint="a sealed letter or a mysterious map" style={{ height: 360 }} />
        </Split>
      </Slide>
    ),
  },
  {
    id: "fail-fast",
    notes: "Call It. Crews hold up A to D. Answer A: config/env.js reads every variable when the server starts and throws with the name of the missing one. Option B is what happens WITHOUT a config file: the server starts fine and the first request fails with a confusing database error. Pay the crews.",
    render: () => (
      <Slide kicker={K("Call It!")} q="A key is missing. Crash at startup, or at the first request?" sm>
        <CallIt cols={2} options={["At startup, with a message that names the variable", "At the first request, with a database error", "Never: it just returns empty lists", "Only after you deploy"]} answer={0}
          why={<div><div>config/env.js checks every setting the moment the server starts. A loud crash at startup beats a confusing error on the first request. The real message:</div><div className="mono" style={{ marginTop: 8, fontSize: 15, color: "var(--red-deep)" }}>{MISSING_ERR}</div></div>} />
      </Slide>
    ),
  },

  /* ---------- C. Code-along 12:55-1:20 ---------- */
  {
    id: "map",
    notes: "12:55. Code-along. Students work in THEIR recipe-box-api, you work in the example project. After each step everyone sends GET /api/recipes from requests.http, and nothing moves on until most hands are up. If someone falls behind: npm run cp11 (or cp12, cp13, cp14) in the example project shows the finished step. Tick each item as the room reaches it.",
    render: () => (
      <Slide kicker={K("Code-along")} q="Where are we sailing in the next 25 minutes?" sm>
        <Split cols="minmax(0,1.2fr) minmax(0,1fr)">
          <Checklist size={19} items={[
            "11: config/env.js, the ship's log (the only file that reads process.env)",
            "12: services/recipes.js, the cook (the only file that talks to Supabase)",
            "13: app.js builds the ship, server.js sets sail",
            "14: CORS_ORIGINS from .env, and the logger moves to the top",
          ]} />
          <div className="col" style={{ gap: 12 }}>
            <Term title="stuck? run the finished step" lines={[
              { c: "dim", t: "# in the example project" },
              { c: "prompt", t: "npm run cp11" },
              { c: "prompt", t: "npm run cp12" },
              { c: "prompt", t: "npm run cp13" },
              { c: "prompt", t: "npm run cp14" },
              { c: "ok", t: "Galley open at http://localhost:3000" },
            ]} size={16} />
            <div className="parch" style={{ fontSize: 17 }}>After every step: send <span className="mono">GET /api/recipes</span> from requests.http. Same answer as before? Then the refactor worked.</div>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "live-11",
    notes: "Type config/env.js live. Then change data/supabase.js to import config (3 lines on the right). Then in server.js use config.port. PREDICT out loud before running: delete SUPABASE_URL from .env (or rename it) and start the server. What prints? Reveal, then run it for real and compare. Put the variable back.",
    render: () => (
      <Slide kicker={K("Live code, checkpoint 11")} q="What prints if SUPABASE_URL is missing?" sm>
        <Split cols="minmax(0,1.38fr) minmax(0,1fr)">
          <Code code={CONFIG_11} title="config/env.js (new)" size={12.5} hl={[2, 4]} />
          <div className="col" style={{ gap: 12 }}>
            <Code code={SUPABASE_11} title="data/supabase.js (now asks config)" size={13.5} />
            <Reveal label="Predict, then reveal">
              <Term title="npm run dev" size={14} lines={[{ c: "prompt", t: "npm run dev" }, { c: "err", t: MISSING_ERR }]} />
            </Reveal>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "live-12",
    notes: "Create services/recipes.js and move every supabase call into it (show getRecipe here, do all five). Then make the routes call the service. DELIBERATE MISTAKE: type the import in routes as \"../services/recipes\" with NO .js and start the server. Ask: which file is Node looking for, and what is missing from its name? (No 'Did you mean' hint is printed for a nested import: they have to read the path.) Fix it. Then run the rule check: grep prints nothing when rule 1 holds. Windows Command Prompt: findstr /s /i supabase routes\\*.js",
    render: () => (
      <Slide kicker={K("Live code, checkpoint 12")} q="Which file is Node looking for, and what is missing from its name?" sm>
        <Split cols="minmax(0,0.9fr) minmax(0,1.1fr)">
          <Code code={SERVICE_12} title="services/recipes.js (new)" size={12.5} />
          <Code code={ROUTE_12} title="routes/recipes.js (now thin)" size={12.5} hl={[2, 6]} />
        </Split>
        <div className="grid2" style={{ gap: 18, marginTop: 12 }}>
          <Reveal label="Show the deliberate mistake">
            <Term title='import ... from "../services/recipes"' size={13} lines={[{ c: "err", t: "Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/you/recipe-box-api/services/recipes' imported from /home/you/recipe-box-api/routes/recipes.js" }, { c: "dim", t: "# ESM needs the full file name: ../services/recipes.js" }]} />
          </Reveal>
          <Term title="rule 1 check: prints NOTHING when it holds" size={14} lines={[{ c: "prompt", t: 'grep -rn "supabase" routes/' }, { c: "dim", t: "# Windows: findstr /s /i supabase routes\\*.js" }]} />
        </div>
      </Slide>
    ),
  },
  {
    id: "live-13",
    notes: "Split server.js: everything except listen() moves to app.js, which ends with export default app. server.js keeps three lines. Then dissect app.js pin by pin, crews answer first (press P). Pin 1: app.js builds the app, so it needs express; server.js only needs the finished app. Pin 2: listen is not here on purpose. Pin 3: cors must run before the routes or route answers leave without the header. Pin 4: errorHandler last, it catches what everything above throws. Pin 5: export default hands the ship to whoever imports it.",
    render: () => (
      <Slide kicker={K("Live code, checkpoint 13")} q="What is each line of the ship doing?" sm>
        <Dissect code={APP_13} title="app.js (new): builds the ship" size={13.5} cols="minmax(0,1.15fr) minmax(0,1fr)" pins={[
          { n: 1, line: 1, q: "Why does app.js import express, but server.js does not?", a: "app.js builds the app, so it needs express. server.js only receives the finished app and pushes it into the water." },
          { n: 2, line: 7, q: "Search the whole file: where does this app start listening?", a: "Nowhere. On purpose. server.js is the only file that calls listen(). That is what lets other code import the app without starting a server." },
          { n: 3, line: 9, q: "Why must cors come before the routes?", a: "Middleware runs top to bottom. If a route answers first, the response leaves without the Access-Control-Allow-Origin header." },
          { n: 4, line: 17, q: "Why is errorHandler the very last line of the crew?", a: "It catches anything thrown above it, including database errors. Express spots it by its four parameters (err, req, res, next)." },
          { n: 5, line: 20, q: "Who receives this export?", a: "server.js today (three lines, shown in the notes). And on Thursday, someone else." },
        ]} />
      </Slide>
    ),
  },

  /* ---------- D. CORS 1:20-1:45 ---------- */
  {
    id: "mystery",
    notes: "1:20. Run harbor-client with npm run stranger (port 5174) against checkpoint 13 and click GET. Show all three windows. Ask question 1, take votes, then point at the server terminal: the GET arrived and the server answered 200. Question 2: so who blocked it? Not the server. The browser. Thunder Client is not a browser, so it never checks. Do not explain why yet.",
    render: () => (
      <Slide kicker={K("CORS")} q="The data is right there. Why can't my page see it?" sm>
        <div className="grid3" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14 }}>
          <div className="panel" style={{ padding: 10 }}>
            <span className="tag green">Thunder Client</span>
            <Code lang="json" size={12} style={{ marginTop: 8 }} code={`GET /api/recipes\n200 OK\n\n[\n  { "id": 1, "name": "Margherita Pizza" },\n  ...7 more recipes\n]`} />
          </div>
          <div className="panel" style={{ padding: 10 }}>
            <span className="tag red">Chrome console, page on :5174</span>
            <div className="term" style={{ fontSize: 13.5, marginTop: 8 }}><span className="err">{CONSOLE_STRING_5174}</span></div>
          </div>
          <div className="panel" style={{ padding: 10 }}>
            <span className="tag teal">Server terminal</span>
            <Term size={14} style={{ marginTop: 8 }} lines={[{ c: "ok", t: "Galley open at http://localhost:3000" }, "GET /api/recipes -> 200 (19ms)"]} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 250px", gap: 16, marginTop: 14, alignItems: "start" }}>
          <div className="col" style={{ gap: 8 }}>
            <Ask n="1">Did the request reach the server?</Ask>
            <Reveal label="Reveal"><div className="panel" style={{ fontSize: 18 }}>Yes. The server logged it and answered 200.</div></Reveal>
          </div>
          <div className="col" style={{ gap: 8 }}>
            <Ask n="2">So who blocked it?</Ask>
            <Reveal label="Reveal"><div className="panel" style={{ fontSize: 18 }}>The browser. It received the answer and refused to hand it to the page's JavaScript.</div></Reveal>
          </div>
          <Cap id="t-16-blocked" hint="a ship stopped by a harbor blockade" style={{ height: 150 }} />
        </div>
      </Slide>
    ),
  },
  {
    id: "origins",
    notes: "An origin is scheme + host + port. For each row: crews shout SAME or DIFFERENT, then reveal (the differing part lights up). Row 2 surprises people: localhost and 127.0.0.1 are the same machine, but the browser compares text. Row 6 previews today's deliberate mistake: the browser's Origin header never ends with a slash.",
    render: () => (
      <Slide kicker={K("CORS")} q="Same origin, or different?" sm>
        <div className="row" style={{ gap: 14, marginBottom: 8, alignItems: "center" }}>
          <span className="tag">origin = scheme + host + port</span>
          <span className="mono" style={{ fontSize: 17 }}><span className="gold">http://</span><span className="teal">localhost</span><span className="red">:5173</span></span>
          <span className="note" style={{ fontSize: 16 }}>The path is NOT part of it.</span>
        </div>
        <OriginChecker />
      </Slide>
    ),
  },
  {
    id: "bank",
    notes: "Tell it as a story. Tab 1: your bank, logged in. Tab 2: a game site from an ad. Its JavaScript asks the bank for your balance, and the browser attaches your bank cookie automatically. Predict with the policy ON: does the request go out? (yes) Does the script get the balance? (no). Then flip to OFF and run it: that is the world without the same-origin policy. CORS is how a server says 'these other origins may read me'. The bank will never put a game site on its list.",
    render: () => (
      <Slide kicker={K("CORS")} q="Why would a browser block this at all?" sm>
        <BankStory />
      </Slide>
    ),
  },
  {
    id: "slip",
    notes: "The permission slip is a response header: Access-Control-Allow-Origin. The SERVER writes it, the BROWSER checks it. Click page 5174 with the Week 10 string origin: the server answers 200 and sends 5173 to everyone (we tested this: the cors package always sends a single string), the browser compares and blocks. Switch to the list (config.corsOrigins): now 5174 gets no header at all. Switch page to 5173: match. Last line: Thunder Client and curl never do step 3.",
    render: () => (
      <Slide kicker={K("CORS")} q="Who writes the permission slip, and who checks it?" sm>
        <PermissionSlip />
      </Slide>
    ),
  },
  {
    id: "simulator",
    notes: "Harbor Simulator. Run at least these four, crews predict both Yes/No answers first (press P to pick who answers): 1) 5173 + GET (docks). 2) 5174 + GET (reaches the route, server logs 200, script cannot read). 3) 5174 + POST JSON (preflight fails, the POST is never sent). 4) 5173 + cors after the routes (even the allowed origin is blocked). Bonus: DELETE from 5174 (recipe 8 survives), and put a slash at the end of CORS_ORIGINS. Every log line and console message here matches what we saw in real Chrome.",
    render: () => (
      <Slide kicker={K("Simulator")} q="Will this ship be allowed to dock?" sm>
        <HarborSimulator />
      </Slide>
    ),
  },
  {
    id: "preflight",
    notes: "We are still on checkpoint 13 (cors first, logger second, one string origin). Run npm run stranger and click POST in harbor-client. Chrome says it sent a preflight. Our terminal shows NOTHING. Mystery 1: why is the log empty? (cors answers the OPTIONS by itself and never calls next(), so the logger below it never runs; the real POST was never sent.) Mystery 2: why ask first at all? Reveal both. Key takeaway: a failed preflight means your route never ran. A blocked simple request DID reach your route; only the answer was hidden. Next slide fixes the logger.",
    render: () => (
      <Slide kicker={K("CORS")} q="Why does a JSON POST ask permission first?" sm>
        <Split cols="minmax(0,1.05fr) minmax(0,1fr)">
          <div className="col" style={{ gap: 10 }}>
            <Term title="Chrome console, page on :5174, POST with JSON" size={13} lines={[{ c: "err", t: CONSOLE_PREFLIGHT_STRING_5174 }]} />
            <Term title="our server terminal (checkpoint 13: cors first, logger second)" size={15} lines={[{ c: "ok", t: "Galley open at http://localhost:3000" }, { c: "dim", t: "# ...nothing. Not one line." }]} />
            <Ask n="1">The browser says it asked first. So why is our log empty?</Ask>
            <Reveal label="Reveal">
              <div className="parch" style={{ fontSize: 17 }}>cors answered the OPTIONS question by itself and never called next(), so the logger below it never ran. And the real POST was never sent.</div>
            </Reveal>
          </div>
          <div className="col" style={{ gap: 10 }}>
            <div className="panel">
              <h3 className="green">Simple: sent right away</h3>
              <div style={{ fontSize: 17 }}>GET, HEAD, or POST with no custom headers and a plain Content-Type (none, text/plain, form data).</div>
            </div>
            <div className="panel">
              <h3 className="red">Preflighted: asks first (OPTIONS)</h3>
              <div style={{ fontSize: 17 }}>Content-Type: application/json, and every PUT, PATCH, DELETE.</div>
            </div>
            <Ask n="2">Why ask first for a JSON POST, but not for a plain GET?</Ask>
            <Reveal label="Reveal">
              <div className="parch" style={{ fontSize: 17 }}>A JSON POST, PUT, PATCH or DELETE can change data, and old servers never expected those from other sites. So the browser asks first and only sends the real request if the answer allows it. <b>Failed preflight: your route never ran.</b></div>
            </Reveal>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "live-14",
    notes: "Add CORS_ORIGINS to .env and .env.example, add list() to config, change cors to config.corsOrigins, and MOVE THE LOGGER TO THE TOP. Why first? That was the empty-log mystery: cors answers preflight OPTIONS by itself and never calls next(), so a logger below it never sees them. PREDICT: from the 5174 page, POST a recipe. What does our terminal print now? Then from the 5173 page. Reveal, then do both for real (npm run dev and npm run stranger in harbor-client).",
    render: () => (
      <Slide kicker={K("Live code, checkpoint 14")} q="What will the terminal print for a blocked POST?" sm>
        <Split cols="minmax(0,0.95fr) minmax(0,1.1fr)">
          <div className="col" style={{ gap: 10 }}>
            <Code lang="env" code={`# .env (and .env.example)\nCORS_ORIGINS=http://localhost:5173`} title=".env" size={15} />
            <Code code={LIST_14} title="config/env.js" size={13.5} />
          </div>
          <div className="col" style={{ gap: 10 }}>
            <Code code={APP_14} title="app.js: new order" size={12.5} hl={[2, 5]} />
            <Reveal label="Predict, then reveal">
              <div className="col" style={{ gap: 8 }}>
                <Term title="page on :5174 (not on the list), POST with JSON" size={14} lines={["OPTIONS /api/recipes -> 204 (2ms)", { c: "dim", t: "# only the preflight. The POST was never sent." }]} />
                <Term title="page on :5173 (on the list), POST with JSON" size={14} lines={["OPTIONS /api/recipes -> 204 (1ms)", "POST /api/recipes -> 201 (24ms)"]} />
              </div>
            </Reveal>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "after-routes",
    notes: "Call It. Answer A: blocked, even for the ALLOWED origin 5173. We tested this in real Chrome: the GET reached the route and the server logged 200, but the answer left without the header. The JSON POST's preflight was answered by Express itself (OPTIONS -> 200) with no CORS headers, so the POST never went out.",
    render: () => (
      <Slide kicker={K("Call It!")} q={<>Placed <span style={mono}>cors()</span> after the routes: blocked or not?</>} sm>
        <Split cols="minmax(0,1.15fr) minmax(0,1fr)" style={{ flex: "none", marginBottom: 12 }}>
          <Code code={`app.use(logger);\napp.use(express.json());\napp.use("/api/recipes", recipesRouter);\napp.use(cors({ origin: config.corsOrigins })); // moved here\napp.use(notFound);`} size={15} bad={[4]} />
          <Reveal label="After the vote: show the real server log">
            <Term title="server terminal (real), page on the allowed :5173" size={15} lines={["GET /api/recipes -> 200 (82ms)", "OPTIONS /api/recipes -> 200 (7ms)", { c: "dim", t: "# GET reached the route. The POST never came:" }, { c: "dim", t: "# Express answered OPTIONS itself, no CORS headers." }]} />
          </Reveal>
        </Split>
        <CallIt cols={4} size={17} options={["Blocked, even from 5173", "Works fine", "The server crashes", "Only POST is blocked"]} answer={0}
          why={<div>The route answers first, so the response leaves without the header. Real Chrome, page on the allowed 5173:<div className="mono" style={{ marginTop: 6, fontSize: 14, color: "var(--red-deep)" }}>{CONSOLE_NO_HEADER_5173}</div></div>} />
      </Slide>
    ),
  },
  {
    id: "slash",
    notes: "DELIBERATE MISTAKE. Put the slash in your .env, restart, click GET from the 5173 page. Blocked. Crews hunt for the bug (press T, 60 s). The browser's Origin header is http://localhost:5173, never with a slash, and cors compares the strings exactly, so no header is sent. Fix: remove the slash, restart. Gold tier asks them to make config reject it.",
    render: () => (
      <Slide kicker={K("Spot the bug")} q="This page is on 5173. Why is it still blocked?" sm>
        <Split cols="minmax(0,1fr) minmax(0,1fr)">
          <div className="col" style={{ gap: 12 }}>
            <Code lang="env" code={`# .env\nSUPABASE_URL=https://abcdefghijklmnop.supabase.co\nSUPABASE_SECRET_KEY=sb_secret_...\nPORT=3000\nCORS_ORIGINS=http://localhost:5173/`} title=".env" size={15} hl={[5]} />
            <Term title="Chrome console, page on :5173" size={13} lines={[{ c: "err", t: CONSOLE_NO_HEADER_5173 }]} />
          </div>
          <div className="col" style={{ gap: 12 }}>
            <Ask n="?">The page IS on 5173. What is different?</Ask>
            <Reveal label="Reveal the bug">
              <div className="parch" style={{ fontSize: 18 }}>The trailing slash. The browser sends <span className="mono">Origin: http://localhost:5173</span>, never with a slash. cors compares the text exactly, finds no match, and sends no header. An origin is scheme + host + port. Nothing after it.</div>
            </Reveal>
            <QuickBounty label="+1M for the crew that spotted it" />
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "protect",
    notes: "Call It. Answer B. This is the most common misunderstanding about CORS. Anyone can still call your API with curl, Thunder Client, a script, or their own server. CORS only decides what JavaScript running in someone's BROWSER may read. Real protection is authentication, coming on Thursday Nov 12 with Supabase Auth.",
    render: () => (
      <Slide kicker={K("Call It!")} q="Does CORS protect your database from strangers?" sm>
        <CallIt cols={2} options={["Yes: strangers get blocked", "No: curl and Thunder Client ignore it", "Only for DELETE requests", "Only after you deploy"]} answer={1}
          why="CORS is a rule browsers follow about what a page's JavaScript may READ. curl, Thunder Client, scripts and other servers never check the header. Locking the door is a different job: authentication (Supabase Auth, Thursday Nov 12)." />
      </Slide>
    ),
  },
  {
    id: "horizon",
    notes: "Plant Thursday. Ask all three, take answers, do not resolve them. Question 1: the API will live at a vercel.app address and your React app somewhere else, so the list must change (that is why it lives in an env var). Question 2: you will type them into Vercel. Question 3: nobody calls listen. Hold it.",
    render: () => (
      <Slide kicker={K("Thursday preview")} q="Thursday your API moves to the internet. What breaks?" sm>
        <Split cols="minmax(0,1.1fr) minmax(0,1fr)">
          <div className="col" style={{ gap: 12 }}>
            <Ask n="1">The guest list says http://localhost:5173. Where will your pages live on Thursday?</Ask>
            <Ask n="2">The computer you deploy to has no .env file. Where do the secrets go?</Ask>
            <Ask n="3">Who calls listen() on a computer you do not own?</Ask>
          </div>
          <Cap id="t-26-horizon" hint="the ship looking out at the open sea" style={{ height: 360 }} />
        </Split>
      </Slide>
    ),
  },

  /* ---------- E. Build 1:45-2:05, Close 2:05-2:15 ---------- */
  {
    id: "tiers",
    notes: "1:45. Build time, 20 minutes. Bronze and Silver are on the Recipe Box API from today. Gold moves the same crew structure into Project 4. Walk the room with the field guide. Common snags: missing .js in imports, forgetting to restart after editing .env, trailing slash in CORS_ORIGINS, logger still below cors.",
    render: () => (
      <Slide kicker={K("Build")} q={<>Mission <span style={{ fontFamily: "var(--body)", fontWeight: 900 }}>11</span>: Assemble the Crew</>} sm>
        <Tiers size={16} tiers={[
          { name: "Bronze", items: ["config/env.js is the only file that reads process.env (SUPABASE_URL, SUPABASE_SECRET_KEY, PORT, CORS_ORIGINS).", "A missing variable stops the server at startup with its name.", "app.js builds and exports the app; server.js is the only file that calls listen().", "Every request in requests.http still works."] },
          { name: "Silver", items: ["services/recipes.js holds every Supabase call; routes never import supabase (paste the empty grep result in your README).", "cors reads CORS_ORIGINS and the logger runs first.", "harbor-client works from 5173 but is blocked from 5174 (npm run stranger). README: the log lines for a blocked GET and a blocked POST, and the difference in two sentences."] },
          { name: "Gold", items: ["Give your Project 4 API the same crew: config, services, routes, app.js and server.js.", "config/env.js rejects an origin ending in \"/\" and a PORT that is not a number, each with a clear message."] },
          { name: "Bonus", items: ["Track B: all of it in TypeScript (typed promises like Promise<Recipe[]>).", "Or: a node:test file that imports app.js, starts it on port 0, checks GET / returns 200, and one sentence on why app.js not listening makes it possible."] },
        ]} />
      </Slide>
    ),
  },
  {
    id: "close",
    notes: "2:05. No exit ticket. Partners take turns: one explains prompt 1 to the other in under a minute, swap for prompt 2, then 3. Walk around and listen; pick one pair per prompt to say it to the room (+1M). Open the bounty board (B), crown the leading crew, remind them it carries over. Thursday prep: make a Vercel account with Sign up with GitHub, know your GitHub username, Node 22.18 or newer.",
    render: () => (
      <Slide kicker={K("Close")} q="Can you explain it to your partner?" sm>
        <Split cols="minmax(0,1.15fr) minmax(0,1fr)">
          <div className="col" style={{ gap: 10 }}>
            <Ask n="1">A page was blocked by CORS. Who blocked it, and how do you know if the request reached the server?</Ask>
            <Ask n="2">Why does only one file in our project talk to Supabase?</Ask>
            <Ask n="3">What does app.js do that server.js does not, and why split them?</Ask>
            <div className="panel" style={{ fontSize: 17 }}><b className="gold">Before Thursday:</b> create a Vercel account with <b>Sign up with GitHub</b>, know your GitHub username, and check <span className="mono">node -v</span> is 22.18 or newer.</div>
          </div>
          <Cap id="t-28-feast" hint="a celebration feast after a win" style={{ height: 380 }} />
        </Split>
      </Slide>
    ),
  },
];

export default function Deck() {
  return <DeckShell slides={slides} label="CSC 436 | Week 11 Tue | Mission 11: Assemble the Crew" />;
}
