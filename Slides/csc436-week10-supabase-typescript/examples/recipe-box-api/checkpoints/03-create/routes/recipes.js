// All /api/recipes routes, MID-MOVE.
// Routes marked [SUPABASE] ask the database. Routes marked [ARRAY] still use
// last week's in-memory array until we convert them, one at a time.

import { Router } from "express";
import { supabase } from "../data/supabase.js";
import { recipes, takeNextId } from "../data/recipes.js";
import { checkId, validateRecipe, validateRecipePatch } from "../middleware/validate.js";

const router = Router();

function findRecipe(idText) {
  return recipes.find((r) => r.id === Number(idText));
}

// GET /api/recipes  [SUPABASE]
// (The ?cuisine= ?tag= filters come back later. One thing at a time.)
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("recipes").select("*").order("id");
  if (error) throw error;
  res.json(data);
});

// GET /api/recipes/:id  [SUPABASE]
router.get("/:id", checkId, async (req, res) => {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle(); // one object, or null if there is no match

  if (error) throw error;
  if (!data) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  res.json(data);
});

// POST /api/recipes  [SUPABASE]
router.post("/", validateRecipe, async (req, res) => {
  const { name, cuisine, minutes, tags = [] } = req.body;

  const { data, error } = await supabase
    .from("recipes")
    .insert({ name: name.trim(), cuisine: cuisine.trim(), minutes, tags })
    .select()  // send back the row we just saved (with its new id)
    .single(); // exactly one row, as an object

  if (error) throw error;
  res.status(201).json(data);
});

// PATCH /api/recipes/:id  [ARRAY]
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

// DELETE /api/recipes/:id  [ARRAY]
router.delete("/:id", (req, res) => {
  const index = recipes.findIndex((r) => r.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  recipes.splice(index, 1); // splice so the shared array in data/recipes.js changes too
  res.status(204).end();
});

export default router;
