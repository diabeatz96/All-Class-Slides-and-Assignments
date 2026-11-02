// config/env.js: THE SHIP'S LOG.
// The ONE file in the whole project that reads process.env.
//
// Every setting the galley needs is listed here, checked once when the
// server starts, and handed out as one frozen object. If something is
// missing, we stop right away with a message that names the variable.
// A loud crash at startup beats a confusing error on the first request.

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Missing environment variable ${name}. ` +
        "On your laptop: add it to .env (see .env.example). " +
        "On a host: add it in the host's environment variable settings."
    );
  }
  return value.trim();
}

// "http://localhost:5173,http://localhost:4173" -> ["http://localhost:5173", "http://localhost:4173"]
function list(name) {
  return required(name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = Object.freeze({
  supabaseUrl: required("SUPABASE_URL"),
  supabaseSecretKey: required("SUPABASE_SECRET_KEY"),
  // PORT is optional. Env values are always text, and listen() wants a number.
  port: Number(process.env.PORT ?? 3000),
  // NEW: which websites (origins) may read our responses from a browser.
  // Comma separated. An origin is scheme + host + port, and NEVER ends with a slash.
  corsOrigins: list("CORS_ORIGINS"),
  // NEW THURSDAY: Vercel sets VERCEL=1 on its own machines. Your laptop does not.
  runningOnVercel: process.env.VERCEL === "1",
});
