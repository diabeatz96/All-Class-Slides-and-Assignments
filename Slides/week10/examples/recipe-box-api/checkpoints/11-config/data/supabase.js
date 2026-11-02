// The pantry door: one shared connection to our Supabase database.
//
// NEW THIS WEEK: this file no longer reads process.env itself.
// It asks config/env.js, which already checked that both values exist.

import { createClient } from "@supabase/supabase-js";
import { config } from "../config/env.js";

export const supabase = createClient(config.supabaseUrl, config.supabaseSecretKey);
