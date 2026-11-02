// routes/recipes.ts: THE NAVIGATOR, typed.
// Owns req and res. Never touches the database client. Turns HTTP text into plain values.

import { Router } from "express";
import * as recipes from "../services/recipes.ts";
import type { NewRecipe, RecipeChanges } from "../services/recipes.ts";
import { checkId, validateRecipe, validateRecipePatch } from "../middleware/validate.ts";

const router = Router();
// req.params values are typed loosely by Express, so accept anything printable.
const notFoundMsg = (id: unknown) => ({ error: `No recipe with id ${String(id)}` });

// A query string value can be text (?tag=a), a list (?tag=a&tag=b), or missing.
function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// GET /api/recipes  (optional filters: ?cuisine= &maxMinutes= &tag= &q=)
router.get("/", async (req, res) => {
  const maxMinutes = text(req.query.maxMinutes);
  const list = await recipes.listRecipes({
    cuisine: text(req.query.cuisine),
    maxMinutes: maxMinutes ? Number(maxMinutes) : undefined,
    tag: text(req.query.tag),
    q: text(req.query.q),
  });
  res.json(list);
});

// GET /api/recipes/:id
router.get("/:id", checkId, async (req, res) => {
  const recipe = await recipes.getRecipe(Number(req.params.id));
  if (!recipe) return res.status(404).json(notFoundMsg(req.params.id));
  res.json(recipe);
});

// POST /api/recipes
router.post("/", validateRecipe, async (req, res) => {
  const { name, cuisine, minutes, tags = [], servings = null } = req.body;
  const newRecipe: NewRecipe = { name: name.trim(), cuisine: cuisine.trim(), minutes, tags, servings };
  const saved = await recipes.createRecipe(newRecipe);
  res.status(201).json(saved);
});

// PATCH /api/recipes/:id
router.patch("/:id", checkId, validateRecipePatch, async (req, res) => {
  const { name, cuisine, minutes, tags, servings } = req.body;
  const changes: RecipeChanges = {};
  if (name !== undefined) changes.name = name.trim();
  if (cuisine !== undefined) changes.cuisine = cuisine.trim();
  if (minutes !== undefined) changes.minutes = minutes;
  if (tags !== undefined) changes.tags = tags;
  if (servings !== undefined) changes.servings = servings;

  const updated = await recipes.updateRecipe(Number(req.params.id), changes);
  if (!updated) return res.status(404).json(notFoundMsg(req.params.id));
  res.json(updated);
});

// DELETE /api/recipes/:id
router.delete("/:id", checkId, async (req, res) => {
  const deleted = await recipes.deleteRecipe(Number(req.params.id));
  if (!deleted) return res.status(404).json(notFoundMsg(req.params.id));
  res.status(204).end();
});

export default router;
