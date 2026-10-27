# CSC 436, Week 10, Thursday Oct 29: Mission 10, TypeScript via Generated Types

Interactive deck. Every jar in the pantry gets a label: students meet TypeScript from zero, generate types from their own Supabase database, and convert Tuesday's Recipe Box API to TypeScript that Node runs directly.

## Run it

    npm install
    npm run dev

Open the printed URL (usually http://localhost:5173), then F11 for full screen.
If the example API or a client is already on 5173, run the deck on another port: `npx vite --port 5174`.

## Presenting

- Right arrow, space, Page Down: next slide
- Left arrow, Page Up: previous slide
- Home / End: first / last slide
- N: toggle the instructor note strip
- Click a progress bar segment to jump

## The live TypeScript editor

Slides 5 to 9 and 13 have an editor you can type in. Red lines, squiggles, and the problem list come from the real TypeScript compiler running in the browser (TypeScript 6.0.3, the last version with a JavaScript compiler API; the projects use TypeScript 7, and the messages match). It loads in the background on the first slide and takes about a second. No network needed after `npm install`.

Slide 13 uses a simplified copy of the Supabase types so it fits in the browser. The error messages are the same ones students see in VS Code.

Students type along at typescriptlang.org/play (strict by default, no setup, hover works). The alternative is a `playground.ts` in a folder OUTSIDE their Mission repo: any .ts scratch file inside the repo gets checked by every later `npm run typecheck` and its deliberate errors show up there. Delete stray scratch files (including slide 15's `hello.ts`) before the code-along.

Run the checker as plain `npx tsc` or `npm run typecheck`. With TypeScript 7 and a tsconfig.json in the folder, `npx tsc somefile.ts` fails with TS5112.

## Slides (115 minute block)

| # | Slide | Time |
|---|-------|------|
| 1 | Title: Label every jar (labels on / off demo) | 12:20 |
| 2 | Warm-up: spot the bug before it runs (6 real course bugs) | 12:20 to 12:30 |
| 3 | When do you find out? (JavaScript vs TypeScript timeline) | 12:30 |
| 4 | TypeScript is JavaScript with labels (erase the labels like Node does) | to 12:38 |
| 5 | Playground 1: labels on values, inference | 12:38 |
| 6 | Playground 2: labels on whole objects (type Recipe) | |
| 7 | Playground 3: maybe there, maybe not (null, optional, if checks) | |
| 8 | Playground 4: functions, params and return labels | |
| 9 | Playground 5: typeof, unknown, any | to 12:58 |
| 10 | TypeScript checks your code, validation checks their data | 12:58 |
| 11 | The database already knows the types (SQL to Row / Insert / Update) | |
| 12 | Generate the types (npx supabase gen types, npm run types) | |
| 13 | Playground: a typed client, createClient&lt;Database&gt; | to 1:08 |
| 14 | tsconfig.json, line by line (plus the install command) | 1:08 code-along starts |
| 15 | Node runs it, tsc checks it (four rules with real errors) | |
| 16 | Converting the routes: three kinds of red (8 errors, 3 fixes) | |
| 17 | Change the database, regenerate, follow the red (servings demo) | 1:43 to 1:50 |
| 18 | Code-along progression: setup, checkpoints 06 to 09 | on screen 1:08 to 1:43 |
| 19 | Mission 10: Label Every Jar (Track A optional, Track B required) | 1:50 to 2:07 |
| 20 | Close: three sentences, partner explain, tease Render | 2:07 to 2:15 |

Code-along order (slides 14, 12, 15, 16 with 18 on screen): install, tsconfig.json, generate types, checkpoint 06 (typed client), 07 (typed middleware), 08 (routes and server.ts). Example code: `examples/recipe-box-api`, scripts `npm run cp06` to `npm run cp09`.

ESM throughout. No require() or module.exports. No enums.
