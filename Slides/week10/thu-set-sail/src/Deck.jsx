import { DeckShell, Slide, Split, Cap, Code, CallIt, Term, Reveal, Checklist, Tiers, Ask } from "./kit/index.jsx";
import { Leaderboard, DeploySteps, ServerlessSim, BundleView, EnvVarMap, TwoRemotes, LogMysteries, VerdictCards } from "./widgets.jsx";

/* ------------------------------------------------------------------
   CSC 436 | Week 11, Thursday Nov 5 | Mission 12: Set Sail
   Deploy the Recipe Box API (the galley) to Vercel, secrets in env vars,
   then P4 Studio. Every title is a question. Answers hide behind reveals.
------------------------------------------------------------------- */

const K = (part) => `CSC 436 | Week 11 | Thursday Nov 5 | ${part}`;
const mono = { fontFamily: "var(--mono)", fontSize: "0.62em" };

const APP_TAIL = `// 6. Something threw (including database errors).
app.use(errorHandler);

// Hand the finished ship to whoever imports this file.
export default app;`;

const SERVER_JS = `import app from "./app.js";
import { config } from "./config/env.js";

app.listen(config.port, () => {
  console.log(\`Galley open at http://localhost:\${config.port}\`);
});`;

const HEALTH = `app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    runningOn: config.runningOnVercel ? "vercel" : "your laptop",
    time: new Date().toISOString(),
  });
});`;

const VISITS = `let visits = 0;
const startedAt = new Date().toISOString();
app.get("/api/visits", (req, res) => {
  visits += 1;
  res.json({ visits, thisCopyStartedAt: startedAt });
});`;

const PUSH_CMDS = `# 1. On github.com, under YOUR account: New repository
#    name: recipe-box-api   visibility: Private
#    EMPTY: no README, no .gitignore, no license

# 2. In your project folder, add a second remote called "personal"
$ git remote add personal https://github.com/YOUR-USERNAME/recipe-box-api.git
$ git remote -v

# 3. Send your work there
$ git push personal main`;

const slides = [
  /* ===================== A. Warm-up 12:20-12:35 ===================== */
  {
    id: "title",
    notes:
      "12:20. Welcome aboard. Bounties from Tuesday carry over: press B to show the board. Ask the question on screen and take 3 or 4 answers before moving on. Expected: 'No, localhost only exists on my laptop.' Push: 'So where would it have to live so your friend can open it at 3 a.m.?' Today's voyage: the galley (our Recipe Box API) leaves the home island for the open internet. Then you deploy your own Project 4.",
    render: () => (
      <Slide kicker={K("Mission 12")} q="Set Sail">
        <Split cols="1.05fr 1fr">
          <div className="col" style={{ gap: 16 }}>
            <Ask n="?">Close your laptop. Does your API still work?</Ask>
            <div className="panel" style={{ fontSize: 19, lineHeight: 1.5 }}>
              <div className="tag teal" style={{ marginBottom: 6 }}>today's voyage</div>
              <div>1. What deploying actually means</div>
              <div>2. Secrets ride in env vars, never in git</div>
              <div>3. The galley leaves port: Recipe Box API on Vercel</div>
              <div>4. Log mysteries, then P4 Studio: deploy YOUR API</div>
            </div>
          </div>
          <Cap id="h-01-title" hint="the ship leaving the harbor" style={{ height: 420 }} />
        </Split>
      </Slide>
    ),
  },
  {
    id: "bounty",
    notes:
      "Show the standings, then press B to open the full board. Same rules as Tuesday plus one new prize: the FIRST crew that shows me a working /api/health on a vercel.app URL gets 5 million. Crews of 4 or 5 by seating, same crew names as Tuesday.",
    render: () => (
      <Slide kicker={K("Bounties")} q="Who is leading the bounty race?">
        <Split cols="1.1fr 1fr">
          <div className="col" style={{ gap: 10 }}>
            {[
              ["+1M", "Call it right on a Call It! slide"],
              ["+5M", "Best question of the day"],
              ["+1M", "Catch a bug in the live code"],
              ["+1M", "Explain something to the class"],
              ["+5M", "NEW: first crew with a working /api/health on Vercel"],
            ].map(([amt, txt]) => (
              <div key={txt} className="panel" style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 14px" }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 30, color: "var(--gold)", width: 64 }}>{amt}</span>
                <span style={{ fontSize: 19 }}>{txt}</span>
              </div>
            ))}
            <div className="note" style={{ fontSize: 15 }}>Keys: B bounty board, P pick a crew, T timer.</div>
          </div>
          <Leaderboard />
        </Split>
      </Slide>
    ),
  },
  {
    id: "deploy-means",
    notes:
      "Press T, 2 minutes. Each crew writes every step between 'works on my laptop' and 'anyone can open it'. Collect one step per crew, pay 1M for each real one. Then reveal the six steps in order. Point out: GitHub only does step 1's storage part. A host does all six. Common miss: 'keep it up' (someone has to keep answering while you sleep).",
    render: () => (
      <Slide kicker={K("Warm-up")} q="What does deploy actually mean?">
        <div className="col" style={{ gap: 14 }}>
          <Ask>Crew huddle, 2 minutes (press T): list every step between "it works on my laptop" and "anyone in the world can open it".</Ask>
          <DeploySteps />
        </div>
      </Slide>
    ),
  },
  {
    id: "where-runs",
    notes:
      "Crews hold up a letter first. Common wrong answer: A, GitHub. GitHub only STORES your code. It never runs your Express server. D is tempting for frontend people: the browser runs your React code, but it only receives your API's JSON. Pay the crews that said C.",
    render: () => (
      <Slide kicker={K("Call It!")} q="After you deploy, where does your code run?">
        <CallIt
          cols={2}
          options={["On GitHub", "On your laptop", "On Vercel's computers", "In the visitor's browser"]}
          answer={2}
          why="On Vercel's computers. GitHub only stores your code. Vercel copies it, installs your dependencies, bundles it, and runs it when requests arrive. The visitor's browser never sees your server code: it only receives the JSON your API sends back."
        />
      </Slide>
    ),
  },

  /* ===================== B. Whole group 12:35-1:00 ===================== */
  {
    id: "two-ships",
    notes:
      "12:35. Contrast what npm run dev does with what Vercel does. Key sentence to say slowly: 'On Vercel, your whole Express app becomes ONE Vercel Function.' Vercel starts copies of it when requests arrive. A copy can be reused for many requests, and copies can disappear when nobody is visiting. Ask the reveal question, then show the answer. Do not over-promise timings: Vercel decides when copies start and stop.",
    render: () => (
      <Slide kicker={K("Two kinds of ships")} q="Always-on ship, or a crew summoned by a bell?">
        <Split cols="1fr 1fr 0.8fr" style={{ flex: "none" }}>
          <div className="panel" style={{ borderTop: "6px solid var(--teal)", fontSize: 18, lineHeight: 1.45 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 30, color: "var(--teal-soft)" }}>Always on</div>
            <div className="mono" style={{ fontSize: 15, color: "var(--foam)" }}>npm run dev</div>
            <ul style={{ paddingLeft: 18, margin: "8px 0 0" }}>
              <li>One process starts once</li>
              <li>server.js calls listen(3000)</li>
              <li>It waits for requests, all day</li>
              <li>Memory lives until you stop it</li>
            </ul>
          </div>
          <div className="panel" style={{ borderTop: "6px solid var(--gold)", fontSize: 18, lineHeight: 1.45 }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 30, color: "var(--gold)" }}>Summoned</div>
            <div className="mono" style={{ fontSize: 15, color: "var(--foam)" }}>a Vercel Function</div>
            <ul style={{ paddingLeft: 18, margin: "8px 0 0" }}>
              <li>Your whole Express app becomes ONE function</li>
              <li>Copies start when requests arrive</li>
              <li>A copy can answer many requests</li>
              <li>Idle copies can disappear</li>
            </ul>
          </div>
          <Cap id="h-05-ships" hint="a ship waiting at anchor" style={{ height: 300 }} />
        </Split>
        <Reveal label="Which one costs nothing while nobody visits?" style={{ marginTop: 14 }}>
          <div className="parch" style={{ fontSize: 18 }}>
            The summoned crew. Nothing has to sit there running while your API has no visitors. The price: anything you keep in a variable can vanish with the copy that held it. Next slide.
          </div>
        </Reveal>
      </Slide>
    ),
  },
  {
    id: "serverless-sim",
    notes:
      "Drive it live. 1) Send request three times: copy #1 says 1, 2, 3. Laptop says 3 too. 2) Wait 15 min: copies gone. Send: a NEW copy says visits 1. Ask the slide question. 3) Rush: 3 at once can start a second copy, and the two copies disagree. 4) POST a recipe, then Redeploy: Supabase still has it. Punchline: memory belongs to one copy; the database belongs to everyone. This is simplified: say so out loud. Callback to Week 10: 'Memory forgets. Databases remember.'",
    render: () => (
      <Slide kicker={K("Memory vs database")} q="Why did visits say 3, and then 1?" sm>
        <ServerlessSim />
      </Slide>
    ),
  },
  {
    id: "where-listen",
    notes:
      "TUESDAY PAYOFF. On Tuesday we split app.js (builds and exports) from server.js (listens) and I said 'hold that thought until Thursday'. Vercel looks for app.js, index.js or server.js (or the same names in src/) that imports express and exports the app. We ran the real Vercel build on our galley: handler is app.js, runtime nodejs26.x, and server.js is NOT EVEN IN THE BUNDLE. Vercel calls the exported app itself for each request. Also not in the bundle: .env.example, setup.sql, and of course .env.",
    render: () => (
      <Slide kicker={K("Tuesday's payoff")} q="If nothing listens, where did app.listen go?" sm>
        <Split cols="1fr 1fr">
          <div className="col" style={{ gap: 10 }}>
            <CallIt
              options={["server.js, because it calls listen()", "app.js, because it exports the app", "Both, one after the other", "Neither: Vercel needs a vercel.json first"]}
              answer={1}
              size={17}
              why="app.js. Vercel found the file that imports express and does export default app. It calls your app for each request, so nothing of yours ever listens. server.js only runs on your laptop."
            />
          </div>
          <div className="col" style={{ gap: 10 }}>
            <Code code={APP_TAIL} title="app.js (the last lines)" size={15} hl={[5]} />
            <BundleView />
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "env-map",
    notes:
      "Ask the title question before revealing anything. Expected wrong answer: 'Vercel reads my .env from GitHub.' It can't: .env is in .gitignore, so it never reached GitHub. You tell Vercel separately. Reveal the three cards one at a time. PORT: not needed on Vercel, because nothing of yours listens. Remind: values in .env.example are fake on purpose.",
    render: () => (
      <Slide kicker={K("Secrets")} q="If .env is in .gitignore, how does Vercel know your Supabase key?" sm>
        <EnvVarMap />
      </Slide>
    ),
  },
  {
    id: "secrets-vote",
    notes:
      "Crews vote first. Source: GitGuardian, State of Secrets Sprawl 2026 (published March 2026): 28.65 million new hardcoded secrets in public GitHub commits in 2025, up 34%, their biggest one-year jump. Then the follow-up: more than 64% of secrets confirmed valid in 2022 still worked when retested in January 2026. Ask why: nobody rotated them. Lesson: if a key ever lands in git, deleting the file is not enough. Rotate the key.",
    render: () => (
      <Slide kicker={K("Call It!")} q="How many new secrets leaked on public GitHub in 2025?" sm>
        <Split cols="1.25fr 0.75fr">
          <CallIt
            cols={2}
            options={["28 thousand", "280 thousand", "2.8 million", "28 million"]}
            answer={3}
            why="About 28.65 million new hardcoded secrets showed up in public GitHub commits in 2025, up 34% from the year before (GitGuardian, State of Secrets Sprawl 2026)."
          />
          <div className="col" style={{ gap: 12 }}>
            <Cap id="h-09-treasure" hint="a treasure map falling into the wrong hands" style={{ height: 210 }} />
            <Reveal label="Follow-up: what about old leaks?">
              <div className="parch" style={{ fontSize: 17, lineHeight: 1.4 }}>
                More than 64% of secrets confirmed valid in 2022 still worked when retested in January 2026.
                <div style={{ fontWeight: 900, marginTop: 6 }}>Why would a key from 2022 still work?</div>
              </div>
            </Reveal>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "redeploy",
    notes:
      "This one bites every semester. Vercel's docs: changes to environment variables are not applied to previous deployments; they only apply to new deployments. The deployment you keep refreshing was built before the variable existed. Fix: the Redeploy option in the deployment's menu, or push a new commit to your personal repo. Pay the crews that said B.",
    render: () => (
      <Slide kicker={K("Call It!")} q="You added the variable in Vercel. Still broken. Why?" sm>
        <Split cols="1.2fr 1fr">
          <CallIt
            size={17}
            options={[
              "Vercel needs about 10 minutes to notice",
              "Env var changes only apply to new deployments",
              "Variable names must be lowercase on Vercel",
              "You also have to commit your .env file",
            ]}
            answer={1}
            why="Changes to environment variables are not applied to deployments that already exist. They only apply to new ones. Redeploy (the Redeploy option in the deployment's menu) or push a new commit. Never commit .env."
          />
          <Term
            title="runtime log, after adding SUPABASE_URL"
            size={14}
            lines={[
              { c: "dim", t: "GET /api/health" },
              { c: "err", t: "Error: Missing environment variable SUPABASE_URL. On your laptop: add it to .env (see .env.example). On a host: add it in the host's environment variable settings." },
            ]}
          />
        </Split>
      </Slide>
    ),
  },
  {
    id: "org-repo",
    notes:
      "Vercel's docs, Using Hobby teams: you cannot deploy to a Hobby team from a PRIVATE repository in a GitHub ORGANIZATION. Your Classroom repo is exactly that: private, owned by the class organization. Most of you are outside collaborators there, and outside collaborators can't import org repos into Vercel anyway. Reveal the verdicts one by one. Our fix: push a copy to your own account. On Hobby the commit author must be you, the account owner: sign up for Vercel WITH GitHub, and commits from Codespaces are already authored as you.",
    render: () => (
      <Slide kicker={K("The Classroom problem")} q="Your repo lives in the class organization. Why does Vercel say no?" sm>
        <Split cols="1fr 1fr">
          <div className="col" style={{ gap: 12 }}>
            <div className="parch" style={{ fontSize: 18, lineHeight: 1.45 }}>
              <h3>The rule</h3>
              Vercel's free Hobby plan cannot deploy a <b>private</b> repository that belongs to a GitHub <b>organization</b>.
            </div>
            <div className="panel" style={{ fontSize: 18, lineHeight: 1.45 }}>
              Your Classroom repo is private and belongs to the class organization. You are usually an outside collaborator there, which also cannot import it into Vercel.
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            <div className="note" style={{ fontSize: 16 }}>Three ways out. Which one do we take?</div>
            <VerdictCards
              items={[
                { option: "Make the Classroom repo public", ok: false, why: "Everyone could read and copy your work, and it is the class organization's repo, not yours to change." },
                { option: "Pay for Vercel Pro", ok: false, why: "A paid plan for a class project? No. Hobby is free for personal, non-commercial work like this." },
                { option: "Push a copy to your own GitHub account", ok: true, why: "A private repo in YOUR account deploys fine on Hobby. Same code, second remote. Next slide." },
              ]}
            />
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "two-remotes",
    notes:
      "Drive it: git commit (only your machine has it), git push (Classroom gets it, Vercel does nothing), git push personal main (your repo gets it, Vercel builds). Ask: 'What happens if you only ever run git push?' (I can grade it, but your site never updates.) 'What if you only push personal?' (Your site updates, but I can't grade it.) Rule of thumb: every time, both pushes.",
    render: () => (
      <Slide kicker={K("Two remotes")} q="Can one repo push to two places?" sm>
        <div className="col" style={{ gap: 12 }}>
          <TwoRemotes />
          <div className="panel mono" style={{ fontSize: 16, padding: "10px 14px" }}>
            <span className="gold">git push</span>  <span className="note">(Classroom: for grading)</span>
            {"     "}
            <span className="gold">git push personal main</span>  <span className="note">(your repo: Vercel deploys it)</span>
          </div>
        </div>
      </Slide>
    ),
  },

  /* ===================== C. Code-along deploy 1:00-1:30 ===================== */
  {
    id: "preflight",
    notes:
      "1:00. Everyone checks every box on their OWN machine before we go further. Walk the room. The big one is git ls-files .env: if it prints .env, the secret is in your history. Fix it with git rm --cached .env, commit, and ROTATE the Supabase secret key (make a new one in Supabase, delete the old one), because deleting the file does not remove it from history.",
    render: () => (
      <Slide kicker={K("Code-along")} q="Is your ship ready to leave port?" sm>
        <Split cols="1.15fr 1fr">
          <Checklist
            size={17}
            items={[
              "node -v says 22.18 or newer",
              "npm run dev works on your laptop",
              "http://localhost:3000/api/health says \"your laptop\"",
              "git ls-files .env prints NOTHING",
              "app.js ends with export default app",
              ".env has SUPABASE_URL, SUPABASE_SECRET_KEY, CORS_ORIGINS",
              "git status is clean (everything committed)",
            ]}
          />
          <div className="col" style={{ gap: 10 }}>
            <Term
              title="the secrets check"
              size={14}
              lines={[
                { c: "prompt", t: "git ls-files .env" },
                { c: "dim", t: "(no output: good, .env was never committed)" },
              ]}
            />
            <Reveal label="It printed .env. Now what?">
              <Term
                title="if .env WAS committed"
                size={14}
                lines={[
                  { c: "prompt", t: "git rm --cached .env" },
                  { c: "prompt", t: "git commit -m \"stop tracking .env\"" },
                  { c: "err", t: "Then ROTATE the Supabase secret key." },
                  { c: "err", t: "The old one is still in your git history." },
                ]}
              />
            </Reveal>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "push-personal",
    notes:
      "Type it live, students follow. WATCH FOR: someone ticks 'Add a README' when creating the repo. Then git push personal main is rejected with a message about fetch first, because the remote has a commit they don't have. Easiest fix for beginners: delete that repo and make it again, EMPTY. WATCH FOR (Codespaces): a Codespace's built-in login is meant for the Classroom repo, so a push to a second repo can be refused with a permission error. Fix (GitHub's documented route): push from a laptop, or make a fine-grained personal access token limited to the new personal repo with Contents: Read and write, then git remote set-url personal https://USERNAME:TOKEN@github.com/USERNAME/recipe-box-api.git and push again. Exact steps are in the Code-Along Guide, Step 5. The token is a password: never commit it or paste it in chat. Ask: why private? (Your repo holds your work; secrets should never be in it anyway, but don't tempt fate.)",
    render: () => (
      <Slide kicker={K("Live: step 1")} q="How do you make the copy Vercel can see?" sm>
        <Split cols="1.75fr 1fr">
          <Code code={PUSH_CMDS} lang="bash" title="terminal, in your project folder" size={14} hl={[6, 10]} />
          <div className="col" style={{ gap: 12 }}>
            <div className="parch" style={{ fontSize: 17, lineHeight: 1.45 }}>
              <h3>Watch for</h3>
              Ticked "Add a README" when you made the repo? Your push gets <span className="mono" style={{ fontSize: 15 }}>rejected (fetch first)</span>. Delete that repo and make it again, empty.
            </div>
            <Reveal label="Predict: what does git remote -v show now?">
              <div className="panel mono" style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre" }}>
                <div>{"origin    github.com/CLASS-ORG/... (fetch)"}</div>
                <div>{"origin    github.com/CLASS-ORG/... (push)"}</div>
                <div className="gold">{"personal  github.com/YOU/recipe-box-api.git"}</div>
                <div className="gold">{"          (fetch) and (push)"}</div>
                <div className="note" style={{ fontFamily: "var(--body)", fontSize: 15, whiteSpace: "normal", marginTop: 4 }}>Two remotes, one repo. Full URLs start with https://</div>
              </div>
            </Reveal>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "import",
    notes:
      "Live in the browser: vercel.com/new, Import the personal repo. Framework: Express should be detected on its own. No build command, no vercel.json. BEFORE you click Deploy, open the Environment Variables section and add all three. CORS_ORIGINS for today is http://localhost:5173 so harbor-client can reach it. Ask the predict question, then point at the build log: the engines warning is just a warning (Vercel is telling you it will move to new Node versions on its own; our build ran on nodejs26.x). Nothing about server.js anywhere.",
    render: () => (
      <Slide kicker={K("Live: step 2")} q="What goes in BEFORE you click Deploy?" sm>
        <Split cols="1fr 1.1fr">
          <div className="col" style={{ gap: 10 }}>
            {[
              "vercel.com/new",
              "Import your personal recipe-box-api repo",
              "Framework preset: Express (detected for you)",
              "Open Environment Variables, add all three",
              "Deploy",
            ].map((s, k) => (
              <div key={s} className="panel" style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 12px", fontSize: 18 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 26, color: "var(--gold)", width: 24 }}>{k + 1}</span>
                {s}
              </div>
            ))}
          </div>
          <div className="col" style={{ gap: 10 }}>
            <table className="t" style={{ fontSize: 16 }}>
              <thead><tr><th>Name</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td className="mono">SUPABASE_URL</td><td>same as your .env</td></tr>
                <tr><td className="mono">SUPABASE_SECRET_KEY</td><td>same as your .env (sb_secret_...)</td></tr>
                <tr><td className="mono">CORS_ORIGINS</td><td className="mono">http://localhost:5173</td></tr>
              </tbody>
            </table>
            <Reveal label="Predict: what will the build log say about server.js?">
              <div className="col" style={{ gap: 8 }}>
                <div className="parch" style={{ fontSize: 17 }}>Nothing at all. It is not in the bundle. You may see this warning, and it is only a warning:</div>
                <Term size={13} title="build log" lines={[{ c: "dim", t: "Warning: Detected \"engines\": { \"node\": \">=22.18\" } in your package.json that will automatically upgrade when a new major Node.js Version is released." }]} />
              </div>
            </Reveal>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "health",
    notes:
      "Everyone predicts the JSON out loud before opening https://YOUR-PROJECT.vercel.app/api/health. Key line: runningOn says vercel, because Vercel sets VERCEL=1 on its machines and config/env.js reads it. First crew with a working one gets 5M. IF IT SAYS 'your laptop' ON VERCEL: VERCEL=1 is a System Environment Variable, and it only reaches your code when 'Enable access to System Environment Variables' is checked in Project Settings > Environment Variables (normally on). Check that box and redeploy. Then run the smoke test as a crew: one person drives Thunder Client, others call expected statuses.",
    render: () => (
      <Slide kicker={K("Live: step 3")} q="What should the health check say?" sm>
        <Split cols="1fr 1fr">
          <div className="col" style={{ gap: 10 }}>
            <Code code={HEALTH} title="app.js: the new health check" size={15} hl={[4]} />
            <Reveal label="Predict the JSON, then open it">
              <Code
                lang="json"
                size={15}
                title="https://your-project.vercel.app/api/health"
                code={`{
  "status": "ok",
  "runningOn": "vercel",
  "time": "2026-11-05T18:12:44.120Z"
}`}
                hl={[3]}
              />
            </Reveal>
          </div>
          <div className="col" style={{ gap: 6 }}>
            <div className="tag teal">smoke test on the production URL</div>
            <Checklist
              size={16}
              items={[
                "GET /api/health : 200, runningOn \"vercel\"",
                "GET /api/recipes : 200, an array",
                "GET /api/recipes/1 : 200",
                "GET /api/recipes/two : 404 (checkId)",
                "POST a valid recipe : 201",
                "POST an invalid recipe : 400 with problems",
                "POST bad JSON : 400",
                "GET / : 200 (API info)",
              ]}
            />
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "login-page",
    notes:
      "Somebody will hit this today. Vercel's Standard Protection protects every URL except production domains. The long per-deployment links (the ones with a random-looking part) can show a Vercel login page instead of your JSON, especially in a private window or on a classmate's laptop. Fix: use the short production domain listed under the project's Domains. That is also the URL you submit on Brightspace and the one your React app will call next week.",
    render: () => (
      <Slide kicker={K("Gotcha")} q="Why does my link show a Vercel login page?" sm>
        <Split cols="1fr 1fr">
          <div className="col" style={{ gap: 12 }}>
            <div className="panel" style={{ borderTop: "6px solid var(--good)", fontSize: 18 }}>
              <div className="tag green">production domain: public</div>
              <div className="mono" style={{ fontSize: 17, marginTop: 8 }}>https://your-project.vercel.app</div>
              <div className="note" style={{ fontSize: 15, marginTop: 4 }}>Short. Listed under the project's Domains. Use this one.</div>
            </div>
            <div className="panel" style={{ borderTop: "6px solid var(--red)", fontSize: 18 }}>
              <div className="tag red">a per-deployment URL: can be protected</div>
              <div className="mono" style={{ fontSize: 17, marginTop: 8 }}>https://your-project-a1b2c3d4e-you.vercel.app</div>
              <div className="note" style={{ fontSize: 15, marginTop: 4 }}>Long, one per deployment. May ask for a Vercel login.</div>
            </div>
          </div>
          <div className="col" style={{ gap: 12 }}>
            <Ask>Why would Vercel hide the long links behind a login?</Ask>
            <Reveal>
              <div className="parch" style={{ fontSize: 18, lineHeight: 1.45 }}>
                Each long link is one exact version of your work, including half-finished previews. Vercel's protection keeps those private and leaves your production domain open. Test with, submit, and connect your frontend to the production domain.
              </div>
            </Reveal>
          </div>
        </Split>
      </Slide>
    ),
  },
  {
    id: "visits-live",
    notes:
      "Adam's deploy only (checkpoint 16-visits-experiment, pushed to your own personal repo). Refresh /api/visits a few times: the number climbs and thisCopyStartedAt stays the same, so one copy is answering. Redeploy, refresh: visits starts over with a new start time. Now GET /api/recipes: every row is still there. Ask the title question. Students do NOT add this route to Project 4 (Bonus tier only, and delete it after).",
    render: () => (
      <Slide kicker={K("Live experiment")} q="What survived the redeploy, and why?" sm>
        <Split cols="1.2fr 1fr">
          <div className="col" style={{ gap: 10 }}>
            <Code code={VISITS} title="app.js, checkpoint 16 (instructor demo only)" size={16} hl={[1]} />
            <div className="parch" style={{ fontSize: 17, lineHeight: 1.4 }}>
              <b>visits</b> lives in the memory of ONE running copy of the function. <b>recipes</b> live in Supabase. Teaching experiment only: delete it before you submit Project 4.
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            {["Refresh /api/visits three times. Watch both numbers.", "Redeploy from the deployment's menu.", "Refresh /api/visits again.", "Open /api/recipes."].map((s, k) => (
              <div key={s} className="panel" style={{ fontSize: 18, padding: "8px 12px" }}>
                <span className="gold" style={{ fontFamily: "var(--display)", fontSize: 24, marginRight: 10 }}>{k + 1}</span>
                {s}
              </div>
            ))}
            <Reveal label="Show the answer">
              <div className="parch" style={{ fontSize: 17, lineHeight: 1.4 }}>
                visits started over with a new thisCopyStartedAt: the redeploy replaced every copy, and their memory went with them. The recipes survived because they live in Supabase, not in any copy.
              </div>
            </Reveal>
          </div>
        </Split>
      </Slide>
    ),
  },

  /* ===================== D. Log Mysteries 1:30-1:45 ===================== */
  {
    id: "mysteries",
    notes:
      "1:30. Use P to pick a crew per case. 90 seconds each (T). Crew gives the cause in one sentence and the fix in one sentence before you reveal. 1M per correct diagnosis. Cases: A letter case (Routes vs routes; Windows and Mac forgive it, Linux does not); B variable never added; C added but not redeployed; D CommonJS paste; E CORS from localhost:5173 to the deployed API; F login page on a per-deployment URL. Error texts are real Node and Chrome messages; the /var/task path is where Vercel keeps your code.",
    render: () => (
      <Slide kicker={K("Log Mysteries")} q="Can your crew solve the log mystery?" sm>
        <LogMysteries />
      </Slide>
    ),
  },
  {
    id: "netlify-cors",
    notes:
      "Bridge to next Tuesday. The harbor master never changed: the browser still checks Access-Control-Allow-Origin. Only the guest list changes, and the guest list lives in an env var, so no code changes. Add the new origin to the comma list in Vercel, no trailing slash, and REDEPLOY (env var changes only apply to new deployments). Keep http://localhost:5173 in the list so local development still works.",
    render: () => (
      <Slide kicker={K("Call It!")} q="Next week your React app moves to Netlify. What must change?" sm>
        <Split cols="1.25fr 1fr">
          <div className="col" style={{ gap: 10 }}>
            <div className="note" style={{ fontSize: 17 }}>The React app will live at https://galley-crew.netlify.app and call your Vercel API.</div>
            <CallIt
              size={17}
              options={[
                "Edit the cors() line in app.js",
                "Add the Netlify origin to CORS_ORIGINS on Vercel, then redeploy",
                "Nothing: Vercel allows every origin",
                "Move the API to Netlify too",
              ]}
              answer={1}
              why="The guest list lives in an env var, so no code changes. Add the new origin to the comma list in Vercel, with no slash at the end, and redeploy."
            />
          </div>
          <Reveal label="Show the new value">
            <div className="col" style={{ gap: 10 }}>
              <div className="panel">
                <div className="tag teal">CORS_ORIGINS on Vercel, next week</div>
                <div className="mono" style={{ fontSize: 16, marginTop: 10, overflowWrap: "normal", lineHeight: 1.5 }}>
                  <span className="tk-key">CORS_ORIGINS</span>=<wbr /><span className="tk-str">http://localhost:5173,<wbr />https://galley-crew.netlify.app</span>
                </div>
              </div>
              <div className="parch" style={{ fontSize: 17 }}>Two origins, one comma, no spaces needed, no slash at the end. Then redeploy.</div>
            </div>
          </Reveal>
        </Split>
      </Slide>
    ),
  },

  /* ===================== E. P4 Studio 1:45-2:05, Close 2:05-2:15 ===================== */
  {
    id: "tiers",
    notes:
      "1:45. P4 Studio: deploy YOUR Project 4 API the same way. Walk the room, Bronze first for everyone. Submit the production domain (the short one) on Brightspace. Track B: the TypeScript version deploys too, but tsconfig.json needs \"typeRoots\": [\"./node_modules/@types\"] next to \"types\": [\"node\"], or the Vercel build fails with error TS2688: Cannot find type definition file for 'node'.",
    render: () => (
      <Slide kicker={K("P4 Studio")} q="Mission 12: Set Sail" sm>
        <div className="col" style={{ gap: 12 }}>
          <Tiers
            size={16}
            tiers={[
              { name: "Bronze", items: ["Your P4 API is deployed on Vercel from a repo in your own GitHub account", "It has GET /api/health (copy it from today's code), and your production URL /api/health returns 200", "Submit the production URL on Brightspace"] },
              { name: "Silver", items: ["Secrets live only in Vercel's Environment Variables: git ls-files .env prints nothing", "/api/health says runningOn \"vercel\"", "Every route passes a smoke test on the production URL; put the table (request, expected, actual) in your README"] },
            ]}
          />
          <Tiers
            size={16}
            tiers={[
              { name: "Gold", items: ["CORS_ORIGINS on Vercel includes http://localhost:5173 and harbor-client (or your React app) can read your deployed API", "Change one env var, redeploy, and note what changed", "README \"Deploy notes\": production URL, env var NAMES (never values), how to redeploy"] },
              { name: "Bonus", items: ["Track B: deploy the TypeScript version (remember the typeRoots fix)", "Or: run the visits experiment on your deploy and explain in three sentences why the counter reset but the recipes survived"] },
            ]}
          />
        </div>
      </Slide>
    ),
  },
  {
    id: "close",
    notes:
      "2:05. Partners explain to each other, one prompt each, then swap. No exit ticket. Cold-call two pairs with P. Then press B and crown the crew of the week. Preview Tuesday Nov 10: your React app calls this deployed API, and Project 4 is due. Remind: both pushes, every time.",
    render: () => (
      <Slide kicker={K("Close")} q="What happens between git push and your URL working?" sm>
        <Split cols="1.15fr 1fr">
          <div className="col" style={{ gap: 10 }}>
            <Ask n="1">Partner A: walk from git push personal main to a working /api/health. Every stop.</Ask>
            <Ask n="2">Partner B: where do your secrets live now, and where must they never live?</Ask>
            <Ask n="3">Together: why did visits reset while the recipes survived?</Ask>
            <div className="panel" style={{ fontSize: 17, lineHeight: 1.45 }}>
              <span className="tag teal">Tuesday Nov 10</span> Your React app calls this deployed API. Project 4 is due.
            </div>
          </div>
          <Cap id="h-22-feast" hint="a crew celebrating on deck" style={{ height: 400 }} />
        </Split>
      </Slide>
    ),
  },
];

export default function Deck() {
  return <DeckShell slides={slides} label="CSC 436 | Week 11 Thu | Mission 12: Set Sail" />;
}
