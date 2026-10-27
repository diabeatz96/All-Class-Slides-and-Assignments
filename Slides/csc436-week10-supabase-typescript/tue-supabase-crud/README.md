# CSC 436, Week 10, Tuesday Oct 27: Mission 9, Supabase CRUD from Express

Interactive deck. The Recipe Box API's in-memory array moves into a real Postgres table on Supabase. Students have never used a database before; this deck starts from "what is a database" and ends with full CRUD that survives a restart.

## Run it

    npm install
    npm run dev

Open the printed URL, then F11 for full screen. If you will also run the Recipe Finder client on port 5173, start this deck on another port: `npx vite --port 5174`.

## Presenting

- Right arrow, space, Page Down: next slide
- Left arrow, Page Up: previous slide
- Home / End: first / last slide
- N: toggle the instructor note strip
- Click a progress bar segment to jump

The interactive slides (title, rules, select, data/error, query builder) run on `src/pantry.js`, a small in-browser copy of the recipes table that uses the real Postgres error messages. No network or Supabase account needed to present.

## Slides (115 minute block)

| # | Slide | Time |
|---|-------|------|
| 1 | Title: memory forgets, databases remember (POST, then restart) | 12:20 |
| 2 | Warm-up: does Ramen survive? (6 predictions) | 12:20 to 12:30 |
| 3 | A database is the pantry | 12:30 |
| 4 | Tables, rows, and columns | |
| 5 | Every column has a type and rules (try to sneak bad rows in) | |
| 6 | SQL: setup.sql line by line | |
| 7 | Asking questions: select | |
| 8 | Meet Supabase (the four hops, the dashboard) | to 12:45 |
| 9 | Code-along A: stock the pantry (project, setup.sql, keys) | 12:45 to 1:00 |
| 10 | Two keys, one rule (publishable vs secret) | 1:00 |
| 11 | .env: secrets live outside the code | |
| 12 | data/supabase.js, then convert GET all (Checkpoint 01) | to 1:20 |
| 13 | Every answer comes in two halves: { data, error } | 1:20 |
| 14 | Building a question one piece at a time (query builder) | |
| 15 | Same route, new pantry (before and after) | to 1:27 |
| 16 | The trap: GET /api/recipes/two, then checkId (Checkpoint 02) | 1:27 to 1:37 |
| 17 | Writing: insert, update, delete (Checkpoints 03, 04) | 1:37 to 1:52 |
| 18 | Restart the kitchen: the food is still there | (inside 17) |
| 19 | When it breaks: error decoder | any time |
| 20 | Code-along map: six checkpoints | on screen during code-along |
| 21 | Mission 9: Stock the Pantry | 1:52 to 2:08 |
| 22 | Close: pair explain, tease Thursday | 2:08 to 2:15 |

The code-along uses `examples/recipe-box-api` (checkpoints 00 to 05). See the instructor walkthrough for the exact order and every line to type.

ESM throughout. No require() or module.exports.
