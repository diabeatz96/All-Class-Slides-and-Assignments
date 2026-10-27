// The connection to our pantry: a Supabase (Postgres) database.
// Every route that needs data imports `supabase` from this one file.
//
// The URL and the secret key come from the .env file, never from the code.
// .env stays on your laptop. It is in .gitignore so it never reaches GitHub.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

// Fail loud, fail early: a clear message now beats a confusing one later.
if (!url || !secretKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env"
  );
}

export const supabase = createClient(url, secretKey);
