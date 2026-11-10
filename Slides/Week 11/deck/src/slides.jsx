import { S, Cols, Reveal, Ask, Predict, Check, Callout, Steps, Code, Term, Shot, JsonTab, Node, Arrow, Table, K, Pill, partColor } from "./kit.jsx";

const API_URL = "https://recipe-api-yourname.vercel.app";
const WEB_URL = "https://recipe-web-yourname.vercel.app";

const HEALTH_LOCAL = `{
  "status": "ok",
  "runningOn": "your laptop",
  "database": "sample data (no Supabase keys found)",
  "corsOrigins": ["http://localhost:5173"],
  "time": "2026-11-10T17:31:04.118Z"
}`;

const HEALTH_FIRST = `{
  "status": "ok",
  "runningOn": "vercel",
  "database": "sample data (no Supabase keys found)",
  "corsOrigins": ["http://localhost:5173"],
  "time": "2026-11-10T17:52:40.903Z"
}`;

const HEALTH_AFTER = `{
  "status": "ok",
  "runningOn": "vercel",
  "database": "supabase",
  "corsOrigins": ["http://localhost:5173"],
  "time": "2026-11-10T18:01:12.477Z"
}`;

const HEALTH_FINAL = `{
  "status": "ok",
  "runningOn": "vercel",
  "database": "supabase",
  "corsOrigins": [
    "http://localhost:5173",
    "https://recipe-web-yourname.vercel.app"
  ],
  "time": "2026-11-10T18:44:55.210Z"
}`;

const APP_HEALTH = `app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    runningOn: req.app.locals.startedBy === "server.js"
      ? "your laptop" : "vercel",
    database: config.useSupabase
      ? "supabase" : "sample data (no Supabase keys found)",
    corsOrigins: config.corsOrigins,
    time: new Date().toISOString(),
  });
});`;

const SERVER_JS = `// Starts the API on your laptop. Vercel never runs it.
import app from "./app.js";
import { config } from "./config/env.js";

// Leave a note for /api/health to find.
app.locals.startedBy = "server.js";

app.listen(config.port, (error) => {
  // (busy port? print the error and stop)
  console.log(\`Galley open at http://localhost:\${config.port}\`);
});`;

const API_JS = `const raw = import.meta.env.VITE_API_URL;
export const API_URL = raw ? raw.trim().replace(/\\/+$/, "") : null;

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(\`\${API_URL}\${path}\`, options);
  } catch {
    // The server is off, the address is wrong, or CORS blocked it.
    const error = new Error("Could not reach the API");
    error.kind = "unreachable";
    throw error;
  }
  // ... read the JSON, throw if the status is not ok
}

export const getRecipes = () => request("/api/recipes");`;

const CORS_LINE = `Access to fetch at 'https://recipe-api-yourname.vercel.app/api/recipes'
from origin 'https://recipe-web-yourname.vercel.app' has been blocked by
CORS policy: No 'Access-Control-Allow-Origin' header is present on the
requested resource.`;

function TwoUrls() {
  return (
    <div className="flow" style={{ marginTop: 10 }}>
      <Node title="Your browser" sub="anyone" color="var(--slate)" w={160} />
      <Arrow label="loads" />
      <Node title="recipe-web" sub="React (Vite)" tag="URL #2" color="var(--indigo)" w={300}>
        <div className="muted" style={{ marginTop: 6, fontFamily: "var(--mono)", fontSize: 14 }}>recipe-web-yourname.vercel.app</div>
      </Node>
      <Arrow label="fetch()" />
      <Node title="recipe-api" sub="Express" tag="URL #1" color="var(--teal)" w={300}>
        <div className="muted" style={{ marginTop: 6, fontFamily: "var(--mono)", fontSize: 14 }}>recipe-api-yourname.vercel.app</div>
      </Node>
      <Arrow label="secret key" />
      <Node title="Supabase" sub="your table" color="var(--green)" w={150} />
    </div>
  );
}

export const slides = [
  /* ============================== INTRO ============================== */
  {
    id: "title",
    part: "intro",
    title: "Going Live",
    notes: `
TIME: 12:20. Have this up as people walk in. Starter zip already posted on Brightspace.
SAY: Thursday I was out sick, so today we do Thursday's lesson and today's lesson together. We are going slowly on purpose. Nobody moves on until everyone has the checkmark.
SAY: You will not write new code today. The code is preset. Today is about getting code off your laptop and onto the internet, and making two programs talk.
DO: While people settle, ask them to log in to Brightspace and download the starter zip.`,
    render: () => (
      <div className="slide title-slide">
        <div className="kicker">CSC 436 &middot; Tuesday, November 10</div>
        <h1>Going Live</h1>
        <div className="lede">Deploy the API, then connect the React site to it. Thursday's lesson and today's lesson, one step at a time.</div>
        <div className="meta">Starter code: Brightspace, "going-live-starter.zip"</div>
      </div>
    ),
  },
  {
    id: "plan",
    part: "intro",
    title: "Today's plan",
    notes: `
TIME: 12:22
SAY: Here is the whole day. Setup first, so everyone has the same thing running. Then the API goes live. Then the React site goes live and talks to it. The last part is about your Project 4.
SAY: The rule for today: if you are stuck, raise your hand right away. Don't sit on it for ten minutes. A stuck step is my problem to fix, not yours.
WATCH: Students who arrive late. Point them at slide 6 (get the starter) and keep going. The guide on Brightspace has every step.`,
    render: () => (
      <S kicker="Today" title="The plan">
        <Cols split="1fr 1fr" gap={40}>
          <div className="stack">
            <div className="card"><h3>Setup <span className="muted small">about 20 min</span></h3><div className="small">Everyone runs the starter on their own laptop.</div></div>
            <div className="card" style={{ borderLeft: "8px solid var(--teal)" }}><h3>Part 1: The API goes live <span className="muted small">35 min</span></h3><div className="small">Deploy recipe-api to Vercel. Give it its settings.</div></div>
            <div className="card" style={{ borderLeft: "8px solid var(--indigo)" }}><h3>Part 2: React talks to the API <span className="muted small">35 min</span></h3><div className="small">Deploy recipe-web. Connect the two. Fix CORS.</div></div>
            <div className="card" style={{ borderLeft: "8px solid var(--amber)" }}><h3>Part 3: Your Project 4 <span className="muted small">15 min</span></h3><div className="small">The same steps, on your own project.</div></div>
          </div>
          <div className="stack">
            <Callout kind="info" title="How today works">
              <div className="small">No new code. Every step is a command or a setting.</div>
              <div className="small mt">After each step there is a <b>checkpoint</b>. We wait until everyone has it.</div>
            </Callout>
            <Callout kind="warn" title="Stuck?">
              <div className="small">Raise your hand right away. The red error boxes in the app tell you what to do, so read them out loud.</div>
            </Callout>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "finish",
    part: "intro",
    title: "The finish line",
    steps: 1,
    notes: `
TIME: 12:24
SAY: By the end of class you will have two real addresses on the internet. You can text them to anyone. URL number 1 is the API. URL number 2 is the React site.
ASK: Look at the arrows. Which box is the only one that holds the Supabase secret key? (recipe-api. The browser never sees it.)
SAY: This is the architecture we drew last Tuesday, except today it's real.`,
    render: () => (
      <S kicker="Today" title="By 2:15 you will have two live URLs">
        <TwoUrls />
        <div className="mt2">
          <Ask>Follow the arrows. Which box is the <b>only</b> one that ever holds the Supabase secret key?</Ask>
          <div className="mt">
            <Reveal at={1}>
              <Callout kind="good"><b>recipe-api.</b> The browser and the React code never see it. That is why the API exists.</Callout>
            </Reveal>
          </div>
        </div>
      </S>
    ),
  },
  {
    id: "words",
    part: "intro",
    title: "Three words we will use all day",
    notes: `
TIME: 12:26
SAY: Three words. If you understand these, today makes sense.
SAY: Deploy. Copy your code to a computer that is always on and has a public address. Your laptop goes to sleep. Vercel's computers don't.
SAY: Environment variable. A setting that lives outside your code. Same code, different settings on your laptop and on Vercel. You already have one: the Supabase key in .env.
SAY: Origin. The front part of a web address: scheme, host, and port. CORS works with origins.
ASK: What is the origin of http://localhost:5173/recipes?id=3 ? (http://localhost:5173)`,
    render: () => (
      <S kicker="Today" title="Three words we will use all day">
        <Cols split="1fr 1fr 1fr" gap={22}>
          <div className="card" style={{ borderTop: "8px solid var(--teal)" }}>
            <h3>Deploy</h3>
            <p className="small">Copy your code to a computer that is <b>always on</b> and has a <b>public address</b>.</p>
            <p className="small muted">Your laptop sleeps. Vercel's computers don't.</p>
          </div>
          <div className="card" style={{ borderTop: "8px solid var(--indigo)" }}>
            <h3>Environment variable</h3>
            <p className="small">A <b>setting that lives outside your code</b>.</p>
            <p className="small muted">Same code, different settings on your laptop and on Vercel.</p>
          </div>
          <div className="card" style={{ borderTop: "8px solid var(--amber)" }}>
            <h3>Origin</h3>
            <p className="small">The front of a web address: <b>scheme + host + port</b>.</p>
            <p className="small" style={{ fontFamily: "var(--mono)", fontSize: 17 }}><b style={{ color: "var(--amber)" }}>http://localhost:5173</b><span className="muted">/recipes?id=3</span></p>
          </div>
        </Cols>
        <Callout kind="info" title="An origin never ends with a slash">
          <span className="small"><K>https://recipe-web-yourname.vercel.app</K> is an origin. <K>https://recipe-web-yourname.vercel.app/</K> is not.</span>
        </Callout>
      </S>
    ),
  },

  /* ============================== SETUP ============================== */
  {
    id: "sec-setup",
    part: "setup",
    title: "Section: Setup",
    notes: `
TIME: 12:28
SAY: First, everyone gets the same thing running on their own laptop. If it doesn't work on your laptop, it won't work on Vercel.`,
    render: () => (
      <div className="slide section-slide">
        <div className="sec-num" style={{ color: partColor("setup") }}>Setup</div>
        <h1>Everyone running locally</h1>
        <div className="lede">Same starter, same versions, same output on every screen.</div>
      </div>
    ),
  },
  {
    id: "get-starter",
    part: "setup",
    title: "Get the starter",
    notes: `
TIME: 12:29
DO: Show Brightspace on the projector. Download, unzip, open the WHOLE going-live-starter folder in VS Code.
SAY: Two folders, two separate projects. recipe-api is the Recipe Box API you already know, with Tuesday's app.js and server.js split. recipe-web is a small React site that is already wired to it.
WATCH: Windows students opening the zip without extracting it first. VS Code then shows files but npm install fails. Right click, Extract All.
WATCH: Codespaces students: drag the zip into the Explorer panel, then in the terminal run: unzip going-live-starter.zip
CHECK: Everyone sees both folders in VS Code's sidebar.`,
    render: () => (
      <S kicker="Setup 1 of 5" title="Get the starter">
        <Cols split="1fr 1.05fr" gap={36}>
          <div>
            <Steps items={[
              <>Brightspace: download <b>going-live-starter.zip</b></>,
              <>Unzip it <span className="muted small">(Windows: right click, Extract All)</span></>,
              <>VS Code: <b>File, Open Folder</b>, pick <K>going-live-starter</K></>,
            ]} />
            <div className="mt2">
              <Check>You see two folders in the sidebar: <b>recipe-api</b> and <b>recipe-web</b>.</Check>
            </div>
          </div>
          <Code lang="text" numbers={false} title="going-live-starter/" size={18}>{`
recipe-api/        the backend (Express)
  app.js           builds the API
  server.js        starts it on your laptop
  config/env.js    reads the settings
  routes/ services/ middleware/
  .env.example
  .vercelignore

recipe-web/        the frontend (React)
  src/api.js       knows where the API is
  src/App.jsx
  .env.development
`}</Code>
        </Cols>
      </S>
    ),
  },
  {
    id: "run-api",
    part: "setup",
    title: "Install and run the API",
    notes: `
TIME: 12:32
DO: Open a terminal in VS Code (Terminal, New Terminal). Type along with them, slowly. Read each line of output out loud.
SAY: cd means change directory. We go INTO the recipe-api folder first, because npm install reads the package.json in the folder you are standing in.
SAY: ".env not found. Continuing without it." is fine. No .env means the API uses 8 sample recipes. Supabase comes in a minute and it's optional.
WATCH: "npm: command not found" means Node is not installed. Pair them with a neighbor's screen for now and get Node installed after class.
WATCH: "node: bad option: --env-file-if-exists" means Node is older than 22. Check with node -v.
WATCH: "Could not start on port 3000: EADDRINUSE" means something else is already on port 3000, usually an old Recipe Box server in another terminal. Ctrl + C it.
CHECK: Everyone sees "Galley open at http://localhost:3000".`,
    render: () => (
      <S kicker="Setup 2 of 5" title="Install and run the API">
        <Cols split="1.25fr 1fr" gap={30}>
          <Term title="Terminal 1: recipe-api" size={20}>{`
$ cd recipe-api
$ npm install
added 76 packages, and audited 77 packages in 1s
found 0 vulnerabilities
$ npm run dev
> recipe-api@1.0.0 dev
> node --env-file-if-exists=.env server.js

.env not found. Continuing without it.
! Galley open at http://localhost:3000
Database: sample data (no Supabase keys found)
CORS allows: http://localhost:5173
`}</Term>
          <div className="stack">
            <Callout kind="info" title=".env not found? That's fine.">
              <span className="small">With no Supabase keys, the API uses <b>8 sample recipes</b>. Everyone can follow along either way.</span>
            </Callout>
            <Callout kind="warn" title="Leave it running">
              <span className="small">This terminal is now busy being a server. Don't close it.</span>
            </Callout>
            <Check>You see <b>Galley open at http://localhost:3000</b></Check>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "health-local",
    part: "setup",
    title: "Open the health check",
    steps: 1,
    notes: `
TIME: 12:35
DO: Open http://localhost:3000/api/health in the browser on the projector. Tick "Pretty-print" if Chrome offers it.
SAY: This is a route I added for today: /api/health. It reports the API's settings, never its secrets. After every deploy today, this is the FIRST thing we open.
ASK: Read it out loud with me. Where is it running? What database? Who is allowed to call it from a browser?
ASK: Why does it say sample data? (No .env file, so no Supabase keys.)
CHECK: Everyone has this JSON in a tab.`,
    render: () => (
      <S kicker="Setup 3 of 5" title="Open the health check">
        <Cols split="1.35fr 1fr" gap={30}>
          <JsonTab url="http://localhost:3000/api/health" json={HEALTH_LOCAL} size={20} />
          <div className="stack">
            <Ask>Read each line. Why does <K>database</K> say <b>sample data</b>?</Ask>
            <Reveal at={1}>
              <Callout kind="good">There is no <K>.env</K> file, so the API has no Supabase keys. It falls back to the built-in recipes.</Callout>
            </Reveal>
            <Check>This JSON is open in a browser tab.</Check>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "supabase-optional",
    part: "setup",
    title: "Optional: your own Supabase data",
    notes: `
TIME: 12:37 (3 minutes max, then move on)
SAY: If you set up Supabase in Week 10, you can plug in the same keys now. Copy .env.example, name the copy .env, paste the two values from your Week 10 .env, then restart the server.
SAY: If you never set up Supabase, skip this. Sample data works for every step today.
WATCH: Students pasting quotes or spaces around the value. KEY=value, nothing else.
WATCH: "SUPABASE_URL is set but SUPABASE_SECRET_KEY is missing" means only one of the two was filled in.
WATCH: The health check says supabase but /api/recipes gives a 500? Their table is missing or the grant line was skipped in Week 10. They can delete .env and use sample data today, and fix Supabase in office hours.
CHECK: Health says "supabase" (or they chose sample data, which is fine).`,
    render: () => (
      <S kicker="Setup 4 of 5 (optional)" title="Use your own Supabase data">
        <Cols split="1fr 1fr" gap={34}>
          <div>
            <Steps items={[
              <>In <K>recipe-api</K>, copy <K>.env.example</K> and name the copy <K>.env</K></>,
              <>Paste the two values from your Week 10 <K>.env</K></>,
              <>Restart: <K>Ctrl + C</K>, then <K>npm run dev</K></>,
              <>Refresh <K>/api/health</K></>,
            ]} />
            <div className="mt">
              <Callout kind="info" title="No Supabase? Skip this slide.">
                <span className="small">Sample data works for every step today.</span>
              </Callout>
            </div>
          </div>
          <div className="stack">
            <Code lang="env" numbers={false} title="recipe-api/.env" size={18}>{`
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
CORS_ORIGINS=http://localhost:5173
PORT=3000
`}</Code>
            <Check>Health now says <K>"database": "supabase"</K></Check>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "tour-api",
    part: "setup",
    title: "Tour: app.js and server.js",
    steps: 2,
    notes: `
TIME: 12:40
SAY: Quick tour, and it's mostly a callback to Tuesday. app.js BUILDS the API and exports it. server.js STARTS it by calling listen(). That split is the reason today's deploy needs no code changes.
SAY: Look at line 6 of server.js. Before listening, server.js leaves a note on the app: startedBy = "server.js". The health route checks for that note.
ASK: On Vercel, server.js never runs. So what will runningOn say there? Reveal 1.
ASK: Why is it safe to show corsOrigins in public, but not the Supabase key? Reveal 2. (CORS origins are website addresses, already public. The key is a password.)`,
    render: () => (
      <S kicker="Setup 5 of 5" title="Tour: who builds, who starts">
        <Cols split="1.25fr 1fr" gap={22}>
          <Code title="recipe-api/app.js (the new health route)" size={15} hl={[4, 5]}>{APP_HEALTH}</Code>
          <Code title="recipe-api/server.js (part)" size={15} hl={[6]}>{SERVER_JS}</Code>
        </Cols>
        <Cols split="1fr 1fr" gap={22}>
          <div className="stack mt">
            <Ask n={1}>On Vercel, what will <K>runningOn</K> say?</Ask>
            <Reveal at={1}><Callout kind="good"><span className="small"><b>"vercel"</b>: no note, so nobody ran server.js.</span></Callout></Reveal>
          </div>
          <div className="stack mt">
            <Ask n={2}>Showing <K>corsOrigins</K> is OK. Why not the key?</Ask>
            <Reveal at={2}><Callout kind="good"><span className="small">Origins are public addresses. The key is a password.</span></Callout></Reveal>
          </div>
        </Cols>
      </S>
    ),
  },

  /* ============================== PART 1: API ============================== */
  {
    id: "sec-api",
    part: "api",
    title: "Section: The API goes live",
    notes: `
TIME: 12:45
SAY: Part 1. Your API goes from localhost to a real address on the internet.`,
    render: () => (
      <div className="slide section-slide">
        <div className="sec-num" style={{ color: partColor("api") }}>Part 1</div>
        <h1>The API goes live</h1>
        <div className="lede">From <K>http://localhost:3000</K> to a real address anyone can open.</div>
      </div>
    ),
  },
  {
    id: "laptop-vs-vercel",
    part: "api",
    title: "Laptop vs Vercel",
    steps: 2,
    notes: `
TIME: 12:46
SAY: On your laptop, server.js calls listen() and the server sits there all day, waiting. On Vercel, there is no listen(). Vercel imports app.js and hands it each request as it arrives. Your Express app becomes a Vercel Function.
ASK: If nothing is running between requests, what happens to recipes saved in a plain array? Reveal 1. (They can disappear when Vercel starts a fresh copy. That's why real data lives in Supabase.)
ASK: How does Vercel know which file to use? Reveal 2. It looks for app.js (or index.js or server.js) that imports express and does export default app.`,
    render: () => (
      <S kicker="Part 1" title="Your laptop vs Vercel">
        <Cols split="1fr 1fr" gap={28}>
          <div className="card" style={{ borderTop: "8px solid var(--slate)" }}>
            <h3>On your laptop</h3>
            <Steps items={[<><K>npm run dev</K> runs server.js</>, <>server.js calls <K>listen(3000)</K></>, <>The server waits, all day, until Ctrl + C</>]} />
          </div>
          <div className="card" style={{ borderTop: "8px solid var(--teal)" }}>
            <h3>On Vercel</h3>
            <Steps items={[<>Vercel finds <K>app.js</K> with <K>export default app</K></>, <>A request arrives, Vercel hands it to <K>app</K></>, <>server.js <b>never runs</b></>]} />
          </div>
        </Cols>
        <div className="mt stack">
          <Cols split="1fr 1fr" gap={28}>
            <div className="stack">
              <Ask n={1}>If nothing waits between requests, what happens to recipes saved in a plain JavaScript array?</Ask>
              <Reveal at={1}><Callout kind="good" ><span className="small">They can vanish when Vercel starts a fresh copy. Real data lives in Supabase.</span></Callout></Reveal>
            </div>
            <div className="stack">
              <Ask n={2}>How does Vercel know which file is the app?</Ask>
              <Reveal at={2}><Callout kind="good"><span className="small">It looks for <K>app.js</K> (or index.js, server.js) that imports express and has <K>export default app</K>.</span></Callout></Reveal>
            </div>
          </Cols>
        </div>
      </S>
    ),
  },
  {
    id: "login",
    part: "api",
    title: "Step 1: Log in to Vercel",
    notes: `
TIME: 12:49
DO: Open a SECOND terminal (the + button). Terminal 1 stays the running server.
SAY: npx runs a tool without installing it for good. The first time, it downloads the Vercel CLI, which is big, so give it a minute.
SAY: vercel login opens your browser. Sign in (Continue with GitHub is easiest), check the code matches, and approve. Then come back to the terminal.
WATCH: No Vercel account yet: vercel.com/signup, choose the free Hobby plan, Continue with GitHub.
WATCH: The browser didn't open (Codespaces does this). Copy the link the terminal prints into your browser by hand.
WATCH: "Need to install the following packages: vercel. Ok to proceed? (y)" Press y, then Enter.
CHECK: npx vercel whoami prints their username.`,
    render: () => (
      <S kicker="Part 1 &middot; Step 1" title="Log in to Vercel (once per computer)">
        <Cols split="1.2fr 1fr" gap={30}>
          <Term title="Terminal 2 (new terminal, any folder)" size={20}>{`
$ npx vercel login
# The first run downloads the Vercel CLI. Give it a minute.
# Your browser opens. Sign in, confirm the code, approve.
# Then come back here.
$ npx vercel whoami
! your-username
`}</Term>
          <div className="stack">
            <Callout kind="info" title="Why a second terminal?">
              <span className="small">Terminal 1 is busy running the API. Keep it.</span>
            </Callout>
            <Callout kind="warn" title="No Vercel account?">
              <span className="small"><K>vercel.com/signup</K>, Hobby (free), <b>Continue with GitHub</b>.</span>
            </Callout>
            <Callout kind="warn" title="Browser didn't open?">
              <span className="small">Copy the link from the terminal into your browser.</span>
            </Callout>
            <Check><K>npx vercel whoami</K> prints your username.</Check>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "secrets-home",
    part: "api",
    title: "Step 2: Secrets stay home",
    steps: 1,
    notes: `
TIME: 12:54
SAY: Before we upload anything, look at two files that are already in the starter.
SAY: .gitignore tells GIT what never to save. But the Vercel CLI does not read .gitignore. It uploads every file in the folder unless .vercelignore says otherwise. That's why the starter has a .vercelignore with .env in it.
ASK: If .env did get uploaded, what's the problem? (Your secret key now sits on someone else's computer, outside the place built to hold secrets. Secrets go in Vercel's Environment Variables page, where they are encrypted.)
SAY: node_modules is never uploaded either. Vercel runs npm install itself.`,
    render: () => (
      <S kicker="Part 1 &middot; Step 2" title="Secrets stay home (already set up for you)">
        <Cols split="1fr 1fr" gap={28}>
          <div className="stack">
            <Code lang="bash" numbers={false} title="recipe-api/.gitignore  (read by git)" size={19}>{`
node_modules
.env
.vercel
`}</Code>
            <Code lang="bash" numbers={false} title="recipe-api/.vercelignore  (read by the Vercel CLI)" size={19}>{`
# The Vercel CLI does NOT read .gitignore.
.env
`}</Code>
          </div>
          <div className="stack">
            <Callout kind="warn" title="Two different files for two different tools">
              <span className="small">git reads <K>.gitignore</K>. <K>npx vercel</K> reads <K>.vercelignore</K>. Your <K>.env</K> must be in <b>both</b>.</span>
            </Callout>
            <Ask>If <K>.env</K> did get uploaded, what's the problem?</Ask>
            <Reveal at={1}>
              <Callout kind="good"><span className="small">Your secret key would be sitting in an uploaded file. Secrets belong in Vercel's <b>Environment Variables</b> page, which is encrypted and built for this.</span></Callout>
            </Reveal>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "deploy-api",
    part: "api",
    title: "Step 3: Deploy the API",
    notes: `
TIME: 12:57
DO: In terminal 2: cd into recipe-api (from the starter folder). Type the command slowly.
SAY: --prod means production: the real, public address. --yes means "use the defaults for every setup question." It names the project after the folder: recipe-api.
SAY: Vercel uploads the folder, runs npm install, sees Express, and turns app.js into a function. It takes about a minute.
SAY: At the end it prints your address. If you see two addresses, use the SHORTER one. That's your production domain. Your address won't say yourname. Vercel adds something to make it unique.
WATCH: "Error: The provided path does not exist" or it deploys the wrong thing: they're in the wrong folder. pwd should end in recipe-api.
WATCH: It asks questions anyway (older setups, or more than one team). Enter accepts each default. Project name: recipe-api.
WATCH: Can't find the address? npx vercel open opens the project in the dashboard. The Domains box shows it.
CHECK: Everyone has an address that ends in .vercel.app. Have them paste it somewhere safe (a notes file). They'll need it four more times.`,
    render: () => (
      <S kicker="Part 1 &middot; Step 3" title="Deploy the API">
        <Cols split="1.25fr 1fr" gap={30}>
          <div className="stack">
            <Term title="Terminal 2" size={20}>{`
$ cd recipe-api
$ npx vercel --prod --yes
# uploading, installing, building... about a minute
# The end of the output shows your address.
# If there are two, use the SHORTER one:
! https://recipe-api-yourname.vercel.app
`}</Term>
            <Table size={18} widths={["32%", "68%"]} head={["Part", "Meaning"]} rows={[
              [<K>--prod</K>, "Production: the real, public address"],
              [<K>--yes</K>, "Accept the default for every setup question"],
            ]} />
          </div>
          <div className="stack">
            <Callout kind="info" title="Yours will look different">
              <span className="small">Vercel adds letters to make your address unique. That's fine.</span>
            </Callout>
            <Callout kind="warn" title="Can't find it?">
              <span className="small">Run <K>npx vercel open</K>. Your project opens in the browser. The <b>Domains</b> box shows the address.</span>
            </Callout>
            <Check>You have an address ending in <K>.vercel.app</K>. Paste it into a notes file. You'll need it again.</Check>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "health-vercel-1",
    part: "api",
    title: "Step 4: Health check on Vercel",
    steps: 2,
    notes: `
TIME: 1:03
DO: Open YOUR-ADDRESS/api/health. Have students do it on theirs.
ASK: Predict before you open it. runningOn? database? corsOrigins? Take answers for all three. Reveal 1.
ASK: Why sample data, when some of you have a .env with Supabase keys? Reveal 2. (.vercelignore kept .env home. Vercel has no settings yet.)
WATCH: A Vercel login page instead of JSON: they opened the long per-deployment address, which Vercel protects. Use the short production address.
WATCH: 404 "Nothing at GET /api/healt": typo in the path. A JSON 404 actually proves the API is running.
CHECK: Everyone sees "runningOn": "vercel".`,
    render: () => (
      <S kicker="Part 1 &middot; Step 4" title="Open /api/health on Vercel">
        <Cols split="1fr 1.1fr" gap={30}>
          <div className="stack">
            <Predict>Before you open it: what will <K>runningOn</K>, <K>database</K>, and <K>corsOrigins</K> say?</Predict>
            <Ask>Some of you have Supabase keys in <K>.env</K>. Why doesn't Vercel use them?</Ask>
            <Reveal at={2}><Callout kind="good"><span className="small"><K>.vercelignore</K> kept <K>.env</K> on your laptop. Vercel has <b>no settings yet</b>.</span></Callout></Reveal>
          </div>
          <div className="stack">
            <Reveal at={1}><JsonTab url={`${API_URL}/api/health`} json={HEALTH_FIRST} size={18} /></Reveal>
            <Callout kind="warn" title="See a Vercel login page?">
              <span className="small">You opened the long deployment address. Use the <b>short</b> one.</span>
            </Callout>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "env-vars",
    part: "api",
    title: "Step 5: Give Vercel its settings",
    notes: `
TIME: 1:07
DO: On the projector: vercel.com, click recipe-api, Settings, Environment Variables. Add one variable live, slowly, then let them do the rest.
SAY: This page is Vercel's version of your .env file. Same names, same values.
SAY: Type matters. Config means "readable later," for settings that aren't secret. Secret means "write-only," for passwords and keys. The secret key is a Secret. The rest are Config.
SAY: For CORS_ORIGINS, use http://localhost:5173 for now. We add the React site's address in Part 2.
SAY: No Supabase? Add only CORS_ORIGINS. Everything else still works.
WATCH: Pasting with quotes, or a space after the equals sign. Just the value.
WATCH: A slash at the end of an origin. The starter trims it and logs a warning, but in your own project it would break CORS.
CHECK: The list shows 3 variables (or 1, for the sample-data folks).`,
    render: () => (
      <S kicker="Part 1 &middot; Step 5" title="Give Vercel its settings">
        <Cols split="1fr 1.25fr" gap={28}>
          <div>
            <Steps items={[
              <><K>vercel.com</K>, click <b>recipe-api</b></>,
              <><b>Settings</b>, then <b>Environment Variables</b></>,
              <>Add each variable below. Pick the <b>Type</b>.</>,
              <>Environments: keep <b>Production</b> checked</>,
              <><b>Save</b></>,
            ]} />
          </div>
          <div className="stack">
            <Table size={17} widths={["36%", "40%", "24%"]} head={["Name", "Value", "Type"]} rows={[
              [<K>SUPABASE_URL</K>, "from your .env (optional)", "Config"],
              [<K>SUPABASE_SECRET_KEY</K>, "from your .env (optional)", <b>Secret</b>],
              [<K>CORS_ORIGINS</K>, <K>http://localhost:5173</K>, "Config"],
            ]} />
            <Callout kind="info" title="This page is Vercel's .env file">
              <span className="small">Same names, same values. <b>Secret</b> values can't be read back after you save, which is what you want for keys.</span>
            </Callout>
            <Check>Your list shows the variables. (No Supabase? Just <K>CORS_ORIGINS</K>.)</Check>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "predict-refresh",
    part: "api",
    title: "Predict: refresh the health check",
    steps: 2,
    notes: `
TIME: 1:13
DO: Refresh /api/health on the projector WITHOUT redeploying. It still says sample data.
ASK: Predict first. Does it say supabase now? Hands up for yes. Reveal 1.
ASK: Why not? Reveal 2. Vercel's rule: changing environment variables does not change deployments that already exist. Only new deployments get them.
SAY: Write this one down. It's the number one "but I set it!" problem with deploying, on every platform.`,
    render: () => (
      <S kicker="Part 1" title="Predict: you saved the settings. Refresh /api/health.">
        <Cols split="1fr 1fr" gap={30}>
          <div className="stack">
            <Predict>Does <K>database</K> say <b>supabase</b> now?</Predict>
            <Reveal at={1}><JsonTab url={`${API_URL}/api/health`} json={`{
  "runningOn": "vercel",
  "database": "sample data (no Supabase keys found)",
  ...
}`} size={18} /></Reveal>
          </div>
          <div className="stack">
            <Ask>We saved the variables. Why is it unchanged?</Ask>
            <Reveal at={2}>
              <Callout kind="warn" title="The rule">
                Changing environment variables does <b>not</b> change deployments that already exist. Only a <b>new deployment</b> picks them up.
              </Callout>
              <p className="big mt center"><b>Change a setting? Redeploy.</b></p>
            </Reveal>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "redeploy-api",
    part: "api",
    title: "Step 6: Redeploy the API",
    notes: `
TIME: 1:15
DO: In terminal 2, still in recipe-api, run npx vercel --prod. No --yes needed now: the folder is linked to the project (that's the .vercel folder it created).
SAY: Same command, new deployment, now built with your settings. Refresh the health check.
ASK: What changed? (database: supabase for anyone who added keys. Everyone else still sees sample data, and that's correct.)
SAY: Now open /api/recipes. That's your real data, from Supabase, through Vercel, in a browser. Your backend is live.
CHECK: Checkpoint 1. Every student has a live API whose /api/recipes returns JSON. Do not move on until this is true. Walk the room.
IF BEHIND: Pair anyone stuck with a neighbor who's done, and start Part 2's tour on the projector.`,
    render: () => (
      <S kicker="Part 1 &middot; Step 6" title="Redeploy, then check again">
        <Cols split="1fr 1fr" gap={30}>
          <div className="stack">
            <Term title="Terminal 2 (still in recipe-api)" size={20}>{`
$ npx vercel --prod
# no --yes this time: the folder is already linked
`}</Term>
            <JsonTab url={`${API_URL}/api/health`} json={HEALTH_AFTER} size={17} />
          </div>
          <div className="stack">
            <Callout kind="info" title="Then open your recipes">
              <K>{"/api/recipes"}</K> on your Vercel address. That's your data, live on the internet.
            </Callout>
            <Check title="Checkpoint 1">
              Your API is live. <K>/api/recipes</K> on your <K>.vercel.app</K> address shows recipes.
            </Check>
            <Callout kind="good" title="Sample data folks">
              <span className="small">Still says sample data? Correct. You added no keys.</span>
            </Callout>
          </div>
        </Cols>
      </S>
    ),
  },

  /* ============================== PART 2: WEB ============================== */
  {
    id: "sec-web",
    part: "web",
    title: "Section: React talks to the API",
    notes: `
TIME: 1:19
SAY: Part 2. The API is live, but nobody wants to read JSON. Now the React site goes live and talks to it.`,
    render: () => (
      <div className="slide section-slide">
        <div className="sec-num" style={{ color: partColor("web") }}>Part 2</div>
        <h1>React talks to the API</h1>
        <div className="lede">Same three moves as Part 1: deploy, set an environment variable, redeploy.</div>
      </div>
    ),
  },
  {
    id: "tour-web",
    part: "web",
    title: "Tour: src/api.js",
    steps: 2,
    notes: `
TIME: 1:20
SAY: Only one file in recipe-web knows where the API lives: src/api.js. Every fetch goes through its request helper.
ASK: Line 1. Where does VITE_API_URL come from when you run npm run dev? Reveal 1. (.env.development, which says http://localhost:3000.)
ASK: Line 7 can fail. What does it mean when fetch itself throws, not just returns a 404? Reveal 2. (The browser got no readable answer: server off, wrong address, or CORS.)
SAY: Callback to Week 7: the app uses the Three States Pattern. Loading, error, or ready. The error state is where those red boxes come from.`,
    render: () => (
      <S kicker="Part 2" title="Tour: the one file that knows where the API lives">
        <Cols split="1.25fr 1fr" gap={26}>
          <Code title="recipe-web/src/api.js (part)" size={16} hl={[1, 7]}>{API_JS}</Code>
          <div className="stack">
            <Code lang="env" numbers={false} title="recipe-web/.env.development" size={16}>{`VITE_API_URL=http://localhost:3000`}</Code>
            <Ask n={1}>In <K>npm run dev</K>, where does <K>VITE_API_URL</K> come from?</Ask>
            <Reveal at={1}><Callout kind="good"><span className="small"><K>.env.development</K> (dev mode only).</span></Callout></Reveal>
            <Ask n={2}>What does it mean when <K>fetch()</K> itself throws?</Ask>
            <Reveal at={2}><Callout kind="good"><span className="small">No readable answer: server off, wrong address, or <b>CORS</b>.</span></Callout></Reveal>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "run-web",
    part: "web",
    title: "Step 7: Run the site locally",
    notes: `
TIME: 1:24
DO: Terminal 1 must still be running the API. In terminal 2: cd ../recipe-web, npm install, npm run dev. Open http://localhost:5173.
SAY: Two programs, two terminals, two ports. The site on 5173 calls the API on 3000.
SAY: Look at the top panel. It shows this site's origin and the API address it was given. Those two lines are what today is about.
WATCH: "Port 5173 is already in use": an old Vite server is running in another terminal. Ctrl + C it. (strictPort is on, so it won't sneak onto 5174.)
WATCH: Red box "Could not reach the API" with "Is the API running?": terminal 1 got closed. Start it again.
CHECK: Recipes show up on localhost:5173.`,
    render: () => (
      <S kicker="Part 2 &middot; Step 7" title="Run the site on your laptop">
        <Cols split="1fr 660px" gap={26}>
          <div className="stack">
            <Term title="Terminal 2" size={18}>{`
$ cd ../recipe-web
$ npm install
$ npm run dev
  VITE v7.3.8  ready in 171 ms
! Local:   http://localhost:5173/
`}</Term>
            <Callout kind="info" title="Two programs, two terminals">
              <span className="small">Terminal 1: API on <K>3000</K>. Terminal 2: site on <K>5173</K>.</span>
            </Callout>
            <Check>Recipes show up at <K>http://localhost:5173</K>.</Check>
          </div>
          <Shot src="/shots/local-working.png" url="http://localhost:5173" />
        </Cols>
      </S>
    ),
  },
  {
    id: "env-two-ends",
    part: "web",
    title: "Env vars: backend vs frontend",
    steps: 1,
    notes: `
TIME: 1:28
SAY: Both ends have environment variables, but they behave very differently. This slide is the heart of today's lesson.
SAY: Backend: process.env, read while the server runs, can hold secrets because the code never leaves the server.
SAY: Frontend: import.meta.env.VITE_ something. Vite pastes the value into the JavaScript when it builds. That JavaScript is downloaded by every visitor. So it's public, and changing it means building again.
ASK: Could we put SUPABASE_SECRET_KEY in a VITE_ variable to skip the API? Reveal. (No. It would be in the downloaded JavaScript. Anyone could open DevTools and copy it. Same lesson as Week 7.)`,
    render: () => (
      <S kicker="Part 2" title="Environment variables on both ends">
        <Table size={19} widths={["24%", "38%", "38%"]} head={["", "recipe-api (backend)", "recipe-web (frontend)"]} rows={[
          [<b>Read with</b>, <K>process.env.CORS_ORIGINS</K>, <K>import.meta.env.VITE_API_URL</K>],
          [<b>When</b>, "While the server runs", <>When Vite <b>builds</b> the site</>],
          [<b>Who can see it</b>, "Only the server", <><b>Everyone.</b> It's in the downloaded JavaScript.</>],
          [<b>Secrets OK?</b>, <span style={{ color: "var(--green)", fontWeight: 700 }}>Yes</span>, <span style={{ color: "var(--red)", fontWeight: 700 }}>Never</span>],
          [<b>Changed it on Vercel?</b>, "Redeploy", "Redeploy (so Vite builds again)"],
        ]} />
        <div className="mt stack">
          <Ask>Could we put <K>SUPABASE_SECRET_KEY</K> in a <K>VITE_</K> variable and skip the API?</Ask>
          <Reveal at={1}><Callout kind="bad"><span className="small"><b>No.</b> It would be in the JavaScript every visitor downloads. Anyone can copy it out of DevTools. That's why the API exists (Week 7).</span></Callout></Reveal>
        </div>
      </S>
    ),
  },
  {
    id: "deploy-web",
    part: "web",
    title: "Step 8: Deploy the site",
    steps: 2,
    notes: `
TIME: 1:33
DO: In terminal 2: Ctrl + C to stop Vite (it's fine, we're done with it locally). Still in recipe-web: npx vercel --prod --yes. Vercel sees Vite, runs npm run build, and hosts the dist folder.
SAY: Same command as the API. Vercel figures out it's a Vite site by itself.
ASK: Predict. What will the site show? Take guesses. Reveal 1.
ASK: Why? We had VITE_API_URL in .env.development. Reveal 2. (.env.development is for dev only. vite build runs in production mode, so it never read that file. And the recipe-web project on Vercel has no variables yet.)
SAY: The red box tells you exactly what to do. That's the next step.
CHECK: Everyone has a second address, recipe-web-something.vercel.app, showing the "VITE_API_URL is not set" box. Save that address in the notes file too.`,
    render: () => (
      <S kicker="Part 2 &middot; Step 8" title="Deploy the site">
        <Cols split="1fr 660px" gap={26}>
          <div className="stack">
            <Term title="Terminal 2 (in recipe-web)" size={18}>{`
# Ctrl + C first to stop Vite
$ npx vercel --prod --yes
! https://recipe-web-yourname.vercel.app
`}</Term>
            <Predict>Open your new site. What will it show?</Predict>
            <Ask>Why didn't <K>.env.development</K> count here?</Ask>
            <Reveal at={2}><Callout kind="good"><span className="small">It's only for <K>npm run dev</K>. A build runs in <b>production</b> mode.</span></Callout></Reveal>
          </div>
          <Reveal at={1}><Shot src="/shots/deployed-missing-url.png" url={WEB_URL} /></Reveal>
        </Cols>
      </S>
    ),
  },
  {
    id: "set-vite",
    part: "web",
    title: "Step 9: Set VITE_API_URL, redeploy",
    steps: 1,
    notes: `
TIME: 1:39
DO: vercel.com, click recipe-web this time (NOT recipe-api), Settings, Environment Variables. Add VITE_API_URL = their API address from the notes file. Type Config. Save. Then npx vercel --prod in recipe-web.
SAY: The value is the API's address, not the site's address. No slash at the end, no /api on the end.
ASK: Predict: what will the site show after this redeploy? Reveal. (A different red box: Could not reach the API.)
SAY: Progress! A new error is a good sign. The site now knows where the API is. Something is blocking it. Let's find out what.
WATCH: Added the variable to recipe-api instead of recipe-web. The site still says "VITE_API_URL is not set."
WATCH: Forgot to redeploy: same box as before.
WATCH: Used the site's own address: red box "That address is not the API."`,
    render: () => (
      <S kicker="Part 2 &middot; Step 9" title="Tell the site where the API lives">
        <Cols split="1fr 660px" gap={26}>
          <div className="stack">
            <Steps items={[
              <><K>vercel.com</K>, click <b>recipe-web</b> <span className="small muted">(not recipe-api)</span></>,
              <>Settings, Environment Variables</>,
              <><K>VITE_API_URL</K> = your <b>API</b> address, Type Config</>,
              <>Redeploy: <K>npx vercel --prod</K></>,
            ]} />
            <Code lang="env" numbers={false} size={16} title="the value (no slash, no /api at the end)">{`VITE_API_URL=https://recipe-api-yourname.vercel.app`}</Code>
            <Predict>After the redeploy, what will the site show?</Predict>
          </div>
          <Reveal at={1}><Shot src="/shots/deployed-cors-blocked.png" url={WEB_URL} /></Reveal>
        </Cols>
      </S>
    ),
  },
  {
    id: "read-cors",
    part: "web",
    title: "Read the CORS error together",
    steps: 3,
    notes: `
TIME: 1:45
DO: On your deployed site, open DevTools (F12), Console tab. Read the red line out loud, slowly.
ASK: Who blocked the request: the API, or the browser? Reveal 1. (The browser. The API actually answered. The browser read the answer, saw no permission header for this origin, and hid it from our JavaScript.)
ASK: Which origin is asking? Reveal 2. (Our site: https://recipe-web-....vercel.app.)
ASK: Which side has to change, and what setting? Reveal 3. (The API's guest list: CORS_ORIGINS on recipe-api.)
SAY: Callback to last Tuesday: CORS is the API's guest list. Our guest list says http://localhost:5173 only. Our new site isn't on it.
WATCH: Chrome also shows "GET ... net::ERR_FAILED 200 (OK)". The 200 proves the API answered. The browser just wouldn't hand it over.`,
    render: () => (
      <S kicker="Part 2" title="Read the error out loud (DevTools, Console)">
        <Code lang="text" numbers={false} title="Console (real Chrome wording)" size={19}>{CORS_LINE}</Code>
        <Cols split="1fr 1fr 1fr" gap={18} >
          <div className="stack mt">
            <Ask n={1}>Who blocked it: the API or the browser?</Ask>
            <Reveal at={1}><Callout kind="good"><span className="small"><b>The browser.</b> The API answered, but without permission for this origin, so the browser hid the answer.</span></Callout></Reveal>
          </div>
          <div className="stack mt">
            <Ask n={2}>Which origin is asking?</Ask>
            <Reveal at={2}><Callout kind="good"><span className="small">Our new site: <K>https://recipe-web-yourname.vercel.app</K></span></Callout></Reveal>
          </div>
          <div className="stack mt">
            <Ask n={3}>Which side changes, and which setting?</Ask>
            <Reveal at={3}><Callout kind="good"><span className="small">The <b>API's</b> guest list: <K>CORS_ORIGINS</K> on <b>recipe-api</b>.</span></Callout></Reveal>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "fix-cors",
    part: "web",
    title: "Step 10: Fix CORS, redeploy the API",
    notes: `
TIME: 1:48
DO: On the deployed site, click Copy next to "This website (its origin)". vercel.com, recipe-api (back to the API!), Settings, Environment Variables, CORS_ORIGINS, three dots, Edit. Add a comma, then paste. Save.
DO: Redeploy the API, not the site: cd ../recipe-api, npx vercel --prod. Then refresh the site.
ASK: Why do we redeploy recipe-api and not recipe-web? (The setting we changed belongs to the API.)
SAY: Keep http://localhost:5173 in the list so your laptop's dev site still works.
WATCH: Edited CORS_ORIGINS on recipe-web by mistake. Nothing changes.
WATCH: Still blocked after redeploying? Open the API's /api/health and read corsOrigins. Is the site's address in there, spelled exactly like the Copy button gave it?
CHECK: Checkpoint 2. Recipes load on the deployed site. Add a recipe through the form. It saves.`,
    render: () => (
      <S kicker="Part 2 &middot; Step 10" title="Put the site on the API's guest list">
        <Cols split="1fr 660px" gap={26}>
          <div className="stack">
            <Steps items={[
              <>On your site, click <b>Copy</b> next to "This website"</>,
              <><b>recipe-api</b> project, Environment Variables, edit <K>CORS_ORIGINS</K></>,
              <>Add a comma, paste. Save.</>,
              <>Redeploy the <b>API</b>: <K>cd ../recipe-api</K>, <K>npx vercel --prod</K></>,
            ]} />
            <Code lang="env" numbers={false} size={15} title="CORS_ORIGINS on recipe-api">{`http://localhost:5173,https://recipe-web-yourname.vercel.app`}</Code>
            <Check title="Checkpoint 2">Recipes load on your deployed site. Add one through the form.</Check>
          </div>
          <Shot src="/shots/deployed-working.png" url={WEB_URL} />
        </Cols>
      </S>
    ),
  },
  {
    id: "whole-picture",
    part: "web",
    title: "The whole picture",
    notes: `
TIME: 1:54
SAY: Here's everything we did, on one slide. Three settings, each living in exactly one place.
ASK: Point at each setting and tell me which project it lives in, and whether it's a secret.
SAY: And the pattern repeated three times: deploy, set an environment variable, redeploy. You will do this exact thing for every project you ever deploy, on any platform.`,
    render: () => (
      <S kicker="Part 2" title="Three settings, each in exactly one place">
        <TwoUrls />
        <Cols split="1fr 1fr" gap={26}>
          <div className="card mt" style={{ borderTop: "8px solid var(--indigo)" }}>
            <h3>recipe-web settings</h3>
            <div className="small"><K>VITE_API_URL</K> = the API's address</div>
            <div className="small muted mt">Public. Pasted in at build time.</div>
          </div>
          <div className="card mt" style={{ borderTop: "8px solid var(--teal)" }}>
            <h3>recipe-api settings</h3>
            <div className="small"><K>CORS_ORIGINS</K> = localhost + the site's address</div>
            <div className="small"><K>SUPABASE_URL</K>, <K>SUPABASE_SECRET_KEY</K> <Pill color="var(--red)">Secret</Pill></div>
          </div>
        </Cols>
        <p className="big center mt"><b>Deploy. Set an environment variable. Redeploy.</b></p>
      </S>
    ),
  },

  /* ============================== WHEN IT BREAKS ============================== */
  {
    id: "breaks",
    part: "fix",
    title: "When it breaks",
    notes: `
TIME: 1:56
SAY: This is the page to come back to when you deploy your own project tonight. It's also in the code-along guide.
SAY: The last two rows are about your own code, not the starter. Vercel runs Linux, where Recipes.js and recipes.js are different files. Windows and Mac don't care, so it works on your laptop and fails on Vercel.
SAY: And require is not defined is our old friend: CommonJS pasted into an ESM project. import, not require.`,
    render: () => (
      <S kicker="Reference" title="When it breaks">
        <Table size={16} widths={["35%", "33%", "32%"]} head={["You see", "Why", "Fix"]} rows={[
          ["A Vercel login page instead of your app", "You opened the long, protected deployment address", "Use the short production address"],
          [<>Health says <b>sample data</b> on Vercel</>, "Supabase variables missing, or no redeploy", <>Add them on <b>recipe-api</b>, then <K>npx vercel --prod</K></>],
          [<b>VITE_API_URL is not set</b>, "No variable on recipe-web, or no redeploy", <>Add it on <b>recipe-web</b>, then redeploy the site</>],
          [<><b>Could not reach the API</b> + CORS in Console</>, "Site's origin is not in CORS_ORIGINS", <>Add it on <b>recipe-api</b>, then redeploy the API</>],
          [<b>That address is not the API</b>, "VITE_API_URL points at the site itself", "Use the recipe-api address, redeploy the site"],
          [<>Works locally, Vercel says <K>Cannot find module</K></>, "Capital letters differ (Recipes.js vs recipes.js). Vercel's Linux cares.", "Match the import to the real file name exactly"],
          [<K>require is not defined in ES module scope</K>, "CommonJS pasted into an ESM project", <>Use <K>import</K> and <K>export</K></>],
        ]} />
      </S>
    ),
  },

  /* ============================== PART 3: P4 ============================== */
  {
    id: "sec-p4",
    part: "p4",
    title: "Section: Your Project 4",
    notes: `
TIME: 2:00
SAY: You just deployed a full-stack app. Now the same steps on your own Project 4.`,
    render: () => (
      <div className="slide section-slide">
        <div className="sec-num" style={{ color: partColor("p4") }}>Part 3</div>
        <h1>Now do it with your Project 4</h1>
        <div className="lede">Same commands. Your folder. Copy what you need from the starter.</div>
      </div>
    ),
  },
  {
    id: "p4-checklist",
    part: "p4",
    title: "Project 4 deploy checklist",
    notes: `
TIME: 2:01
SAY: Before you deploy your own API, check these four things. The starter has a working example of each, so copy from it.
SAY: The Vercel CLI deploys whatever folder you're in, so your GitHub Classroom repo is fine as it is. You don't need to move it anywhere.
SAY: Track B: if Vercel's build fails with "Cannot find type definition file for 'node'", add "typeRoots": ["./node_modules/@types"] next to "types": ["node"] in tsconfig.json. It's in the guide.
DO: Let them start. Walk the room. Whoever finishes first shows their live URL to a neighbor who's stuck.`,
    render: () => (
      <S kicker="Part 3" title="Before you deploy your Project 4">
        <Cols split="1.1fr 1fr" gap={28}>
          <Table size={20} widths={["55%", "45%"]} head={["Check", "Copy from the starter"]} rows={[
            [<><K>app.js</K> does <K>export default app</K> and never calls listen</>, <><K>app.js</K>, <K>server.js</K></>],
            [<>A <K>GET /api/health</K> route</>, <>the health route in <K>app.js</K></>],
            [<><K>cors()</K> reads <K>CORS_ORIGINS</K> from the environment</>, <><K>config/env.js</K></>],
            [<><K>.vercelignore</K> lists <K>.env</K></>, <><K>.vercelignore</K></>],
          ]} />
          <div className="stack">
            <Term title="Terminal (in YOUR project folder)" size={20}>{`
$ npx vercel --prod --yes
# add your variables on vercel.com
$ npx vercel --prod
# open /api/health, then /api/your-route
`}</Term>
            <Callout kind="info" title="Your Classroom repo is fine">
              <span className="small">The CLI deploys the folder you're in. You don't need to change any git settings.</span>
            </Callout>
          </div>
        </Cols>
      </S>
    ),
  },
  {
    id: "tiers",
    part: "p4",
    title: "Today's goals",
    notes: `
TIME: 2:05
SAY: Bronze, Silver, Gold as usual. Bronze is today's lesson done. Silver and Gold are your own project.
SAY: Submit your live URLs on Brightspace.`,
    render: () => (
      <S kicker="Part 3" title="Today's goals">
        <div className="tiers">
          <div className="tier tier-bronze">
            <h3>Bronze</h3>
            <ul>
              <li>recipe-api live on Vercel</li>
              <li>recipe-web live and showing recipes</li>
              <li>Both addresses saved</li>
            </ul>
          </div>
          <div className="tier tier-silver">
            <h3>Silver</h3>
            <ul>
              <li>Your <b>Project 4</b> API live on Vercel</li>
              <li><K>/api/health</K> works on it</li>
              <li>Its variables are set (Secret for keys)</li>
            </ul>
          </div>
          <div className="tier tier-gold">
            <h3>Gold</h3>
            <ul>
              <li>Copy recipe-web, change the paths in <K>src/api.js</K> to <b>your</b> P4 routes</li>
              <li>Point it at your P4 API, deploy it, and fix the CORS error yourself</li>
            </ul>
          </div>
        </div>
        <Callout kind="info" title="Submit on Brightspace">
          <span className="small">Your live URLs: recipe-web, recipe-api, and your Project 4 API.</span>
        </Callout>
      </S>
    ),
  },
  {
    id: "wrap",
    part: "p4",
    title: "Say it out loud",
    steps: 3,
    notes: `
TIME: 2:10
SAY: Three questions, out loud, whole class. Then Thursday: Supabase Auth, login and protected routes.
ASK: Cold call gently, or take volunteers. Reveal each answer after someone answers.`,
    render: () => (
      <S kicker="Wrap up" title="Say it out loud">
        <div className="stack">
          <Ask n={1}>You changed a variable on Vercel and nothing happened. Why?</Ask>
          <Reveal at={1}><Callout kind="good"><span className="small">Changes only apply to <b>new</b> deployments. Redeploy.</span></Callout></Reveal>
          <Ask n={2}>Why can't a <K>VITE_</K> variable hold a secret?</Ask>
          <Reveal at={2}><Callout kind="good"><span className="small">Vite pastes it into the JavaScript that every visitor downloads.</span></Callout></Reveal>
          <Ask n={3}>The deployed site said "Could not reach the API" and the Console said CORS. Which project did we change?</Ask>
          <Reveal at={3}><Callout kind="good"><span className="small">The <b>API</b>: its <K>CORS_ORIGINS</K> guest list. Then we redeployed the API.</span></Callout></Reveal>
        </div>
        <p className="muted small mt">Thursday: Supabase Auth. Sign up, log in, and protected routes.</p>
      </S>
    ),
  },
];
