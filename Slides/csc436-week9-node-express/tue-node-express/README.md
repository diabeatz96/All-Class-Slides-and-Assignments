# CSC 436, Week 9, Tuesday Oct 20: Mission 7, Node + Express, ESM Head-On

Interactive deck for the first backend lesson. Students have never written a server. Theme: the Week 7 Recipe Finder finally gets its own API.

## Run it

    npm install
    npm run dev

Open the printed URL (usually http://localhost:5173), then F11 for full screen.
Tip: start the deck BEFORE the example server, or run the deck with `npx vite --port 5174` so it does not collide with the client demo.

## Presenting

- Right arrow, space, Page Down: next slide
- Left arrow, Page Up: previous slide
- Home / End: first / last slide
- N: toggle the instructor note strip
- Click a progress bar segment to jump
- The URL keeps the slide number (#7), so a refresh stays put

Everything runs offline. The "server" on the simulator slides is a tiny Express look-alike in `src/sim.js`, so demos work without wifi.

## Slides (115 minute block)

| # | Slide | Time |
|---|-------|------|
| 1 | Title: one request travels browser, server, data | 12:20 |
| 2 | Warm-up: Where does this code run? (8 jobs, Browser or Server) | 12:20 to 12:35 |
| 3 | A web app is a restaurant (dining room, waiter, kitchen, pantry) | 12:35 |
| 4 | Why a backend: share data, keep secrets, enforce rules (3 live demos) | |
| 5 | Where today fits in the stack + today's plan | |
| 6 | Node is JavaScript without the browser (what exists where) | |
| 7 | Terminal 101 (type along) | |
| 8 | npm and package.json (click each line) | |
| 9 | ESM vs CommonJS: memorize this slide | |
| 10 | Spot it (ESM or CJS) + error decoder | |
| 11 | HTTP: the order slip (request and response anatomy) | |
| 12 | Status codes in waiter language | 1:00 |
| 13 | Hello Express, line by line | 1:00 to 1:40 live code |
| 14 | Be the request: route matching simulator | |
| 15 | Params vs query + the string-vs-number trap | |
| 16 | Three ways to test a server | |
| 17 | Live-code progression: stages 0 to 4 in examples/recipe-box-api | |
| 18 | Mission 7: Open the Kitchen (Bronze / Silver / Gold / Bonus) | 1:40 to 2:05 |
| 19 | Exit check quiz | 2:05 to 2:15 |

Slides live in `src/Deck.jsx`. Shared theme and helpers are in `src/ui.jsx`. The instructor walkthrough and student handouts are the DOCX files in `docs/`.

ESM throughout. No require() or module.exports.
