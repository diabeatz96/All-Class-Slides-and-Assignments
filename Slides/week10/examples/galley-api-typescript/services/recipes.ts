// services/recipes.ts: THE GALLEY COOK, typed.
// The ONLY file that talks to the database. No req, no res, no status codes.
// The return types are the contract the routes can count on.

import { supabase, type Recipe, type NewRecipe, type RecipeChanges } from "../data/supabase.ts";

// Routes need these shapes too. They get them from the cook, never from data/.
export type { Recipe, NewRecipe, RecipeChanges };

export type RecipeFilters = {
  cuisine?: string;
  maxMinutes?: number;
  tag?: string;
  q?: string;
};

export async function listRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  const { cuisine, maxMinutes, tag, q } = filters;
  let query = supabase.from("recipes").select("*").order("id");
  if (cuisine) query = query.ilike("cuisine", cuisine);
  if (maxMinutes) query = query.lte("minutes", maxMinutes);
  if (tag) query = query.contains("tags", [tag]);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getRecipe(id: number): Promise<Recipe | null> {
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createRecipe(recipe: NewRecipe): Promise<Recipe> {
  const { data, error } = await supabase.from("recipes").insert(recipe).select().single();
  if (error) throw error;
  return data;
}

export async function updateRecipe(id: number, changes: RecipeChanges): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from("recipes")
    .update(changes)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteRecipe(id: number): Promise<boolean> {
  const { data, error } = await supabase.from("recipes").delete().eq("id", id).select();
  if (error) throw error;
  return data.length > 0;
}
