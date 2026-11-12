import { useMemo, useState } from "react";
import { useStep } from "./ui.jsx";

/* -------------------------------------------------------------------
   Flow: who talks to whom. Arrows light up one build step at a time.
------------------------------------------------------------------- */

const ARROWS = [
  { d: "M 250 150 C 340 110, 390 70, 474 60", color: "var(--indigo)", label: "email + password", x: 268, y: 54 },
  { d: "M 480 86 C 400 110, 340 150, 256 176", color: "var(--teal)", label: "a token (the wristband)", x: 330, y: 150 },
  { d: "M 250 200 C 340 240, 390 270, 474 280", color: "var(--indigo)", label: "request + token", x: 262, y: 262 },
  { d: "M 605 226 L 605 96", color: "var(--amber)", label: "whose token is this?", x: 622, y: 136 },
  { d: "M 730 286 L 934 286", color: "var(--amber)", label: "save it with the user's id", x: 738, y: 303 },
];

export function Flow() {
  const { step } = useStep();
  return (
    <div className="flow">
      <svg viewBox="0 0 1192 340" preserveAspectRatio="none">
        <defs>
          {ARROWS.map((a, i) => (
            <marker key={i} id={`head${i}`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
              <path d="M0,0 L9,4.5 L0,9 z" fill={a.color} />
            </marker>
          ))}
        </defs>
        {ARROWS.map((a, i) => (
          <path key={i} d={a.d} className={`flow-arrow ${step >= i + 1 ? "on" : ""}`} stroke={a.color} markerEnd={`url(#head${i})`} />
        ))}
      </svg>
      <div className="flow-box react"><h3>React site</h3><p>recipe-web, in the browser</p></div>
      <div className="flow-box supa"><h3>Supabase Auth</h3><p>keeps the accounts and checks passwords</p></div>
      <div className="flow-box api"><h3>Our API</h3><p>recipe-api, Express</p></div>
      <div className="flow-box db"><h3>Database</h3><p>recipes table</p></div>
      {ARROWS.map((a, i) => (
        <div key={i} className={`flow-label ${step >= i + 1 ? "on" : ""}`} style={{ left: a.x, top: a.y }}>
          <b>{i + 1}</b>{a.label}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------
   JWT decoder. Runs entirely in this page. Nothing is sent anywhere.
------------------------------------------------------------------- */

const b64url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function sampleToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", typ: "JWT" };
  const payload = {
    sub: "8f14e45f-ceea-467f-a0e6-3c1b2d9f0a11",
    email: "ana@example.com",
    role: "authenticated",
    iat: now - 300,
    exp: now + 3300,
  };
  return `${b64url(header)}.${b64url(payload)}.c2lnbmF0dXJlLW1hZGUtYnktc3VwYWJhc2Utbm90LWJ5LXVz`;
}

function decodePart(part) {
  const pad = part.replace(/-/g, "+").replace(/_/g, "/");
  const text = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  return JSON.parse(decodeURIComponent(escape(text)));
}

export function JwtDecoder() {
  const sample = useMemo(sampleToken, []);
  const [token, setToken] = useState(sample);
  const parts = token.trim().split(".");
  let header = null;
  let payload = null;
  let problem = null;
  if (parts.length !== 3) problem = "A token has three parts with dots between them: header.payload.signature";
  else {
    try { header = decodePart(parts[0]); payload = decodePart(parts[1]); }
    catch { problem = "That does not decode. Copy the whole access_token, with no quotes around it."; }
  }
  const exp = payload?.exp ? new Date(payload.exp * 1000) : null;
  const minsLeft = exp ? Math.round((exp.getTime() - Date.now()) / 60000) : null;

  return (
    <div className="jwt" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <textarea value={token} onChange={(e) => setToken(e.target.value)} spellCheck={false} aria-label="token" />
        <div className="jwt-btns">
          <button className="btn" onClick={() => setToken(sample)}>Use the sample token</button>
          <button className="btn" onClick={() => setToken("")}>Clear (paste yours)</button>
        </div>
        {parts.length === 3 && (
          <div className="jwt-parts">
            <span className="jwt-h">{parts[0]}</span>.<span className="jwt-p">{parts[1]}</span>.<span className="jwt-s">{parts[2]}</span>
          </div>
        )}
        <div className="jwt-facts">
          {problem && <span style={{ color: "var(--red)" }}>{problem}</span>}
          {!problem && (
            <>
              <div>User id (<b>sub</b>): <code className="ic" style={{ whiteSpace: "normal" }}>{String(payload.sub ?? "none")}</code></div>
              {exp && <div>Expires (<b>exp</b>): {exp.toLocaleTimeString()} ({minsLeft >= 0 ? `in ${minsLeft} min` : `${-minsLeft} min ago`})</div>}
            </>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="jwt-card">
          <h4 style={{ background: "var(--red)" }}>Header</h4>
          <pre>{header ? JSON.stringify(header, null, 2) : "..."}</pre>
        </div>
        <div className="jwt-card">
          <h4 style={{ background: "var(--indigo)" }}>Payload: readable by anyone</h4>
          <pre>{payload ? JSON.stringify(payload, null, 2) : "..."}</pre>
        </div>
        <div className="jwt-card">
          <h4 style={{ background: "var(--teal)" }}>Signature: only Supabase can make it</h4>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------
   Request simulator: the same logic as middleware/require-auth.js
   plus the Part 4 ownership check. Recipe 3 belongs to Ana.
------------------------------------------------------------------- */

const ROUTES = [
  { id: "get", label: "GET /api/recipes", auth: false },
  { id: "post", label: "POST /api/recipes", auth: true },
  { id: "delete", label: "DELETE /api/recipes/3", auth: true },
];
const TOKENS = [
  { id: "none", label: "No token" },
  { id: "fake", label: "A made-up token" },
  { id: "ana", label: "Ana's real token" },
  { id: "ben", label: "Ben's real token" },
];

function answer(route, token) {
  if (!route.auth) return { status: 200, body: '[ { "id": 3, "name": "Pad Thai" }, ... ]', why: "No bouncer on this route. Anyone can read recipes." };
  if (token === "none") return { status: 401, body: '{ "error": "Log in first" }', why: "The bouncer found no Authorization header and stopped the request. The route never ran." };
  if (token === "fake") return { status: 401, body: '{ "error": "Invalid or expired token" }', why: "The bouncer asked Supabase about the token. Supabase did not recognize it." };
  const who = token === "ana" ? "Ana" : "Ben";
  if (route.id === "post") return { status: 201, body: `{ "id": 9, "name": "Tacos", "user_id": "${who.toLowerCase()}-id" }`, why: `Supabase said the token is ${who}'s. The route ran and saved the recipe with ${who}'s id.` };
  if (who === "Ana") return { status: 204, body: "(no content)", why: "Recipe 3 is Ana's and the token is Ana's. Deleted." };
  return { status: 404, body: '{ "error": "Recipe not found" }', why: "Ben is logged in, but recipe 3 is Ana's. The delete matched zero rows. (Part 4)" };
}

export function RequestSim() {
  const [route, setRoute] = useState("post");
  const [token, setToken] = useState("none");
  const [sent, setSent] = useState(false);
  const r = ROUTES.find((x) => x.id === route);
  const a = answer(r, token);
  const pick = (setter) => (id) => { setter(id); setSent(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="sim-row">
        <span className="sim-label">Request</span>
        {ROUTES.map((x) => (
          <button key={x.id} className={`btn ${route === x.id ? "on" : ""}`} onClick={() => pick(setRoute)(x.id)}>{x.label}</button>
        ))}
      </div>
      <div className="sim-row">
        <span className="sim-label">Sent with</span>
        {TOKENS.map((x) => (
          <button key={x.id} className={`btn ${token === x.id ? "on" : ""}`} onClick={() => pick(setToken)(x.id)}>{x.label}</button>
        ))}
      </div>
      <div className="sim-row">
        <span className="sim-label" />
        <button className="btn go" onClick={() => setSent(true)}>Send it</button>
        {!sent && <span className="muted" style={{ fontSize: 18 }}>Say your prediction out loud first: which status code?</span>}
      </div>
      <div className="sim-out">
        {!sent && <span style={{ color: "#8b97aa" }}>{`> ${r.label}\n> Authorization: ${token === "none" ? "(not sent)" : "Bearer ..."}\n\nwaiting for your prediction`}</span>}
        {sent && (
          <>
            <span className={`sim-status ${a.status < 400 ? "ok" : "no"}`}>{a.status}</span>
            {"\n"}{a.body}
          </>
        )}
      </div>
      {sent && <div className="sim-why"><b>Why:</b> {a.why}</div>}
    </div>
  );
}
