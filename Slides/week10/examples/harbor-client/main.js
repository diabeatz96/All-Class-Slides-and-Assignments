// Harbor Client: every button is a plain fetch() from THIS page's origin.
// Open DevTools (F12): the Console tab shows the browser's CORS messages,
// and the Network tab shows every request, including OPTIONS preflights.

const out = document.querySelector("#out");
const baseInput = document.querySelector("#base");
document.querySelector("#origin").textContent = window.location.origin;

// Remember the API URL in this browser (it may be unavailable; that is fine).
function loadBase() {
  try {
    return window.localStorage.getItem("harbor-base") || "http://localhost:3000";
  } catch {
    return "http://localhost:3000";
  }
}
function saveBase(value) {
  try {
    window.localStorage.setItem("harbor-base", value);
  } catch {
    /* not saved, still used for this visit */
  }
}
baseInput.value = loadBase();
document.querySelector("#save").addEventListener("click", () => {
  baseInput.value = baseInput.value.trim();
  saveBase(baseInput.value);
  show("Saved. Requests now go to " + baseInput.value, "ok");
});

let lastCreatedId = null;

function show(text, kind = "") {
  out.className = kind;
  out.textContent = text;
}

async function send(method, path, body) {
  const url = baseInput.value.trim() + path;
  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json"; // this header is why POST gets a preflight
    options.body = JSON.stringify(body);
  }
  show(`${method} ${url}\nwaiting...`);
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = text;
    try {
      data = text ? JSON.parse(text) : "(empty body)";
    } catch {
      /* not JSON, show the raw text */
    }
    show(`${method} ${url}\nstatus ${res.status}\n\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}`, res.ok ? "ok" : "bad");
    return data;
  } catch (err) {
    // fetch() throws a plain TypeError for CORS blocks AND for "server is down".
    // On purpose, the page is NOT told which one. The Console tab knows.
    show(
      `${method} ${url}\n\n${err.name}: ${err.message}\n\n` +
        "This page was not allowed to see a response.\n" +
        "Either the server is not running, or the browser blocked the answer (CORS).\n" +
        "Open DevTools, Console tab, to see which one. Then check the SERVER terminal:\n" +
        "did the request arrive?",
      "bad"
    );
    return null;
  }
}

document.querySelectorAll("[data-act]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const act = btn.dataset.act;
    if (act === "health") await send("GET", "/api/health");
    if (act === "list") await send("GET", "/api/recipes");
    if (act === "create") {
      const made = await send("POST", "/api/recipes", {
        name: "Harbor Chowder",
        cuisine: "Seafood",
        minutes: 35,
        tags: ["soup", "from-the-browser"],
      });
      if (made && made.id) lastCreatedId = made.id;
    }
    if (act === "remove") {
      if (!lastCreatedId) return show("Make a recipe with the POST button first.", "bad");
      await send("DELETE", `/api/recipes/${lastCreatedId}`);
      lastCreatedId = null;
    }
  });
});
