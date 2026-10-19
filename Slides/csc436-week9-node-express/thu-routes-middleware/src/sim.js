/* ------------------------------------------------------------------
   A tiny Express look-alike that runs in the browser, so slides can
   "send requests" to a real-feeling server with no network.

   Same shape as Express on purpose:
     const app = createApp();
     app.use(fn);  app.get(path, ...fns);  app.post(...)  app.patch(...)  app.delete(...)
     handler(req, res, next)   error handler(err, req, res, next)
     res.status(201).json(obj)  res.send(text)  res.end()
   Extra: every request returns a trace of which stations it visited.
------------------------------------------------------------------- */

export const SEED = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25, tags: ["vegetarian", "oven"] },
  { id: 2, name: "Chicken Tikka Masala", cuisine: "Indian", minutes: 50, tags: ["spicy", "dinner"] },
  { id: 3, name: "Pad Thai", cuisine: "Thai", minutes: 30, tags: ["noodles", "dinner"] },
  { id: 4, name: "Avocado Toast", cuisine: "American", minutes: 10, tags: ["vegetarian", "breakfast"] },
  { id: 5, name: "Beef Tacos", cuisine: "Mexican", minutes: 20, tags: ["quick", "dinner"] },
  { id: 6, name: "Shakshuka", cuisine: "Middle Eastern", minutes: 35, tags: ["vegetarian", "breakfast"] },
];

export const clone = (x) => JSON.parse(JSON.stringify(x));

function compile(path) {
  const keys = [];
  const src = path
    .replace(/\/$/, "")
    .replace(/[.+*?^${}()|[\]\\]/g, "\\$&")
    .replace(/:([A-Za-z_]\w*)/g, (_, k) => { keys.push(k); return "([^/]+)"; });
  return { re: new RegExp(`^${src || ""}/?$`), keys };
}

export const STATUS_TEXT = {
  200: "OK", 201: "Created", 204: "No Content", 304: "Not Modified", 400: "Bad Request",
  401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 500: "Internal Server Error",
};

export function createApp() {
  const stack = [];
  const add = (method, path, fns, name) => {
    fns.forEach((fn, k) => {
      stack.push({
        method, path, fn,
        match: path ? compile(path) : null,
        name: fn.label || name || (method ? `${method} ${path}${fns.length > 1 && k < fns.length - 1 ? ` (${fn.name || "middleware"})` : ""}` : fn.name || "middleware"),
        isError: fn.length === 4,
        route: !!method,
      });
    });
  };
  const app = {
    stack,
    use(a, ...rest) { if (typeof a === "string") add(null, a, rest, a); else add(null, null, [a, ...rest]); return app; },
    get(p, ...f) { add("GET", p, f); return app; },
    post(p, ...f) { add("POST", p, f); return app; },
    put(p, ...f) { add("PUT", p, f); return app; },
    patch(p, ...f) { add("PATCH", p, f); return app; },
    delete(p, ...f) { add("DELETE", p, f); return app; },
    handle(reqIn) { return run(stack, reqIn); },
  };
  return app;
}

function run(stack, { method = "GET", url = "/", body, contentType }) {
  const [pathname, qs = ""] = url.split("?");
  const query = Object.fromEntries(new URLSearchParams(qs));
  const trace = [];
  const logs = [];
  const req = { method, path: pathname, originalUrl: url, query, params: {}, body: undefined, headers: {}, _raw: body, _ct: contentType };
  if (contentType) req.headers["content-type"] = contentType;

  const out = { status: 200, body: undefined, type: null, sent: false, headers: {} };
  const res = {
    statusCode: 200,
    get headersSent() { return out.sent; },
    status(c) { out.status = c; res.statusCode = c; return res; },
    set(k, v) { out.headers[k] = v; return res; },
    json(v) { if (out.sent) throw new Error("Cannot set headers after they are sent to the client"); out.body = v; out.type = "json"; out.sent = true; out.headers["Content-Type"] = "application/json"; return res; },
    send(v) { if (out.sent) throw new Error("Cannot set headers after they are sent to the client"); out.body = v; out.type = typeof v === "string" ? "text" : "json"; out.sent = true; out.headers["Content-Type"] = typeof v === "string" ? "text/html" : "application/json"; return res; },
    end() { if (out.sent) throw new Error("Cannot set headers after they are sent to the client"); out.body = ""; out.type = "empty"; out.sent = true; return res; },
  };
  const origLog = console.log;

  let idx = 0;
  let err = null;
  let hung = false;
  let guard = 0;

  while (idx < stack.length && !out.sent && guard++ < 200) {
    const layer = stack[idx++];
    // match?
    if (layer.method && layer.method !== method) { trace.push({ name: layer.name, outcome: "skip", why: "different method" }); continue; }
    if (layer.match) {
      const m = pathname.match(layer.match.re);
      const prefixOk = !layer.method && (pathname === layer.path || pathname.startsWith(layer.path + "/"));
      if (!m && !prefixOk) { trace.push({ name: layer.name, outcome: "skip", why: "path does not match" }); continue; }
      if (m) layer.match.keys.forEach((k, j) => { req.params[k] = decodeURIComponent(m[j + 1]); });
    }
    if (err && !layer.isError) { trace.push({ name: layer.name, outcome: "skip", why: "an error is in flight" }); continue; }
    if (!err && layer.isError) { trace.push({ name: layer.name, outcome: "skip", why: "no error" }); continue; }

    let called = false;
    const next = (e) => { called = true; if (e) err = e; };
    try {
      console.log = (...a) => logs.push(a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" "));
      if (layer.isError) { const e = err; err = null; layer.fn(e, req, res, next); }
      else layer.fn(req, res, next);
    } catch (e) {
      err = e;
      called = true;
      trace.push({ name: layer.name, outcome: "threw", why: e.message });
      console.log = origLog;
      continue;
    } finally {
      console.log = origLog;
    }
    if (out.sent) { trace.push({ name: layer.name, outcome: "sent" }); break; }
    if (called) { trace.push({ name: layer.name, outcome: "next" }); continue; }
    trace.push({ name: layer.name, outcome: "hung", why: "never called next() and never sent a response" });
    hung = true;
    break;
  }

  if (!out.sent && !hung) {
    if (err) {
      out.status = 500; out.type = "html"; out.sent = true; out.headers["Content-Type"] = "text/html";
      out.body = `<!DOCTYPE html>\n<html><body><pre>Error: ${err.message}\n    at Layer.handle (node_modules/express/lib/router/layer.js:152:17)\n    at next (node_modules/express/lib/router/route.js:157:13)\n    ...</pre></body></html>`;
      trace.push({ name: "Express default", outcome: "sent", why: "nobody handled the error, so Express sent its HTML stack trace" });
    } else {
      out.status = 404; out.type = "html"; out.sent = true; out.headers["Content-Type"] = "text/html";
      out.body = `<!DOCTYPE html>\n<html><body><pre>Cannot ${method} ${pathname}</pre></body></html>`;
      trace.push({ name: "Express default", outcome: "sent", why: "no route matched, so Express sent its HTML 404" });
    }
  }

  return { status: out.status, body: out.body, type: out.type, hung, trace, logs, req: { params: req.params, query: req.query, body: req.body }, headers: out.headers };
}

/* express.json() look-alike */
export function jsonParser() {
  const fn = function (req, res, next) {
    if (req._raw !== undefined && (req._ct || "").includes("application/json")) {
      try { req.body = JSON.parse(req._raw); }
      catch { const e = new Error("Unexpected token in JSON"); e.status = 400; e.type = "entity.parse.failed"; return next(e); }
    }
    next();
  };
  fn.label = "express.json()";
  return fn;
}

export function pretty(v) {
  if (v === undefined) return "undefined";
  if (typeof v === "string") return v;
  return JSON.stringify(v, null, 2);
}
