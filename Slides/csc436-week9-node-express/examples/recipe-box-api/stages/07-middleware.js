// STAGE 7: THE ASSEMBLY LINE (run with: npm run stage7)
//
// Middleware is a function that runs BETWEEN the request arriving and your
// route answering. Every request walks the same line, top to bottom:
//
//   request -> logger -> express.json() -> your routes -> 404 catcher -> error handler
//
// A middleware function gets three things: (req, res, next).
//   Call next()       -> "I am done, pass it down the line."
//   Send a response   -> "Stop here, I answered."
//   Do neither        -> the request hangs forever. The browser just spins.
//
// ORDER MATTERS. Express runs app.use and routes in the order you wrote them.

import express from "express";

const app = express();
const PORT = 3000;

/* ---------- 1. Logger: our first homemade middleware ---------- */
function logger(req, res, next) {
  const start = Date.now();
  // res.on("finish") fires after the response is sent, so we can log the status.
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next(); // FORGET THIS LINE AND EVERY REQUEST HANGS. Try it.
}
app.use(logger);

/* ---------- 2. Body parser (built in) ---------- */
app.use(express.json());

/* ---------- 3. A middleware for ONE route: validation ---------- */
// Put it between the path and the handler. It only runs for that route.
function validateRecipe(req, res, next) {
  const { name, cuisine, minutes } = req.body ?? {};
  const problems = [];
  if (typeof name !== "string" || !name.trim()) problems.push("name is required");
  if (typeof cuisine !== "string" || !cuisine.trim()) problems.push("cuisine is required");
  if (typeof minutes !== "number" || minutes <= 0) problems.push("minutes must be a positive number");

  if (problems.length > 0) {
    return res.status(400).json({ error: "Invalid recipe", problems });
  }
  next();
}

/* ---------- Data ---------- */
let recipes = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25, tags: ["vegetarian", "oven"] },
  { id: 2, name: "Chicken Tikka Masala", cuisine: "Indian", minutes: 50, tags: ["spicy", "dinner"] },
  { id: 3, name: "Pad Thai", cuisine: "Thai", minutes: 30, tags: ["noodles", "dinner"] },
];
let nextId = 4;
const findRecipe = (idText) => recipes.find((r) => r.id === Number(idText));

/* ---------- 4. Routes ---------- */
app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

app.get("/api/recipes/:id", (req, res) => {
  const recipe = findRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  res.json(recipe);
});

//                         path            middleware      handler
app.post("/api/recipes", validateRecipe, (req, res) => {
  const { name, cuisine, minutes, tags = [] } = req.body;
  const recipe = { id: nextId++, name: name.trim(), cuisine: cuisine.trim(), minutes, tags };
  recipes.push(recipe);
  res.status(201).json(recipe);
});

app.delete("/api/recipes/:id", (req, res) => {
  const recipe = findRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  recipes = recipes.filter((r) => r.id !== recipe.id);
  res.status(204).end();
});

// A route that breaks on purpose, so we can watch the error handler work.
app.get("/api/kaboom", (req, res) => {
  throw new Error("The oven exploded");
});

// Express 5 bonus: if an async route throws, Express catches it for you.
app.get("/api/slow-kaboom", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  throw new Error("The oven exploded, slowly");
});

/* ---------- 5. 404 catcher: runs only if NO route above answered ---------- */
// Must come AFTER every route. Move it to the top and every request 404s.
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
});

/* ---------- 6. Error handler: FOUR arguments, always last ---------- */
// Express knows it is an error handler because it takes (err, req, res, next).
// Without this, a thrown error sends an HTML stack trace to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status ?? 500).json({ error: "Something went wrong in the kitchen" });
});

app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});

// TRY IT
//   Watch the terminal: every request prints one log line.
//   GET  /api/nope           -> 404 JSON from the catcher (not Express's HTML page)
//   GET  /api/kaboom         -> 500 JSON, the real message stays in the terminal
//   POST /api/recipes  {}    -> 400 with a list of every problem at once
//   Delete the next() in logger. Every request hangs. Put it back.
