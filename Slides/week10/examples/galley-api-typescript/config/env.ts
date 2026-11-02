// config/env.ts: THE SHIP'S LOG, typed.
// The ONE file that reads process.env. Everything else imports `config`.

function required(name: string): string {
  const value = process.env[name]; // string | undefined
  if (!value || !value.trim()) {
    throw new Error(
      `Missing environment variable ${name}. ` +
        "On your laptop: add it to .env (see .env.example). " +
        "On a host: add it in the host's environment variable settings."
    );
  }
  return value.trim(); // TypeScript knows this is a string now
}

function list(name: string): string[] {
  return required(name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = Object.freeze({
  supabaseUrl: required("SUPABASE_URL"),
  supabaseSecretKey: required("SUPABASE_SECRET_KEY"),
  port: Number(process.env.PORT ?? 3000),
  corsOrigins: list("CORS_ORIGINS"),
  runningOnVercel: process.env.VERCEL === "1",
});
