// All /api/recipes routes live here. A Router is a mini app:
// same .get / .post / .patch / .delete, mounted under a prefix in server.js.
// Inside this file, "/" means /api/recipes and "/:id" means /api/recipes/:id.

import { Router } from "express";
import { recipes, takeNextId } from "../data/recipes.js";
import { validateRecipe, validateRecipePatch } from "../middleware/validate.js";

const router = Router();

function findRecipe(idText) {
  return recipes.find((r) => r.id === Number(idText));
}

// GET /api/recipes  (optional filters: ?cuisine= &maxMinutes= &tag= &q=)
router.get("/", (req, res) => {
  const { cuisine, maxMinutes, tag, q } = req.query;
  let results = recipes;
  if (cuisine) results = results.filter((r) => r.cuisine.toLowerCase() === cuisine.toLowerCase());
  if (maxMinutes) results = results.filter((r) => r.minutes <= Number(maxMinutes));
  if (tag) results = results.filter((r) => r.tags.includes(tag));
  if (q) results = results.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  res.json(results);
});

// GET /api/recipes/:id
router.get("/:id", (req, res) => {
  const recipe = findRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  res.json(recipe);
});

// POST /api/recipes
router.post("/", validateRecipe, (req, res) => {
  const { name, cuisine, minutes, tags = [] } = req.body;
  const recipe = { id: takeNextId(), name: name.trim(), cuisine: cuisine.trim(), minutes, tags };
  recipes.push(recipe);
  res.status(201).json(recipe);
});

// PATCH /api/recipes/:id
router.patch("/:id", validateRecipePatch, (req, res) => {
  const recipe = findRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  const { name, cuisine, minutes, tags } = req.body;
  if (name !== undefined) recipe.name = name.trim();
  if (cuisine !== undefined) recipe.cuisine = cuisine.trim();
  if (minutes !== undefined) recipe.minutes = minutes;
  if (tags !== undefined) recipe.tags = tags;
  res.json(recipe);
});

// DELETE /api/recipes/:id
router.delete("/:id", (req, res) => {
  const index = recipes.findIndex((r) => r.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  recipes.splice(index, 1); // splice so the shared array in data/recipes.js changes too
  res.status(204).end();
});

export default router;
