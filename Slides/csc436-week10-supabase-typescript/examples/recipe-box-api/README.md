# Recipe Box API, Week 10

The same Recipe Box API from Week 9, in two moves:

- **Tuesday Oct 27:** the in-memory array becomes a real Supabase (Postgres) table.
- **Thursday Oct 29:** the JavaScript becomes TypeScript, typed by the database itself.

Every step of the code-along is saved as a checkpoint folder. If you fall behind, copy the checkpoint you need into your own project and keep going.

## Requirements

- Node **22.18 or newer** (Node 24 LTS recommended). Check with `node -v`.
  supabase-js needs Node 22, and Thursday's TypeScript runs directly in Node 22.18+.
- A free Supabase account (sign in with GitHub at supabase.com).

## One-time setup

1. Create a Supabase project. In its **SQL Editor**, paste all of `setup.sql` and click **Run**. You should see 8 rows.
2. Copy `.env.example` to `.env` and fill in your Project URL (Connect button) and your secret key (Project Settings, API Keys, starts with `sb_secret_`).
3. `npm install`

## Run a checkpoint

| Command | Folder | What it shows |
|---------|--------|---------------|
| npm run cp00 | checkpoints/00-start | Last Thursday's organized server. Everything in memory. Needs no Supabase. |
| npm run cp01 | checkpoints/01-connected | data/supabase.js, .env, GET /api/recipes from Supabase. Other routes still use the array. |
| npm run cp02 | checkpoints/02-read | GET /api/recipes/:id with maybeSingle, plus checkId (the /two trap fixed). |
| npm run cp03 | checkpoints/03-create | POST with insert().select().single(). Minutes must be a whole number. |
| npm run cp04 | checkpoints/04-crud | PATCH and DELETE. data/recipes.js is gone. Full CRUD in the database. |
| npm run cp05 | checkpoints/05-filters | Gold solution: ?cuisine ?maxMinutes ?tag ?q with the query builder. Same as `npm run dev`. |
| npm run cp06 | checkpoints/06-typed-client | Thursday: tsconfig.json, generated data/database.types.ts, typed data/supabase.ts. |
| npm run cp07 | checkpoints/07-typed-middleware | middleware/*.ts with Request, Response, NextFunction. |
| npm run cp08 | checkpoints/08-all-typescript | routes/recipes.ts and server.ts. Zero type errors. |
| npm run cp09 | checkpoints/09-servings | The schema-change demo. Run `add-servings.sql` first. |
| npm run typecheck | checkpoints 06 to 09 | Runs the TypeScript checker on every TypeScript checkpoint. |

`requests.http` tests every route (VS Code REST Client extension, or copy into Thunder Client).

## Catching up during the code-along

Your own repo has `server.js`, `routes/`, `middleware/`, and `data/` at the top level. To jump to a checkpoint:

1. Copy everything **inside** `checkpoints/0X-name/` into your project folder, replacing files with the same name.
2. If the checkpoint no longer has a file you still have (for example `data/recipes.js` after 04), delete yours.
3. `npm install` (Tuesday needs `@supabase/supabase-js`; Thursday also needs the dev packages below).
4. Keep your own `.env`. Never copy someone else's.

Thursday's dev packages:

    npm install -D typescript @types/node @types/express @types/cors

Thursday's scripts in your own package.json:

    "dev": "node --watch --env-file=.env server.ts",
    "start": "node server.ts",
    "typecheck": "tsc",
    "types": "npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > data/database.types.ts"

The `types` script needs the Supabase CLI: `npm install -D supabase`, then `npx supabase login` once.
Everyone ran the same `setup.sql`, so if the CLI gives you trouble, copying `checkpoints/08-all-typescript/data/database.types.ts` gives you the same file.

## Files

    setup.sql          Tuesday: create the table, lock it down, grant the server access, add 8 recipes
    add-servings.sql   Thursday demo: add an optional servings column
    .env.example       The names your .env needs (safe to commit)
    requests.http      Every route, good and bad requests
    checkpoints/       One folder per code-along step

ESM throughout. No require() or module.exports anywhere.
