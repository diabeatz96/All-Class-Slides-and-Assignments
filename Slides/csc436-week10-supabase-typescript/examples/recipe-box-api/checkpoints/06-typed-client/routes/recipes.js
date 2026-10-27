// All /api/recipes routes. Same paths, same status codes as last week.
//
// What changed: the recipes live in Supabase now, not in an array.
//  - Every handler is `async`, because asking the database takes time.
//  - Every query hands back { data, error }. Check error first, every time.
//  - The database picks ids and keeps everything after a restart.

import { Router } from "express";
import { supabase } from "../data/supabase.ts"; // the real file name, .ts
import { checkId, validateRecipe, validateRecipePatch } from "../middleware/validate.js";

const router = Router();

// GET /api/recipes  (optional filters: ?cuisine= &maxMinutes= &tag= &q=)
router.get("/", async (req, res) => {
  const { cuisine, maxMinutes, tag, q } = req.query;

  // Build the question one piece at a time. Nothing is sent yet.
  let query = supabase.from("recipes").select("*").order("id");
  if (cuisine) query = query.ilike("cuisine", cuisine);              // case-insensitive match
  if (maxMinutes) query = query.lte("minutes", Number(maxMinutes));  // less than or equal
  if (tag) query = query.contains("tags", [tag]);                    // tags list includes it
  if (q) query = query.ilike("name", `%${q}%`);                      // name contains q

  // `await` is the moment the question is actually sent.
  const { data, error } = await query;
  if (error) throw error;
  res.json(data);
});

// GET /api/recipes/:id
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

// POST /api/recipes
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

// PATCH /api/recipes/:id
router.patch("/:id", checkId, validateRecipePatch, async (req, res) => {
  const { name, cuisine, minutes, tags } = req.body;

  // Only the fields that were sent. Everything else stays as it is.
  const changes = {};
  if (name !== undefined) changes.name = name.trim();
  if (cuisine !== undefined) changes.cuisine = cuisine.trim();
  if (minutes !== undefined) changes.minutes = minutes;
  if (tags !== undefined) changes.tags = tags;

  const { data, error } = await supabase
    .from("recipes")
    .update(changes)
    .eq("id", req.params.id)
    .select()
    .maybeSingle(); // null means no row had that id

  if (error) throw error;
  if (!data) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  res.json(data);
});

// DELETE /api/recipes/:id
router.delete("/:id", checkId, async (req, res) => {
  const { data, error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", req.params.id)
    .select(); // the rows that were deleted: [] means nothing matched

  if (error) throw error;
  if (data.length === 0) return res.status(404).json({ error: `No recipe with id ${req.params.id}` });
  res.status(204).end();
});

export default router;
