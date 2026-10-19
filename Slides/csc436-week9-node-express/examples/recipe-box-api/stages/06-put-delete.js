// STAGE 6: UPDATE AND DELETE, FULL CRUD (run with: npm run stage6)
//
//   C  Create   POST    /api/recipes        201 + the new recipe
//   R  Read     GET     /api/recipes        200 + list
//   R  Read     GET     /api/recipes/:id    200 + one, or 404
//   U  Update   PATCH   /api/recipes/:id    200 + the updated recipe, or 404
//   D  Delete   DELETE  /api/recipes/:id    204 (no body), or 404
//
// Same path, different METHOD, different meaning. The method is the verb,
// the path is the noun.
//
// PUT vs PATCH: PUT replaces the whole thing. PATCH changes only the fields
// you send. PATCH is friendlier for forms that edit one field.

import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

let recipes = [
  { id: 1, name: "Margherita Pizza", cuisine: "Italian", minutes: 25, tags: ["vegetarian", "oven"] },
  { id: 2, name: "Chicken Tikka Masala", cuisine: "Indian", minutes: 50, tags: ["spicy", "dinner"] },
  { id: 3, name: "Pad Thai", cuisine: "Thai", minutes: 30, tags: ["noodles", "dinner"] },
];
let nextId = 4;

// A tiny helper so three routes do not repeat the same lookup.
function findRecipe(idText) {
  return recipes.find((r) => r.id === Number(idText));
}

app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

app.get("/api/recipes/:id", (req, res) => {
  const recipe = findRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  res.json(recipe);
});

app.post("/api/recipes", (req, res) => {
  const { name, cuisine, minutes, tags = [] } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "name is required" });
  if (typeof cuisine !== "string" || !cuisine.trim()) return res.status(400).json({ error: "cuisine is required" });
  if (typeof minutes !== "number" || minutes <= 0) return res.status(400).json({ error: "minutes must be a positive number" });

  const recipe = { id: nextId++, name: name.trim(), cuisine: cuisine.trim(), minutes, tags };
  recipes.push(recipe);
  res.status(201).json(recipe);
});

app.patch("/api/recipes/:id", (req, res) => {
  const recipe = findRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });

  // Only copy fields we allow. Someone could send { "id": 999 } to hijack ids.
  const { name, cuisine, minutes, tags } = req.body ?? {};
  if (minutes !== undefined && (typeof minutes !== "number" || minutes <= 0)) {
    return res.status(400).json({ error: "minutes must be a positive number" });
  }
  if (name !== undefined) recipe.name = String(name).trim();
  if (cuisine !== undefined) recipe.cuisine = String(cuisine).trim();
  if (minutes !== undefined) recipe.minutes = minutes;
  if (tags !== undefined) recipe.tags = tags;

  res.json(recipe);
});

app.delete("/api/recipes/:id", (req, res) => {
  const recipe = findRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });

  recipes = recipes.filter((r) => r.id !== recipe.id);

  // 204 No Content: it worked, and there is nothing to send back.
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});

// TRY IT
//   PATCH  /api/recipes/2  { "minutes": 45 }  -> 200, minutes is now 45
//   PATCH  /api/recipes/2  { "minutes": -5 }  -> 400
//   DELETE /api/recipes/3                     -> 204
//   DELETE /api/recipes/3  (again)            -> 404, it is already gone
