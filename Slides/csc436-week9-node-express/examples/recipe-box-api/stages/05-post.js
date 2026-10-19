// STAGE 5: CREATE A RECIPE WITH POST (run with: npm run stage5)
//
// GET asks for data. POST sends NEW data to the server.
// The new data rides in the request BODY as JSON.
//
// THE TRAP: Express does not read the body by default.
// Without app.use(express.json()), req.body is undefined and every
// POST "works" but saves nothing useful.
//
// You cannot test POST by typing a URL in the browser bar. The browser
// bar only sends GET. Use Thunder Client, or the requests.http file.

import express from "express";

const app = express();
const PORT = 3000;

// MIDDLEWARE: runs on every request BEFORE your routes.
// express.json() reads the raw body text and turns it into req.body.
// Comment this line out, send a POST, and watch req.body become undefined.
app.use(express.json());

const recipes = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25, tags: ["vegetarian", "oven"] },
  { id: 2, name: "Chicken Tikka Masala", cuisine: "Indian", minutes: 50, tags: ["spicy", "dinner"] },
  { id: 3, name: "Pad Thai", cuisine: "Thai", minutes: 30, tags: ["noodles", "dinner"] },
];
let nextId = 4;

app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

app.get("/api/recipes/:id", (req, res) => {
  const recipe = recipes.find((r) => r.id === Number(req.params.id));
  if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  res.json(recipe);
});

app.post("/api/recipes", (req, res) => {
  console.log("Body received:", req.body);

  // NEVER TRUST THE CLIENT. Anyone can send anything to a server.
  // Check the body before you save it. Bad input gets a 400 and a reason.
  const { name, cuisine, minutes, tags = [] } = req.body ?? {};

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name is required and must be text" });
  }
  if (typeof cuisine !== "string" || cuisine.trim() === "") {
    return res.status(400).json({ error: "cuisine is required and must be text" });
  }
  if (typeof minutes !== "number" || minutes <= 0) {
    return res.status(400).json({ error: "minutes must be a positive number" });
  }

  // The SERVER picks the id, never the client.
  const recipe = { id: nextId++, name: name.trim(), cuisine: cuisine.trim(), minutes, tags };
  recipes.push(recipe);

  // 201 Created, and send back what we saved (with its new id).
  res.status(201).json(recipe);
});

app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});

// TRY IT (Thunder Client or requests.http)
//   POST /api/recipes   { "name": "Ramen", "cuisine": "Japanese", "minutes": 40 }   -> 201
//   POST /api/recipes   { "name": "Ramen" }                                         -> 400 cuisine is required
//   POST /api/recipes   { "name": "Ramen", "cuisine": "Japanese", "minutes": "40" } -> 400 minutes must be a number
//   GET  /api/recipes   -> Ramen is in the list
//   Restart the server, GET again -> Ramen is gone. Memory is not a database.
