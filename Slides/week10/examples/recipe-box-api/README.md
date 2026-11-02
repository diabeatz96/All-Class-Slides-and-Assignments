# Recipe Box API, Week 11

The same Recipe Box API from Week 10, in two moves:

- **Tuesday Nov 3 (Mission 11, Assemble the Crew):** every file gets ONE job. Settings move into `config/env.js`, database calls move into `services/`, `app.js` builds the app and `server.js` starts it, and the CORS allowlist comes from an env var.
- **Thursday Nov 5 (Mission 12, Set Sail):** the same code goes on the internet with Vercel. The only new code is a health check.

Every step of the code-along is a checkpoint folder. If you fall behind, copy the checkpoint you need into your own project and keep going.

## Requirements

- Node **22.18 or newer**. Check with `node -v`.
- Your Supabase project from Week 10 (the `recipes` table from `setup.sql`).

## One-time setup

1. Copy `.env.example` to `.env` and fill in your values. **New this week:** `CORS_ORIGINS=http://localhost:5173`.
2. `npm install`

## Run a checkpoint

| Command | Folder | What it shows |
|---------|--------|---------------|
| npm run cp10 | checkpoints/10-start | Week 10 final. Where we start. |
| npm run cp11 | checkpoints/11-config | `config/env.js`: the only file that reads `process.env`. Stops at startup if a variable is missing. |
| npm run cp12 | checkpoints/12-services | `services/recipes.js`: the only file that talks to Supabase. Routes get thin. |
| npm run cp13 | checkpoints/13-app-server | `app.js` builds and exports the app. `server.js` only listens. |
| npm run cp14 | checkpoints/14-cors-env | TUESDAY FINAL. CORS reads `CORS_ORIGINS`. The logger runs first, so you can see preflights. |
| npm run cp15 | checkpoints/15-set-sail | THURSDAY. Adds `GET /api/health`. Ready for Vercel. Same as `npm run dev`. |
| npm run cp16 | checkpoints/16-visits-experiment | Instructor demo only: an in-memory counter to compare with the database. |

`requests.http` tests every route, plus three CORS experiments that send an `Origin` header by hand.

## The crew (who does what)

| File | Crew role | Its one job |
|------|-----------|-------------|
| app.js | The ship | Builds the app: middleware, routes, error handlers. `export default app`. Never listens. |
| server.js | Setting sail | Imports the app and calls `listen()`. Only runs on your laptop. |
| config/env.js | The ship's log | The only file that reads `process.env`. Checks every variable once. |
| data/supabase.js | The pantry door | One shared Supabase client. |
| services/recipes.js | The cook | The only file that talks to the database. No `req`, no `res`, no status codes. |
| routes/recipes.js | The navigator | Reads the request, calls the cook, picks the status code. Never imports supabase. |
| middleware/ | The lookouts | Logger, validation, 404, errors. |

## Catching up during the code-along

1. Copy everything **inside** `checkpoints/1X-name/` into your project folder, replacing files with the same name.
2. Keep your own `.env`. Never copy someone else's. Add `CORS_ORIGINS` if you have not yet.
3. After you change `.env`, save it and watch the terminal restart. If the change still does not show up, stop the server (Ctrl+C) and start it again.

ESM only: every file uses `import` and `export`. If you paste code with `require(...)`, Node stops with `require is not defined in ES module scope`.
