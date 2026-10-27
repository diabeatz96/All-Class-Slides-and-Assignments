// The connection to our pantry, now TYPED.
// createClient<Database> hands every query the shape of our tables,
// so TypeScript knows every column name and every column type.

import { createClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert, TablesUpdate } from "./database.types.ts";

// process.env values are `string | undefined`. Hover them in VS Code.
const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env"
  );
}
// Below this line TypeScript knows both are `string`. The `if` proved it.

export const supabase = createClient<Database>(url, secretKey);

// Friendly names for the three shapes of a recipe row.
export type Recipe = Tables<"recipes">;              // what you GET back (every column)
export type NewRecipe = TablesInsert<"recipes">;     // what you may INSERT (id not allowed)
export type RecipeChanges = TablesUpdate<"recipes">; // what you may UPDATE (everything optional)
