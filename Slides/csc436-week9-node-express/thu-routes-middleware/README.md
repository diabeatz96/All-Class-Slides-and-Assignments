# CSC 436, Week 9, Thursday Oct 22: Mission 8, Routes + Middleware

Interactive deck. The Recipe Box server learns to write (POST, PATCH, DELETE), gets a middleware assembly line, and the Week 7 Recipe Finder connects to it.

## Run it

    npm install
    npm run dev

Open the printed URL, then F11. If you will also demo the React client (port 5173), start this deck on another port: `npx vite --port 5174`.

## Presenting

- Right arrow, space, Page Down: next slide
- Left arrow, Page Up: previous slide
- Home / End: first / last slide
- N: toggle the instructor note strip
- Click a progress bar segment to jump

The CRUD playground, body trap, validation, assembly line, order, and error slides all run a small Express look-alike in `src/sim.js`. No network needed.

## Slides (115 minute block)

| # | Slide | Time |
|---|-------|------|
| 1 | Title: one POST walks the assembly line | 12:20 |
| 2 | Warm-up: predict the status code (6 requests) | 12:20 to 12:35 |
| 3 | CRUD: four verbs, one noun | 12:35 |
| 4 | All four, live (CRUD playground with server memory table) | |
| 5 | The trap: req.body is undefined (express.json + Content-Type) | |
| 6 | Validate every body (validation on and off) | |
| 7 | Middleware: a station on the assembly line | |
| 8 | Watch a request walk the line (toggle stations, break next()) | |
| 9 | Your first middleware: a logger | 1:00 |
| 10 | Order is the whole point (reorder the stack) | |
| 11 | Global vs route-level middleware | |
| 12 | One place where every error lands | |
| 13 | One file per job: express.Router and folders | |
| 14 | Prove every route works: requests.http | |
| 15 | The payoff: Recipe Finder on your server (CORS preview) | |
| 16 | Live-code progression: stages 5 to 7, final, client | 1:00 to 1:40 live code |
| 17 | Mission 8: Run the Kitchen | 1:40 to 2:05 |
| 18 | Exit check quiz | 2:05 to 2:15 |

Concept slides 3 to 15 are designed to be interleaved with the live code (see the instructor walkthrough for the exact order).

ESM throughout. No require() or module.exports.
