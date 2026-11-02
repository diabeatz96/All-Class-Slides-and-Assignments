// routes/recipes.js: THE NAVIGATOR.
// Reads the request, asks the cook (services/recipes.js), picks the status code.
//
// House rules for a route:
//   - It owns req and res. Nobody else touches them.
//   - It NEVER talks to the database directly: no database client in this folder.
//     Check it: searching routes/ for the client's name must find nothing.
//   - It turns HTTP stuff (text in the URL, JSON bodies) into plain values.

import { Router } from "express";
import * as recipes from "../services/recipes.js";
import { checkId, validateRecipe, validateRecipePatch } from "../middleware/validate.js";

const router = Router();
const notFoundMsg = (id) => ({ error: `No recipe with id ${id}` });

// GET /api/recipes  (optional filters: ?cuisine= &maxMinutes= &tag= &q=)
router.get("/", async (req, res) => {
  const { cuisine, maxMinutes, tag, q } = req.query;
  // Everything in a URL is text. The route converts; the cook never sees strings like "20".
  const list = await recipes.listRecipes({
    cuisine,
    maxMinutes: maxMinutes ? Number(maxMinutes) : undefined,
    tag,
    q,
  });
  res.json(list);
});

// GET /api/recipes/:id
router.get("/:id", checkId, async (req, res) => {
  const recipe = await recipes.getRecipe(req.params.id);
  if (!recipe) return res.status(404).json(notFoundMsg(req.params.id));
  res.json(recipe);
});

// POST /api/recipes
router.post("/", validateRecipe, async (req, res) => {
  const { name, cuisine, minutes, tags = [] } = req.body;
  const saved = await recipes.createRecipe({ name: name.trim(), cuisine: cuisine.trim(), minutes, tags });
  res.status(201).json(saved);
});

// PATCH /api/recipes/:id
router.patch("/:id", checkId, validateRecipePatch, async (req, res) => {
  const { name, cuisine, minutes, tags } = req.body;

  // Only the fields that were sent. Everything else stays as it is.
  const changes = {};
  if (name !== undefined) changes.name = name.trim();
  if (cuisine !== undefined) changes.cuisine = cuisine.trim();
  if (minutes !== undefined) changes.minutes = minutes;
  if (tags !== undefined) changes.tags = tags;

  const updated = await recipes.updateRecipe(req.params.id, changes);
  if (!updated) return res.status(404).json(notFoundMsg(req.params.id));
  res.json(updated);
});

// DELETE /api/recipes/:id
router.delete("/:id", checkId, async (req, res) => {
  const deleted = await recipes.deleteRecipe(req.params.id);
  if (!deleted) return res.status(404).json(notFoundMsg(req.params.id));
  res.status(204).end();
});

export default router;
