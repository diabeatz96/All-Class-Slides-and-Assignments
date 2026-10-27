/* ------------------------------------------------------------------
   A tiny in-browser stand-in for our Supabase "recipes" table.
   Slides only. It copies the real rules and the REAL Postgres error
   messages (checked against Postgres), so what students see here is
   what they will see in their terminal.
------------------------------------------------------------------- */

export const COLUMNS = [
  { name: "id", type: "bigint", rule: "generated always as identity, primary key", js: "number", note: "A whole number the database picks: 1, 2, 3... You never send it. Primary key means no two rows share it." },
  { name: "name", type: "text", rule: "not null", js: "string", note: "Text of any length. not null means required: a row without a name is refused." },
  { name: "cuisine", type: "text", rule: "not null", js: "string", note: "Text, required." },
  { name: "minutes", type: "integer", rule: "not null, check (minutes > 0)", js: "number", note: "A whole number, required, and the check rule says it must be above 0." },
  { name: "tags", type: "text[]", rule: "not null, default '{}'", js: "string[]", note: "text[] means a list of text. If you do not send tags, the default is an empty list." },
  { name: "created_at", type: "timestamptz", rule: "not null, default now()", js: "string", note: "A date and time with time zone. default now() fills it in the moment the row is saved." },
];

const AT = "2026-10-27T16:05:00+00:00";
export const SEED = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25, tags: ["vegetarian", "oven"], created_at: AT },
  { id: 2, name: "Chicken Tikka Masala", cuisine: "Indian", minutes: 50, tags: ["spicy", "dinner"], created_at: AT },
  { id: 3, name: "Pad Thai", cuisine: "Thai", minutes: 30, tags: ["noodles", "dinner"], created_at: AT },
  { id: 4, name: "Avocado Toast", cuisine: "American", minutes: 10, tags: ["vegetarian", "breakfast"], created_at: AT },
  { id: 5, name: "Beef Tacos", cuisine: "Mexican", minutes: 20, tags: ["quick", "dinner"], created_at: AT },
  { id: 6, name: "Shakshuka", cuisine: "Middle Eastern", minutes: 35, tags: ["vegetarian", "breakfast"], created_at: AT },
  { id: 7, name: "Miso Ramen", cuisine: "Japanese", minutes: 45, tags: ["noodles", "dinner"], created_at: AT },
  { id: 8, name: "Greek Salad", cuisine: "Greek", minutes: 15, tags: ["vegetarian", "quick"], created_at: AT },
];

export const clone = (x) => JSON.parse(JSON.stringify(x));
export const pretty = (x) => JSON.stringify(x, null, 2);

const err = (code, message, details = null, hint = null) => ({ code, details, hint, message });

/* ---------- INSERT with Postgres rules ---------- */

export function tryInsert(rows, body, nextId) {
  const known = COLUMNS.map((c) => c.name);
  for (const k of Object.keys(body)) {
    if (!known.includes(k)) return { error: err("PGRST204", `Could not find the '${k}' column of 'recipes' in the schema cache`) };
  }
  if ("id" in body) {
    return { error: err("428C9", 'cannot insert a non-DEFAULT value into column "id"', 'Column "id" is an identity column defined as GENERATED ALWAYS.', "Use OVERRIDING SYSTEM VALUE to override.") };
  }
  const row = { id: nextId };
  for (const k of ["name", "cuisine"]) {
    const v = body[k];
    row[k] = v === undefined || v === null ? null : String(v);
  }
  // minutes: integer
  let m = body.minutes;
  if (m === undefined || m === null) m = null;
  else if (typeof m === "number") {
    if (!Number.isInteger(m)) return { error: err("22P02", `invalid input syntax for type integer: "${m}"`) };
  } else if (typeof m === "string") {
    if (!/^\s*-?\d+\s*$/.test(m)) return { error: err("22P02", `invalid input syntax for type integer: "${m}"`) };
    m = parseInt(m, 10);
  } else return { error: err("22P02", `invalid input syntax for type integer: "${JSON.stringify(m)}"`) };
  row.minutes = m;
  // tags: text[]
  let t = body.tags;
  if (t === undefined) t = [];
  else if (t === null) t = null;
  else if (!Array.isArray(t)) return { error: err("22P02", `malformed array literal: "${t}"`) };
  row.tags = t;
  row.created_at = new Date().toISOString().replace(/\.\d+Z$/, "+00:00");
  const fail = (col) => err("23502", `null value in column "${col}" of relation "recipes" violates not-null constraint`, `Failing row contains (${nextId}, ${row.name ?? "null"}, ${row.cuisine ?? "null"}, ${row.minutes ?? "null"}, ...).`);
  for (const col of ["name", "cuisine", "minutes", "tags"]) if (row[col] === null) return { error: fail(col) };
  if (row.minutes <= 0) {
    return { error: err("23514", 'new row for relation "recipes" violates check constraint "recipes_minutes_check"', `Failing row contains (${nextId}, ${row.name}, ${row.cuisine}, ${row.minutes}, ...).`) };
  }
  return { row: { id: row.id, name: row.name, cuisine: row.cuisine, minutes: row.minutes, tags: row.tags, created_at: row.created_at } };
}

/* ---------- SELECT with the query builder pieces we use ---------- */

const likeToRegex = (p) => new RegExp("^" + p.split("%").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$", "i");

/**
 * spec: { filters: [{ op: "eq"|"ilike"|"lte"|"contains", col, val }], order: "id"|null, mode: "list"|"maybeSingle", table: "recipes" }
 * returns { data, error }
 */
export function runSelect(rows, spec) {
  if (spec.table && spec.table !== "recipes") {
    return { data: null, error: err("PGRST205", `Could not find the table 'public.${spec.table}' in the schema cache`, null, "Perhaps you meant the table 'public.recipes'") };
  }
  let out = rows.slice();
  for (const f of spec.filters || []) {
    if (f.op === "eq" && f.col === "id") {
      const s = String(f.val);
      if (!/^\s*-?\d+\s*$/.test(s)) return { data: null, error: err("22P02", `invalid input syntax for type bigint: "${s}"`) };
      out = out.filter((r) => r.id === Number(s));
    } else if (f.op === "eq") out = out.filter((r) => String(r[f.col]) === String(f.val));
    else if (f.op === "ilike") { const re = likeToRegex(String(f.val)); out = out.filter((r) => re.test(r[f.col])); }
    else if (f.op === "lte") out = out.filter((r) => r[f.col] <= Number(f.val));
    else if (f.op === "contains") out = out.filter((r) => f.val.every((v) => r[f.col].includes(v)));
  }
  if (spec.order) out.sort((a, b) => (a[spec.order] > b[spec.order] ? 1 : -1));
  if (spec.mode === "maybeSingle") return { data: out.length === 1 ? out[0] : null, error: null };
  return { data: out, error: null };
}

/* ---------- Pretty-printers for the builder slide ---------- */

const sqlVal = (v) => (typeof v === "number" ? String(v) : `'${v}'`);

export function toSql(spec) {
  const where = (spec.filters || []).map((f) => {
    if (f.op === "eq") return `${f.col} = ${sqlVal(f.val)}`;
    if (f.op === "ilike") return `${f.col} ilike ${sqlVal(f.val)}`;
    if (f.op === "lte") return `${f.col} <= ${f.val}`;
    if (f.op === "contains") return `${f.col} @> array[${f.val.map((v) => `'${v}'`).join(", ")}]`;
    return "";
  });
  let s = "select * from recipes";
  if (where.length) s += "\nwhere " + where.join("\n  and ");
  if (spec.order) s += `\norder by ${spec.order}`;
  return s + ";";
}

export function toUrl(spec) {
  const parts = ["select=*"];
  for (const f of spec.filters || []) {
    if (f.op === "contains") parts.push(`${f.col}=cs.{${f.val.join(",")}}`);
    else parts.push(`${f.col}=${f.op}.${f.val}`);
  }
  if (spec.order) parts.push(`order=${spec.order}.asc`);
  return "GET /rest/v1/recipes?" + parts.join("&");
}
