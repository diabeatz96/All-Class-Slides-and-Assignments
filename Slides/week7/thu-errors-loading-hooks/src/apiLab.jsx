import { useState } from "react";
import { T } from "./ui.jsx";

/* ------------------------------------------------------------------
   API Lab helpers. These slides hit REAL public APIs (PokéAPI,
   Deck of Cards, DummyJSON). If the classroom wifi dies, flip the
   "Backup data" switch and labFetch answers from the fixtures below
   with the same shapes, so every demo still runs.
------------------------------------------------------------------- */

export const lab = { backup: false };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Same shape as fetch. Live mode is literally fetch. */
export async function labFetch(url) {
  if (!lab.backup) return fetch(url);
  const delay = Number((url.match(/[?&]delay=(\d+)/) || [])[1] || 250 + Math.random() * 350);
  await sleep(delay);
  const hit = backupFor(url);
  if (hit === "CORS") throw new TypeError("Failed to fetch");
  const { status = 200, body } = hit;
  const text = JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => JSON.parse(text),
    text: async () => text,
  };
}

export const kb = (n) => (n / 1024).toFixed(n < 10240 ? 1 : 0) + " KB";
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* Wifi switch strip, same idea as NetControls */
export function LabControls({ extra }) {
  const [, force] = useState(0);
  return (
    <div className="panel" style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 14px" }}>
      <span className="note">Data source</span>
      <button className={"tab" + (!lab.backup ? " on" : "")} onClick={() => { lab.backup = false; force((x) => x + 1); }}>Live API</button>
      <button className={"tab" + (lab.backup ? " on" : "")} style={lab.backup ? { borderColor: T.warn, color: T.warn } : {}} onClick={() => { lab.backup = true; force((x) => x + 1); }}>Backup data</button>
      <span className="note" style={{ marginLeft: "auto", fontSize: 12 }}>{lab.backup ? "Wifi down? Fixtures with the same JSON shape." : "Real requests. Open the Network tab."}</span>
      {extra}
    </div>
  );
}

/* ------------------------------ visuals ---------------------------- */
export const TYPE_COLORS = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#E0B000", grass: "#7AC74C", ice: "#66C6C2",
  fighting: "#C22E28", poison: "#A33EA1", ground: "#C9A23F", flying: "#8F7FD8", psychic: "#F95587", bug: "#8FA01B",
  rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746", steel: "#8E8EA8", fairy: "#D685AD",
};

export function TypeChip({ type }) {
  return <span className="chip" style={{ background: TYPE_COLORS[type] || T.muted, color: "#fff", textTransform: "capitalize" }}>{type}</span>;
}

const SUIT = { SPADES: "♠", HEARTS: "♥", DIAMONDS: "♦", CLUBS: "♣" };
export function PlayingCard({ card, dim }) {
  const [broken, setBroken] = useState(false);
  const box = { width: 112, height: 156, borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,.12)", opacity: dim ? 0.45 : 1, transition: "opacity 200ms" };
  if (!card) return <div style={{ ...box, background: `repeating-linear-gradient(45deg, ${T.blue}, ${T.blue} 8px, #3B76F6 8px, #3B76F6 16px)`, border: "4px solid #fff" }} />;
  if (card.image && !broken) return <img src={card.image} alt={`${card.value} of ${card.suit}`} onError={() => setBroken(true)} style={box} />;
  const red = card.suit === "HEARTS" || card.suit === "DIAMONDS";
  return (
    <div style={{ ...box, background: "#fff", border: `1px solid ${T.line}`, color: red ? "#C81E1E" : T.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
      <div style={{ fontSize: 30 }}>{card.code ? card.code.replace(/[SHDC]$/, "").replace("0", "10") : card.value}</div>
      <div style={{ fontSize: 40 }}>{SUIT[card.suit]}</div>
    </div>
  );
}

export function ProductThumb({ p, size = 84 }) {
  const [broken, setBroken] = useState(false);
  const box = { width: size, height: size, borderRadius: 10, background: T.bg, border: `1px solid ${T.line}`, objectFit: "contain", flexShrink: 0 };
  if (p.thumbnail && !broken) return <img src={p.thumbnail} alt={p.title} onError={() => setBroken(true)} style={box} />;
  return <div style={{ ...box, display: "grid", placeItems: "center", fontWeight: 700, color: T.muted, fontSize: 20 }}>{p.title.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>;
}

/* --------------------------- JSON explorer ------------------------- */
const IDENT = /^[A-Za-z_$][\w$]*$/;
export const joinPath = (base, key) => (typeof key === "number" ? `${base}[${key}]` : IDENT.test(key) ? `${base}.${key}` : `${base}["${key}"]`);

function Leaf({ v }) {
  if (v === null) return <span style={{ color: "#9CA3AF" }}>null</span>;
  if (typeof v === "string") return <span style={{ color: "#FCD34D" }}>"{v.length > 48 ? v.slice(0, 46) + "..." : v}"</span>;
  return <span style={{ color: "#FDBA74" }}>{String(v)}</span>;
}

function Node({ k, v, path, depth, onPick, picked }) {
  const isObj = v !== null && typeof v === "object";
  const [open, setOpen] = useState(depth === 0);
  const [all, setAll] = useState(depth === 0);
  const label = k === undefined ? "data" : typeof k === "number" ? `[${k}]` : k;
  const on = picked === path;
  const rowStyle = { paddingLeft: depth * 16, cursor: "pointer", borderRadius: 4, background: on ? "rgba(14,159,110,.35)" : "transparent", whiteSpace: "nowrap" };
  if (!isObj) {
    return (
      <div style={rowStyle} onClick={() => onPick(path, v)}>
        <span style={{ color: "#93C5FD" }}>{label}</span>: <Leaf v={v} />
      </div>
    );
  }
  const entries = Array.isArray(v) ? v.map((x, i) => [i, x]) : Object.entries(v);
  const shown = all ? entries : entries.slice(0, 6);
  const summary = Array.isArray(v) ? `[ ${v.length} items ]` : `{ ${entries.length} keys }`;
  return (
    <div>
      <div style={rowStyle} onClick={() => { setOpen(!open); onPick(path, v); }}>
        <span style={{ color: "#9CA3AF", display: "inline-block", width: 12 }}>{open ? "▾" : "▸"}</span>
        <span style={{ color: "#93C5FD" }}>{label}</span> <span style={{ color: "#9CA3AF" }}>{summary}</span>
      </div>
      {open && shown.map(([ck, cv]) => <Node key={ck} k={ck} v={cv} path={joinPath(path, ck)} depth={depth + 1} onPick={onPick} picked={picked} />)}
      {open && !all && entries.length > 6 && (
        <div style={{ paddingLeft: (depth + 1) * 16 + 12, color: "#A7F3D0", cursor: "pointer" }} onClick={() => setAll(true)}>+ {entries.length - 6} more</div>
      )}
    </div>
  );
}

export function JsonTree({ data, onPick, picked }) {
  return (
    <div className="mono" style={{ background: T.codeBg, color: "#E5E7EB", borderRadius: 12, padding: "14px 16px", fontSize: 13.5, lineHeight: 1.7, overflow: "auto", minHeight: 0, flex: 1 }}>
      <Node v={data} path="data" depth={0} onPick={onPick} picked={picked} />
    </div>
  );
}

/* ------------------------------ fixtures --------------------------- */
const ART = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const STAT_NAMES = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
function mon(id, name, types, stats, height, weight, abilities) {
  return {
    id, name, base_experience: 112 + id, height, weight, is_default: true, order: id,
    abilities: abilities.map((a, i) => ({ ability: { name: a, url: "https://pokeapi.co/api/v2/ability/" }, is_hidden: i > 0, slot: i + 1 })),
    cries: { latest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`, legacy: null },
    moves: ["mega-punch", "pay-day", "thunder-punch", "slam", "double-kick", "headbutt", "body-slam", "take-down"].map((m) => ({ move: { name: m, url: "https://pokeapi.co/api/v2/move/" } })),
    species: { name, url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
    sprites: {
      front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      back_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`,
      front_shiny: null,
      other: { "official-artwork": { front_default: ART(id), front_shiny: null }, showdown: { front_default: null } },
    },
    stats: stats.map((s, i) => ({ base_stat: s, effort: 0, stat: { name: STAT_NAMES[i], url: "https://pokeapi.co/api/v2/stat/" } })),
    types: types.map((t, i) => ({ slot: i + 1, type: { name: t, url: "https://pokeapi.co/api/v2/type/" } })),
  };
}
const MONS = [
  mon(25, "pikachu", ["electric"], [35, 55, 40, 50, 50, 90], 4, 60, ["static", "lightning-rod"]),
  mon(6, "charizard", ["fire", "flying"], [78, 84, 78, 109, 85, 100], 17, 905, ["blaze", "solar-power"]),
  mon(143, "snorlax", ["normal"], [160, 110, 65, 65, 110, 30], 21, 4600, ["immunity", "thick-fat"]),
  mon(94, "gengar", ["ghost", "poison"], [60, 65, 60, 130, 75, 110], 15, 405, ["cursed-body"]),
  mon(150, "mewtwo", ["psychic"], [106, 110, 90, 154, 90, 130], 20, 1220, ["pressure", "unnerve"]),
];

const VALUES = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];
const decks = {};
function freshDeck() {
  const cards = [];
  for (const suit of ["SPADES", "HEARTS", "DIAMONDS", "CLUBS"]) for (const value of VALUES) {
    const code = (value === "10" ? "0" : value[0]) + suit[0];
    cards.push({ code, image: null, value, suit });
  }
  return cards.sort(() => Math.random() - 0.5);
}

const PRODUCTS = {
  tops: ["Cropped Denim Jacket", "Oversized Graphic Tee", "Ribbed Knit Top"],
  "mens-shirts": ["Blue & Black Check Shirt", "Linen Camp Collar Shirt", "Classic Oxford Shirt"],
  "womens-dresses": ["Corset Leather Dress", "Floral Midi Dress", "Black Slip Dress"],
  "womens-shoes": ["Chunky Platform Sneakers", "Pointed Toe Heels", "Strappy Sandals"],
  "mens-shoes": ["Retro High Tops", "Suede Chelsea Boots", "Running Trainers"],
  sunglasses: ["Black Square Shades", "Green Aviators", "Round Tortoise Frames"],
  "womens-bags": ["Mini Shoulder Bag", "Canvas Tote", "Quilted Crossbody"],
  "mens-watches": ["Steel Dive Watch", "Leather Strap Chrono", "Minimal Mesh Watch"],
  "womens-jewellery": ["Gold Hoop Earrings", "Pearl Pendant", "Stacked Rings"],
  "womens-watches": ["Rose Gold Watch", "Square Face Watch", "Bangle Watch"],
};

function backupFor(url) {
  const u = new URL(url);
  // PokéAPI
  let m = u.pathname.match(/\/api\/v2\/pokemon\/([^/]+)/);
  if (u.host === "pokeapi.co" && m) {
    const key = decodeURIComponent(m[1]).toLowerCase();
    const found = MONS.find((p) => p.name === key || String(p.id) === key) || (/^\d+$/.test(key) ? MONS[Number(key) % MONS.length] : null);
    return found ? { body: found } : { status: 404, body: "Not Found" };
  }
  // Deck of Cards
  if (u.host === "deckofcardsapi.com") {
    m = u.pathname.match(/\/api\/deck\/([^/]+)\/(shuffle|draw)?/);
    let id = m[1];
    if (id === "new") { id = Math.random().toString(36).slice(2, 14); decks[id] = freshDeck(); }
    if (!decks[id]) return { status: 404, body: { success: false, error: "Deck ID does not exist." } };
    if (m[2] === "draw") {
      const count = Number(u.searchParams.get("count") || 1);
      const cards = decks[id].splice(0, count);
      return { body: { success: true, deck_id: id, cards, remaining: decks[id].length } };
    }
    return { body: { success: true, deck_id: id, remaining: decks[id].length, shuffled: true } };
  }
  // DummyJSON fashion
  m = u.pathname.match(/\/products\/category\/([^/]+)/);
  if (u.host === "dummyjson.com" && m) {
    const names = PRODUCTS[m[1]] || [];
    const products = names.map((title, i) => ({ id: i + 1, title, brand: "Backup Co", price: Math.round(19 + Math.random() * 80) + 0.99, thumbnail: null, rating: 4.2 }));
    const limit = Number(u.searchParams.get("limit") || products.length);
    return { body: { products: products.slice(0, limit), total: products.length, skip: 0, limit } };
  }
  // API tryouts
  if (u.host === "opentdb.com") return { body: { response_code: 0, results: [{ category: "Entertainment: Video Games", question: "Which Pokémon is #25?", correct_answer: "Pikachu", incorrect_answers: ["Eevee", "Jigglypuff", "Meowth"] }] } };
  // RAWG's 401 and Steam's 200 both lack a CORS header, so the browser only sees TypeError
  if (u.host === "api.rawg.io" || u.host === "store.steampowered.com") return "CORS";
  return { status: 404, body: { message: "Not in backup data" } };
}
