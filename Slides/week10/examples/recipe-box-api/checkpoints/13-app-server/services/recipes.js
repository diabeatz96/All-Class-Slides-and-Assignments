// services/recipes.js: THE GALLEY COOK.
// The ONLY file in the project that talks to the database.
//
// House rules for a service:
//   - No req, no res, no status codes. It has never heard of HTTP.
//   - It takes plain values in, hands plain data back.
//   - When something goes wrong, it throws. The error handler deals with it.
//
// Why bother? If the pantry ever changes (a different database), this is
// the one file that changes. The routes never notice.

import { supabase } from "../data/supabase.js";

// Every recipe, oldest first. Every filter is optional.
export async function listRecipes({ cuisine, maxMinutes, tag, q } = {}) {
  let query = supabase.from("recipes").select("*").order("id");
  if (cuisine) query = query.ilike("cuisine", cuisine);       // case-insensitive match
  if (maxMinutes) query = query.lte("minutes", maxMinutes);   // less than or equal
  if (tag) query = query.contains("tags", [tag]);             // tags list includes it
  if (q) query = query.ilike("name", `%${q}%`);               // name contains q

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// One recipe, or null when no row has that id.
export async function getRecipe(id) {
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

// Saves a new recipe and returns it with its new id and created_at.
export async function createRecipe(recipe) {
  const { data, error } = await supabase.from("recipes").insert(recipe).select().single();
  if (error) throw error;
  return data;
}

// Changes only the fields in `changes`. Returns the updated recipe, or null.
export async function updateRecipe(id, changes) {
  const { data, error } = await supabase
    .from("recipes")
    .update(changes)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Returns true if a recipe was deleted, false if nothing had that id.
export async function deleteRecipe(id) {
  const { data, error } = await supabase.from("recipes").delete().eq("id", id).select();
  if (error) throw error;
  return data.length > 0;
}
