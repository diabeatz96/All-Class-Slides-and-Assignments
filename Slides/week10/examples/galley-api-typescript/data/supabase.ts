// The pantry door, TYPED. Reads its settings from config, not process.env.

import { createClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert, TablesUpdate } from "./database.types.ts";
import { config } from "../config/env.ts";

export const supabase = createClient<Database>(config.supabaseUrl, config.supabaseSecretKey);

// Friendly names for the three shapes of a recipe row.
export type Recipe = Tables<"recipes">;              // what you GET back (every column)
export type NewRecipe = TablesInsert<"recipes">;     // what you may INSERT (id not allowed)
export type RecipeChanges = TablesUpdate<"recipes">; // what you may UPDATE (everything optional)
