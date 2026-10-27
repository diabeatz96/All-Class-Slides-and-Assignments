// All /api/recipes routes, in TypeScript.
// Same routes, same status codes as Tuesday. What TypeScript added:
//  - Every column name and value type is checked against the real table.
//  - req.params.id is a string, so we turn it into a number on purpose.
//  - Query string values might not be plain text, so we check first.

import { Router } from "express";
import { supabase, type NewRecipe, type RecipeChanges } from "../data/supabase.ts";
import { checkId, validateRecipe, validateRecipePatch } from "../middleware/validate.ts";

const router = Router();

// A query string value can be text (?tag=a), a list (?tag=a&tag=b), or missing.
// This helper keeps only plain text and turns everything else into undefined.
function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// GET /api/recipes  (optional filters: ?cuisine= &maxMinutes= &tag= &q=)
router.get("/", async (req, res) => {
  const cuisine = text(req.query.cuisine);
  const maxMinutes = text(req.query.maxMinutes);
  const tag = text(req.query.tag);
  const q = text(req.query.q);

  let query = supabase.from("recipes").select("*").order("id");
  if (cuisine) query = query.ilike("cuisine", cuisine);
  if (maxMinutes) query = query.lte("minutes", Number(maxMinutes));
  if (tag) query = query.contains("tags", [tag]);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data, error } = await query;
  if (error) throw error;
  res.json(data); // hover data: Recipe[]
});

// GET /api/recipes/:id
router.get("/:id", checkId, async (req, res) => {
  const id = Number(req.params.id); // params are always strings; the id column is a number
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return res.status(404).json({ error: `No recipe with id ${id}` });
  res.json(data); // hover data: Recipe (null was ruled out one line up)
});

// POST /api/recipes
router.post("/", validateRecipe, async (req, res) => {
  // req.body is `any`: TypeScript cannot know what a stranger sent us.
  // validateRecipe checked it at runtime. Here we build a properly TYPED object,
  // so a typo or a wrong type in OUR code is caught before it runs.
  const { name, cuisine, minutes, tags = [] } = req.body;
  const newRecipe: NewRecipe = {
    name: name.trim(),
    cuisine: cuisine.trim(),
    minutes,
    tags,
  };

  const { data, error } = await supabase.from("recipes").insert(newRecipe).select().single();
  if (error) throw error;
  res.status(201).json(data);
});

// PATCH /api/recipes/:id
router.patch("/:id", checkId, validateRecipePatch, async (req, res) => {
  const id = Number(req.params.id);
  const { name, cuisine, minutes, tags } = req.body;

  // Without the type, `{}` is "an object with no properties" and every line below is an error.
  const changes: RecipeChanges = {};
  if (name !== undefined) changes.name = name.trim();
  if (cuisine !== undefined) changes.cuisine = cuisine.trim();
  if (minutes !== undefined) changes.minutes = minutes;
  if (tags !== undefined) changes.tags = tags;

  const { data, error } = await supabase
    .from("recipes")
    .update(changes)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) return res.status(404).json({ error: `No recipe with id ${id}` });
  res.json(data);
});

// DELETE /api/recipes/:id
router.delete("/:id", checkId, async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase.from("recipes").delete().eq("id", id).select();

  if (error) throw error;
  if (data.length === 0) return res.status(404).json({ error: `No recipe with id ${id}` });
  res.status(204).end();
});

export default router;
