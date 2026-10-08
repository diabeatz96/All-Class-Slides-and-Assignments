import { useState, useEffect, useRef } from "react";
import { T, Code, Slide, Col, Reveal, Tiers, Checklist, Quiz, DeckShell } from "./ui.jsx";
import { fakeFetch, net, NetControls, RecipeRow, Skeleton, RECIPES } from "./fakeApi.jsx";
import { LAB_SLIDES } from "./LabSlides.jsx";

/* ------------------------------------------------------------------
   CSC 436  |  Week 7, Thursday Oct 8  |  Mission 6
   Error handling, loading UX, custom hooks. Recipe Finder continues.
------------------------------------------------------------------- */

/* The hook we build toward. Used live on several slides. */
function useFetch(path, { retries = 0 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true); setError(null); setAttempt(0);
    async function load(n) {
      try {
        if (alive) setAttempt(n);
        const res = await fakeFetch(path);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (alive) { setData(json); setLoading(false); }
      } catch (e) {
        if (!alive) return;
        if (n < retries) { setTimeout(() => load(n + 1), 600 * (n + 1)); return; }
        setError(e.message); setLoading(false);
      }
    }
    load(1);
    return () => { alive = false; };
  }, [path, tick, retries]);
  return { data, loading, error, attempt, refetch: () => setTick((t) => t + 1) };
}

/* 1. Title */
function TitleSlide() {
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "center", padding: "0 80px", gap: 40 }}>
      <div>
        <div className="kicker">CSC 436, Week 7, Mission 6, Thursday Oct 8</div>
        <h1 style={{ fontSize: 60, lineHeight: 1.0, fontWeight: 800 }}>When it breaks, and how to stop repeating yourself</h1>
        <p style={{ fontSize: 21, color: T.muted, marginTop: 22, maxWidth: 560, lineHeight: 1.5 }}>
          Tuesday you made it work. First, an API Lab: Pokémon, a card game, and a fashion API. Then you make it survive bad wifi, feel fast while it waits, and fit in one reusable hook.
        </p>
      </div>
      <div className="panel" style={{ padding: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: T.ink, marginBottom: 12 }}>Warm up on real APIs, then harden one app</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 16, lineHeight: 1.5 }}>
          <div><span className="chip" style={{ background: T.ink, color: "#fff" }}>api lab</span> The five steps of every call. Sequential vs Promise.all. Picking an API and reading its docs.</div>
          <div><span className="chip warn">errors</span> Messages a human can act on. Retry buttons. Automatic retries.</div>
          <div><span className="chip blue">loading</span> Skeletons instead of spinners. Keep old data on screen while refetching.</div>
          <div><span className="chip">hooks</span> Extract useFetch so the three states are written once.</div>
        </div>
        <div className="note" style={{ marginTop: 16 }}>Plus the one slide that sets up Project 4: why your API key cannot live in this code.</div>
      </div>
    </div>
  );
}

/* 2. Warm-up: rate the error messages */
function WarmupSlide() {
  const msgs = [
    { t: "Error", score: 1, why: "Error what? The user has nothing to do with this." },
    { t: "TypeError: Cannot read properties of undefined (reading 'map')", score: 1, why: "Honest, but it is for you, not for them. Never show raw error objects." },
    { t: "Could not load recipes. Check your connection and try again.", score: 3, why: "What happened, likely cause, what to do. This is the bar." },
    { t: "Something went wrong.", score: 2, why: "Better than nothing, but no next step. Add a Retry button and it becomes a 3." },
    { t: "No recipes match \"pasta\". Try a shorter search.", score: 3, why: "Not an error at all. An empty state with a suggestion. The fourth state done right." },
  ];
  const [picked, setPicked] = useState(msgs.map(() => null));
  const [checked, setChecked] = useState(false);
  return (
    <Slide kicker="Warm-up" title="Rate the error message. 1 is useless, 3 is what we ship." wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignContent: "start" }}>
        {msgs.map((m, i) => (
          <div key={i} className="panel" style={{ padding: 14, borderColor: checked ? (picked[i] === m.score ? T.accent : T.warn) : T.line }}>
            <div className="mono" style={{ fontSize: 14, background: T.bg, padding: 10, borderRadius: 8, marginBottom: 10 }}>{m.t}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[1, 2, 3].map((s) => <button key={s} className={"tab" + (picked[i] === s ? " on" : "")} onClick={() => { setPicked(picked.map((p, j) => (j === i ? s : p))); setChecked(false); }}>{s}</button>)}
              {checked && <span className="note" style={{ marginLeft: 8 }}>{m.why}</span>}
            </div>
          </div>
        ))}
        <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 15 }}>A good error says what happened, why it probably happened, and what to do next.</span>
          <button className="btn primary" onClick={() => setChecked(true)}>Check</button>
        </div>
      </div>
    </Slide>
  );
}

/* 3. Error kinds */
function ErrorKindsSlide() {
  const [k, setK] = useState(0);
  const kinds = [
    { name: "Network down", how: "fetch rejects. Your catch runs.", code: `try {\n  const res = await fetch(URL)\n} catch (err) {\n  // TypeError: Failed to fetch\n  setError("Could not reach the server. Check your connection.")\n}`, user: "Could not reach the server. Check your connection." },
    { name: "Server says no (404, 500)", how: "fetch resolves. res.ok is false. You must throw.", code: `const res = await fetch(URL)\nif (res.status === 404) throw new Error("That recipe does not exist.")\nif (!res.ok) throw new Error("The server had a problem. Try again in a moment.")`, user: "That recipe does not exist." },
    { name: "Bad JSON", how: "res.json() rejects because the body is HTML or empty.", code: `const data = await res.json()   // throws SyntaxError on bad body\n// Usually a sign you hit the wrong URL. Log it, show a generic message.`, user: "We got an unexpected response. Try again." },
    { name: "Right data, wrong shape", how: "No error at all. data.recipes is undefined and map crashes during render.", code: `setRecipes(data.recipes ?? [])   // defend the shape\n// or check: if (!Array.isArray(data.recipes)) throw new Error(...)`, user: "No recipes found." },
  ];
  const c = kinds[k];
  return (
    <Slide kicker="Four ways a fetch fails" title="Each one surfaces differently. Handle each one on purpose.">
      <Col>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {kinds.map((x, i) => <button key={i} className={"tab" + (k === i ? " on" : "")} onClick={() => setK(i)}>{x.name}</button>)}
        </div>
        <div className="panel" style={{ fontSize: 16 }}><b>How it shows up:</b> {c.how}</div>
        <Code>{c.code}</Code>
      </Col>
      <Col>
        <div className="panel">
          <div className="note" style={{ marginBottom: 8 }}>What the user sees</div>
          <div className="callout"><div className="h">Could not load recipes</div>{c.user}<div style={{ marginTop: 10 }}><button className="btn small">Retry</button></div></div>
        </div>
        <div className="callout blue">
          <div className="h">Rule</div>
          The error message in state is for the user. The real error goes to console.error for you. Two audiences, two messages.
        </div>
      </Col>
    </Slide>
  );
}

/* 4. Retry button and auto retry */
function RetrySlide() {
  const [retries, setRetries] = useState(0);
  const { data, loading, error, attempt, refetch } = useFetch("/recipes", { retries });
  return (
    <Slide kicker="Recovery" title="A Retry button is free. Automatic retries are three lines more.">
      <Col>
        <Code>{`async function load(attempt = 1) {
  try {
    const res = await fetch(URL)
    if (!res.ok) throw new Error("HTTP " + res.status)
    setData(await res.json())
  } catch (err) {
    if (attempt < 3) {
      setTimeout(() => load(attempt + 1), 600 * attempt)   // back off
      return
    }
    setError("Could not load recipes after 3 tries.")
  } finally {
    if (attempt >= 3 || !error) setLoading(false)
  }
}

// and in the error branch:
<button onClick={refetch}>Retry</button>`}</Code>
        <div className="callout">
          <div className="h">Do not retry forever, and do not retry 404s</div>
          A missing recipe will still be missing on try 5. Retry network failures and 5xx. Cap it. Back off a little each time so you are not hammering a server that is already struggling.
        </div>
      </Col>
      <Col>
        <NetControls />
        <div className="panel" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="note">Automatic retries</span>
          {[0, 1, 2].map((n) => <button key={n} className={"tab" + (retries === n ? " on" : "")} onClick={() => setRetries(n)}>{n}</button>)}
          <span className="note mono" style={{ marginLeft: "auto" }}>attempt {attempt}</span>
        </div>
        <div className="panel" style={{ minHeight: 170 }}>
          {loading && <p className="note">Loading{attempt > 1 ? `, retry ${attempt - 1}` : ""}...</p>}
          {error && <div className="callout"><div className="h">Could not load recipes</div>{error}<div style={{ marginTop: 10 }}><button className="btn small primary" onClick={refetch}>Retry</button></div></div>}
          {data && !loading && !error && data.recipes.slice(0, 3).map((r) => <RecipeRow key={r.id} r={r} />)}
        </div>
        <div className="note">Set Failing, retries 2, click Retry. Watch the attempt counter climb, then fail with a message. Flip Healthy mid-retry and it recovers.</div>
      </Col>
    </Slide>
  );
}

/* 5. Loading UX: spinner vs skeleton vs stale-while-refetch */
function LoadingSlide() {
  const [mode, setMode] = useState("text");
  const [status, setStatus] = useState("data");
  const [recipes, setRecipes] = useState(RECIPES.slice(0, 4));
  const [shown, setShown] = useState(RECIPES.slice(0, 4));
  const load = () => {
    setStatus("loading");
    fakeFetch("/recipes").then((r) => r.json()).then((d) => {
      const next = [...d.recipes].sort(() => Math.random() - 0.5).slice(0, 4);
      setRecipes(next); setShown(next); setStatus("data");
    }).catch(() => setStatus("error"));
  };
  return (
    <Slide kicker="Loading UX" title="Three ways to wait. Only one of them feels fast.">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          {[["text", "Loading text"], ["skeleton", "Skeleton"], ["stale", "Keep old data"]].map(([k, l]) => <button key={k} className={"tab" + (mode === k ? " on" : "")} onClick={() => setMode(k)}>{l}</button>)}
        </div>
        {mode === "text" && <Code>{`if (loading) return <p>Loading...</p>\n\n// Honest, but the layout jumps when data lands.\n// Fine for a first version. Not fine for a list the user is reading.`}</Code>}
        {mode === "skeleton" && <Code>{`if (loading) return <RecipeSkeleton rows={4} />\n\n// Grey blocks shaped like the real rows.\n// Layout does not jump. The eye already knows where to look.\n// Pure CSS: a div with a background and a subtle pulse animation.`}</Code>}
        {mode === "stale" && <Code>{`// Do NOT clear the list when a refetch starts\n// Show the old data dimmed, with a small "Updating..." tag\n\n<div style={{ opacity: loading ? 0.5 : 1 }}>\n  {recipes.map(...)}\n</div>\n{loading && <span>Updating...</span>}\n\n// Best for search and refresh: the user never loses their place.`}</Code>}
        <div className="callout good">
          <div className="h">Pick by situation</div>
          First load with nothing to show: skeleton. Refetch with data already on screen: keep it, dim it. Plain text only for tiny widgets.
        </div>
      </Col>
      <Col>
        <NetControls />
        <div className="panel" style={{ minHeight: 230 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span className="note">Recipes {mode === "stale" && status === "loading" && <span className="chip blue">Updating...</span>}</span>
            <button className="btn small primary" onClick={load} disabled={status === "loading"}>Refresh</button>
          </div>
          {status === "loading" && mode === "text" && <p className="note" style={{ padding: "30px 0" }}>Loading...</p>}
          {status === "loading" && mode === "skeleton" && <Skeleton rows={4} />}
          {status === "loading" && mode === "stale" && <div style={{ opacity: 0.45 }}>{shown.map((r) => <RecipeRow key={r.id} r={r} />)}</div>}
          {status === "data" && recipes.map((r) => <RecipeRow key={r.id} r={r} />)}
          {status === "error" && <div className="callout">Could not refresh. <button className="btn small" onClick={load}>Retry</button></div>}
        </div>
      </Col>
    </Slide>
  );
}

/* 6. The repetition problem */
function RepetitionSlide() {
  return (
    <Slide kicker="The smell" title="Three components, the same fifteen lines, three times">
      <Col>
        <Code style={{ fontSize: 12.5 }}>{`function RecipeList() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    let alive = true
    fetch("/recipes").then(r => r.json())
      .then(d => alive && setData(d))
      .catch(e => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])
  ...
}

function RecipeDetail({ id }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    // the exact same thing with a different URL
  }, [id])
  ...
}

function CuisineFilter() {
  // and again
}`}</Code>
      </Col>
      <Col>
        <div className="panel" style={{ fontSize: 16, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 6 }}>You already know the fix for duplicated UI</div>
          <div>Repeated JSX becomes a component. Repeated <i>logic with state</i> becomes a custom hook. Same instinct, different container.</div>
        </div>
        <div className="callout blue">
          <div className="h">What a custom hook is</div>
          A plain function whose name starts with <span className="mono">use</span> and which calls other hooks inside. That is the entire definition. The <span className="mono">use</span> prefix is how React and the linter know to apply the hook rules.
        </div>
        <div className="callout">
          <div className="h">What it is not</div>
          Not shared state. Two components calling useFetch each get their own data, loading, and error. The hook shares the recipe, not the cake.
        </div>
      </Col>
    </Slide>
  );
}

/* 7. Extracting useFetch, step by step */
function ExtractSlide() {
  const [step, setStep] = useState(0);
  const steps = [
    { t: "1. Cut the three useState lines and the effect out of the component", code: `function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // the same effect as before
  }, [url])
}` },
    { t: "2. The URL that was hardcoded becomes a parameter", code: `useEffect(() => {
  let alive = true
  setLoading(true); setError(null)
  fetch(url)                       // was "/recipes"
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status)
      return res.json()
    })
    .then(d => alive && setData(d))
    .catch(e => alive && setError(e.message))
    .finally(() => alive && setLoading(false))
  return () => { alive = false }
}, [url])                           // refetch when the url changes` },
    { t: "3. Return what the component needs", code: `  return { data, loading, error }
}` },
    { t: "4. The component becomes three lines of logic", code: `function RecipeList() {
  const { data, loading, error } = useFetch("https://dummyjson.com/recipes")

  if (loading) return <RecipeSkeleton />
  if (error) return <ErrorBox message={error} />
  return <ul>{data.recipes.map(r => <li key={r.id}>{r.name}</li>)}</ul>
}

function RecipeDetail({ id }) {
  const { data, loading, error } = useFetch(\`https://dummyjson.com/recipes/\${id}\`)
  ...
}` },
  ];
  return (
    <Slide kicker="Refactor" title="Extract useFetch in four cuts">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          {steps.map((_, i) => <button key={i} className={"tab" + (step === i ? " on" : "")} onClick={() => setStep(i)}>Cut {i + 1}</button>)}
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>{steps[step].t}</h3>
        <Code>{steps[step].code}</Code>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn small" disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button>
          <button className="btn small primary" disabled={step === 3} onClick={() => setStep(step + 1)}>Next cut</button>
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 6 }}>Where it lives</div>
          <div><span className="mono">src/hooks/useFetch.js</span>, one hook per file, <span className="mono">export default</span>.</div>
          <div className="note" style={{ marginTop: 6 }}>No JSX inside, so .js is fine. Import it like any other module.</div>
        </div>
        <div className="callout">
          <div className="h">Hook rules still apply inside</div>
          Called at the top level of a component, never inside an if, loop, or event handler. <span className="mono">useFetch</span> calls <span className="mono">useState</span> and <span className="mono">useEffect</span>, so it inherits their rules.
        </div>
      </Col>
    </Slide>
  );
}

/* 8. useFetch live with search and detail */
function LiveHookSlide() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const list = useFetch(`/recipes/search?q=${encodeURIComponent(query)}`);
  const detail = useFetch(selected ? `/recipes/${selected}` : "/recipes/0");
  return (
    <Slide kicker="Payoff" title="Two components, two calls to useFetch, zero copied effects">
      <Col>
        <Code>{`function Search() {
  const [query, setQuery] = useState("")
  const { data, loading, error } = useFetch(
    \`https://dummyjson.com/recipes/search?q=\${query}\`
  )
  // url changes as you type, the hook refetches, cleanup handles races
}

function Detail({ id }) {
  const { data, loading, error } = useFetch(
    \`https://dummyjson.com/recipes/\${id}\`
  )
}`}</Code>
        <NetControls />
      </Col>
      <Col>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, minHeight: 0 }}>
          <div className="panel" style={{ padding: 14 }}>
            <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
            <div style={{ marginTop: 8 }}>
              {list.loading && <Skeleton rows={3} />}
              {list.error && <div className="callout" style={{ fontSize: 13 }}>{list.error} <button className="btn small" onClick={list.refetch}>Retry</button></div>}
              {list.data && !list.loading && !list.error && list.data.recipes.map((r) => (
                <button key={r.id} className="btn" style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 6, borderColor: selected === r.id ? T.accent : T.line }} onClick={() => setSelected(r.id)}>{r.name}</button>
              ))}
              {list.data && !list.loading && list.data.recipes.length === 0 && <div className="note">No matches.</div>}
            </div>
          </div>
          <div className="panel" style={{ padding: 14 }}>
            <div className="note" style={{ marginBottom: 6 }}>Detail</div>
            {!selected && <div className="note">Pick a recipe.</div>}
            {selected && detail.loading && <Skeleton rows={2} />}
            {selected && detail.error && <div className="callout" style={{ fontSize: 13 }}>{detail.error}</div>}
            {selected && detail.data && !detail.loading && !detail.error && (
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.ink }}>{detail.data.name}</div>
                <div className="note">{detail.data.cuisine}, {detail.data.minutes} minutes</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>{detail.data.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              </div>
            )}
          </div>
        </div>
      </Col>
    </Slide>
  );
}

/* 9. API keys cannot live in the browser */
function KeysSlide() {
  const [shown, setShown] = useState(false);
  return (
    <Slide kicker="Foreshadowing Project 4" title="Why your API key cannot live in React code">
      <Col>
        <Code>{`// src/App.jsx
const KEY = "sk-live-9f3a7c2e..."     // "nobody will see it, it is in my code"

useEffect(() => {
  fetch(\`https://api.example.com/data?key=\${KEY}\`)
}, [])`}</Code>
        <div className="callout">
          <div className="h">Everything in src/ ships to the browser</div>
          Vite bundles it into a .js file and sends it to every visitor. View Source. Network tab. The key is right there. A .env file with VITE_ in front does not change this, it just moves where you typed it.
        </div>
        <div className="callout good">
          <div className="h">The fix is Project 4</div>
          Your React app calls <i>your</i> server. Your server holds the key and calls the real API. Express, in two weeks. Today's useFetch will point at localhost:3000 instead of dummyjson and nothing else changes.
        </div>
      </Col>
      <Col>
        <div className="panel">
          <div className="note" style={{ marginBottom: 8 }}>What an attacker does</div>
          <button className="btn primary" onClick={() => setShown(true)}>Open DevTools, Sources tab</button>
          {shown && (
            <div className="mono" style={{ marginTop: 12, background: T.codeBg, color: "#E5E7EB", padding: 14, borderRadius: 10, fontSize: 13, lineHeight: 1.6 }}>
              assets/index-C8f2a.js<br />
              ...const Lq="<span style={{ background: T.warn, color: "#fff", padding: "0 4px" }}>sk-live-9f3a7c2e...</span>";fetch(`https://api.example.com/data?key=${"{"}Lq{"}"}`)...
            </div>
          )}
          {shown && <div className="note" style={{ marginTop: 8 }}>Thirty seconds. Then they run up your bill.</div>}
        </div>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>Browser to server to API</div>
          <div className="mono" style={{ fontSize: 14 }}>React  -&gt;  your Express server (holds the key)  -&gt;  real API</div>
        </div>
      </Col>
    </Slide>
  );
}

/* 10. Assignment */
function AssignmentSlide() {
  const setup = [
    { t: "Continue in Tuesday's recipe-finder project. No new scaffold today.", m: false },
    { t: "mkdir src/hooks   then create src/hooks/useFetch.js", m: true },
    { t: "Keep ?delay=2000 on the URL while building so loading states are visible", m: false },
    { t: "Test failure by changing the host to dummyjson.comx (network) and the path to /recipez (404)", m: false },
  ];
  const tiers = [
    { name: "Bronze", text: "Extract useFetch(url) into src/hooks/useFetch.js returning { data, loading, error }. RecipeList uses it. The component has no useEffect left." },
    { name: "Silver", text: "Error messages a human can act on, different for network failure vs 404 vs other. A Retry button that refetches. console.error keeps the real error." },
    { name: "Gold", text: "A RecipeSkeleton component shown on first load. During a search refetch, keep the old list on screen dimmed with an Updating tag instead of clearing it. Empty state with a suggestion." },
    { name: "Bonus", text: "useFetch takes { retries } and retries network failures with backoff, never 404s. A second hook useDebounce(value, ms) so search waits until typing stops. Detail panel via a second useFetch call." },
  ];
  return (
    <Slide kicker="Assignment: due before you leave" title="Harden Recipe Finder">
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Setup</h3>
        <Checklist items={setup} />
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>Before you code</div>
          <div>Unplug the wifi (or set the host to dummyjson.comx) and load your app. Write down exactly what the screen shows. That sentence is your Bronze-to-Silver gap.</div>
        </div>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.5 }}>Submit: push to GitHub Classroom and paste the link in Brightspace. Silver counts as complete. Next Thursday is P3 Studio, no class Tuesday (Monday schedule).</div>
      </Col>
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Milestones</h3>
        <Tiers tiers={tiers} />
      </Col>
    </Slide>
  );
}

/* 11. Close */
function CloseSlide() {
  const qs = [
    { q: "A custom hook is...", a: ["a component with no JSX", "a function starting with use that calls hooks", "shared global state"], c: 1 },
    { q: "Two components call useFetch(sameUrl). They...", a: ["share one data value", "each get their own data, loading, error", "cause a conflict"], c: 1 },
    { q: "Best loading UX for a search refetch when results are already on screen?", a: ["clear and show spinner", "keep old results dimmed", "show nothing"], c: 1 },
    { q: "Which should you retry automatically?", a: ["a 404", "a network failure", "both"], c: 1 },
    { q: "An API key in src/App.jsx is...", a: ["safe if not committed", "visible to anyone who opens DevTools", "safe with VITE_ prefix"], c: 1 },
  ];
  return (
    <Slide kicker="Close" title="Five checks before the week off" wide>
      <Quiz qs={qs} footer={<div><div style={{ fontSize: 21, fontWeight: 600, color: T.ink }}>Thu Oct 15: Project 3 studio. Then Express, and the key moves to the server.</div><div className="note">No class Tue Oct 13. Project 3 is due at the end of the studio.</div></div>} />
    </Slide>
  );
}

const SLIDES = [
  { el: <TitleSlide />, notes: "Quick. API Lab first, then the three chips. Say: Tuesday it worked, today we play with real APIs, then make it survive." },
  ...LAB_SLIDES,
  { el: <WarmupSlide />, notes: "Bridge from the hunt: real APIs fail. Vote by hand per message. The raw TypeError one gets laughs. The empty-state one is the trick: not an error, and it scores a 3. Land the rule: what happened, why, what next." },
  { el: <ErrorKindsSlide />, notes: "Click through all four. Spend the longest on 'right data, wrong shape' since it never hits catch. Two audiences, two messages: user gets state, you get console.error." },
  { el: <RetrySlide />, notes: "Set Failing, retries 2, Retry. Watch attempt climb to 3 then fail. Flip Healthy while it is retrying and it recovers. Ask: should a 404 retry? No." },
  { el: <LoadingSlide />, notes: "Set delay 2500. Click Refresh in each mode. Text jumps, skeleton holds shape, stale keeps the list. Ask which one they would want in their phone's food app." },
  { el: <RepetitionSlide />, notes: "Let them groan at the code. Ask what they did last week when JSX repeated: made a component. Same instinct. Define custom hook in one sentence." },
  { el: <ExtractSlide />, notes: "Live-code this in examples/recipe-finder, Stage6.jsx into hooks/useFetch.js. Four cuts, in order. Do not skip cut 2, the url parameter is the whole point." },
  { el: <LiveHookSlide />, notes: "Type, pick a recipe, set Failing, hit retry. Two useFetch calls, independent states. Ask: do they share data? No. Shares the recipe, not the cake." },
  { el: <KeysSlide />, notes: "Click Open DevTools. Then actually do it live on the real app: npm run build, open dist, grep for a string. Thirty seconds. This is why Project 4 exists." },
  { el: <AssignmentSlide />, notes: "Wifi-off test first, on paper. Start a 25 minute timer. Circulate for useEffect left inside components after extraction, and for retrying 404s." },
  { el: <CloseSlide />, notes: "Hands up per question. Q5 is the setup for Express. Remind: no class Tuesday, P3 Studio Thursday." },
];

export default function Deck() {
  return <DeckShell slides={SLIDES} />;
}
